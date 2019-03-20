import React from 'react';
import PropTypes from 'prop-types';
import { Tabs, Layout, message, Dropdown, Menu, Icon} from 'antd';
import DocumentTitle from 'react-document-title';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { ContainerQuery } from 'react-container-query';
import classNames from 'classnames';
import { enquireScreen } from 'enquire-js';
import GlobalHeader from '../components/GlobalHeader';
import SiderMenu from '../components/SiderMenu';
import NotFound from '../routes/Exception/404';
import { Urls, FilterSlash } from '../utils/utils';
import Authorized from '../utils/Authorized';
import { setScreenTime } from '../utils/authority';
import { getMenuData, getSiderMenu } from '../common/menu';
import logo from '../assets/logo.png';
import { erpPost } from '../services/ajax';
import ScreenLock from './ScreenLock';

require('./BasicLayout.less');

const { Content, Header } = Layout;
const { check } = Authorized;
const { TabPane } = Tabs;

/**
 * 根据菜单取得重定向地址1.
 */
const redirectData = [];
const getRedirect = item => {
  if (item && item.children) {
    if (item.children[0] && item.children[0].path) {
      redirectData.push({
        from: `${item.path}`,
        to: `${item.children[0].path}`,
      });
      item.children.forEach(children => {
        getRedirect(children);
      });
    }
  }
};
getMenuData().forEach(getRedirect);

/**
 * 获取面包屑映射
 * @param {Object} menuData 菜单配置
 * @param {Object} routerData 路由配置
 */
const getBreadcrumbNameMap = (menuData, routerData) => {
  const result = {};
  const childResult = {};
  for (const i of menuData) {
    if (!routerData[i.path]) {
      result[i.path] = i;
    }
    if (i.children) {
      Object.assign(childResult, getBreadcrumbNameMap(i.children, routerData));
    }
  }
  return Object.assign({}, routerData, result, childResult);
};

const query = {
  'screen-xs': {
    maxWidth: 575,
  },
  'screen-sm': {
    minWidth: 576,
    maxWidth: 767,
  },
  'screen-md': {
    minWidth: 768,
    maxWidth: 991,
  },
  'screen-lg': {
    minWidth: 992,
    maxWidth: 1199,
  },
  'screen-xl': {
    minWidth: 1200,
  },
};

let isMobile;
enquireScreen(b => {
  isMobile = b;
});

class BasicLayout extends React.PureComponent {
  static childContextTypes = {
    location: PropTypes.object,
    breadcrumbNameMap: PropTypes.object,
  };

  constructor(props, context) {
    super(props, context);

    this.state = {
      hideSidebar: props.location.pathname === '/home' ? !0 : false /* 首页菜单隐藏 */,
      siderMenus: [],
      siderParentMenu: [],
      isMobile,
      topMenuIndex: 0,
      todoData: [],   // 已完成的待办事项   2
      noTodoData:[],  // 未完成的待办事项   3
      noticesData: [],   // 通知
      activeKey: FilterSlash(props.location.pathname),
      refreshKeys: [],
      tabPanels: [],
      lockingScreen: false,
    };
  };

  getChildContext() {
    const { location, routerData } = this.props;
    return {
      location,
      breadcrumbNameMap: getBreadcrumbNameMap(getMenuData(), routerData),
    };
  };
  componentDidMount() {
    this.getTodolist(3); // 调用未完成的待办事项
    this.getTodolist(2); // 调用已完成的待办事项
    // this.setInterCache(); // 调用轮询

    enquireScreen(mobile => {
      this.setState({
        isMobile: mobile,
      });
    });
    const { pathname } = this.props.location;
    const url = new Urls(window.location.href);
    this.refreshTabPanel(FilterSlash(pathname), url.searchParams);
  };
  componentWillReceiveProps(nextProps) {
    if (
      nextProps.location.pathname !== this.props.location.pathname ||
      nextProps.location.search !== this.props.location.search
    ) {
      const path = nextProps.location.pathname;
      const url = new Urls(window.location.href);
      this.refreshTabPanel(FilterSlash(path), url.searchParams);
    }
  };
  getPageTitle() {
    const { routerData, location } = this.props;
    const { pathname } = location;
    let title = 'Dataforce';
    if (routerData[pathname] && routerData[pathname].name) {
      title = `${routerData[pathname].name} - Dataforce`;
    }
    return title;
  };
  // 调用待办事项列表
  getTodolist = id => {
    erpPost('todolisting/index', { status: id},res=>{
      if(id===3){
        this.setState({
          noTodoData:res.data.data,
        })
      }
      if(id===2){
        this.setState({
          todoData: res.data.data,
        })
      }
    })
  };
  // 轮询的调用
  getCacheList = () => {
    this.props.dispatch({
      type: 'commonUse/fetchCache',
    });
  };
  //
  siderMenuChange = (activeKey) => {
    const siderMenu = getSiderMenu(activeKey);
    if(!siderMenu || !siderMenu.currentMenu){
      // 未获取到侧边栏的信息，隐藏侧边栏
      this.setState({
        hideSidebar: true,
      });
      return;
    }
    // 首页隐藏侧边菜单
    this.setState({
      hideSidebar: activeKey === 'home' ? !0 : false,
    });

    // 设置顶级菜单的选中状态
    this.setState({
      topMenuIndex: siderMenu.topMenu.id,
    });
    // 设置侧边菜单的内容
    if(toString.call(siderMenu.topMenu.items) === '[object Array]') {
      this.setState({
        siderMenus: siderMenu.topMenu.items,
        siderParentMenu: siderMenu.parentMenus.map(item=> item.path),
      });
    }
  };

  // 页签变化事件
  onTabPanelChange = (activeKey) => {
    this.setState({
      activeKey,
    });
    // 只要当前 path 与激活的 path 不一致，都认为 changeTabPanel
    this.siderMenuChange(activeKey);
  };

  // 新增或删除页签时触发该事件， 当前只实现了remove
  onTabPanelEdit = (targetKey, action) => {
    this[action](targetKey);
  };
  // 删除页签时触发该事件
  remove = (targetKey) => {
    const { tabPanels } = this.state;
    let {activeKey, hideSidebar} = this.state;
    let lastIndex;
    let willRemovePanel;

    tabPanels.forEach((pane, i) => {
      if (pane.key === targetKey) {
        willRemovePanel = pane;
        lastIndex = i - 1;
      }
    });
    // 如果该panel不允许关闭， 则不进行删除
    if(!willRemovePanel || willRemovePanel.closeable === false){
      return;
    }
    const newTabPanels = tabPanels.filter(pane => pane.key !== targetKey);
    if(newTabPanels.length > 0) {
      if(lastIndex >= 0 && newTabPanels.length > lastIndex){
        activeKey = newTabPanels[lastIndex].key;
      }else{
        activeKey = newTabPanels[0].key;
      }
    }else{
      activeKey = null;
      hideSidebar = true;
    }

    this.setState({
      tabPanels: newTabPanels,
      activeKey,
      hideSidebar,
    });

    this.onTabPanelChange(activeKey);
  };
  handleRemove = (key) =>{
    this.remove(key);
  }
  // 路由变化时添加新页签
  refreshTabPanel = (path, params) => {
    const { routerData } = this.props;
    let { tabPanels } = this.state;
    // 添加新的TabPanel
    const tabPanel = tabPanels.filter(item => (item.key === path));
    const router = routerData[`/${path}`];
    if(toString.call(router) === '[object Undefined]'){
      message.warning('您无权访问该页面，请联系管理员!',2);
      return;
    }
    if(tabPanel.length === 0) {
      if(path === 'home'){
        tabPanels.unshift({
          name: router.name,
          key: path,
          component: router.component,
          closeable: false,
          params,
        });
      }else{
        tabPanels = tabPanels.concat([{
          name: router.name,
          key: path,
          component: router.component,
          closeable: true,
          params,
        }]);
      }
      this.setState({
        activeKey: path,
        tabPanels,
      });
      // 只要当前 path 与激活的 path 不一致，都认为 changeTabPanel
      this.siderMenuChange(path);
    }else{
      message.warning('您已打开了相同的页签',2);
      this.onTabPanelChange(path);
    }
  };

  getBashRedirect = () => {
    // According to the url parameter to redirect
    // 这里是重定向的,重定向到 url 的 redirect 参数所示地址
    const urlParams = new URL(window.location.href);
    const { routerData } = this.props;
    const redirect = urlParams.searchParams.get('redirect');
    // Remove the parameters in the url
    if (redirect) {
      urlParams.searchParams.delete('redirect');
      window.history.replaceState(null, 'redirect', urlParams.href);
    } else {
      // get the first authorized route path in routerData
      const authorizedPath = Object.keys(routerData).find(
        item => check(routerData[item].authority, item) && item !== '/'
      );
      return authorizedPath;
    }
    return redirect;
  };

  handleMenuCollapse = collapsed => {
    this.props.dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: collapsed,
    });
  };
  // 修改状态 待办-已完成
  handleChangeMatter = (e, a) => {
    // if(a){
    //   this.props.dispatch({
    //     type: 'erpHome/fetchUpdateTodo',
    //     payload: can,
    //   });
    //   this.getTodolist(0)  // 调用待办事项
    // }
    if (e.message_id) {
      const can = {
        message_id: e.message_id,
      };
      erpPost('message/update-status', can, res => {
        if (res.data.code === 200) {
          // this.getNotification(); // 调用通知
        }
      });
    } else if (a) {
      const can = {
        todo_listing_id: e.todo_listing_id,
        status: a,
      };
      erpPost('todolisting/update', can, res => {
        if (res.data.code === 200) {
          this.getTodolist(3); // 调用未完成的待办事项
          this.getTodolist(2); // 调用已完成的待办事项
        }
      });
    }
  };
  handleNoticeClear = type => {
    message.success(`清空了${type}`);
    this.props.dispatch({
      type: 'global/clearNotices',
      payload: type,
    });
  };
  // 页面按钮点击事件
  handleAddPanel = (key, params) => {
    if(params === undefined){
      params = new URLSearchParams();
    }
    this.refreshTabPanel(key, params);
  };
  // 顶级菜单中个人信息中的菜单事件
  handleMenuClick = ({ key }) => {
    if (key === 'triggerError') {
      this.props.dispatch(routerRedux.push('/exception/trigger'));
      return;
    }
    if (key === 'logout') {
      /* this.props.dispatch({
       type: 'login/logout',
       }); */
    }
  };
  // tabPanel 操作菜单事件
  handleTabOperationsMenuClick = ({ key }) => {
    if (key === 'closeAll') {
      const { tabPanels } = this.state;
      const newTabPanels = tabPanels.filter(item=>item.closeable === false);
      this.setState({
        tabPanels: newTabPanels,
      });
      if(newTabPanels.length > 0) {
        this.onTabPanelChange(newTabPanels[0].key);
      }else{
        this.setState({
          activeKey: null,
          hideSidebar: true,
        });
      }
      return;
    }
    if (key === 'closeOther') {
      const { tabPanels, activeKey } = this.state;
      const newTabPanels = tabPanels.filter(item=>(item.key === activeKey || item.closeable === false));
      this.setState({
        tabPanels: newTabPanels,
      });
      if(newTabPanels.length > 0) {
        this.onTabPanelChange(activeKey);
      }else{
        this.setState({
          activeKey: null,
          hideSidebar: true,
        });
      }
    }
  };
  // 添加需要刷新的组件key
  handleAddRefreshKey = key => {
    // 合并后去重
    let oldRefreshKeys = this.state.refreshKeys;
    if(toString.call(oldRefreshKeys) !== '[object Array]'){
      oldRefreshKeys = [];
    }
    if(toString.call(key) !== '[object String]'){
      return;
    }
    oldRefreshKeys.push(key);
    const refreshKeys = Array.from(new Set(oldRefreshKeys));
    this.setState({
      refreshKeys,
    });
  };
  // 移除需要刷新的组件key
  handleRemoveRefreshKey = key => {
    const { refreshKeys } = this.state;
    const index = refreshKeys.indexOf(key);
    if (index > -1) {
      refreshKeys.splice(index, 1);
    }
    this.setState({
      refreshKeys,
    });
  };

  handleNoticeVisibleChange = visible => {
    if (visible) {
      /* this.props.dispatch({
       type: 'global/fetchNotices',
       }); */
    }
  };
  render() {
    const {
      currentUser,
      collapsed,
      fetchingNotices,
      location,
    } = this.props;
    const {
      isMobile,
      todoData,
      noticesData,
      noTodoData,
      topMenuIndex,
      hideSidebar,
      siderParentMenu,
      siderMenus,
      activeKey,
      refreshKeys,
      tabPanels,
      lockingScreen,
    } = this.state;
    const bashRedirect = this.getBashRedirect();
    const menuars = JSON.parse(localStorage.getItem('menuList'))
      ? JSON.parse(localStorage.getItem('menuList'))
      : [];
    const tabsOperationsMenu = (
      <Menu onClick={this.handleTabOperationsMenuClick}>
        <Menu.Item  key="closeAll">
          <a>关闭全部</a>
        </Menu.Item>
        <Menu.Item  key="closeOther">
          <a>关闭其他页</a>
        </Menu.Item>
      </Menu>
    );
    const tabsOperations = (
      <Dropdown overlay={tabsOperationsMenu} placement="bottomRight">
        <Icon type="down-square" theme="filled" style={{ fontSize: '1.6em' }} />
      </Dropdown>
    );

    const layout = (
      <div className="erp">
        <Layout className={lockingScreen ? 'erpContent' : ''}>
          <Header style={{ padding: 0 }}>
            <GlobalHeader
              menuars={menuars}
              logo={logo}
              currentUser={currentUser}
              fetchingNotices={fetchingNotices}
              notices={noticesData}
              todoData={todoData}
              noTodoData={noTodoData}
              collapsed={collapsed}
              isMobile={isMobile}
              onNoticeClear={this.handleNoticeClear}
              onCollapse={this.handleMenuCollapse}
              onMenuClick={this.handleMenuClick}
              onLinkClick={()=>{}}
              onChangeCheck={this.handleChangeCheck}
              onChangeMatter={this.handleChangeMatter}
              onNoticeVisibleChange={this.handleNoticeVisibleChange}
              currentIndex={topMenuIndex}
            />
          </Header>
          <div className="sider-content">
            {!hideSidebar ? (
              <SiderMenu
                logo={logo}
                // 不带Authorized参数的情况下如果没有权限,会强制跳到403界面
                // If you do not have the Authorized parameter
                // you will be forced to jump to the 403 interface without permission
                Authorized={Authorized}
                menuData={getMenuData()}
                menus={siderMenus}
                parentMenu={siderParentMenu}
                collapsed={collapsed}
                location={location}
                isMobile={isMobile}
                onCollapse={this.handleMenuCollapse}
                currentMenu={activeKey}
                onMenuClick={()=>{}}
              />
            ) : null}
            <Layout>
              <Content style={{ margin: '0px 10px 0', height: '100%' }}>
                <Tabs
                  hideAdd
                  className="productVariants"
                  activeKey={activeKey}
                  onChange={this.onTabPanelChange}
                  onEdit={this.onTabPanelEdit}
                  type="editable-card"
                  tabBarExtraContent={tabsOperations}
                >
                  {tabPanels.map(panel => (
                    <TabPane
                      tab={panel.name}
                      key={panel.key}
                      className="proTabs"
                      style={{ marginBottom: '0px' }}
                      closable={panel.closeable}
                    >
                      {/*
                       params：URLSearchParams对象，是打开当前页签时的URL地址中的参数信息；
                       activeKey: 当前组件的唯一标识，也就是路由的path；
                       refreshKeys: 存储activeKey的数组， 定义了当某个页签切换到当前时是否需要刷新数据；
                       onAddRefreshKey: 事件，及刷新数据时需传递 activeKey 给该事件， 以便目标组件切换到当前时刷新数据；
                       onRemoveRefreshKey: 事件，及刷新数据时需传递 activeKey 给该事件， 以便Layout 把当前组件的activeKey从refreshKeys中移除；
                      */}
                      <panel.component
                        location={location}
                        params={panel.params}
                        activeKey={activeKey}
                        refreshKeys={refreshKeys}
                        onAddpanel={this.handleAddPanel}
                        onAddRefreshKey={this.handleAddRefreshKey}
                        onRemoveRefreshKey={this.handleRemoveRefreshKey}
                        handleRemove={this.handleRemove}
                      />
                    </TabPane>
                  ))}
                </Tabs>

              </Content>
            </Layout>
          </div>
        </Layout>
        <ScreenLock onLock={(locking)=>{
          this.setState({
            lockingScreen: locking,
          });
        }}/>
      </div>
    );
    return (
      <DocumentTitle title={this.getPageTitle()}>
        <ContainerQuery query={query}>
          {params => <div className={classNames(params)}>{layout}</div>}
        </ContainerQuery>
      </DocumentTitle>
    );
  }
}

export default connect(({ user, global, erpHome, commonUse, loading }) => ({
  currentUser: user.currentUser,
  homeTodoData: erpHome&&erpHome.homeTodoData,
  erpCacheData: commonUse&&commonUse.erpCacheList,
  addressData: commonUse&&commonUse.addressList,
  collapsed: global.collapsed,
  fetchingNotices: loading.effects['global/fetchNotices'],
  notices: global.notices,
}))(BasicLayout);
