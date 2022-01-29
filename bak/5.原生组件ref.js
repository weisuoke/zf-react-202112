import React from "./react";
import ReactDOM from "./react-dom";

class Sum extends React.Component {
  constructor() {
    super();
    this.a = React.createRef();
    this.b = React.createRef();
    this.result = React.createRef();
  }

  handleClick = (event) => {
    let valueA = this.a.current.value;
    let valueB = this.b.current.value;
    this.result.current.value = valueA + valueB
  }

  render() {
    return (
      <div>
        <input ref={this.a} /> + <input ref={this.b} />
        <button onClick={this.handleClick}>=</button>
        <input ref={this.result} />
      </div>
    )
  }
}

ReactDOM.render(<Sum />, document.getElementById("root"));