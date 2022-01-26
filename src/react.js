import { REACT_ELEMENT } from "./constants";
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

const React = {
  createElement,
  Component
}
export default React