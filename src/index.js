import React from './react';
import ReactDOM from './react-dom';

/**
 * 函数组件
 * 1. 必须接收一个 props 对象，并返回一个 React 元素
 * 2. 函数组件的名称必须是大写的开头
 * 3. 必须先定义再使用
 * 4. 函数组件能且只能返回一个根节点 JSX 表达式必须具有一个父元素
 */
// function FunctionComponent(props) {
//   return <div className="title" style={{color: 'red'}}><span>{props.name}</span>{props.children}</div>;
// }
//
// let element = <FunctionComponent name="hello">world</FunctionComponent>;

class ClassComponent extends React.Component {
  render() {
    return <div className="title" style={{color: 'red'}}><span>{this.props.name}</span>{this.props.children}</div>;
  }
}

let element = <ClassComponent name="hello">world</ClassComponent>;

console.log(element)

ReactDOM.render(
  element,
  document.getElementById('root')
);