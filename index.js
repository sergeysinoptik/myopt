const $body = document.querySelector('body');
const $wrap = document.querySelector('.wrap');
const $description = document.querySelector('.description');

$wrap.addEventListener('click', () => {
  $wrap.classList.add('unvisible');
  $description.classList.add('unvisible');
});

$description.addEventListener('click', () => {
  $wrap.classList.add('unvisible');
  $description.classList.add('unvisible');
});

const createElem = (tagName, className) => {
  const element = document.createElement(tagName);
  if (className) {
    element.classList.add(className);
  }
  return element;
};

const createReloadButton = () => {
  const $reloadWrap = createElem('div', 'reloadWrap');
  const $reloadButton = createElem('button', 'button');
  $reloadButton.innerText = 'Ой, верните всё как было!';
  $reloadWrap.appendChild($reloadButton);
  $reloadButton.addEventListener('click', () => {
    window.location.reload();
  });
  $body.appendChild($reloadWrap);
};

$body.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    $body.removeChild($wrap);
    $body.removeChild($description);
    createReloadButton();
  }
});

