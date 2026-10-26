import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { WebGLPathTracer, DenoiseMaterial } from 'three-gpu-pathtracer';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';

export const METALS = {
  yellow: {hex:'#e7bc72',name:'18k yellow gold'},
  white: {hex:'#d6d8dc',name:'18k white gold'},
  rose: {hex:'#d7a18d',name:'18k rose gold'},
  platinum: {hex:'#cbd1d8',name:'Platinum'},
  silver: {hex:'#edf0f2',name:'Silver'}
};
export const GEMS = {
  diamond:{ior:2.417,hex:'#eff8ff',distance:120,density:3.52},
  sapphire:{ior:1.77,hex:'#376ac0',distance:7,density:4.00},
  ruby:{ior:1.77,hex:'#cb4266',distance:8,density:4.00},
  emerald:{ior:1.577,hex:'#40a980',distance:7,density:2.72}
};

// A high-dynamic-range studio environment, in linear radiance units. Large
// emitters produce broad metal reflections; small strips give gemstone fire.
function studioEnvironment() {
  const width=512,height=256,data=new Float32Array(width*height*4);
  const boxes=[[-1.05,.35,.48,.65,11], [1.4,.12,.20,.85,9], [2.8,.9,.65,.30,5],[-.15,1.22,.60,.15,7]];
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const longitude=x/width*Math.PI*2-Math.PI,latitude=(.5-y/height)*Math.PI;
    let energy=.06+.10*Math.max(0,Math.sin(latitude));
    for(const [cx,cy,sx,sy,power]of boxes){
      const dx=Math.atan2(Math.sin(longitude-cx),Math.cos(longitude-cx));
      const d=Math.max(Math.abs(dx)/sx,Math.abs(latitude-cy)/sy);
      energy+=power*(1-THREE.MathUtils.smoothstep(d,.84,1.04));
    }
    const i=(y*width+x)*4;
    data[i]=energy;data[i+1]=energy*.985;data[i+2]=energy*.965;data[i+3]=1;
  }
  const texture=new THREE.DataTexture(data,width,height,THREE.RGBAFormat,THREE.FloatType);
  texture.mapping=THREE.EquirectangularReflectionMapping;
  texture.colorSpace=THREE.LinearSRGBColorSpace;texture.needsUpdate=true;
  return texture;
}

function cutOutline(shape,count=24) {
  if(shape==='emerald')return [[-.32,-.50],[.32,-.50],[.43,-.39],[.43,.39],[.32,.50],[-.32,.50],[-.43,.39],[-.43,-.39]];
  return Array.from({length:shape==='round'?16:count},(_,i)=>{
    const a=i/(shape==='round'?16:count)*Math.PI*2,x=Math.cos(a),z=Math.sin(a);
    if(shape==='oval')return [x*.40,z*.55];
    if(shape==='marquise')return [x*.32*(.25+.75*Math.abs(x)),z*.66];
    if(shape==='pear')return [x*.47*(.7-.30*z),z*.59];
    return [x*.5,z*.5];
  });
}

export function gemstoneGeometry(shape,diameter) {
  const outline=cutOutline(shape),n=outline.length,vertices=[];
  // Proportions describe a closed, solid dielectric: pavilion, thin girdle,
  // crown and table. A single-sided closed mesh is required for Snell/TIR.
  const levels=[{scale:0,y:-.43},{scale:1,y:-.018},{scale:1,y:.018},{scale:.55,y:.17}];
  const point=(l,i)=>[outline[i%n][0]*diameter*l.scale,l.y*diameter,outline[i%n][1]*diameter*l.scale];
  const add=(a,b,c)=>{
    const ab=new THREE.Vector3().fromArray(b).sub(new THREE.Vector3().fromArray(a));
    const ac=new THREE.Vector3().fromArray(c).sub(new THREE.Vector3().fromArray(a));
    const normal=ab.cross(ac),centre=new THREE.Vector3((a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3);
    // The interior reference lies inside the pavilion, not at a surface.
    centre.y+=diameter*.06;
    if(normal.dot(centre)<0)[b,c]=[c,b];
    vertices.push(...a,...b,...c);
  };
  for(let i=0;i<n;i++){
    const j=(i+1)%n;
    add(point(levels[0],0),point(levels[1],i),point(levels[1],j));
    for(let level=1;level<3;level++){
      const a=point(levels[level],i),b=point(levels[level],j),c=point(levels[level+1],j),d=point(levels[level+1],i);
      add(a,b,c);add(a,c,d);
    }
    add([0,levels[3].y*diameter,0],point(levels[3],i),point(levels[3],j));
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  geometry.computeVertexNormals();
  // Flat facet normals are intentional: smoothing them destroys cut optics.
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(vertices.length/3*2),2));
  return geometry;
}

const unitCutVolumes=new Map();
export function gemstoneDiameter(shape,carat,density){
  if(!unitCutVolumes.has(shape)){
    const geometry=gemstoneGeometry(shape,1),p=geometry.getAttribute('position');let volume=0;
    for(let i=0;i<p.count;i+=3){
      const a=new THREE.Vector3().fromBufferAttribute(p,i),b=new THREE.Vector3().fromBufferAttribute(p,i+1),c=new THREE.Vector3().fromBufferAttribute(p,i+2);
      volume+=a.dot(b.cross(c))/6;
    }
    unitCutVolumes.set(shape,volume);geometry.dispose();
  }
  // One carat = 0.2 g. Convert g/cm³ to a target volume in mm³.
  return Math.cbrt(200*Number(carat)/density/unitCutVolumes.get(shape));
}

function bandGeometry(radius,width,thickness,segments) {
  const profile=[];
  for(let i=0;i<=32;i++){
    const a=i/32*Math.PI*2;
    const curve=v=>Math.sign(v)*Math.pow(Math.abs(v),.65);
    profile.push(new THREE.Vector2(radius+curve(Math.cos(a))*thickness/2,curve(Math.sin(a))*width/2));
  }
  return new THREE.LatheGeometry(profile,segments);
}

// Convex-cut dielectric ray transport for the responsive preview. Trace the
// actual facet planes, splitting Fresnel reflection/transmission at each exit.
// The full-scene path tracer remains available for inter-object light transport.
function liveGemMaterial(geometry,physical,environment,mobile) {
  const positions=geometry.getAttribute('position'),normal=geometry.getAttribute('normal');
  const planes=[],keys=new Set();
  for(let i=0;i<positions.count;i+=3){
    const n=new THREE.Vector3().fromBufferAttribute(normal,i),p=new THREE.Vector3().fromBufferAttribute(positions,i),d=n.dot(p);
    const key=[n.x,n.y,n.z,d].map(v=>v.toFixed(4)).join(',');
    if(!keys.has(key)){keys.add(key);planes.push(new THREE.Vector4(n.x,n.y,n.z,d));}
  }
  if(planes.length>96)throw new Error('Gem cut exceeds supported facet-plane count.');
  const planeCount=planes.length;while(planes.length<96)planes.push(new THREE.Vector4());
  const absorption=physical.attenuationColor.clone();
  absorption.setRGB(-Math.log(Math.max(.001,absorption.r))/physical.attenuationDistance,-Math.log(Math.max(.001,absorption.g))/physical.attenuationDistance,-Math.log(Math.max(.001,absorption.b))/physical.attenuationDistance);
  return new THREE.ShaderMaterial({
    uniforms:{uPlanes:{value:planes},uPlaneCount:{value:planeCount},uInverse:{value:new THREE.Matrix4()},uModel:{value:new THREE.Matrix4()},uEnvironment:{value:environment},uIor:{value:physical.ior},uDispersion:{value:physical.dispersion},uAbsorption:{value:new THREE.Vector3(absorption.r,absorption.g,absorption.b)}},
    vertexShader:`varying vec3 vPosition;varying vec3 vNormal;void main(){vPosition=position;vNormal=normal;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`precision highp float;
      varying vec3 vPosition;varying vec3 vNormal;
      uniform vec4 uPlanes[96];uniform int uPlaneCount;uniform mat4 uInverse;uniform mat4 uModel;uniform sampler2D uEnvironment;uniform float uIor;uniform float uDispersion;uniform vec3 uAbsorption;
      vec3 environment(vec3 direction){vec3 d=normalize(mat3(uModel)*direction);vec2 uv=vec2(atan(d.z,d.x)/6.28318530718+.5,asin(clamp(d.y,-1.,1.))/3.14159265359+.5);return texture2D(uEnvironment,uv).rgb;}
      float fresnel(float ci,float a,float b){ci=clamp(abs(ci),0.,1.);float st=(a*a)/(b*b)*(1.-ci*ci);if(st>=1.)return 1.;float ct=sqrt(1.-st);float rs=(a*ci-b*ct)/(a*ci+b*ct);float rp=(b*ci-a*ct)/(b*ci+a*ct);return .5*(rs*rs+rp*rp);}
      vec3 transport(float ior,vec3 origin,vec3 incoming,vec3 entryNormal){
        float entry=fresnel(dot(-incoming,entryNormal),1.,ior);
        vec3 result=entry*environment(reflect(incoming,entryNormal));
        vec3 direction=refract(incoming,entryNormal,1./ior),throughput=vec3(1.-entry),p=origin+direction*.0005;
        for(int bounce=0;bounce<${mobile?6:10};bounce++){
          float distance=1e8;vec3 exitNormal=vec3(0.);
          for(int i=0;i<96;i++){if(i>=uPlaneCount)break;vec4 plane=uPlanes[i];float denom=dot(plane.xyz,direction);if(denom>.000001){float t=(plane.w-dot(plane.xyz,p))/denom;if(t>.0001&&t<distance){distance=t;exitNormal=plane.xyz;}}}
          if(distance>1e7)break;
          throughput*=exp(-uAbsorption*distance);vec3 exitPoint=p+direction*distance;
          float reflection=fresnel(dot(direction,exitNormal),ior,1.);
          if(reflection<.99999){vec3 transmitted=refract(direction,-exitNormal,ior);result+=throughput*(1.-reflection)*environment(transmitted);}
          throughput*=reflection;if(max(throughput.r,max(throughput.g,throughput.b))<.003)break;
          direction=reflect(direction,exitNormal);p=exitPoint+direction*.0005;
        }
        return result;
      }
      void main(){vec3 eye=(uInverse*vec4(cameraPosition,1.)).xyz;vec3 incoming=normalize(vPosition-eye),n=normalize(vNormal);float spread=uDispersion*.5;
        vec3 red=transport(uIor-spread,vPosition,incoming,n),green=transport(uIor,vPosition,incoming,n),blue=transport(uIor+spread,vPosition,incoming,n);
        gl_FragColor=vec4(red.r,green.g,blue.b,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
  });
}

export function createJewelleryStudio(canvas,initial,onStatus=()=>{}) {
  const mobile=matchMedia('(max-width:700px)').matches;
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:mobile?'low-power':'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,mobile?1.3:1.75));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1;
  const scene=new THREE.Scene();scene.background=new THREE.Color('#101a2c');
  const environment=studioEnvironment();scene.environment=environment;
  const camera=new THREE.PerspectiveCamera(34,1,.1,350);
  const controls=new OrbitControls(camera,canvas);
  controls.enableDamping=false;controls.enablePan=false;controls.minDistance=22;controls.maxDistance=130;
  controls.rotateSpeed=.7;controls.zoomSpeed=.7;
  let tracer,denoiseQuad,refining=false;
  function enableRefinement(){
    if(!renderer.extensions.has('EXT_color_buffer_float')){onStatus('Interactive preview');return;}
    if(!tracer){
      tracer=new WebGLPathTracer(renderer);
      tracer.bounces=6;tracer.transmissiveBounces=12;
      tracer.renderDelay=180;tracer.minSamples=1;tracer.fadeDuration=250;
      tracer.renderScale=mobile?.85:1;tracer.tiles.set(4,4);
      tracer.textureSize.set(1024,1024);
      denoiseQuad=new FullScreenQuad(new DenoiseMaterial({sigma:2.2,kSigma:1,threshold:.14}));
      tracer.renderToCanvasCallback=(target,renderDevice,quad)=>{
        const previousAutoClear=renderDevice.autoClear;renderDevice.autoClear=false;
        try{
          if(quad.material.opacity<1||tracer.samples<4)quad.render(renderDevice);
          else{denoiseQuad.material.map=target.texture;denoiseQuad.render(renderDevice);}
        }finally{renderDevice.autoClear=previousAutoClear;}
      };
    }
    refining=true;group.traverse(object=>{if(object.userData.physicalGem)object.material=object.userData.physicalGem;});
    tracer.setScene(scene,camera);schedule();
  }
  let group=new THREE.Group();scene.add(group);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(250,250),new THREE.MeshStandardMaterial({color:'#101a2c',roughness:.52,metalness:.12}));
  floor.rotation.x=-Math.PI/2;floor.position.y=-11.2;scene.add(floor);
  const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(-25,45,30);scene.add(key);
  let state,bandMaterial,metalMaterial,gemMaterial,mappedTexture,frame,visible=true,dragging=false,disposed=false;
  let selectedCategory,uploadedImage;
  const maxSamples=mobile?48:128;
  function interactive(){refining=false;group.traverse(object=>{if(object.userData.liveGem)object.material=object.userData.liveGem;});}
  function schedule(){if(!frame&&!disposed&&visible&&!document.hidden)frame=requestAnimationFrame(draw);}
  function draw(){
    frame=undefined;if(disposed||!visible||document.hidden)return;
    try{
      if(tracer&&refining){
        tracer.pausePathTracing=dragging;
        tracer.renderSample();
        const done=tracer.samples>=maxSamples;
        onStatus(tracer.isCompiling?'Preparing materials':dragging?'Interactive preview':done?'Studio render ready':'Refining light',tracer.samples);
        if(!done||dragging)schedule();
      }else{renderer.render(scene,camera);onStatus('Interactive preview');}
    }catch(error){
      console.warn('Path tracing fallback',error);tracer?.dispose();denoiseQuad?.material.dispose();denoiseQuad?.dispose();denoiseQuad=null;tracer=null;interactive();
      renderer.render(scene,camera);onStatus('Interactive preview');
    }
  }
  function resetCamera(){
    const bounds=new THREE.Box3().setFromObject(group),centre=bounds.getCenter(new THREE.Vector3());
    const forward=new THREE.Vector3(28,21,43).normalize(),right=new THREE.Vector3(0,1,0).cross(forward).normalize(),up=forward.clone().cross(right).normalize();
    const tangent=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));let distance=1;
    for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
      const point=new THREE.Vector3(x,y,z).sub(centre),depth=point.dot(forward);
      distance=Math.max(distance,depth+Math.abs(point.dot(up))/tangent,depth+Math.abs(point.dot(right))/(tangent*camera.aspect));
    }
    distance*=1.12;controls.minDistance=distance*.4;controls.maxDistance=distance*2.3;
    camera.far=distance*5;camera.updateProjectionMatrix();camera.position.copy(centre).addScaledVector(forward,distance);
    controls.target.copy(centre);controls.update();
    tracer?.updateCamera();schedule();
  }
  function mesh(geometry,material,parent=group){const object=new THREE.Mesh(geometry,material);parent.add(object);return object;}
  function rod(a,b,radius,material,parent=group){
    const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);
    const object=mesh(new THREE.CylinderGeometry(radius,radius,delta.length(),10),material,parent);
    object.position.copy(start.add(end).multiplyScalar(.5));object.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return object;
  }
  function setting(diameter,parent=group){
    const set=new THREE.Group();parent.add(set);
    const gemGeometry=gemstoneGeometry(state.shape,diameter),live=liveGemMaterial(gemGeometry,gemMaterial,environment,mobile);
    const stone=mesh(gemGeometry,live,set);stone.userData.liveGem=live;stone.userData.physicalGem=gemMaterial;
    stone.onBeforeRender=()=>{live.uniforms.uModel.value.copy(stone.matrixWorld);live.uniforms.uInverse.value.copy(stone.matrixWorld).invert();};
    const curve=new THREE.CatmullRomCurve3(cutOutline(state.shape,32).map(([x,z])=>new THREE.Vector3(x*diameter*1.035,-diameter*.10,z*diameter*1.035)),true,'centripetal');
    mesh(new THREE.TubeGeometry(curve,64,.20,8,true),bandMaterial,set);
    for(let index of [2,6,10,14]){
      const points=cutOutline(state.shape,16),[x,z]=points[Math.floor(index/16*points.length)%points.length];
      rod([x*diameter*.65,-diameter*.43,z*diameter*.65],[x*diameter*1.01,diameter*.09,z*diameter*1.01],.19,metalMaterial,set);
      const tip=mesh(new THREE.SphereGeometry(.235,10,8),metalMaterial,set);tip.position.set(x*diameter*1.01,diameter*.09,z*diameter*1.01);
    }
    return set;
  }
  function makeTexture(){
    mappedTexture?.dispose();mappedTexture=null;
    if(!uploadedImage){bandMaterial.map=null;bandMaterial.needsUpdate=true;return;}
    const textureCanvas=document.createElement('canvas');textureCanvas.width=1024;textureCanvas.height=512;
    const ctx=textureCanvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,1024,512);
    const scale=Math.min(900/uploadedImage.width,450/uploadedImage.height),w=uploadedImage.width*scale,h=uploadedImage.height*scale;
    ctx.drawImage(uploadedImage,(1024-w)/2,(512-h)/2,w,h);
    mappedTexture=new THREE.CanvasTexture(textureCanvas);mappedTexture.colorSpace=THREE.SRGBColorSpace;
    mappedTexture.wrapS=mappedTexture.wrapT=THREE.RepeatWrapping;
    mappedTexture.repeat.set(Number(state.artScale),1);mappedTexture.offset.set(Number(state.artOffset),0);
    mappedTexture.center.set(.5,.5);mappedTexture.rotation=Number(state.artRotation)*Math.PI/180;
    mappedTexture.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),4);
    bandMaterial.map=mappedTexture;bandMaterial.needsUpdate=true;
  }
  function rebuild(next){
    state={...next};
    interactive();group.traverse(object=>{object.geometry?.dispose();object.userData.liveGem?.dispose();});scene.remove(group);group=new THREE.Group();scene.add(group);
    bandMaterial?.dispose();metalMaterial?.dispose();gemMaterial?.dispose();
    const roughness=Number(state.roughness),metal=METALS[state.metal]||METALS.yellow,gem=GEMS[state.gem]||GEMS.diamond;
    metalMaterial=new THREE.MeshPhysicalMaterial({color:metal.hex,metalness:1,roughness,clearcoat:0});
    bandMaterial=metalMaterial.clone();
    gemMaterial=new THREE.MeshPhysicalMaterial({color:0xffffff,metalness:0,roughness:.005,transmission:1,ior:gem.ior,thickness:8,attenuationColor:new THREE.Color(state.gemColour||gem.hex),attenuationDistance:gem.distance,dispersion:state.gem==='diamond'?.044:.018});
    // The path tracer traces the closed surface and applies Beer attenuation.
    // Its RGB transport does not implement spectral dispersion or birefringence.
    makeTexture();
    const diameter=gemstoneDiameter(state.shape,state.carat,gem.density);
    const width=Number(state.bandWidth),segments=mobile?64:96;
    if(state.category==='ring'){
      const band=mesh(bandGeometry(9.1,width,1.5,segments),bandMaterial);band.rotation.x=Math.PI/2;
      const head=setting(diameter);head.position.y=9.85+diameter*.43;
      // Cathedral shoulders connect the head to the shank; no floating setting.
      for(const side of [-1,1])for(const depth of [-1,1])rod([side*3.1,9.1,depth*width*.30],[side*diameter*.27,head.position.y-diameter*.12,depth*diameter*.23],.32,metalMaterial);
      floor.position.y=-10.0;
    }else if(state.category==='pendant'){
      const head=setting(diameter);head.rotation.x=Math.PI/2;head.position.y=-2;
      const loop=mesh(new THREE.TorusGeometry(1.35,.30,10,32),bandMaterial);loop.position.y=diameter*.55-1;
      for(let side of [-1,1])for(let i=0;i<12;i++){
        const link=mesh(new THREE.TorusGeometry(.75,.16,6,12),metalMaterial);
        link.position.set(side*(.55+i*.75),diameter*.55+i*.74,0);
        link.rotation.y=i%2?Math.PI/2:0;link.scale.y=state.chain==='rolo'?1:1.35;
      }
      floor.position.y=-diameter*.7-3;
    }else if(state.category==='earrings'){
      for(let side of [-1,1]){
        const stud=new THREE.Group();group.add(stud);stud.position.x=side*(diameter*.72+1);
        const head=setting(diameter,stud);head.rotation.x=Math.PI/2;
        rod([0,0,-diameter*.4],[0,0,-diameter*.4-5],.35,metalMaterial,stud);
        const backing=mesh(new THREE.CylinderGeometry(1.1,1.1,.7,16),bandMaterial,stud);backing.rotation.x=Math.PI/2;backing.position.z=-diameter*.4-3.5;
      }
      floor.position.y=-diameter*.7;
    }else{
      const band=mesh(bandGeometry(29.1,width+1.2,1.7,segments),bandMaterial);band.rotation.x=Math.PI/2;
      for(let i=-2;i<=2;i++){
        const a=i*.22,size=i===0?diameter:diameter*.55,head=setting(size),radius=29.95+size*.43;
        head.position.set(Math.sin(a)*radius,Math.cos(a)*radius,0);head.rotation.z=-a;
      }
      floor.position.y=-30;
    }
    const frameKey=[state.category,state.shape,state.carat,state.bandWidth].join('|');
    if(selectedCategory!==frameKey){selectedCategory=frameKey;resetCamera();}
    scene.updateMatrixWorld(true);
    schedule();
  }
  function resize(){
    const box=canvas.parentElement.getBoundingClientRect();if(!box.width||!box.height)return;
    renderer.setSize(Math.floor(box.width),Math.floor(box.height),false);
    camera.aspect=box.width/box.height;camera.updateProjectionMatrix();resetCamera();tracer?.updateCamera();schedule();
  }
  controls.addEventListener('start',()=>{dragging=true;interactive();schedule();});
  controls.addEventListener('end',()=>{dragging=false;tracer?.updateCamera();schedule();});
  controls.addEventListener('change',()=>{interactive();schedule();});
  canvas.addEventListener('keydown',event=>{
    const offset=camera.position.clone().sub(controls.target),spherical=new THREE.Spherical().setFromVector3(offset);
    if(event.key==='ArrowLeft')spherical.theta-=.12;
    else if(event.key==='ArrowRight')spherical.theta+=.12;
    else if(event.key==='ArrowUp')spherical.phi=Math.max(.08,spherical.phi-.12);
    else if(event.key==='ArrowDown')spherical.phi=Math.min(Math.PI-.08,spherical.phi+.12);
    else if(event.key==='+'||event.key==='=')spherical.radius=Math.max(controls.minDistance,spherical.radius/1.12);
    else if(event.key==='-')spherical.radius=Math.min(controls.maxDistance,spherical.radius*1.12);
    else return;
    event.preventDefault();interactive();camera.position.setFromSpherical(spherical).add(controls.target);controls.update();schedule();
  });
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(canvas.parentElement);
  const visibilityObserver=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)schedule();});visibilityObserver.observe(canvas);
  const onVisibility=()=>{if(!document.hidden)schedule();};document.addEventListener('visibilitychange',onVisibility);
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();onStatus('Graphics paused. Reload to continue.');if(frame)cancelAnimationFrame(frame);frame=undefined;});
  rebuild(initial);resize();
  return {
    update:rebuild,
    resetView:resetCamera,
    refine(){try{onStatus('Preparing materials');enableRefinement();}catch(error){console.warn(error);interactive();schedule();}},
    stopRefinement(){interactive();schedule();},
    setImage(image){interactive();uploadedImage=image;makeTexture();schedule();},
    exportImage(){renderer.render(scene,camera);const url=renderer.domElement.toDataURL('image/png');tracer?.reset();schedule();return url;},
    dispose(){disposed=true;if(frame)cancelAnimationFrame(frame);resizeObserver.disconnect();visibilityObserver.disconnect();document.removeEventListener('visibilitychange',onVisibility);controls.dispose();tracer?.dispose();denoiseQuad?.material.dispose();denoiseQuad?.dispose();mappedTexture?.dispose();environment.dispose();group.traverse(o=>{o.geometry?.dispose();o.userData.liveGem?.dispose();});bandMaterial?.dispose();metalMaterial?.dispose();gemMaterial?.dispose();floor.geometry.dispose();floor.material.dispose();renderer.dispose();}
  };
}
