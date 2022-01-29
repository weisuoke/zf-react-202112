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
  container.appendChild(newDOM)
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
  // 让 ref.current 指向类组件的实例
  if (ref) ref.current = classInstance;
  let renderVdom = classInstance.render();
  // 把上一次render渲染得到的虚拟DOM
  vdom.oldRenderVdom = classInstance.oldRenderVdom = renderVdom
  return createDOM(renderVdom)
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
    let oldRenderVdom = vdom.oldRenderVdomc
    return findDOM(oldRenderVdom)
  }
}

/**
 * 进行 DOM-DIFF 对比
 * @param parentDOM 父真实 DOM 节点
 * @param oldVdom 老的虚拟 DOM
 * @param newVdom 新的虚拟 DOM
 */
export function compareTwoVdom(parentDOM, oldVdom, newVdom) {
  // 获取老的真实 DOM
  let oldDOM = findDOM(oldVdom)
  let newDOM = createDOM(newVdom)
  parentDOM.replaceChild(newDOM, oldDOM)
}

const ReactDOM = {
  render
}

export default ReactDOM