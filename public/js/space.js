import fetchSpace from './jsm/fetch-space.js';
import setupThree from './jsm/setup-three.js';
import setupScene from './jsm/setup-scene.js';

(function () {
  let space, three;

  fetchSpace()
  .then(data => {
    space = data;
    three = setupThree();
    setupScene(three, space);
  })
  .catch(err => {
    console.error(err);
  });
})();