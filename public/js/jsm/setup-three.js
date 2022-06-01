import * as THREE from 'three';
import { OrbitControls } from './OrbitControls.js';

export default function () {
  const canvas = document.querySelector('.space-canvas');

  // Setup renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
  });
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  renderer.setClearColor(0x000000, 0);

  // Setup camera
  const fov = 45;
  const aspect = 2;
  const near = 0.1;
  const far = 100;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 10, 20);

  // Resize based on window size
  function resizeRendererToDisplaySize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;

    if (!needResize)
      return
    
    renderer.setSize(width, height, false);
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resizeRendererToDisplaySize);
  resizeRendererToDisplaySize();

  // Setup orbit controls
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 5, 0);
  controls.update();

  // Setup scene
  const scene = new THREE.Scene();

  // Setup audio listener
  const audioListener = new THREE.AudioListener();
  const sound = new THREE.PositionalAudio(audioListener);
  camera.add(audioListener);

  // Setup hover
  const pointer = new THREE.Vector3(0, 0, 0);
  const raycaster = new THREE.Raycaster();
  const hoverables = [];
  const hover = {
    hoverable: null,
    onStart: null,
    onEnd: null
  };

  window.addEventListener('mousemove', e => {
    pointer.x = (2 * (e.x / window.innerWidth)) - 1;
    pointer.y = -1 * ((2 * (e.y / window.innerHeight)) - 1);
  });

  // Setup render loop
  function render () {
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(hoverables.map(el => el.object));
    if (intersects.length > 0) {
      if (hover.hoverable && hover.hoverable.object.name != intersects[0].object.name && hover.onEnd) {
        hover.onEnd(hover.hoverable);
      }

      if (!hover.hoverable || (hover.hoverable.object.name != intersects[0].object.name && hover.onStart)) {
        const hoverable = hoverables.find(el => {
          return el.object?.name == intersects[0].object.name;
        });

        if (hoverable) {
          hover.hoverable = hoverable;
          hover.onStart(hoverable);
        }
      }
    } else if (hover.hoverable) {
      if (hover.onEnd) {
        hover.onEnd(hover.hoverable);
      }
      
      hover.hoverable = null;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  // Export object
  return {
    scene,
    camera,
    controls,
    audioListener,
    hoverables,
    hover
  }
}