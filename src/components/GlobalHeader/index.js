import React, { PureComponent } from 'react';
import { Menu, Icon, Tag, Dropdown, Avatar, Divider } from 'antd';
import moment from 'moment';
import groupBy from 'lodash/groupBy';
import { Link, withRouter } from 'dva/router';
import { setAuthority } from '../../utils/authority';
import { reloadAuthorized } from '../../utils/Authorized';
import NoticeIcon from '../NoticeIcon';
import styles from './index.less';
import { erpPost } from '../../services/ajax';

@withRouter
export default class GlobalHeader extends PureComponent {
  constructor(props, context) {
    super(props, context);
    this.state = {
      noData:[],
      waData:[],
      noCount:0,
      waCount:0,
    };
  };
  componentDidMount() {
    this.getNotice()
  }

  getNoticeData() {
    let arrData=[];
    const { todoData = [], noTodoData, notices } = this.props;
    if (todoData.length === 0) {
      return {};
    }
    arrData = todoData.concat(noTodoData, notices);

    const newNotices = arrData&&arrData.map(notice => {
      const newNotice = { ...notice };
      if (newNotice.status === 2) {
        newNotice.type = '已完成';
      } else {
        newNotice.type = '待办';
      }
      if (newNotice.datetime) {
        newNotice.datetime = moment(notice.datetime).fromNow();
      }
      // transform id to item key
      if (newNotice.id) {
        newNotice.key = newNotice.id;
      }
      if (newNotice.extra && newNotice.status) {
        const color = {
          todo: '',
          processing: 'blue',
          urgent: 'red',
          doing: 'gold',
        }[newNotice.status];
        newNotice.extra = (
          <Tag color={color} style={{ marginRight: 0 }}>
            {newNotice.extra}
          </Tag>
        );
      }
      return newNotice;
    });
    return groupBy(newNotices, 'type');
  }

  // 获取公告的数据
  getNotice = () => {
    const page = {
      total: 0, 
      current: 1,
    }
    erpPost('/message/person/index', {page}, res => {
      this.setState({
        noData:res.data.data,
        noCount:res.data.page&&res.data.page.total,
      })
    });
    erpPost('/todolisting/index', {page}, res => {
      this.setState({
        waData:res.data.data,
        waCount:res.data.page&&res.data.page.total,
      })
    });
  }

  // 退出
  logout = () => {
    erpPost('person/logout', {}, () => {
      setAuthority('guest');
      reloadAuthorized();
      localStorage.removeItem("userName");
      this.props.history.push('/user/login');
    });
  };
  render() {
    const {
      currentIndex,
      currentUser,
      fetchingNotices,
      isMobile,
      logo,
      onNoticeVisibleChange,
      onMenuClick,
      onLinkClick,
      onChangeMatter,
      onChangeCheck,
      onNoticeClear,
    } = this.props;

    const menu = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={onMenuClick}>
        <Menu.Item disabled>
          <Icon type="user" />个人中心
        </Menu.Item>
        <Menu.Item disabled>
          <Icon type="setting" />设置
        </Menu.Item>
        <Menu.Item disabled key="changePwd">
          <Icon type="form" />修改密码
        </Menu.Item>
        {/* <Menu.Divider /> */}
        <Menu.Item key="logout">
          <Icon type="logout" />
          <span onClick={this.logout}>退出登录</span>
        </Menu.Item>
      </Menu>
    );
    const noticeData = this.state.noData;
    const waitData = this.state.waData;
    const count = this.state.noCount + this.state.waCount;
    return (
      <div className={styles.header}>
        {isMobile && [
          <Link to="/" className={styles.logo} key="logo">
            <img src={logo} alt="logo" width="32" />
          </Link>,
          <Divider type="vertical" key="line" />,
        ]}
        <span style={{ width: '350px', height: '60px', marginLeft: '40px' }}>
          <img src={logo} alt="logo" width="164" style={{ marginRight: '60px' }} />
        </span>

        <div className="self-menu">
          {this.props.menuars.map((val) => (
            <Link
              key={val.text}
              className={currentIndex === val.id ? 'active' : ''}
              to={`/${val.path}`}
              onClick={onLinkClick.bind(this, val.path)}
            >
              {val.text}
            </Link>
          ))}
        </div>

        <div className={styles.right}>
          <NoticeIcon
            style={{ border: 0 }}
            className={styles.action}
            count={count}
            onItemClick={(item, tabProps) => {
              console.log(item, tabProps); 
            }}
            onChangeMatter={onChangeMatter}
            onChangeCheck={onChangeCheck}
            onClear={onNoticeClear}
            onPopupVisibleChange={onNoticeVisibleChange}
            loading={fetchingNotices}
            popupAlign={{ offset: [20, -16] }}
          >
            <NoticeIcon.Tab
              list={noticeData}
              title="公告"
              emptyText="你已查看所有公告"
              emptyImage="https://gw.alipayobjects.com/zos/rmsportal/wAhyIChODzsoKIOBHcBk.svg"
            />
            <NoticeIcon.Tab
              list={waitData}
              title="待办"
              emptyText="你已完成所有待办"
              emptyImage="https://gw.alipayobjects.com/zos/rmsportal/HsIsxMZiWKrNUavQUXqx.svg"
            />
          </NoticeIcon>
          <Dropdown overlay={menu}>
            <span className={`${styles.action} ${styles.account}`}>
              <Avatar size="small" className={styles.avatar} src={currentUser.avatar} />
              <span className={styles.name}>{currentUser.name}</span>
            </span>
          </Dropdown>
        </div>
      </div>
    );
  }
}
