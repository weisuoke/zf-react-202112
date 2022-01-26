import React from './react';
import ReactDOM from 'react-dom';

let element = <h1 className="title" style={{color: 'red'}}>hello</h1>

console.log(element)

ReactDOM.render(
  element,
  document.getElementById('root')
);