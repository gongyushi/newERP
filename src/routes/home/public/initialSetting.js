import React from 'react';
import { Button } from 'antd';
import { erpPost } from '../../../services/ajax';
import Prompt from '../../../components/Prompt';

require('./message.less');

export default class InitialSetting extends React.Component{
  state = {
    initStep: this.props.initStep,
  };
  componentDidMount () {
    const { initStep } = this.state;
    if(initStep === 3){
      this.handleCheckComplete();
    }
  }
  componentWillReceiveProps(next){
    this.setState({
      initStep: next.initStep,
    });
  }
  handleNext = () => {
    if(this.props.onNext){
      this.props.onNext(this.props.current);
    }
  }
  handleStart = () => {
    // 请求开始初始化接口
    this.handleInitial();
    // 调用循环请求是否已完成接口
    this.handleCheckComplete();
  }
  handleInitial = () => {
    erpPost('person/third-step',{},() => {
      Prompt.success({content:'开始初始化，请耐心等待'});
      this.setState({
        initStep: 3,
      });
    },() => {
      Prompt.error({content:'初始化失败，请重试'});
    });
  }
  handleCheckComplete = () => {
    const request = setInterval(()=>{
      erpPost('person/get-init-result',{},res => {
        const { status } = res.data.data;
        if(status === 0){
          this.setState({
            initStep: 2,
          });
          clearInterval(request);
        }else if(status === 2){
          clearInterval(request);
          this.handleNext();
        }
      });
    },30000);
  }
  render(){
    const { initStep } = this.state;
    return(
      <div>
        <div style={{minHeight:500,display:'flex',justifyContent:'center',alignItems:'center'}}>
          {/* <Spin size='large' tip='正在初始化，请耐心等待......' /> */}
          {
            initStep && initStep !== 3 ? (
              <Button type='primary' onClick={this.handleStart}>
                开始初始化
              </Button>
            ) : (
              <div>
                <span className='loading ant-spin-dot ant-spin-dot-spin'>
                  <i /><i /><i /><i />
                </span>
                <span>
                  正在初始化，请耐心等待......
                </span>
              </div>
            )
          }
        </div>
      </div>
    );
  }
} 