import React from "./react";
import ReactDOM from "./react-dom";

function TextInput(props, forwardRef) {
  return <input type="text" ref={forwardRef}/>
}

const ForwardedTextInput = React.forwardRef(TextInput)

class Form extends React.Component {
  constructor() {
    super();
    this.textInputRef = React.createRef()
  }

  getFocus = () => {
    this.textInputRef.current.focus()
  }

  render() {
    return (
      <div>
        <ForwardedTextInput ref={this.textInputRef} />
        <button onClick={this.getFocus}>获得焦点</button>
      </div>
    )
  }
}

ReactDOM.render(<Form />, document.getElementById("root"));