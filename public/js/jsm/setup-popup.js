const md = new markdownit();

export default function (space) {
  window.addEventListener('click', () => {
    togglePopup();
    window.addEventListener('click', () => {
      togglePopup();
    }, { once: true });
  }, { once: true });
  
  function togglePopup () {
    const introEl = document.querySelector('.intro');
    if (introEl.classList.contains('hide')) {
      introEl.innerHTML = md.render(space.intro);
      introEl.classList.remove('hide');
    } else {
      introEl.classList.add('hide');
    }
  }
 

  const questionMark = document.querySelector('.after-intro');
  console.log(questionMark);
  questionMark.addEventListener('click', () => {
    togglePopupAfter();
    } );
  function togglePopupAfter () {
    const introEl = document.querySelector('.intro');
    if (introEl.classList.contains('hide')) {
      introEl.innerHTML = md.render(space.intro);
      introEl.classList.remove('hide');
    } else {
      introEl.classList.add('hide');
    }
  }
}