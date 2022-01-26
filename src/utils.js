import { REACT_TEXT } from "./constants";

/**
 * 把虚拟 DOM 节点进行包装
 * 如果此虚拟DOM是一个文本，比如说是字符串或者数字，包装成一个虚拟DOM节点对象
 * @param element 虚拟DOM
 * @returns {{type: symbol, props: {content: (string|number)}}|*}
 */
export function wrapToVdom(element) {
  return typeof element === 'string' || typeof element === 'number' ? {
    type: REACT_TEXT, props: element
  } : element
}