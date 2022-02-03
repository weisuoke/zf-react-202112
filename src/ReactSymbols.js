// symbol 虚拟DOM的$$typeof
export const REACT_ELEMENT = Symbol.for('react.element')  // 元素
export const REACT_FORWARD_REF_TYPE = Symbol.for('react.forward_ref') // 转发
export const REACT_CONTEXT = Symbol.for('react.context')  // _currentValue
export const REACT_PROVIDER = Symbol.for('react.provider') // _currentValue
export const REACT_MEMO = Symbol.for('react.memo')  // 缓存的memo
export const REACT_TEXT = Symbol.for('react.text')  // 文本
export const REACT_FRAGMENT = Symbol.for('react.fragment') // 片段