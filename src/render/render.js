/** @jsx createElement */

const createElement = (type, props, ...children) => {
  if (props === null) props = {};
  return {type, props, children};
};

const setAttribute = (dom, key, value) => {
  if (typeof value == 'function' && key.startsWith('on')) {
    const eventType = key.slice(2).toLowerCase();
    dom.__ginnactHandlers = dom.__ginnactHandlers || {};
    dom.removeEventListener(eventType, dom.__ginnactHandlers[eventType]);
    dom.__ginnactHandlers[eventType] = value;
    dom.addEventListener(eventType, dom.__ginnactHandlers[eventType]);
  } else if (key === 'checked' || key === 'value' || key === 'className') {
    dom[key] = value;
  } else if (key === 'style' && typeof value === 'object') {
    Object.assign(dom.style, value);
  } else if (key = 'ref' && typeof value === 'function') {
    value(dom);//此处直接将dom作为参数传入了函数中
  } else if (key === 'key') {
    dom.__ginnactKey = value;//key使用了特殊的属性来保存，没有直接使用‘key’键
  } else if (typeof value !== 'object' && typeof value !== 'function') {
    dom.setAttribute(key, value);
  }
};

const render = (vdom, parent = null) => {
  if (parent) parent.textContent = '';
  const mount = parent ? (el => parent.appendChild(el)) : (el => el);
  if (typeof vdom === 'string' || typeof vdom === 'number') {//.............................Primitive VDOM rendering
    return mount(document.createTextNode(vdom));//类似的这种地方为什么要用return？
  } else if (typeof vdom === 'boolean' || vdom === null) {//................................Primitive VDOM rendering
    return mount(document.createTextNode(''));
  } else if (typeof vdom === 'object' && typeof vdom.type === 'function') {//...............Component VDOM rendering
    return Component.render(vdom, parent);
  } else if (typeof vdom === 'object' && typeof vdom.type === 'string') {//.................Complex VDOM rendering
    const dom = document.createElement(vdom.type);
    for (const child of [].concat(...vdom.children)) {
      dom.appendChild(render(child));//此处说明了为何上面要用return的原因
    }
    for (const prop in vdom.props) {
      setAttribute(dom, prop, vdom.props[prop]);//.........................................Custom Attribute Setter
    }
    return mount(dom);
  } else {
    throw new Error(`Invalid Vdom: ${vdom}.`);
  }
};

let refNode;

const list = <ul className="wrapper">
  <li className="item">One</li>
  <li className="item">Two</li>
  <li ref={node => {refNode = node}}></li>
</ul>;

render(list, document.getElementById('root'));

console.log(refNode);