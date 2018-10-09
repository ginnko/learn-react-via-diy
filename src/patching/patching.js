/** @jsx createElement */

const createElement = (type, props, ...children) => {
  if (props === null) props = {};
  return {type, props, children};
};

const setAttribute = (dom, key, value) => {
  if (typeof value == 'function' && key.startWith('on')) {
    const eventType = key.slice(2).toLowerCase();
    dom.__ginnactHandlers = dom.__ginnactHandlers || {};
    dom.removeEventListener(eventType, dom.__ginnactHandlers[eventType]);
    dom.__ginnactHandlers[eventType] = value;
    dom.addEventListener(eventType, dom.__ginnactHandlers[eventType]);
  } else if (key === 'checked' || key === 'value' || key === 'className') {
    dom[key] = value;
  } else if (key === 'style' && typeof value === 'object') {
    Object.assign(dom.style, value);
  } else if (key === 'ref' && typeof value === 'function') {
    value(dom);
  } else if (key === 'key') {
    dom.ginnactKey = value;
  } else if (typeof value !== 'object' && typeof value !== 'function') {
    dom.setAttribute(key, value);
  }
};

const render = (vdom, parent = null) => {
  console.log('render:', vdom);
  const mount = parent ? (el => parent.appendChild(el)) : (el => el);
  if (typeof vdom === 'string' || typeof vdom === 'number') {
    return mount(document.createTextNode(vdom));
  } else if (typeof vdom === 'boolean' || vdom === null) {
    return mount(document.createTextNode(''));
  } else if (typeof vdom == 'object' && typeof vdom.type === 'function') {
    return Component.render(vdom, parent);
  } else if (typeof vdom === 'object' && typeof vdom.type === 'string') {
    const dom = mount(document.createElement(vdom.type));
    for (const child of [].concat(...vdom.children)) {
      render(child, dom);
    }
    for (const prop in vdom.props) {
      setAttribute(dom, prop, vdom.props[prop]);
    }
    return dom;
  } else {
    throw new Error(`Invalid VDOM: ${vdom}.`);
  }
};

const patch = (dom, vdom, parent = dom.parentNode) => {
  const replace = parent ? el => (parent.replaceChild(el, dom) && el) : (el => el);
  if (typeof vdom === 'object' && typeof vdom.type === 'function') {
    return Component.patch(dom, vdom, parent);
  } else if (typeof vdom !== 'object' && dom instanceof Text) {
    return dom.textContent !== vdom ? replace(render(vdom, parent)) : dom;//这里replace的新旧节点都有一样的父节点，这个可以正常执行
  } else if (typeof vdom === 'object' && dom.nodeName !== vdom.type.toUpperCase()) {
    return replace(render(vdom, parent));
  } else if (typeof vdom === 'object' && dom.nodeName === vdom.type.toUpperCase()) {
    const pool = {};
    const active = document.activeElement;
    [].concat(...dom.childNodes).map((child, index) => {
      const key = child.__ginnactKey || `__index_${index}`;
      pool[key] = child;
    });
    [].concat(...vdom.children).map((child, index) => {
      const key = child.props && child.props.key || `__index_${index}`;
      dom.appendChild(pool[key] ? patch(pool[key], child) : render(child, dom));
      delete pool[key];
    });
    for (const key in pool) {
      const instance = pool[key].__ginnactInstance;
      if (instance) instance.componentWillUnmount();
      pool[key].remove();
    }

    for (const attr of dom.attributes) dom.removeAttribute(attr.name);
    for (const prop in vdom.props) setAttribute(dom, prop, vdom.props[prop]);
    active.focus();
    return dom;
  }
};

const oldList = <ul className="wrapper">
  <li className="item" key="one">One</li>
  <li className="item" key="two">Two</li>
</ul>;

const newList = <ul className="wrapper">
  <li className="item" key="three">Three</li>
  <li className="item" key="four">Four</li>
</ul>;

const dom = render(oldList, document.getElementById('root'));

const patchBtn = document.getElementById('patchBtn');

patchBtn.addEventListener('click', function() {
  patch(dom, newList);
});
