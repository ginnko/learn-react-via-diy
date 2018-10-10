/** @jsx createElement */

const createElement = (type, props, ...children) => {
  if (props === null) props = {};
  return {type, props, children};
};

const setAttribute = (dom, key, vlaue) => {
  if (typeof value === 'function' && key.startsWith('on')) {
    // 用来处理函数属性的情况
    // 一个dom对象上事件都以
    // 事件名：事件回调函数
    // 的键值对形式保存在一个对象中了
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
    // 这里只是单纯的执行了一下
    // 返回的dom对象保存到哪儿去了？
    value(dom);
  } else if (key === 'key') {
    dom.__ginnactKey = value;
  } else if (typeof value !== 'object' && typeof value !== 'function') {
    dom.setAttribute(key, value);
  }
};

// 下面这个render函数
// 用来执行实际的渲染过程
const render = (vdom, parent = null) => {
  const mount = parent ? (el => parent.appendChild(el)) : (el => el);
  if (typeof vdom === 'string' || typeof vdom === 'number') {
    return mount(document.createTextNode(vdom));
  } else if (typeof vdom === 'boolean' || vdom === null) {
    return mount(document.createTextNode(''));
  } else if (typeof vdom === 'object' && typeof vdom.type === 'function') {
    // 此处回答了之前的问题
    // Component的静态方法在此处用来初始化
    return Component.render(vdom, parent);
  } else if (typeof vdom === 'object' && typeof vdom.type === 'string') {
    const dom = mount(document.createElement(vdom.type));
    for (const child of [].concat(...vdom.children)) {
      render(child, dom);
    }
    for (const prop in vdom.props) {
      setAttribute(dom, prop, vdom.props[prop]);
    }
    // 下面这个return是用在patch中的
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
    return dom.textContent !== vdom ? replace(render(vdom, parent)) : dom;
  } else if (typeof vdom === 'object' && dom instanceof Text) {
    return replace(render(vdom, parent));
  } else if (typeof vdom === 'object' && dom.nodeName !== vdom.type.toUpperCase()) {
    return replace(render(vdom, parent));
  } else if (typeof vdom === 'object' && dom.nodeName === vdom.type.toUpperCase()) {
    const pool = {};
    const active = document.activeElement;
    [].concat(...dom.childNodes).map((child, index) => {
      // 果然此处假设key是稳定的
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
    for (const attr of dom.attributes) {
      dom.removeAttribute(attr.name);
    }
    for (const prop in vdom.props) {
      setAttribute(dom, prop, vdom.props[prop]);
    }
    active.focus();
    return dom;
  }
};

class Component {
  constructor(props) {
    this.props = props || {};
    this.state = null;
  }

  static render(vdom, parent = null) {
    
  }
};