import React, { PureComponent } from 'react';
import { Layout, Menu, Icon } from 'antd';
import pathToRegexp from 'path-to-regexp';
import Debounce from 'lodash-decorators/debounce';

import { Link } from 'dva/router';
import styles from './index.less';
import { urlToList } from '../_utils/pathTools';
import { getMenuByPath } from '../../common/menu';

const { Sider } = Layout;
const { SubMenu } = Menu;

// Allow menu.js config icon as string or ReactNode
//   icon: 'setting',
//   icon: 'http://demo.com/icon.png',
//   icon: <Icon type="setting" />,
const getIcon = () => {
  const icon="table";
  if (typeof icon === 'string' && icon.indexOf('http') === 0) {
    return <img src={icon} alt="icon" className={`${styles.icon} sider-menu-item-img`} />;
  }
  if (typeof icon === 'string') {
    return <Icon type={icon} />;
  }
  return icon;
};

export const getMeunMatcheys = (flatMenuKeys, path) => {
  return flatMenuKeys.filter(item => {
    return pathToRegexp(item).test(path);
  });
};

export default class SiderMenu extends PureComponent {
  constructor(props) {
    super(props);
    this.flatMenuKeys = this.getFlatMenuKeys(props.menuData);
    this.state = {
      openKeys: [],
    };
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.parentMenu !== this.props.parentMenu) {
      this.setState({
        openKeys: nextProps.parentMenu,
      });
    }
  };

  /**
   * 弃用
   * Convert pathname to openKeyss
   * /list/search/articles = > ['list','/list/search']
   * @param  props
   */
  getDefaultCollapsedSubMenus(props) {
    const { parentMenu } = props || this.props;
    return parentMenu.map(item=>{
      return item.path
    });

    // return urlToList(currentMenu)
    //   .map(item => {
    //     return getMeunMatcheys(this.flatMenuKeys, item)[0];
    //   })
    //   .filter(item => item);
  };

  /**
   * Recursively flatten the data
   * [{path:string},{path:string}] => {path,path2}
   * @param  menus
   */
  getFlatMenuKeys(menus) {
    let keys = [];
    menus.forEach(item => {
      if (item.children) {
        keys = keys.concat(this.getFlatMenuKeys(item.children));
      }
      keys.push(item.path);
    });
    return keys;
  }

  /**
   * 判断是否是http链接.返回 Link 或 a
   * Judge whether it is http link.return a or Link
   * @memberof SiderMenu
   */
  getMenuItemPath = item => {
    const itemPath = this.conversionPath(item.path);
    const icon = getIcon(item.icon);
    const { target, text } = item;
    // Is it a http link
    if (/^https?:\/\//.test(itemPath)) {
      return (
        <a href={itemPath} target={target}>
          {icon}
          <span>{text}</span>
        </a>
      );
    }
    return (
      <Link
        to={itemPath}
        target={target}
        replace={itemPath === this.props.location.pathname}
        onClick={
          this.props.isMobile
            ? () => {
                this.props.onCollapse(true);
              }
            : undefined
        }
      >
        {icon}
        <span>{text}</span>
      </Link>
    );
  };
  /**
   * get SubMenu or Item
   */
  getSubMenuOrItem = item => {
    if (item.items && item.items.some(child => child.text && child.is_menu===0)) {
      const childrenItems = this.getNavMenuItems(item.items);
      // && item.items[0].is_menu === 0
      // 当无子菜单时就不展示菜单
      if (childrenItems && childrenItems.length > 0) {
        return (
          <SubMenu
            title={
              item.icon ? (
                <span>
                  {getIcon(item.icon)}
                  <span>{item.text}</span>
                </span>
              ) : (
                <span>
                  {getIcon(item.icon)}
                  <span>{item.text}</span>
                </span>
                // item.text
              )
            }
            key={item.path}
          >
            {childrenItems}
          </SubMenu>
        );
      }else{
        return <Menu.Item key={item.path}>{this.getMenuItemPath(item)}</Menu.Item>
      }
      // return null;
    } else {

      return (item.is_menu === 0 ? (<Menu.Item key={item.path}>{this.getMenuItemPath(item)}</Menu.Item>) : null);
    }
  };
  /**
   * 获得菜单子节点
   * @memberof SiderMenu
   */
  getNavMenuItems = menusData => {
    if (!menusData) {
      return [];
    }
    return menusData
      .filter(item => item.text && !item.hideInMenu)
      .map(item => {
        // make dom
        const ItemDom = this.getSubMenuOrItem(item);
        return this.checkPermissionItem(item.authority, ItemDom);
      })
      .filter(item => item);
  };

  // Get the currently selected menu
  getSelectedMenuKeys = () => {
    // return '/company/organization'
    const { currentMenu } = this.props;
    const arr=currentMenu.split('/')
    arr.splice(0, 1)
    return [currentMenu]
  };
  /**
   * 隐藏菜单
   * @param  props
   */
  toggle = () => {
    const { collapsed, onCollapse } = this.props;
    onCollapse(!collapsed);
    this.triggerResizeEvent();
  };
  /* eslint-disable*/
  @Debounce(600)
  triggerResizeEvent() {
    const event = document.createEvent('HTMLEvents');
    event.initEvent('resize', true, false);
    window.dispatchEvent(event);
  }
  // conversion Path
  // 转化路径
  conversionPath = path => {
    if (path && path.indexOf('http') === 0) {
      return path;
    } else {
      return `/${path || ''}`.replace(/\/+/g, '/');
    }
  };
  // permission to check
  checkPermissionItem = (authority, ItemDom) => {
    if (this.props.Authorized && this.props.Authorized.check) {
      const { check } = this.props.Authorized;
      return check(authority, ItemDom);
    }
    return ItemDom;
  };
  isMainMenu = key => {
    return this.props.menus.some(item => key && (item.key === key || item.path === key));
  };
  handleOpenChange = openKeys => {
    const lastOpenKey = openKeys[openKeys.length - 1];
    const moreThanOne = openKeys.filter(openKey => this.isMainMenu(openKey)).length > 1;
    this.setState({
      openKeys: moreThanOne ? [lastOpenKey] : [...openKeys],
    });
  };
  render() {
    const { collapsed, onCollapse, onMenuClick } = this.props;
    const { openKeys } = this.state;

    // Don't show popup menu when it is been collapsed
    const menuProps = collapsed
      ? {}
      : {
          openKeys,
        };

    // if pathname can't match, use the nearest parent's key
    let selectedKeys = this.getSelectedMenuKeys();
    if (!selectedKeys.length) {
      selectedKeys = [openKeys[openKeys.length - 1]];
    }
    return (
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        onCollapse={onCollapse}
        width={256}
        collapsedWidth={40}
        style={{ padding: 0 }}
        className={styles.sider}
      >
        {/*  <div className={styles.logo} key="logo">
          <Link to="/">
            <img src={logo} alt="logo" />
            <h1>ERP</h1>
          </Link>
        </div> */}
        <Icon
          className={styles.trigger}
          type={collapsed ? 'menu-unfold' : 'menu-fold'}
          onClick={this.toggle}
        />
        <Menu
          key="Menu"
          theme="Light"
          mode="inline"
          {...menuProps}
          onOpenChange={this.handleOpenChange}
          onClick={onMenuClick}
          selectedKeys={selectedKeys}
          style={{ padding: '16px 0', width: '100%' }}
        >
          {this.getNavMenuItems(this.props.menus)}
        </Menu>
      </Sider>
    );
  }
}
