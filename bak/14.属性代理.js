import React from './react';
import ReactDOM from './react-dom';

/**
 * 高阶组件有两种用法
 * 1. 属性代理
 * 2. 反向继承
 */

const withLoading = message => OldComponent => {
  return class extends React.Component {
    render() {
      const state = {
        show() {
          let div = document.createElement('div');
          div.innerHTML = `<p id="loading" style="position:absolute;top:100px;z-index:10;background-color:grey">${message}</p>`;
          document.body.appendChild(div);
        },
        hide() {
          document.getElementById('loading').remove();
        }
      }
      return <OldComponent {...this.props} {...state} />
    }
  }
}

@withLoading('加载中...')
class App extends React.Component {
  render() {
    return (
      <div>
        <p>App</p>
        <button onClick={this.props.show}>show</button>
        <button onClick={this.props.hide}>hide</button>
      </div>
    )
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);