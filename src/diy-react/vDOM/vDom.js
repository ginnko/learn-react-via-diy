/** @jsx createElement */

const createElement = (type, props, ...children) => {
  if (props === null) props = {};
  return {type, props, children};
};

const showVDom = (vdom) => {
  return JSON.stringify(vdom, null, 4);
};

const one = <div className="one">hello world</div>;
const two = <ul className="two">
  <li className="two-item">first</li>
  <li className="two-item">second</li>
</ul>;

document.querySelector('#one').textContent = showVDom(one);
document.querySelector('#two').textContent = showVDom(two);