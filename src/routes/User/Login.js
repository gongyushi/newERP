import React, { Component } from 'react';
import { connect } from 'dva';
import {
  Checkbox,
  Alert,
  // Icon,
  Select,
} from 'antd';
import Login from 'components/Login';
import styles from './Login.less';
import { erpPost } from '../../services/ajax';
import {
  setAuthority,
  setToken,
  setUserName,
  setShowBack,
  setMenuList,
  setActionList,
} from '../../utils/authority';
import { reloadAuthorized } from '../../utils/Authorized';
import loginLeft from '../../assets/loginLeft.png';
import chinaImg from '../../assets/login/china.png';
import englishImg from '../../assets/login/english.png';

const { Tab, UserName, Password, Submit } = Login;
const { Option } = Select;

@connect(({ login, loading }) => ({
  login,
  submitting: loading.effects['login/login'],
}))
export default class LoginPage extends Component {
  state = {
    type: 'account',
    autoLogin: true,
    logIndex: 1,
  };

  onTabChange = type => {
    this.setState({ type });
  };

  // 递归获取登录信息中所有的action，返回action数组
  getActionList = items => {
    let actionList = [];

    if(toString.call(items) === '[object Array]') {
      items.map((item) => {
        if(toString.call(item.items) === '[object Array]'){
          actionList = actionList.concat(this.getActionList(item.items));
        }
        if(toString.call(item.path) !== '[object Undefined]'){
          actionList.push(item.path);
        }
        return item;
      });
    }
    return actionList;
  };

  handleSubmit = (err, values) => {
    if (!err) {
      erpPost('person/login', values, res => {
        if (res.data.code === 200) {
          const erpUser = res.data.data;
          setToken(res.data.data.token);
          setUserName(JSON.stringify(erpUser));

          erpUser.permission.forEach(val => {
            if (val.items) {
              val.path = `${val.items[0].path}`;
            }
          });

          setMenuList(JSON.stringify(erpUser.permission));
          setActionList(JSON.stringify(this.getActionList(erpUser.permission)));
          setAuthority('admin');
          setShowBack(0);
          reloadAuthorized();
          this.props.history.push('/home');
        } else {
          this.setState({
            logIndex: res.data.code,
          });
        }
      });
    }
  };
  // 语言选择
  handleChange = value => {
    console.log(value);
  };
  changeAutoLogin = e => {
    this.setState({
      autoLogin: e.target.checked,
    });
  };

  renderMessage = content => {
    return <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />;
  };

  render() {
    const { login, submitting } = this.props;
    const { type } = this.state;
    return (
      <div className={styles.login}>
        <div className={styles.loginLeft}>
          <img src={loginLeft} alt="" />
        </div>
        <div className={styles.main}>
          <Login
            defaultActiveKey={type}
            onTabChange={this.onTabChange}
            onSubmit={this.handleSubmit}
          >
            <Tab key="account" tab="账户密码登录">
              {login.status === 'error' &&
                // login.type === 'account' &&
                !login.submitting &&
                this.renderMessage('账户或密码错误（admin/888888）')}
              <Select
                style={{ width: 248 }}
                labelInValue
                defaultValue={{ key: 'china' }}
                onChange={this.handleChange}
              >
                <Option value="china">
                  <img src={chinaImg} alt="" /> 中文
                </Option>
                <Option value="english">
                  <img src={englishImg} alt="" /> 英文
                </Option>
              </Select>
              <UserName name="enter_no" placeholder="请输入企业代码" />
              <UserName name="username" placeholder="请输入用户名" />
              <Password name="password" placeholder="请输入密码" />
            </Tab>
            {/* <Tab key="mobile" tab="手机号登录">
            {login.status === 'error' &&
              login.type === 'mobile' &&
              !login.submitting &&
              this.renderMessage('验证码错误')}
            <Mobile name="mobile" />
            <Captcha name="captcha" />
          </Tab> */}
            <div>
              <Checkbox checked={this.state.autoLogin} onChange={this.changeAutoLogin}>
                自动登录
              </Checkbox>
              {/* <a style={{ float: 'right' }} href="">
                忘记密码
              </a> */}
            </div>
            {this.state.logIndex === 1 ? (
              <div style={{ height: 21 }}>{null}</div>
            ) : (
                <div style={{ color: 'red', height: 21 }}>用户名或者密码错误</div>
              )}
            <Submit loading={submitting}>登录</Submit>
            {/* <div className={styles.other}>
              其他登录方式
              <Icon className={styles.icon} type="alipay-circle" />
              <Icon className={styles.icon} type="taobao-circle" />
              <Icon className={styles.icon} type="weibo-circle" />
             <Link className={styles.register} to="/user/register">
                注册账户
              </Link> */}
            {/* </div>  */}
          </Login>
        </div>
      </div>
    );
  }
}
