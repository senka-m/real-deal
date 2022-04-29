import fetchSpace from './jsm/fetch-space.js';
import setupThree from './jsm/setup-three.js';

let space, three;

fetchSpace(data => {
  space = data;
  console.log(space);
  setupThree(three);
});