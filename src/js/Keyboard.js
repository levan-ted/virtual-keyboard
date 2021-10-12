/* eslint-disable no-param-reassign */
import create from './utils/createElement.js';
import Key from './Key.js';
import * as storage from './storage.js';

const main = create('main', 'main--container', [
  create('h1', 'title', 'RSS Virtual Keyboard'),
  create('h3', 'subtitle', 'Languages: English, Georgian'),
  create(
    'p',
    'instruction',
    'In order to switch language, press <kbd>Alt</kbd>+<kbd>Ctrl</kbd>'
  ),
]);

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
      const btn = new Key(keyObj);
      this.keyButtons.push(btn);
      document.querySelector('.keyboard').appendChild(btn.get());
    });

    document.addEventListener('keydown', this.handleEvent.bind(this));
    document.addEventListener('keyup', this.handleEvent.bind(this));
  }

  handleEvent(e) {
    if (e.stopPropagation) e.stopPropagation();
    const { code, type } = e;
    const keyObj = this.keyButtons.find((key) => key.keyCode === code);
    this.output.focus();

    if (type.match(/keydown|mousedown/)) {
      if (type.match(/key/)) e.preventDefault();
      keyObj.btn.classList.add('active');

      // Change Language
      if (code.match(/Control/)) this.ctrlKey = true;
      if (code.match(/Alt/)) this.altKey = true;

      if (code.match(/Control/) && this.altKey) this.changeLang();
      if (code.match(/Alt/) && this.ctrlKey) this.changeLang();
    } else if (type.match(/keyup|mouseup/)) {
      keyObj.btn.classList.remove('active');
      if (code.match(/Control/)) this.ctrlKey = false;
      if (code.match(/Alt/)) this.altKey = false;
    }
  }

  changeLang() {
    const langList = Object.keys(this.layout); // =>['en','ka']
    let langIndex = langList.indexOf(this.container.dataset.language);
    this.language =
      langIndex + 1 >= langList.length
        ? this.layout[langList[(langIndex -= langIndex)]] // In order to update dataset
        : this.layout[langList[(langIndex += 1)]]; // In order to update dataset

    this.container.dataset.language = langList[langIndex];
    storage.set('lang', langList[langIndex]);

    this.keyButtons.forEach((btn) => {
      const keyObj = this.language.find((key) => key.keyCode === btn.keyCode);
      if (!keyObj) return;
      btn.key = keyObj.key;
      btn.shiftVal = keyObj.shiftVal;
      btn.sub.innerHTML = '';
      btn.letter.innerHTML = btn.key;

      if (btn.shiftVal && btn.key !== btn.shiftVal.toLowerCase()) {
        btn.sub.innerHTML = btn.shiftVal;
      }
    });
  }
}
