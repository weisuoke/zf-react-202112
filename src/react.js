import {REACT_ELEMENT, REACT_FORWARD_REF_TYPE} from "./constants";
import { wrapToVdom } from "./utils";
import { Component } from "./Component";

/**
 * 用来创建 React 元素的工厂方法
 * @param type 元素的类型
 * @param config 配置项
 * @param children 儿子们
 */
function createElement(type, config, children) {
  console.log('createElement', type, config.ref)
  let ref, key;
  if (config) {
    ref = config.ref;
    key = config.key;
    delete config.ref;
    delete config.key;
    delete config.__source;
    delete config.__self;
  }
  let props = { ...config }
  // 有多个儿子，props.children 就是一个数组
  if (arguments.length > 3) {
    props.children = Array.prototype.slice.call(arguments, 2).map(wrapToVdom);
  } else {  // 如果只有一个儿子
    props.children = wrapToVdom(children)
  }

  return {
    $$typeof: REACT_ELEMENT,
    type,
    ref,
    key,
    props,
  }
}

function createRef() {
  return {
    current: null
  }
}

function forwardRef(render) {
  return {
    $$typeof: REACT_FORWARD_REF_TYPE,
    render
  }
}

const React = {
  createElement,
  Component,
  createRef,
  forwardRef
}
export default React