import {REACT_CONTEXT, REACT_ELEMENT, REACT_FORWARD_REF_TYPE, REACT_PROVIDER} from "./constants";
import { wrapToVdom } from "./utils";
import { Component } from "./Component";

/**
 * 用来创建 React 元素的工厂方法
 * @param type 元素的类型
 * @param config 配置项
 * @param children 儿子们
 */
function createElement(type, config, children) {
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

function createContext() {
  let context = { $$typeof: REACT_CONTEXT }
  context.Provider = {
    $$typeof: REACT_PROVIDER,
    _context: context
  }
  context.Consumer = {
    $$typeof: REACT_CONTEXT,
    _context: context
  }
  return context;
}

function cloneElement(element, newProps, ...newChildren) {
  let oldChildren = element.props && element.props.children
  oldChildren = (Array.isArray(oldChildren) ? oldChildren : [oldChildren]).filter(item => typeof item !== "undefined").map(wrapToVdom)
  newChildren = newChildren.filter(item => typeof item !== "undefined").map(wrapToVdom)
  let props = {...element.props, ...newProps}
  if (newChildren.length > 0) {
    props.children = newChildren
  } else {
    props.children = oldChildren
  }
  if (props.children.length === 0) {
    props.children = undefined
  } else if (props.children.length === 1) {
    props.children = props.children[0]
  }
  return {...element, props}
}

const React = {
  createElement,
  Component,
  createRef,
  forwardRef,
  createContext,
  cloneElement,
}
export default React