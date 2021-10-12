import create from './utils/createElement.js';
import Key from './Key.js';

const main = create('main', 'main--container', [
  create('h1', 'title', 'RSS Virtual Keyboard'),
  create('h3', 'subtitle', 'Languages: English, Georgian'),
  create(
    'p',
    'instruction',
    'In order to switch language, press <kbd>Alt</kbd>+<kbd>Ctrl</kbd>'
  ),
]);
console.log(main);
export default class Keyboard {
  constructor(layout) {
    this.layout = layout;
    this.keysPressed = {};
    this.isCaps = false;
  }

  init(lang) {
    this.language = this.layout[lang];
    this.output = create(
      'textarea',
      'output',
      null,
      main,
      ['placeholder', 'Start typing....'],
      ['rows', 5],
      ['cols', 50]
    );
    this.container = create('div', 'keyboard', null, main, ['language', lang]);
    document.body.append(main);
    return this;
  }

  generateLayout() {
    this.keyButtons = [];
    this.language.forEach((keyObj) => {
      const btn = new Key(keyObj).get();
      document.querySelector('.keyboard').appendChild(btn);
    });
  }
}
