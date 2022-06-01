import * as THREE from 'three';
import { GLTFLoader } from './GLTFLoader.js';

let three, space, root, cameraFrameBox, originalMaterial, videoMaterial;

export default function (threeArg, spaceArg) {
  three = threeArg
  space = spaceArg

  setBackground();

  // Load GLTF model
  const gltfLoader = new GLTFLoader();
  gltfLoader.load(`/models/${space.model}`, gltf => {
    root = gltf.scene;
    three.scene.add(root);

    setupCamera();
    setupControls();
    setupLights();
    setupVideoMaterial();

    // Iterate over every object
    root.traverse(obj => {
      if (space.objects.screen.some(hoverObj => hoverObj.name == obj.name)) {
        obj.material = videoMaterial;
      }

      const hoverable = space.objects.hover.find(el => el.name == obj.name);
      const exit = space.objects.exit.find(el => el.name == obj.name);
      
      if (hoverable) {
        three.hoverables.push({
          object: obj,
          text: hoverable.text,
          linkId: null
        });
      } else if (exit) {
        three.hoverables.push({
          object: obj,
          text: exit.text,
          linkId: exit.linkId
        });
      }
    });

    setupHoverInteraction();
    fuckItUp(root);
  });
  setupAudio();
}

function setBackground () {
  const body = document.querySelector('body');
  body.setAttribute('style', `background: ${space.backgroundStyle}`);
}

function setupCamera () {
  // Compute the box that contains all the stuff
  // from root and below
  cameraFrameBox = {
    box: new THREE.Box3().setFromObject(root)
  };
  cameraFrameBox.size = cameraFrameBox.box.getSize(new THREE.Vector3()).length();
  cameraFrameBox.center = cameraFrameBox.box.getCenter(new THREE.Vector3());

  // Set the camera to frame the box
  const halfSizeToFitOnScreen = cameraFrameBox.size * 0.4 * 0.5;
  const halfFovY = THREE.MathUtils.degToRad(three.camera.fov * .5);
  const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);

  // Compute a unit vector that points in the direction the camera is now
  // in the xz plane from the center of the box
  const direction = (new THREE.Vector3())
  .subVectors(three.camera.position, cameraFrameBox.center)
  .multiply(new THREE.Vector3(1, 0, 1))
  .normalize();
  
  // Move the camera to a position distance units way from the center
  // in whatever direction the camera was from the center already
  three.camera.position.copy(direction.multiplyScalar(distance).add(cameraFrameBox.center));
  
  // Pick some near and far values for the frustum that
  // will contain the box.
  three.camera.near = cameraFrameBox.size / 100;
  three.camera.far = cameraFrameBox.size * 100;
  
  three.camera.updateProjectionMatrix();
  
  // Point the three.camera to look at the center of the box
  three.camera.lookAt(cameraFrameBox.center.x, cameraFrameBox.center.y, cameraFrameBox.center.z);
}

function setupControls (camera) {
  // Update the Trackball controls to handle the new size
  three.controls.maxDistance = cameraFrameBox.size * 10;
  three.controls.target.copy(cameraFrameBox.center);
  three.controls.update();
}

function setupAudio () {
  // Set audio
  const sound = new THREE.Audio( three.audioListener );

  // load a sound and set it as the Audio object's buffer
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load(`/audio/${space.audio}`, buffer => {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(1);
    sound.play();
  });
}

function setupLights () {
  const color = 0xFFFFFF;
  const intensity = 0.8;
  const light = new THREE.DirectionalLight(color, intensity);

  light.castShadow = true;
  light.position.set(-200, 800, -850);
  light.target.position.set(-550, 40, -450);
  
  light.shadow.bias = -0.004;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;
  
  three.scene.add(light);
  three.scene.add(light.target);
}

function setupVideoMaterial () {
  const video = document.createElement('video');
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.setAttribute("muted", "");
  video.setAttribute("loop", "");
  video.setAttribute("autoplay", "");
  video.setAttribute("src", `/videos/${space.video}`);
  video.setAttribute("style", "display: none");

  const videoTexture = new THREE.VideoTexture(video);
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;

  videoMaterial = new THREE.MeshBasicMaterial({
    map: videoTexture,
    side: THREE.DoubleSide,
    toneMapped: false
  });

  video.play();
}

function setupHoverInteraction () {
  const md = new markdownit();
  const hoverTextEl = document.querySelector('.hover-text');
  const hoverMaterial = new THREE.MeshBasicMaterial({
    color: 0xFF0000,
    side: THREE.DoubleSide
  });
  const exitTextEl = document.querySelector('.exit-text');
  const exitMaterial = new THREE.MeshBasicMaterial({
    color: 0xC6E3FF,
    side: THREE.DoubleSide
  });
  let exitUrl = '';

  three.hover.onStart = function (hoverable) {
    if (hoverable.linkId) {
      exitTextEl.innerHTML = md.render(hoverable.text);
      exitTextEl.classList.remove('hide');
      originalMaterial = hoverable.object.material;
      hoverable.object.material = exitMaterial;
      exitUrl = `/space?id=${hoverable.linkId}`;
      window.addEventListener('click', exitClickHandler);
      window.addEventListener('mousemove', exitMouseMoveHandler);
    } else {
      originalMaterial = hoverable.object.material;
      hoverable.object.material = hoverMaterial;
      hoverTextEl.innerHTML = md.render(hoverable.text);
      hoverTextEl.classList.remove('hide');
    }
  }
  
  three.hover.onEnd = function (hoverable) {
    if (hoverable.linkId) {
      exitTextEl.classList.add('hide');
      window.removeEventListener('click', exitClickHandler);
      window.removeEventListener('mousemove', exitMouseMoveHandler);
      hoverable.object.material = originalMaterial;
    } else {
      hoverable.object.material = originalMaterial;
      hoverTextEl.classList.add('hide');
    }
  }

  function exitClickHandler () {
    window.open(exitUrl, '_self')
  }

  function exitMouseMoveHandler (e) {
    updateExitTextPosition(e.x, e.y);
  }

  function updateExitTextPosition (x, y) {
    exitTextEl.setAttribute(
      'style',
      `transform: translate(${x}px, calc(${y}px + 50%))`
    );
  }
}

function fuckItUp (root) {
  const randomTimeoutRange = [50, 200];

  const flatMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    side: THREE.DoubleSide,
    shading: THREE.FlatShading
  });

  function timeoutHandler () {
    let randomTimeout = randomTimeoutRange[0] + (Math.random() * randomTimeoutRange[1] - randomTimeoutRange[0]);
    root.traverse(obj => {
      const lol = Math.random();

      if (lol > 0.99) {
        const oldMaterial = obj.material;
        obj.material = flatMaterial;
        setTimeout(() => {
          obj.material = oldMaterial;
        }, randomTimeout * 5);
      }
    })
    
    setTimeout(timeoutHandler, randomTimeout);
  }
  timeoutHandler();
}

//Setting up the Pop Up
// window.onclick = setupPopup;
// let timesclicked= 0;

// function setupPopup() {
//   const intro = document.querySelector('intro');
//   // const introTextEl = space.objects.exit.find(el => el.name == obj.name);
//   // console.log(introTextEl);
//   intro.setAttribute("src", `intro: ${space.intro}`);
//   console.log(intro);
//   console.log(timesclicked)
//   if(timesclicked == 0){
//     console.log(timesclicked);
//     timesclicked = 1;
//   } else if(timesclicked == 1){
//     timesclicked = 2;
//     console.log(timesclicked);
//     intro.classList.remove('hide');
//     // document.getElementById("popUp").style.display = "block";
//   } else{
//     timesclicked = 3;
//     console.log('stop this madness');
//     // document.getElementById("popUp").style.display = "none";
//   }
//   setupPopup();
// }

// const exitTextEl = document.querySelector('.exit-text');
//   let exitUrl = '';

//   three.hover.onStart = function (hoverable) {
//     if (hoverable.linkId) {
//       exitTextEl.innerHTML = md.render(hoverable.text);
//       exitTextEl.classList.remove('hide');
//       exitUrl = `/space?id=${hoverable.linkId}`;
//       window.addEventListener('click', exitClickHandler);
//       window.addEventListener('mousemove', exitMouseMoveHandler);
//     } else {
//       originalMaterial = hoverable.object.material;
//       hoverable.object.material = hoverMaterial;
//       hoverTextEl.innerHTML = md.render(hoverable.text);
//       hoverTextEl.classList.remove('hide');
//     }

// Setup Texture
// function setupTextureMaterial () {
//   const texture = document.createElement('texture');
//   texture.setAttribute("src", `/textures/${space.texture}`);
//   texture.setAttribute("style", "display: none");

//   const materialTexture = new THREE.TextureLoader(texture);
//   materialTexture.minFilter = THREE.LinearFilter;
//   materialTexture.magFilter = THREE.LinearFilter;

//   textureMaterial = new THREE.MeshBasicMaterial({
//     map: materialTexture,
//     side: THREE.DoubleSide,
//     toneMapped: false
//   });

// }
// setupTextureMaterial();