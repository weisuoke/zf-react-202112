import {REACT_FORWARD_REF_TYPE, REACT_TEXT} from "./constants";
import {addEvent} from "./event";

function render(vdom, container) {
  mount(vdom, container)
}

/**
 * 把虚拟 DOM 转成真实 DOM 插入容器里
 * @param vdom  虚拟DOM
 * @param container 容器
 */
function mount(vdom, container) {
  let newDOM = createDOM(vdom)
  if (newDOM) {
    // 把子DOM挂载到父DOM
    container.appendChild(newDOM)
    // 执行子 DOM 的挂载完成事件
    if (newDOM.componentDidMount) newDOM.componentDidMount()
  }
}

/**
 * 把虚拟 DOM 转换成真实 DOM
 * @param vdom 虚拟DOM
 */
function createDOM(vdom) {
  let { type, props, ref } = vdom;
  let dom;  // 真实DOM

  if (type && type.$$typeof === REACT_FORWARD_REF_TYPE) { // 转发组件
    return mountForwardComponent(vdom);
  } else if (type === REACT_TEXT) { // 文本组件
    dom = document.createTextNode(props)
  } else if (typeof type === "function") {
    if (type.isReactComponent) { // 类组件
      return mountClassComponent(vdom);
    } else { // 函数组件
      return mountFunctionComponent(vdom)
    }
  } else {
    dom = document.createElement(type)
  }
  if (props) {
    updateProps(dom, {}, props)
    const children = props.children
    if (typeof children === 'object' && children.type) {
      mount(children, dom)
    } else if (Array.isArray(children)) {
      reconcileChildren(children, dom);
    }
  }

  vdom.dom = dom;
  if (ref) ref.current = dom;
  return dom;
}

function mountForwardComponent(vdom) {
  let { type, props, ref } = vdom;
  let renderVdom = type.render(props, ref)
  vdom.oldRenderVdom = renderVdom
  return createDOM(renderVdom)
}

function mountFunctionComponent(vdom) {
  // 获取函数本身
  let { type, props } = vdom;
  // 把属性对象传递给函数执行，返回要渲染的真实DOM
  let renderVdom = type(props);
  // vdom 老的要渲染的虚拟DOM = renderVdom, 方便后面的 DOM diff
  vdom.oldRenderVdom = renderVdom
  return createDOM(renderVdom)
}

function mountClassComponent(vdom) {
  // 获取函数本身
  let { type: ClassComponent, props, ref } = vdom;
  // 把属性对象传递给函数执行，返回要渲染的虚拟DOM
  let classInstance = new ClassComponent(props);
  // 给虚拟DOM添加一个属性 classInstance
  vdom.classInstance = classInstance
  // 让 ref.current 指向类组件的实例
  if (ref) ref.current = classInstance;
  if (classInstance.componentWillMount) {
    classInstance.componentWillMount()
  }
  let renderVdom = classInstance.render();
  // 把上一次render渲染得到的虚拟DOM
  classInstance.oldRenderVdom = renderVdom
  let dom = createDOM(renderVdom)
  if (classInstance.componentDidMount) {
    dom.componentDidMount = classInstance.componentDidMount.bind(this)
  }
  return dom
}

function reconcileChildren(children, parentDOM) {
  children.forEach((child, index) => {
    mount(child, parentDOM)
  })
}

/**
 * 更新真实 DOM 的属性
 * @param dom
 * @param oldProps
 * @param newProps
 */
function updateProps(dom, oldProps = {}, newProps = {}) {
  for (let key in newProps) {
    if (key === 'children') {
      continue
    } else if (key === 'style') {
      let styleObj = newProps[key];
      for (let attr in styleObj) {
        dom.style[attr] = styleObj[attr];
      }
    } else if(/^on[A-Z].*/.test(key)) {
      // dom[key.toLowerCase()] = newProps[key];
      addEvent(dom, key.toLowerCase(), newProps[key])
    } else {
      dom[key] = newProps[key]
    }
  }

  // 如果属性在老得属性里，新的属性没有，需要从真实 DOM 中删除
  for (let key in oldProps) {
    if (!newProps.hasOwnProperty(key)) {
      dom[key] = null;
    }
  }
}

export function findDOM(vdom) {
  if (!vdom) return null;
  // 如果 vdom 上有 dom 属性，说明这个 vdom 是一个原生组件 span div p
  if (vdom.dom) {
    return vdom.dom;  // 返回它对应的真实 DOM 即可
  } else {
    // 它可能是一个函数组件或者类组件
    // 如果是类组件，从 vdom.classInstance.oldRenderVdom 取要渲染的虚拟 DOM
    // 如果是函数组件，从 vdom.oldRenderVdom 取要渲染的虚拟 DOM
    let oldRenderVdom = vdom.classInstance ? vdom.classInstance.oldRenderVdom : vdom.oldRenderVdom
    return findDOM(oldRenderVdom)
  }
}

/**
 * 进行 DOM-DIFF 对比
 * @param parentDOM 父真实 DOM 节点
 * @param oldVdom 老的虚拟 DOM
 * @param newVdom 新的虚拟 DOM
 * @param nextDOM 下一个真实 DOM
 */
export function compareTwoVdom(parentDOM, oldVdom, newVdom, nextDOM) {
  if (!oldVdom && !newVdom) { // 如果新老都是 null，什么都不做
    return;
  } else if (oldVdom && !newVdom) { // 如果说老的有，新的没有，需要删除老的
    unMountVdom(oldVdom)
  } else if (!oldVdom && newVdom) { // 如果说老的没有，新的有
    let newDOM = createDOM(newVdom);
    if (nextDOM) {
      parentDOM.insertBefore(newDOM, nextDOM)
    } else {
      parentDOM.appendChild(newDOM)
    }
    if (newDOM.componentDidMount) newDOM.componentDidMount()
  } else if (oldVdom && newVdom && oldVdom.type !== newVdom.type) { // 新老都有，但是类型不同，也不能复用
    unMountVdom(oldVdom)
    let newDOM = createDOM(newVdom);
    if (nextDOM) {
      parentDOM.insertBefore(newDOM, nextDOM)
    } else {
      parentDOM.appendChild(newDOM)
    }
    if (newDOM.componentDidMount) newDOM.componentDidMount()
  } else {  // 新的有，老得也有，并且类型一样，就可以走我们的深度比较逻辑了，比较属性和子节点过程
    updateElement(oldVdom, newVdom)
  }
}

/**
 * 深度比较新老虚拟DOM的差异，把差异同步到真实DOM上
 * @param oldVdom
 * @param newVdom
 */
function updateElement(oldVdom, newVdom) {
  if (oldVdom.type === REACT_TEXT) {  // 如果是文本节点的话
    let currentDOM = newVdom.dom = findDOM(oldVdom)
    if (oldVdom.props !== newVdom.props) {
      currentDOM.textContent = newVdom.props
    }
  } else if (typeof oldVdom.type === 'string') {
    let currentDOM = newVdom.dom = findDOM(oldVdom)
    updateProps(currentDOM, oldVdom.props, newVdom.props)
    updateChildren(currentDOM, oldVdom.props.children, newVdom.props.children)
  } else if (typeof oldVdom.type === 'function') {
    // 说明这是一个类组件
    if (oldVdom.type.isReactComponent) {
      updateClassComponent(oldVdom, newVdom)
    } else {
      updateFunctionComponent(oldVdom, newVdom)
    }
  }
}

/**
 * 更新函数组件
 * @param oldVdom
 * @param newVdom
 */
function updateFunctionComponent(oldVdom, newVdom) {
  let currentDOM = findDOM(oldVdom)
  if (!currentDOM) return;
  let parentDOM = currentDOM.parentNode;
  let { type, props } = newVdom;
  let newRenderVdom = type(props);
  compareTwoVdom(parentDOM, oldVdom.oldRenderVdom, newRenderVdom)
  newVdom.oldRenderVdom = newRenderVdom
}

/**
 * 更新类组件
 * @param oldVdom
 * @param newVdom
 */
function updateClassComponent(oldVdom, newVdom) {
  // 让新的虚拟 DOM 对象复用老得类组件的实例
  let classInstance = newVdom.classInstance = oldVdom.classInstance
  if (classInstance.componentWillReceiveProps) {
    classInstance.componentWillReceiveProps(newVdom.props)
  }
  classInstance.updater.emitUpdate(newVdom.props)
}

/**
 *
 * @param parentDOM 父DOM
 * @param oldVChildren 老的虚拟DOM数组
 * @param newVChildren 新的虚拟DOM数组
 */
function updateChildren(parentDOM, oldVChildren, newVChildren) {
  oldVChildren = (Array.isArray(oldVChildren) ? oldVChildren : [oldVChildren]).filter(item => item)
  newVChildren = (Array.isArray(newVChildren) ? newVChildren : [newVChildren]).filter(item => item)
  let maxLength = Math.max(oldVChildren.length, newVChildren.length)
  for (let i = 0; i < maxLength; i++) {
    // 在老的 DOM 树中找索引大于当前的索引，并且存在真实DOM那个虚拟DOM
    let nextVdom = oldVChildren.find((item, index) => index > i && item && findDOM(item))
    compareTwoVdom(parentDOM, oldVChildren[i], newVChildren[i], nextVdom && findDOM(nextVdom))
  }
}

function unMountVdom(vdom) {
  let { type, props, ref} = vdom;
  // 获取当前的真实 DOM
  let currentDOM = findDOM(vdom)
  // vdom 有 classInstance 说明这是一个类组件
  if (vdom.classInstance && vdom.classInstance.componentWillMount) {
    vdom.classInstance.componentWillMount()
  }
  if (ref) {
    ref.current = null
  }
  // 如果此虚拟DOM有子节点，递归删除子节点
  if (props.children) {
    let children = Array.isArray(props.children) ? props.children : [props.children]
    children.forEach(unMountVdom)
  }
  // 把此虚拟 DOM 对应的老的 DOM 节点从父节点中移除
  if (currentDOM) {
    currentDOM.parentNode.removeChild(currentDOM)
  }
}

const ReactDOM = {
  render
}

export default ReactDOM