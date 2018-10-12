# learn-react-inner-workings

这个仓库的目的是帮助自己理解react的内部运行原理。

目前包含下面几部分：

### diy your own react

这个项目是手写react的核心功能，包含：

- vdom
- render
- patch
- Component

详见[这里](./src/diy-react/README.md)

### How Virtual-DOM and diffing works in React

来自这篇[文章](https://medium.com/@gethylgeorge/how-virtual-dom-and-diffing-works-in-react-6fc805f9f84e)

1. 在React中，`setState`函数会把有参数或状态改变的组件标记为`dirty`，并推入一个专门的集合中：

```js
//ReactUpdates.js  - enqueueUpdate(component) function
dirtyComponents.push(component);
```
2. 接下来是更新vdom，使用比较算法做调整，更新dom

> Render is where the Virtual DOM gets re-build and the diffing happends

理解有困难，弃。

### The Inner Workings Of Virtual DOM

来自这篇[文章](https://medium.com/@rajaraodv/the-inner-workings-of-virtual-dom-666ee7ad47cf)


##### JSX

Babel的设置

```js
Option 1:
//.babelrc
{   "plugins": [
      ["transform-react-jsx", { "pragma": "h" }]
     ] 
}
Option 2:
//Add the below comment as the 1st line in every JSX file
/** @jsx h */
```
这几行代码解释了`/** @jsx createElement */`。

默认Babel使用`React.createElement`来转换JSX，上面这两种方式都是用来改变默认函数的。

##### 文章里给出了和`vDom`相关的函数链接

[h]( https://github.com/developit/preact/blob/master/src/h.js)
[VNode]( https://github.com/developit/preact/blob/master/src/vnode.js)
[render]( https://github.com/developit/preact/blob/master/src/render.js)
[buildComponentFromVNode]( https://github.com/developit/preact/blob/master/src/vdom/diff.js#L102)

这个要看下。

##### Scenario 1: Initial Creation Of The App

>When our app loads for the first time, the library ends up creating a VNode with children and attributes for the main FilteredList component.
>Note that this doesn’t create VNode for sub-components (that’s a different loop).

这里的`sub-components`指的是谁...明白了！指的的是自定义组件，此处不会对这类`sub-components`进行渲染。 




