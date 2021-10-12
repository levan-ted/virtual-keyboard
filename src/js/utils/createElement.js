export default function create(el, classNames, children, parent, ...attr) {
  let element = null;

  try {
    element = document.createElement(el);
  } catch (err) {
    throw new Error('Can not create HTML element!');
  }

  if (classNames) element.classList.add(...classNames.split(' '));
  if (children && Array.isArray(children)) {
    children.forEach((child) => child && element.appendChild(child));
  } else if (children && typeof children === 'object') {
    element.appendChild(children);
  } else if (children && typeof children === 'string') {
    element.innerHTML = children;
  }

  if (parent) {
    parent.appendChild(element);
  }

  if (attr.length) {
    attr.forEach(([attrName, attrValue]) => {
      switch (attrName) {
        case '':
          element.setAttribute(attrName, '');
          break;
        case 'value':
          element.setAttribute(attrName, attrValue);
          break;
        case 'id':
          element.setAttribute(attrName, attrValue);
          break;
        case 'placeholder':
          element.setAttribute(attrName, attrValue);
          break;
        case 'cols':
          element.setAttribute(attrName, attrValue);
          break;
        case 'rows':
          element.setAttribute(attrName, attrValue);
          break;
        case 'autocorrect':
          element.setAttribute(attrName, attrValue);
          break;
        case 'spellcheck':
          element.setAttribute(attrName, attrValue);
          break;
        default:
          element.dataset[attrName] = attrValue;
      }
    });
  }

  return element;
}
