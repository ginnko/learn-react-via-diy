// 这个文件主要用来记录
// 对Component类的分析

// 原文对Component类中唯一的两个静态函数的说明：
// Render用来初始渲染？？？这个过程在哪里执行的？
// Render: Performs initial rendering. 
// Stateless components are called as a regular 
// function — result is displayed immediately. 
// Class components are instantiated and attached 
// to the DOM — and only then are rendered.

// Patch:这个的作用好说

class Component {
  constructor(props) {
    this.props = props || {};
    this.state = null;
  }

  static render(vdom, parent=null) {
    const props = Object.assign({}, vdom.props, {children: vdom.children});
    if (Component.isPrototypeOf(vdom.type)) {
      const instance = new (vdom.type)(props);
      instance.componentWillMount();
      // 下面这行代码就很困惑了
      // 外层的render应该是前面写过的render
      // 但是
      // instance.render()这个方法有问题啊
      // vdom.type是Component类的一个子类
      // instance是子类vdom.type的一个实例
      // render方法是定义在Component类上的静态方法
      // 虽然可以通过继承传给子类vodom.type
      // 但是已经是实例的instance不可能调用的到render啊...
      // 这里是真的困惑了
      // 明白了！！！
      // 这个是子类里定义的render()
      // 在父类中根本就没有定义这个render()
      instance.base = render(instance.render(), parent);
      instance.base.__gooactInstance = instance;// 这个属性是保存了对实例的引用
      instance.base.gooactKey = vdom.props.key;
      instance.componentDidMount();
      return instance.base;
    } else {
      // 这行代码是处理函数组件
      return render(vdom.type(props), parent);
    }
  } 

  static patch(dom, vdom, parent = dom.parentNode) {
    const props = Object.assign({}, vdom.props, {children: vodm.children});
    if (dom.__gooactInstance && dom.__gooactInstance.constructor == vdom.type) {
      // 这里比较的是当组件参数发生变化的情况
      // 目前看来只有上面的render函数中有设置 __gooactInstance 这个属性
      // 所以上面的render函数的作用是用来当组件参数改变的时候执行的？
      dom.__gooactInstance.componentWillReceiveProps(props);
      dom.__gooactInstance.props = props;
      return patch(dom, dom.__gooactInstance.render(), parent);
    } else if (Component.isPrototypeOf(vdom.type)) {
      // 当虚拟节点的类型是Component的子类时
      // 直接替换了
      const ndom = Component.render(vdom, parent);
      return parent ? (parent.replaceChild(ndom, dom) && ndom) : (ndom);
    } else if (!Component.isPrototypeOf(vdom.type)) {
      // 这里是认为vdom.type是一个函数？
      // 针对函数组件？
      return patch(dom, vdom.type(props), parent);
    }
  }

  setState(nextState) {
    if (this.base && this.shouldComponentUpdate(this.props, nextState)) {
      // 这个代码片段中
      // 要注意的是代码的执行顺序
      // 和传入的参数
      const prevState = this.state;
      this.componentWillUpdate(this.props, nextState);
      this.state = nextState;
      // 在比较的代码中就已经存在替换的代码，而且也会发生替代的过程
      // 所以才命名为patch？
      patch(this.base, this.render());
      this.componentDidUpdate(this.props, prevState);
    } else {
      // 想不出来什么时候会出现这种情况
      this.state = nextState;
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    // 桥豆麻袋
    // 这里的比较是浅比较
    // 这样没有问题么？
    return nextProps != this.props || nextState != this.state;
  }

  componentWillReceiveProps(nextProps) {
    return undefined;
  }

  componentWillUpdate(nextProps, nextState) {
    return undefined;
  }

  componentDidUpdate(preProps, prevState) {
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