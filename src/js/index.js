import * as storage from './storage.js';
import layout from './layout.js';
import Keyboard from './Keyboard.js';

import '../css/style.css';

const lang = storage.get('lang', '"en"');

new Keyboard(layout).init(lang).generateLayout();
