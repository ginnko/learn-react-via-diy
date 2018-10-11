/** @jsx createElement */

const createElement = (type, props, ...children) => {
  if (props === null) props = {};
  return {type, props, children};
};

const setAttribute = (dom, key, value) => {
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
    const props = Object.assign({}, vdom.props, {children: vdom.children});
    if (Component.isPrototypeOf(vdom.type)) {
      // 这里就有点高潮了
      // instance是一个实例对象
      // 只是用来创建DOM对象的一个媒介
      // 喵！喵！喵！
      const instance = new (vdom.type)(props);
      instance.componentWillMount();
      instance.base = render(instance.render(), parent);
      instance.base.__ginnactInstance = instance;
      instance.base.__ginnactKey = vdom.props.key;
      instance.componentDidMount();
      return instance.base;
    } else {
      // 这个应该是无状态组件的情况
      return render(vdom.type(props), parent);
    }
  }

  static patch(dom, vdom, parent = dom.parentNode) {
    const props = Object.assign({}, vdom.props, {children: vdom.children});
    if (dom.__ginnactInstance && dom.__ginnactInstance.constructor === vdom.type) {
      dom.__ginnactInstance.componentWillReceiveProps(props);
      // 下面这行代码是干嘛用的？
      // 感觉是用在下下行代码中
      // 用于这里： dom.__ginnactInstance.render()
      // 和之前遇到的vdom.props一个效果
      dom.__ginnactInstance.props = props;
      return patch(dom, dom.__ginnactInstance.render(), parent);
    } else if (Component.isPrototypeOf(vdom.type)) {
      const ndom = Component.render(vdom, parent);
      return parent ? (parent.replaceChild(ndom, dom) && ndom) : (ndom);
    } else if (!Component.isPrototypeOf(vdom.type)) {
      // 针对无状态组件的情况
      return patch(dom, vdom.type(props), parent);
    }
  }

  setState(nextState) {
    if (this.base && this.shouldComponentUpdate(this.props, nextState)) {
      const prevState = this.state;
      // 感觉是下面这两行代码替换了props和state
      this.componentWillUpdate(this.props, nextState);
      this.state = nextState;
      // 然后用render返回替换后的新的vdom
      patch(this.base, this.render());
      this.componentDidUpdate(this.props, prevState);
    } else {
      this.state = nextState;
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps != this.props || nextState != this.state;
  }

  componentWillReceiveProps(nextProps) {
    return undefined;
  }

  componentWillUpdate(nextProps, nextState) {
    return undefined;
  }

  componentDidUpdate(prevProps, prevState) {
    return undefined;
  }

  componentWillMount() {
    return undefined;
  }

  componentDidMount() {
    return undefined;
  }

  componentWillUnmount() {
    return undefined;
  }
};

const TodoItem = (props) => {
  return (
    <li className="todo-item">
      <span>{props.text} - </span>
      <a href="#" onClick={props.onClick}>X</a>
    </li>
  );
};

class Todo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      input: '',
      items: []
    };
    this.handleAdd('Goal #1');
    this.handleAdd('Goal #2');
    this.handleAdd('Goal #3');
  }

  handleInput(e) {
    this.setState({
      input: e.target.value,
      items: this.state.items
    });
  }

  handleAdd(text) {
    const newItems = [].concat(this.state.items);
    newItems.push({
      id: Math.random(),
      text
    });
    this.setState({
      input: '',
      items: newItems
    });
  }
  handleRemove(index) {
    const newItems = [].concat(this.state.items);
    newItems.splice(index, 1);
    this.setState({
      input: this.state.input,
      items: newItems
    });
  }
  render() {
    return (
      <div className="todo">
        <ul className="item-wrapper">
          {
            this.state.items.map((item, index) => {
              return (
                <TodoItem
                  key={item.id}
                  text={item.text}
                  onClick={e => this.handleRemove(index)}
                />
              );
            })
          }
        </ul>
        <input type="text" onInput={e => this.handleInput(e)} value={this.state.input} />
        <button onClick={e => this.handleAdd(this.state.input)}>Add</button>
      </div>
    );
  }
};

render(<Todo />, document.getElementById('root'));