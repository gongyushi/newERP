import React, { PureComponent } from 'react';
import { Popover, Icon, Tabs, Badge, Spin, Modal, Button } from 'antd';
import classNames from 'classnames';
import List from './NoticeList';
import styles from './index.less';

const { TabPane } = Tabs;

export default class NoticeIcon extends PureComponent {
  static Tab = TabPane;
  static defaultProps = {
    onItemClick: () => {},
    onPopupVisibleChange: () => {},
    onTabChange: () => {},
    onClear: () => {},
    onChangeMatter: () => {},
    onChangeCheck: () => {},
    loading: false,
    locale: {
      emptyText: '暂无数据',
      clear: '清空',
    },
    emptyImage: 'https://gw.alipayobjects.com/zos/rmsportal/wAhyIChODzsoKIOBHcBk.svg',
  };
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      itemData: {},
    };
    if (props.children && props.children[0]) {
      this.state.tabType = props.children[0].props.title;
    }
  }
  onItemClick = (item, tabProps) => {
    const { onItemClick } = this.props;
    onItemClick(item, tabProps);
  };
  onTabChange = tabType => {
    this.setState({ tabType });
    this.props.onTabChange(tabType);
  };
  
  // 模态框弹出
  onShowModal = (item) => {
    this.setState({
      visible:true,
      itemData:item,
    })
  }
  
  onCloseModal = () => {
    this.setState({
      visible:false,
    })
  }

  // 弹出框页面内容
  getNotificationBox() {
    const { children, loading, locale } = this.props;
    if (!children) {
      return null;
    }
    const panes = React.Children.map(children, child => {
      const title =
        child.props.list && child.props.list.length > 0
          ? `${child.props.title} (${child.props.list.length})`
          : child.props.title;
      return (
        <TabPane tab={title} key={child.props.title}>
          <List
            {...child.props}
            data={child.props.list}
            onShowModal={this.onShowModal}   
            type={title}       
            onClick={item => this.onItemClick(item, child.props)}
            onClear={() => this.props.onClear(child.props.title)}
            onChangeMatter={(item, a) => this.props.onChangeMatter(item, a)}
            onChangeCheck={item => this.props.onChangeCheck(item)}
            title={child.props.title}
            locale={locale}
          />
        </TabPane>
      );
    });
    return (
      <Spin spinning={loading} delay={0}>
        <Tabs className={styles.tabs} onChange={this.onTabChange}>
          {panes}
        </Tabs>
      </Spin>
    );
  }

  render() {
    const { className, count, popupAlign, onPopupVisibleChange } = this.props;
    const noticeButtonClass = classNames(className, styles.noticeButton);
    const notificationBox = this.getNotificationBox();
    const trigger = (
      <span className={noticeButtonClass}>
        <Badge count={count} className={styles.badge}>
          <Icon type="bell" className={styles.icon} />
        </Badge>
      </span>
    );
    if (!notificationBox) {
      return trigger;
    }
    const popoverProps = {};
    if ('popupVisible' in this.props) {
      popoverProps.visible = this.props.popupVisible;
    }
    return (
      <span>
        <Popover
          placement="bottomRight"
          content={notificationBox}
          popupClassName={styles.popover}
          trigger="click"
          arrowPointAtCenter
          popupAlign={popupAlign}
          onVisibleChange={onPopupVisibleChange}
          {...popoverProps}
        >
          {trigger}
        </Popover>
        <Modal 
          visible={this.state.visible} 
          onOk={this.onCloseModal}
          title='公告详情'
          width={640}
          onCancel={this.onCloseModal}
          maskClosable={false}
          footer={[
            <Button key="submit" type="primary" onClick={this.onCloseModal}>
              确定
            </Button>,
          ]}
        >
          <div>
            <div style={{fontSize:16, color:'black',marginBottom:20}}>
              {this.state.itemData&&this.state.itemData.title}
            </div>
            <div>
              {this.state.itemData&&this.state.itemData.content}
            </div>
          </div>
        </Modal>
      </span>
    );
  }
}
