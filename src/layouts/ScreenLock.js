import React from 'react';
import { Button, Input,Spin } from 'antd';
import Login from 'components/Login';
import userName from '../assets/userName.jpg';
import { setToken, setAuthority, setScreenTime } from '../utils/authority';
import { erpPost } from '../services/ajax';
import styles from './ScreenLock.less';

let timer = null;

class ScreenLock extends React.Component{

  constructor(props, context) {
    super(props, context);
    this.state = {
      hidden: true,
      loading: false,
      password: '',
    };
  };
  componentDidMount = () => {
    document.addEventListener("keydown", this.handleEnterKey);
    this.startTimer();
  };
  componentWillUnmount = () => {
    this.clearTimer();
  };
  // 回车事件
  handleEnterKey = (e) => {
    if(e.keyCode === 13 && !this.state.hidden){
      this.handleSubmit();
    }
  };

  // 获取密码
  handlePasswordChange = e => {
    this.setState({
      password: e.target.value,
    });
  };
  handleSubmit = () => {
    const userList = JSON.parse(localStorage.getItem('userName'));
    const params = {
      enter_no: userList.enter_no,
      username: userList.username,
      password: this.state.password,
    };
    this.setState({
      loading: true,
      password: '',
    });

    erpPost('person/get-token', params, res => {
      setToken(res.data.data.token);
      setAuthority('admin');
      this.setState({
        loading: false,
        hidden: true,
      });
      this.props.onLock(false);
      this.startTimer();
    }, () => {
      this.setState({
        loading: false,
      });
    });

    setTimeout(()=>{
      this.setState({
        loading: false,
      });

    }, 2000);
  };
  // 定时器封装
  clearTimer = () => {
    clearInterval(timer);
    timer = null;
  };
  // 启动定时器
  startTimer = () => {
    if(timer !== null){
      this.clearTimer();
    }
    timer = setInterval(() => {
      if (localStorage.getItem('screenTime') > 0) {
        setScreenTime(localStorage.getItem('screenTime') - 1);
      } else {
        const userList = JSON.parse(localStorage.getItem('userName'));
        if(userList === null && typeof(this.props.history) !== 'undefined'){
          this.props.history.push('/user/login');
        }else{
          this.setState({
            hidden: false,
          });
        }
        this.clearTimer();
        this.props.onLock(true);
      }
    }, 1000);
  };

  render(){
    const username = JSON.parse(localStorage.getItem('userName'));
    const { hidden, loading, password}=this.state;
    const loginDom = (
      <div className={styles.loginBox}>
        <div className={styles.loginImg}>
          <img src={userName} alt="" />
        </div>
        <p>{username && username.real_name}</p>
        <div className={styles.loginPass}>
          <Input
            type="password"
            autoFocus={!hidden}
            placeholder="请输入密码"
            onChange={this.handlePasswordChange}
            value={password}
          />
        </div>
        <div className={styles.loginName}>
          <Button onClick={this.handleSubmit} type="primary" loading={loading}>
            登录
          </Button>
        </div>
      </div>
    );
    return hidden ? '' : (
      <Login className="erpBack">
        {loading ? <div className={styles.loginBox}><div className={styles.loading}><Spin size="large" /></div></div> : loginDom }
        {loading ? '' :(
          <p className={styles.footer}>
            由于账号长时间未操作，系统为了保护信息安全，将会对5分钟未操作的用户进行锁定保护。
          </p>
        )
        }
      </Login>
    )
  }
}

export default ScreenLock;
