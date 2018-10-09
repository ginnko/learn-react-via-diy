# learn-react-via-diy

本练习主要参考这篇[文章](https://medium.com/@sweetpalma/gooact-react-in-160-lines-of-javascript-44e0742ad60f)。

#### 使用

根目录下运行`npm run build`，然后打开src文件夹下的对应文件夹中的html文件。

#### memo

##### element

`createElement`函数实现相当简单，只是单纯的返回一个对象，对象有三个属性：`type`, `props`以及`children`。

借助`babel`转换同时调用`createElement`将标签字面量形式转换成了对象。

##### render

`render`函数执行了实际的创建dom节点`document.createElement`或者`document.createTextNode`将节点插入到父节点`parent.appendChild(el)`或者`dom.appendChild(render(child))`的过程。

[例子](./src/render/render.js)中走的是`complex rendering`分支。

`setAttribute`函数用在`render`函数中的`complex rendering`分支，用来处理节点属性。

其中`事件回调函数`、`checked, value 以及 className`、`style`、`ref`以及`key`单独处理，其余的属性都是`dom.setAttribute()`函数处理。

这里有个疑问，**直接成为dom元素的属性**和使用 **dom.setAttribute** 函数处理用什么不同？

感觉上面是按`properties`和`attributes`两类分的。

下面这段话出自[这里](https://stackoverflow.com/questions/6003819/what-is-the-difference-between-properties-and-attributes-in-html)：

>For a given DOM node object, properties are the properties of that object, and attributes are the elements of the attributes property of that object.

文章里说`dom.value`能反映`<input />`值的改变，所以`setAttribute`函数中是作为dom对象的属性处理的，其他也应该是类似或者其他特殊的原因。

#### 简单配置babel环境

详见这篇[文章](https://itnext.io/lessons-learned-using-jsx-without-react-bbddb6c28561)。

#### 知道却没怎么用过的函数

1. `startWith`：用字符串调用

2. `Object.assign`:将第二参数对象中的键值对复制到第一个参数中

3. `Array.prototype.concat()`:可以同时传入多个参数数组

比如在[render](./src/render/render.js)中就联合`展开运算符`使用了这个方法：`[].concat(...vdom.children)`