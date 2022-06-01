import * as THREE from 'three';
import {OrbitControls} from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';
// import {OBJLoader} from 'https://threejs.org/examples/jsm/loaders/OBJLoader.js';
import {GLTFLoader} from 'https://threejs.org/examples/jsm/loaders/GLTFLoader.js';
import {GUI} from 'https://threejs.org/examples/jsm/libs/lil-gui.module.min.js';


const objects = [
  {
    name: 'Plane001',
    // audio: './audio/plane001.mp3',
    text: 'I never wore my pijama during this time. I thought, if a bomb hits our house, I wouldn’t want to be found dead in pijamas.',
    obj: null
  },
  {
    name: 'Plane017',
    text: 'I didn’t understand what happened at first. You were young. I left the room, I’ve just changed your clothes, and then at 8 was the first time it exploded. I forgot the exact date. Subconsciously but also consciously to a degree. That evening it exploded in our area, for the first time in Straževica. Straževica is that hill 500 kilometers (air path?) away from our apartment.',
    obj: null
  },
  {
    name: 'Plane',
    text: 'This was another plane',
    obj: null
  }
]

let pointerPos
const mainTitleEl = document.querySelector('.main-title')
const pointerBoxEl = document.querySelector('.pointer-box')

class PickHelper {
  constructor() {
    this.raycaster = new THREE.Raycaster();
    this.pickedObject = null;
    this.intersectObjects = null
    this.pickedObjectSavedColor = 0;
  }
  pick(normalizedPosition, scene, camera, time) {
    // restore the color if there is a picked object
    if (this.pickedObject) {
      this.pickedObject.material = unpickedMaterial
      // this.pickedObject.material?.emissive?.setHex(this.pickedObjectSavedColor);
      this.pickedObject = undefined;
    }

    // cast a ray through the frustum
    this.raycaster.setFromCamera(normalizedPosition, camera);
    // get the list of objects the ray intersected
    this.intersectObjects = this.raycaster.intersectObjects(scene.children);
    if (this.intersectObjects.length) {
      // pick the first object. It's the closest one
      this.pickedObject = this.intersectObjects[0].object;

      const tag = getTag(this.pickedObject.name)

      switch (tag) {
        case 'nav':
          // Do different stuff for nav
          this.navMouseEnterHandler(this.pickedObject.children)
          this.defaultMouseEnterHandler()
          break
        case 'env':
        default:
          this.defaultMouseEnterHandler()
      }
    } else{
      mainTitleEl.classList.remove('active')
      pointerBoxEl.classList.remove('active')
    }
  }
  defaultMouseEnterHandler () {
    unpickedMaterial = this.pickedObject.material
    this.pickedObject.material = pickedMaterial
    // // save its color
    // this.pickedObjectS avedColor = this.pickedObject.material?.emissive?.getHex();
    // // set its emissive color to flashing red/yellow
    // this.pickedObject.material?.emissive?.setHex((time * 8) % 2 > 1 ? 0xFFFF00 : 0xFF0000);
    const selection = objects.filter(obj => obj.name == this.intersectObjects[0].object.name)
    if (selection.length) {
      document.querySelector(".hover-text").innerHTML = selection[0].text;
      mainTitleEl.classList.add('active')
    } else {
      // mainTitleEl.classList.remove('active')
      document.querySelector(".hover-text").innerHTML = "Judt in vsdr";
      mainTitleEl.classList.add('active')
    }
  }
  navMouseEnterHandler (mesh) {
    pointerBoxEl.classList.add('active')
    console.log(pointerPos)
    pointerBoxEl.style = `transform: translate(${pointerPos.x}px, ${pointerPos.y}px)`
    // console.log(mesh)
    // const boundingBox = computeScreenSpaceBoundingBox(mesh)
    // console.log(boundingBox)

    // function computeScreenSpaceBoundingBox(mesh) {
    //   var vertices = mesh.geometry.vertices;
    //   var vertex = new THREE.Vector3();
    //   var min = new THREE.Vector3(1, 1, 1);
    //   var max = new THREE.Vector3(-1, -1, -1);
    
    //   for (var i = 0; i < vertices.length; i++) {
    //     var vertexWorldCoord = vertex.copy(vertices[i]).applyMatrix4(mesh.matrixWorld);
    //     var vertexScreenSpace = vertexWorldCoord.project(camera);
    //     min.min(vertexScreenSpace);
    //     max.max(vertexScreenSpace);
    //   }

    //   const normalisedCoord = new THREE.Box2(min, max);
    //   const size = renderer.getSize()

    //   const halfScreen = new THREE.Vector2(size.width/2, size.height/2)
    //   return coord.clone().multiply(halfScreen);
    // }
  }
}

let unpickedMaterial = null
const pickedMaterial = new THREE.MeshBasicMaterial({
  color: 0xff0000,
  emissive: 0xff0000,
  side: THREE.DoubleSide
})
let root

let plane017Obj = null;
const pickPosition = {x: 0, y: 0};
const pickHelper = new PickHelper();

function clearPickPosition() {
  // unlike the mouse which always has a position
  // if the user stops touching the screen we want
  // to stop picking. For now we just pick a value
  // unlikely to pick something
  pickPosition.x = -100000;
  pickPosition.y = -100000;
}
clearPickPosition();

let canvas, renderer, camera

function main() {
  canvas = document.querySelector('#c');
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
   });
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  
  const fov = 45;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  const far = 100;
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 10, 20);
  
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 5, 0);
  controls.update();
  
  const scene = new THREE.Scene();
  // scene.background = new THREE.Color('#0000FF');
  
  let video = null
  let videoTexture = null
  let movieMaterial = null

  
  { video = document.getElementById( 'video' );
  videoTexture = new THREE.VideoTexture( video );
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;
  video.play()
  
  movieMaterial = new THREE.MeshBasicMaterial({
    map: videoTexture,
    side: THREE.FrontSide,
    toneMapped: false,
  });
  
  let movieGeometry = new THREE.BoxGeometry (16,9,1);
  let movieCubeScreen = new THREE.Mesh (movieGeometry,movieMaterial);
  
  movieCubeScreen.position.set (50,50,50);
  scene.add(movieCubeScreen);
  
  videoTexture.needsUpdate = true;
}
// {
//   const skyColor = 0xB1E1FF;  // light blue
//   const groundColor = 0x800080;  // brownish orange
//   const intensity = 1.0;
//   const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
//   scene.add(light);
// }

{
  const color = 0xFFFFFF;
  const intensity = 0.8;
  const light = new THREE.DirectionalLight(color, intensity);
  light.castShadow = true;
  light.position.set(-250, 800, -850);
  light.target.position.set(-550, 40, -450);
  
  light.shadow.bias = -0.004;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;
  
  scene.add(light);
  scene.add(light.target);
  const cam = light.shadow.camera;
  cam.near = 1;
  cam.far = 2000;
  cam.left = -1500;
  cam.right = 1500;
  cam.top = 1500;
  cam.bottom = -1500;
  
  const cameraHelper = new THREE.CameraHelper(cam);
  scene.add(cameraHelper);
  cameraHelper.visible = false;
  const helper = new THREE.DirectionalLightHelper(light, 100);
  scene.add(helper);
  helper.visible = false;

  
  function makeXYZGUI(gui, vector3, name, onChangeFn) {
    const folder = gui.addFolder(name);
    folder.add(vector3, 'x', vector3.x - 500, vector3.x + 500).onChange(onChangeFn);
    folder.add(vector3, 'y', vector3.y - 500, vector3.y + 500).onChange(onChangeFn);
    folder.add(vector3, 'z', vector3.z - 500, vector3.z + 500).onChange(onChangeFn);
    folder.open();
  }
  
  function updateCamera() {
    // update the light target's matrixWorld because it's needed by the helper
    light.updateMatrixWorld();
    light.target.updateMatrixWorld();
    helper.update();
    // update the light's shadow camera's projection matrix
    light.shadow.camera.updateProjectionMatrix();
    // and now update the camera helper we're using to show the light's shadow camera
    cameraHelper.update();
  }
  updateCamera();
  
  class DimensionGUIHelper {
    constructor(obj, minProp, maxProp) {
      this.obj = obj;
      this.minProp = minProp;
      this.maxProp = maxProp;
    }
    get value() {
      return this.obj[this.maxProp] * 2;
    }
    set value(v) {
      this.obj[this.maxProp] = v /  2;
      this.obj[this.minProp] = v / -2;
    }
  }
  
  class MinMaxGUIHelper {
    constructor(obj, minProp, maxProp, minDif) {
      this.obj = obj;
      this.minProp = minProp;
      this.maxProp = maxProp;
      this.minDif = minDif;
    }
    get min() {
      return this.obj[this.minProp];
    }
    set min(v) {
      this.obj[this.minProp] = v;
      this.obj[this.maxProp] = Math.max(this.obj[this.maxProp], v + this.minDif);
    }
    get max() {
      return this.obj[this.maxProp];
    }
    set max(v) {
      this.obj[this.maxProp] = v;
      this.min = this.min;  // this will call the min setter
    }
  }
  
  class VisibleGUIHelper {
    constructor(...objects) {
      this.objects = [...objects];
    }
    get value() {
      return this.objects[0].visible;
    }
    set value(v) {
      this.objects.forEach((obj) => {
        obj.visible = v;
      });
    }
  }
  
  const gui = new GUI();
  gui.close();
  gui.add(new VisibleGUIHelper(helper, cameraHelper), 'value').name('show helpers');
  gui.add(light.shadow, 'bias', -0.1, 0.1, 0.001);
  {
    const folder = gui.addFolder('Shadow Camera');
    folder.open();
    folder.add(new DimensionGUIHelper(light.shadow.camera, 'left', 'right'), 'value', 1, 4000)
    .name('width')
    .onChange(updateCamera);
    folder.add(new DimensionGUIHelper(light.shadow.camera, 'bottom', 'top'), 'value', 1, 4000 )
    .name('height')
    .onChange(updateCamera);
    const minMaxGUIHelper = new MinMaxGUIHelper(light.shadow.camera, 'near', 'far', 0.1);
    folder.add(minMaxGUIHelper, 'min', 1, 1000, 1).name('near').onChange(updateCamera);
    folder.add(minMaxGUIHelper, 'max', 1, 4000, 1).name('far').onChange(updateCamera);
    folder.add(light.shadow.camera, 'zoom', 0.01, 1.5, 0.01).onChange(updateCamera);
  }
  
  makeXYZGUI(gui, light.position, 'position', updateCamera);
  makeXYZGUI(gui, light.target.position, 'target', updateCamera);
}

function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
  const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
  const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5);
  const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
  // compute a unit vector that points in the direction the camera is now
  // in the xz plane from the center of the box
  const direction = (new THREE.Vector3())
  .subVectors(camera.position, boxCenter)
  .multiply(new THREE.Vector3(1, 0, 1))
  .normalize();
  
  // move the camera to a position distance units way from the center
  // in whatever direction the camera was from the center already
  camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));
  
  // pick some near and far values for the frustum that
  // will contain the box.
  camera.near = boxSize / 100;
  camera.far = boxSize * 100;
  
  camera.updateProjectionMatrix();
  
  // point the camera to look at the center of the box
  camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
}

{
  const gltfLoader = new GLTFLoader();
  gltfLoader.load('renders/maja2.glb', (gltf) => {
    root = gltf.scene;
    scene.add(root);
    root.traverse((obj) => {
      for (const object of objects) {
        if (obj.name == object.name) {
          object.obj = obj
        }
      }

      if (obj.name == 'Plane001'|| obj.name == 'Plane017') {
        // From https://stackoverflow.com/a/52282759
        obj.material = movieMaterial
        // obj.material.map = videoTexture
        obj.material.side = THREE.DoubleSide
        // obj.material.roughness = 1
        // console.log(obj.name)
      }


      switch (obj.name) {
        case 'Plane017':
          plane017Obj = obj
          document.querySelector(".hover-text").innerHTML = "New text!";
        case 'Plane001':
        case 'Plane':
          // From https://stackoverflow.com/a/52282759
          obj.material = movieMaterial
          // obj.material.map = videoTexture
          obj.material.side = THREE.DoubleSide
          // obj.material.roughness = 1
          // console.log(obj.name)
          break
        default:
        // console.log('Object name is something else')
      }
      
      if (obj.castShadow !== undefined) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
     
    });
  

    // create an AudioListener and add it to the camera
    const listener = new THREE.AudioListener();
    camera.add( listener );

    // create the PositionalAudio object (passing in the listener)
    const sound = new THREE.PositionalAudio( listener );

    // load a sound and set it as the PositionalAudio object's buffer
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load( 'sound/maja-duza.mp3', function( buffer ) {
      sound.setBuffer( buffer );
      sound.setRefDistance( 20 );
      // sound.play();
      sound.setLoop(true);
    });
    document.onclick = function() {
      sound.play();
    }
    // console.log (plane017Obj);
    plane017Obj.add( sound );

    // compute the box that contains all the stuff
    // from root and below
    const box = new THREE.Box3().setFromObject(root);
    
    const boxSize = box.getSize(new THREE.Vector3()).length();
    const boxCenter = box.getCenter(new THREE.Vector3());
    
    // set the camera to frame the box
    frameArea(boxSize * 0.5, boxSize, boxCenter, camera);
    
    // update the Trackball controls to handle the new size
    controls.maxDistance = boxSize * 10;
    controls.target.copy(boxCenter);
    controls.update();
  });
}





function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}
clearPickPosition();

function getCanvasRelativePosition(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * canvas.width  / rect.width,
    y: (event.clientY - rect.top ) * canvas.height / rect.height,
  };
}

function setPickPosition(event) {
  pointerPos = getCanvasRelativePosition(event);
  pickPosition.x = (pointerPos.x / canvas.width ) *  2 - 1;
  pickPosition.y = (pointerPos.y / canvas.height) * -2 + 1;  // note we flip Y
}

window.addEventListener('mousemove', setPickPosition);
window.addEventListener('mouseout', clearPickPosition);
window.addEventListener('mouseleave', clearPickPosition);

  

function render() {
  
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
  pickHelper.pick(pickPosition, scene, camera);
  // pickHelper.pick(pickPosition, pickingScene, camera, time);
  
  renderer.render(scene, camera);
  
  requestAnimationFrame(render);
}

requestAnimationFrame(render);
}
main();


// Arimit fucking things up

const randomTimeoutRange = [50, 200]

let flatMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
  shading: THREE.FlatShading
})

function timeoutHandler () {
  // console.log(root)
  let randomTimeout = randomTimeoutRange[0] + (Math.random() * randomTimeoutRange[1] - randomTimeoutRange[0])
  if (root) {
    root.traverse(obj => {
      const lol = Math.random()

      if (lol > 0.99) {
        const oldMaterial = obj.material
        // flatMaterial = Object.assign(flatMaterial, oldMaterial)
        // flatMaterial.shading = THREE.FlatShading
        // flatMaterial.side = THREE.DoubleSide
        obj.material = flatMaterial
        setTimeout(() => {
          obj.material = oldMaterial
        }, randomTimeout * 5);
      }
    })
  }
  
  setTimeout(timeoutHandler, randomTimeout)
}
timeoutHandler()

function getTag (name) {
  if (name.includes('-')) {
    return name.split('-')[0]
  } else {
    return 'env'
  }
} 