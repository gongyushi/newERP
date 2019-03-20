import React from 'react';
import PropTypes from 'prop-types';
import { Steps, Button, message, Row, Col, Divider, Icon } from 'antd';
import MessageForm from './public/messageForm';
import AddAuthorization from './public/addAuthorization';
import ConfigureShop from './public/configureShop';
import styles from './home.less';
import InitialSetting from './public/initialSetting';
import Starting from './public/starting';

const { Step } = Steps;

class SettingGuide extends React.Component {
  static propTypes = {};
  constructor(props) {
    super(props);
    this.state = {
      current: this.handleInitCurrent(this.props.current),
      // current: 1,
      data: [], // 开站点列表
    };
  }
  componentWillReceiveProps(next){
    this.setState({
      current: this.handleInitCurrent(next.current),
    });
  }
  handleInitCurrent = (val) => {
    let current = 0;
    switch(val){
      case 0:
        current = 0;
        break;
      case 1:
        current = 1;
        break;
      case 1.5:
        current = 2;
        break;
      case 2: case 3:
        current = 3;
        break;
      case 4:
        current = 4;
        break;
      default: ;
    }
    return current;
  }
  handleNext(current,data) {
    if(current === 1){
      current = 0.5;
    }
    this.setState({
      current: this.handleInitCurrent(current + 1),
      data,
    });
  }
  handlePrev(current) {
    this.setState({
      current: current - 1,
    });
  }
  handleClose = () => {
    if(this.props.onClose){
      this.props.onClose();
    }
  }
  render() {
    const { current, data } = this.state;
    const stepItems = [
      {
        title: '基本信息',
        discription: '设置企业的基本信息',
        content: () => <MessageForm current={this.state.current} onNext={this.handleNext.bind(this)} />,
      },
      {
        title: '添加授权',
        discription: '添加授权的店铺信息',
        content: () => <AddAuthorization current={this.state.current} onNext={this.handleNext.bind(this)} onPrev={this.handlePrev.bind(this)} />,
      },
      {
        title: '配置店铺',
        discription: '配置店铺信息',
        content: () => <ConfigureShop current={this.state.current} data={data} onNext={this.handleNext.bind(this)} onPrev={this.handlePrev.bind(this)} />,
      },
      {
        title: '初始化设置',
        discription: '初始化设置在线商品及仓库信息',
        content: () => <InitialSetting current={this.state.current} initStep={this.props.current} onNext={this.handleNext.bind(this)} />,
      },
      {
        title: '开始使用',
        discription: '初始化设置在线商品及仓库信息',
        content: () => <Starting onClose={this.handleClose} />,
      },
    ];
    return (
      <Row style={{width:'90%', minWidth:960}}>
        <Col sm={{offset: 1}} md={{offset: 2}} style={{display:'flex',justifyContent:'flex-start'}}>
          <div>
            <Icon type='cloud-o' style={{fontSize:100,color:'#518DED'}} />
            <p style={{color:'#518DED',fontSize:24,textAlign:'center',padding:0,margin:0}}>设置向导</p>
          </div>
        </Col>
        <Divider style={{height:2}} />
        <Row className='steps'>
          <Col sm={{span: 4, offset: 1}} md={{span: 4, offset: 2}}>
            <Steps current={current} direction='vertical'>
              {stepItems.map(item => <Step key={item.title} title={item.title} />)}
            </Steps>
          </Col>
          <Col sm={{span: 18}} md={{span: 16}}>
            <div className={styles.stepContent}>
              {stepItems[current].content()}
            </div>
          </Col>
        </Row>
      </Row>
    );
  }
}

export default SettingGuide;
