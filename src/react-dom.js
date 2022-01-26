import {REACT_TEXT} from "./constants";

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
  let { type, props } = vdom;
  let dom;  // 真实DOM
  if (type === REACT_TEXT) {
    dom = document.createTextNode(props)
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
  return dom;
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

const ReactDOM = {
  render
}

export default ReactDOM