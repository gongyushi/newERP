import React from 'react';
import waitingImg from '../../assets/waiting.png';

export default class Unknown extends React.Component{
  state = {

  };
  render(){
    return(
      <div style={{width: '100%',height: 600,display:'flex',justifyContent:'center',alignItems:'center'}}>
        <div>
          <img src={waitingImg} alt="" style={{width: 700,height: 500}} />
          <h3 style={{opacity:0.8,textAlign:'center',fontSize:'1.5em'}}>
            功能开发中...
          </h3>
        </div>
      </div>
    );
  }
}