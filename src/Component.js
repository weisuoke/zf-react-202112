import { findDOM, compareTwoVdom } from "./react-dom";
import {shallowEqual} from "./utils";

export let updateQueue = {
  isBatchingUpdate: false,  // 更新队里中有一个标识，是否要执行批量更新
  updaters: new Set(),  // Updater实例的集合
  batchUpdate() {
    // 重置为false
    updateQueue.isBatchingUpdate = false
    for(let updater of updateQueue.updaters) {
      updater.updateComponent()
    }
    // 清空updater集合
    updateQueue.updaters.clear()
  }
}

class Updater{
  constructor(classInstance) {
    // 类组件实例
    this.classInstance = classInstance
    // 等待更新的状态
    this.pendingStates = []
    // 更新后的回调
    this.callbacks = []
  }
  addState(partialState, callback) {
    this.pendingStates.push(partialState)
    if (typeof callback === 'function') {
      this.callbacks.push(callback)
    }
    // 触发更新
    this.emitUpdate();
  }
  emitUpdate(nextProps) {
    this.nextProps = nextProps
    // 如果批量更新只需要把 updater 添加到队列里。不需要实时更新
    if (updateQueue.isBatchingUpdate) {
      updateQueue.updaters.add(this)
    } else {
      // 否则就直接更新
      this.updateComponent();
    }
  }
  updateComponent() {
    let { classInstance, pendingStates, nextProps, callbacks } = this;
    // 长度大于 0，说明当前有正在准备要更新的分状态。
    if (nextProps || pendingStates.length > 0) {
      shouldUpdate(classInstance, nextProps, this.getState())
    }
    if (callbacks.length > 0) {
      callbacks.forEach(callback => callback())
      callbacks.length = 0
    }
  }
  // 返回新状态
  getState() {
    let { classInstance, pendingStates } = this;
    // 先获取老状态
    let { state } = classInstance;
    // 用老状态合并新状态
    pendingStates.forEach((partialState) => {
      if (typeof partialState === "function") {
        partialState = partialState(state)
      }
      state = {...state, ...partialState}
    })
    // 清空数组
    pendingStates.length = 0;
    return state;
  }
}

function shouldUpdate(classInstance, nextProps, nextState) {
  // 默认是要更新的
  let willUpdate = true;
  // 如果有方法，并且此方法返回了 false，那就不更新，如果没有此方法，或者返回了 true 就要继续向下更新组件
  if (classInstance.shouldComponentUpdate && !classInstance.shouldComponentUpdate(nextProps, nextState)) {
    willUpdate = false
  }
  if (willUpdate && classInstance.componentWillUpdate) {
    classInstance.componentWillUpdate()
  }
  // 不管要不要更新，都要把最新的状态赋给 classInstance.state
  classInstance.state = nextState
  if(nextProps) classInstance.props = nextProps
  // 如果要更新，才会走组件的更新方法
  if (willUpdate) {
    classInstance.forceUpdate();
  }
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
    // 更新类组件的时候要重新取值
    if (this.constructor.contextType) {
      this.context = this.constructor.contextType._currentValue
    }
    if (this.constructor.getDerivedStateFromProps) {
      let newState = this.constructor.getDerivedStateFromProps(this.props, this.state)
      if (newState)
        this.state = {...this.state, ...newState}
    }
    let snapshot = this.getSnapshotBeforeUpdate && this.getSnapshotBeforeUpdate()
    // 重新执行 render 得到新的虚拟DOM
    let newRenderVdom = this.render()
    // 把老得虚拟DOM和新的虚拟DOM进行对比，对比得到的差异更新到真实DOM
    compareTwoVdom(oldDOM.parentNode, oldRenderVdom, newRenderVdom)
    this.oldRenderVdom = newRenderVdom
    if(this.componentDidUpdate) {
      this.componentDidUpdate(this.props, this.state, snapshot)
    }
  }
}

export class PureComponent extends Component {
  shouldComponentUpdate(newProps, nextState) {
    // 如果新属性和老属性不相等或者新状态和老状态不相等
    return !shallowEqual(this.props, newProps) || !shallowEqual(this.state, nextState)
  }
}