import React from "./react";
import ReactDOM from "./react-dom";

/**
 * 类组件的生命周期
 */

class Counter extends React.Component {
  // 设置默认属性
  static defaultProps = {
    name: 'zhufeng'
  }

  constructor(props) {
    super(props);
    // 设置默认状态对象
    this.state = {number: 0}
  }

  handleClick = () => {
    this.setState({ number: this.state.number + 1 })
  }

  render() {
    console.log(`Counter 3. render`)
    return (
      <div id="counter">
        <p>{ this.state.number }</p>
        <ChildCounter count={this.state.number} />
        <button onClick={this.handleClick}>+</button>
      </div>
    )
  }
}

class ChildCounter extends React.Component {
  constructor() {
    super();
    this.state = {
      number: 0
    }
  }

  // 所有 willXX 的方法都废弃了 componentWillReceiveProps
  static getDerivedStateFromProps(nextProps, nextState) {
    const { count } = nextProps
    if (count % 2 === 0) {
      return { number: count * 2 }
    } else if (count % 3 === 0) {
      return { number: count * 3 }
    }

    return null
  }

  render() {
    console.log(`ChildCounter 2.render`)
    return <div id="sub-counter">{this.state.number}</div>
  }
}

ReactDOM.render(<Counter />, document.getElementById("root"));