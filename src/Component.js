import { findDOM, compareTwoVdom } from "./react-dom";

class Updater{
  constructor(classInstance) {
    // 类组件实例
    this.classInstance = classInstance
    // 等待更新的状态
    this.pendingStates = []
  }
  addState(partialState) {
    this.pendingStates.push(partialState)
    // 触发更新
    this.emitUpdate();
  }
  emitUpdate() {
    this.updateComponent();
  }
  updateComponent() {
    let { classInstance, pendingStates } = this;
    // 长度大于 0，说明当前有正在准备要更新的分状态。
    if (pendingStates.length > 0) {
      shouldUpdate(classInstance, this.getState())
    }
  }
  // 返回新状态
  getState() {
    let { classInstance, pendingStates } = this;
    // 先获取老状态
    let { state } = classInstance;
    // 用老状态合并新状态
    pendingStates.forEach((partialState) => {
      state = {...state, ...partialState}
    })
    // 清空数组
    pendingStates.length = 0;
    return state;
  }
}

function shouldUpdate(classInstance, nextState) {
  classInstance.state = nextState
  classInstance.forceUpdate();
}

export class Component {
  static isReactComponent = true
  constructor(props) {
    this.props = props
    this.state = {}
    this.updater = new Updater(this)
  }
  setState(partialState) {
    this.updater.addState(partialState)
  }
  // 让类组件强行更新
  forceUpdate() {
    // 获取此组件上一次 render 渲染出来的虚拟 DOM
    let oldRenderVdom = this.oldRenderVdom;
    // 获取虚拟DOM对应的真实DOM oldRenderVdom.dom
    let oldDOM = findDOM(oldRenderVdom)
    // 重新执行 render 得到新的虚拟DOM
    let newRenderVdom = this.render()
    // 把老得虚拟DOM和新的虚拟DOM进行对比，对比得到的差异更新到真实DOM
    compareTwoVdom(oldDOM.parentNode, oldRenderVdom, newRenderVdom)
    this.oldRenderVdom = newRenderVdom
  }
}