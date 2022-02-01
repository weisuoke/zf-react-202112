import React from './react';
import ReactDOM from './react-dom';

let  Child = ({data,handleClick})=>{
  console.log('Child render');
  return (
    <button onClick={handleClick}>{data.number}</button>
  )
}
Child = React.memo(Child);

function App(){
  console.log('App render');
  const[name,setName]=React.useState('zhufeng');
  const[number,setNumber]=React.useState(0);
  let data = React.useMemo(()=>({number}),[number]);
  let handleClick = React.useCallback(()=> setNumber(number+1),[number]);
  return (
    <div>
      <input type="text" value={name} onChange={event=>setName(event.target.value)}/>
      <Child data={data} handleClick={handleClick}/>
    </div>
  )
}

ReactDOM.render(
  <App />, document.getElementById('root'));