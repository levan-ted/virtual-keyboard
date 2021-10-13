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
    console.log(this.keyButtons);
    document.addEventListener('keydown', this.handleKeydownEvent.bind(this));
    document.addEventListener('keyup', this.handleKeyupEvent.bind(this));
    this.container.addEventListener(
      'mousedown',
      this.handleMouseDown.bind(this)
    );
    this.container.addEventListener('mouseup', this.handleMouseUp.bind(this));
  }

  handleKeydownEvent(e) {
    if (e.stopPropagation) e.stopPropagation();
    const { code, type } = e;
    const keyObj = this.keyButtons.find((key) => key.keyCode === code);
    this.output.focus();

    if (type.match(/key/)) e.preventDefault();

    if (code.match(/Shift/)) this.shiftKey = true;
    if (this.shiftKey) this.renderUpperCase(true);

    if (code.match(/Caps/)) {
      this.isCaps = !this.isCaps;
      this.renderUpperCase(this.isCaps);
      keyObj.btn.classList.toggle('active');
    } else {
      keyObj.btn.classList.add('active');
    }

    // Change Language
    if (code.match(/Control/)) this.ctrlKey = true;
    if (code.match(/Alt/)) this.altKey = true;

    if (code.match(/Control/) && this.altKey) this.changeLang();
    if (code.match(/Alt/) && this.ctrlKey) this.changeLang();

    // Printing values in output
    this.print(keyObj);
  }

  handleKeyupEvent(e) {
    if (e.stopPropagation) e.stopPropagation();
    const { code, type } = e;
    const keyObj = this.keyButtons.find((key) => key.keyCode === code);

    if (type.match(/key/)) e.preventDefault();

    if (!code.match(/Caps/)) keyObj.btn.classList.remove('active');
    if (code.match(/Control/)) this.ctrlKey = false;
    if (code.match(/Alt/)) this.altKey = false;
    if (code.match(/Shift/)) {
      this.shiftKey = false;
      this.renderUpperCase(false);
    }
  }

  handleMouseDown(e) {
    e.stopPropagation();
    const keyDiv = e.target.closest('.kbd__button');
    const code = keyDiv.dataset.keycode;
    this.handleKeydownEvent({ code, type: e.type });
  }

  handleMouseUp(e) {
    e.stopPropagation();
    const keyDiv = e.target.closest('.kbd__button');
    const code = keyDiv.dataset.keycode;
    this.handleKeyupEvent({ code, type: e.type });
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

  renderUpperCase(isTrue) {
    function activateSub(button) {
      button.sub.classList.add('sub--active');
      button.letter.classList.add('sub--inactive');
    }

    function deactivateSub(button) {
      button.sub.classList.remove('sub--active');
      button.letter.classList.remove('sub--inactive');
    }

    if (isTrue) {
      this.keyButtons.forEach((button) => {
        if (button.isSymbol) {
          if (this.shiftKey) {
            activateSub(button);
          }
        }
        if (!(this.isCaps && this.shiftKey) && button.isLetter) {
          button.sub.innerHTML = button.shiftVal;
          button.letter.innerHTML = '';
          activateSub(button);
        } else if (this.isCaps && this.shiftKey && button.isLetter) {
          button.sub.innerHTML =
            button.key === button.shiftVal.toLowerCase() ? '' : button.shiftVal;
          button.letter.innerHTML = button.key;
          deactivateSub(button);
        }
      });
    } else {
      this.keyButtons.forEach((button) => {
        if (button.isSymbol) {
          deactivateSub(button);
        } else if (button.isLetter) {
          // eslint-disable-next-line no-unused-expressions
          button.sub.innerHTML =
            button.key === button.shiftVal.toLowerCase() ? '' : button.shiftVal;
          button.letter.innerHTML = button.key;
          this.isCaps ? activateSub(button) : deactivateSub(button);
        }
      });
    }
  }

  print(keyObj) {
    let cursorPosition = this.output.selectionStart;
    let symbol;

    if (!this.isCaps && !this.shiftKey) {
      symbol = keyObj.key;
    } else if (!this.isCaps && this.shiftKey) {
      symbol = keyObj.shiftVal;
    } else if (this.isCaps && !this.shiftKey) {
      symbol = keyObj.isLetter ? keyObj.shiftVal : keyObj.key;
    } else {
      symbol = keyObj.isLetter ? keyObj.key : keyObj.shiftVal;
    }

    const left = this.output.value.slice(0, cursorPosition);
    const right = this.output.value.slice(cursorPosition);

    const fnBtnHandler = {
      Tab: () => {
        this.output.value = `${left}\t${right}`;
        cursorPosition += 1;
      },
      ArrowLeft: () => {
        cursorPosition = cursorPosition - 1 >= 0 ? cursorPosition - 1 : 0;
      },
      ArrowRight: () => {
        cursorPosition += 1;
      },
      ArrowUp: () => {
        cursorPosition = cursorPosition - 1 >= 0 ? cursorPosition - 1 : 0;
      },
      ArrowDown: () => {
        cursorPosition += 1;
      },
      Enter: () => {
        this.output.value = `${left}\n${right}`;
        cursorPosition += 1;
      },
      Backspace: () => {
        this.output.value = `${left.slice(0, -1)}${right}`;
        cursorPosition -= 1;
      },
      Delete: () => {
        this.output.value = `${left}${right.slice(1)}`;
      },
      Space: () => {
        this.output.value = `${left} ${right}`;
        cursorPosition += 1;
      },
    };

    if (fnBtnHandler[keyObj.keyCode]) fnBtnHandler[keyObj.keyCode]();
    else if (!keyObj.isFnKey) {
      cursorPosition += 1;
      this.output.value = `${left}${symbol || ''}${right}`;
    }
    this.output.setSelectionRange(cursorPosition, cursorPosition);
  }
}
