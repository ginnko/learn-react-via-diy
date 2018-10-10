# learn-react-via-diy

本练习主要参考这篇[文章](https://medium.com/@sweetpalma/gooact-react-in-160-lines-of-javascript-44e0742ad60f)。

#### 使用

根目录下运行`npm run build`，然后打开src文件夹下的对应文件夹中的html文件。

#### memo

###### element

`createElement`函数实现相当简单，只是单纯的返回一个对象，对象有三个属性：`type`, `props`以及`children`。

借助`babel`转换同时调用`createElement`将标签字面量形式转换成了对象。

###### render

`render`函数执行了实际的创建dom节点`document.createElement`或者`document.createTextNode`将节点插入到父节点`parent.appendChild(el)`或者`dom.appendChild(render(child))`的过程。

[例子](./src/render/render.js)中走的是`complex rendering`分支。

`setAttribute`函数用在`render`函数中的`complex rendering`分支，用来处理节点属性。

其中`事件回调函数`、`checked, value 以及 className`、`style`、`ref`以及`key`单独处理，其余的属性都是`dom.setAttribute()`函数处理。

这里有个疑问，`直接成为dom元素的属性`和使用`dom.setAttribute`函数处理用什么不同？

感觉上面是按`properties`和`attributes`两类分的。

下面这段话出自[这里](https://stackoverflow.com/questions/6003819/what-is-the-difference-between-properties-and-attributes-in-html)：

>For a given DOM node object, properties are the properties of that object, and attributes are the elements of the attributes property of that object.

文章里说`dom.value`能反映`<input />`值的改变，所以`setAttribute`函数中是作为dom对象的属性处理的，其他也应该是类似或者其他特殊的原因。

###### patch

分情况讨论：

`primitive Vdom` + `Text dom`: 如果值不相同就完全替换

`primitive Vdom` + `Element Dom`: 完全替换

`Complex Vdom` + `Text dom`： 完全替换

`Complex Vdom` + `Element Dom`： 类型不同，完全替换

`Complex Vdom` + `Element Dom`: 类型相同，要经过一个复杂的比较过程

`Component Vdom` + `其他dom`

###### components

下面横杠间的部分是关于class的复习内容，来自阮一峰的[ES6入门](http://es6.ruanyifeng.com/#docs/class)

---

1. 类中有一个`constructor`方法，叫作构造方法，对应ES5的构造函数。

2. 类中的`this`代表实例对象

3. 类是函数类型，类本身指向构造函数（`Point.prototype.constructor === Point`）

4. 类的所有方法都定义在类的`prototype`上，在类的实例上调用方法其实就是在调用类原型上的方法

5. 使用ES5在原型上定义定义的方法是可枚举的，而在类中定义的方法（实质是定义在类的原型上的）是不可枚举的。

6. `constructor`方法是类的默认方法，通过`new`命令生成对象实例时，自动调用该方法。

7. 类必须使用`new`调用，否则会报错，这是它和普通构造函数的一个主要区别，后者不用`new`也可以执行。

8. 和ES5一样，类的所有实例共享一个原型对象

9. class表达式

```js
const MyClass = class Me {
  getClassName() {
    return Me.name;
  }
};
```
上面的代码中，类的名字是*MyClass*，而不是*Me*，*Me*只在class的内部代码可用，指代当前类。

如果在类的内部没有用到*Me*，则可以省略

10. 类的定义不存在变量提升

11. 如果在一个方法前，加上`static`关键字，就表示该方法不会被实例继承，而是直接通过类来调用，这就称为`静态方法`。

12. 如果静态方法中包含`this`关键字，这个`this`指的是类而不是实例。

13. 静态方法和非静态方法可以重名

14. **父类的静态方法可以被子类继承**

15. 静态方法也可以从`super`对象上调用

比如下面这段代码：

```js
class Foo {
  static classMethod() {
    return 'hello';
  }
}

class Bar extends Foo {
  static classMethod() {
    return super.classMethod() + ', too';
  }
}

Bar.classMethod() // "hello, too"
```

16. 类的继承

```js
class ColorPoint extends Point {
  constructor(x, y, color) {
    super(x, y); // 调用父类的constructor(x, y)
    this.color = color;
  }

  toString() {
    return this.color + ' ' + super.toString(); // 调用父类的toString()
  }
}

```

上面的代码中，定义了一个`ColorPoint`类，该类通过`extends`关键字，集成了`Point`类的所有属性和方法。

在`constructor`中的`super`关键字表示父类的构造函数，用来新建父类的`this`对象。

子类必须在`constructor`方法中调用`super`方法，否则新建实例时会报错。这是因为子类自己的`this`对象，必须先通过父类的构造函数完成塑造，得到与父类同样的实例属性和方法，然后再对其进行加工，加上子类自己的实例属性和方法。如果不调用`super`方法，子类就得不到`this`对象。

ES5的继承，实质是先创造子类的实例对象`this`，然后再将父类的方法添加到`this`的上面。

ES6的继承机制完全不同，实质是先将父类实例对象的属性和方法，加到`this`上面（所以必须先调用`super`方法），然后再用子类的构造函数修改`this`。

react的状态组件也是先要调用`super`的，好久没写居然记不清了，这怎么行，真是点点点了。

**super虽然代表了父类A的构造函数，但是返回的是子类B的实例，即super内部的this指的是B，因此super()在这里相当于A.prototype.constructor.call(this)。**
---

#### 简单配置babel环境

详见这篇[文章](https://itnext.io/lessons-learned-using-jsx-without-react-bbddb6c28561)。

#### 知道却没怎么用过的函数

1. `startWith`：用字符串调用

2. `Object.assign`:将第二参数对象中的键值对复制到第一个参数中

3. `Array.prototype.concat()`:可以同时传入多个参数数组

比如在[render](./src/render/render.js)中就联合`展开运算符`使用了这个方法：`[].concat(...vdom.children)`

4. `childNode.remove()`:删除dom节点