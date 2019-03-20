import React from 'react';
import {Button, Row, Col, Icon} from 'antd';

export default class Starting extends React.Component{
  state = {

  };
  handleStart = () => {
    if(this.props.onClose){
      this.props.onClose();
    }
  }
  render(){
    return(

      <div>
        <div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:500}}>
          <div>
            <Icon type="check-circle" style={{fontSize:150, color:'#52c41a'}} />
            <h2 style={{margin:0,padding:0,textAlign:'center'}}>设置成功</h2>
          </div>
        </div>
        <Row>
          <Col span='24' style={{display:'flex',justifyContent:'flex-end',alignItems:'flex-end'}}>
            <Button type='primary' onClick={this.handleStart}>
              开始使用
            </Button>
          </Col>
        </Row>
      </div>

    );
  }
}