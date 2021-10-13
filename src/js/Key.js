import create from './utils/createElement.js';

export default class Key {
  constructor({ keyCode, key, shiftVal }) {
    this.keyCode = keyCode;
    this.key = key;
    this.shiftVal = shiftVal;
    this.isFnKey = Boolean(
      keyCode.match(
        /Meta|Caps|Enter|Delete|Backspace|Tab|Shift|Alt|Arrow|Control/
      )
    );
    this.isLetter = Boolean(keyCode.match(/Key/));
    this.isSymbol = !!(!this.isFnKey && !this.isLetter);

    if (shiftVal && shiftVal.toLowerCase() !== key) {
      this.sub = create('div', 'sub', this.shiftVal);
    } else this.sub = create('div', 'sub', '');

    this.letter = create('div', 'letter', this.key);
    this.btn = create(
      'div',
      'kbd__button',
      [this.sub, this.letter],
      null,
      ['keycode', this.keyCode],
      this.isFnKey ? ['fn', 'true'] : ['fn', 'false']
    );

    this.enlargeButtons(this.keyCode, this.btn);
  }

  enlargeButtons(keyCode, btn) {
    const isWideBtn = Boolean(keyCode.match(/Caps|Enter|Backspace/));
    if (isWideBtn) btn.classList.add('span2');
    if (keyCode === 'Space') btn.classList.add('span7');
    if (keyCode === 'ShiftLeft') btn.classList.add('span3');
  }

  get() {
    return this.btn;
  }
}
