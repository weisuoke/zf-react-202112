import React from "./react";
import ReactDOM from "./react-dom";

/**
 * 1. 在 React 能管理的方法更新是异步的，批量的
 * 2. 在 React 管理不到的地方更新就是同步的
 */
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { number: 0 };
  }
  handleClick = (e) => {
    console.log('handle click')
    // 在 handleClick 方法中执行是批量的，是异步的，会在方法执行结束后再更新
    this.setState({ number: this.state.number + 1 });
    console.log(this.state.number);
    this.setState({ number: this.state.number + 1 });
    console.log(this.state.number);
    setTimeout(() => {
      // 在 setTimeout 里更新是同步的
      this.setState({ number: this.state.number + 1 });
      console.log(this.state.number);
      this.setState({ number: this.state.number + 1 });
      console.log(this.state.number);
    })
  }

  handleDivClick = () => {
    console.log('handle div click')
  }

  render() {
    return (
      <div onClick={this.handleDivClick}>
        <p>{this.props.title}</p>
        <p>number:{this.state.number}</p>
        <button onClick={this.handleClick}>+</button>
      </div>
    )
  }
}
ReactDOM.render(<Counter title="计数器" />, document.getElementById("root"));