/** @jsx createElement */

const createElement = (type, props, ...children) => {
  if (props === null) props = {};
  return {type, props, children};
};

const showVDom = (vdom) => {
  return JSON.stringify(vdom, null, 4);
};

const one = <div>hello world</div>;
const two = <ul>
  <li>first</li>
  <li>second</li>
</ul>;

document.querySelector('#one').textContent = showVDom(one);
document.querySelector('#two').textContent = showVDom(two);