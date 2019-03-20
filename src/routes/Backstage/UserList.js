import React from 'react';
import { Table, Tabs, Form, Button } from 'antd';
import SearchBar from '../../components/SearchBar';
import AddNewUser from './AddUser';

require('../ListStyle.less');

const { TabPane } = Tabs;

/* 把from添加天props里 */

@Form.create()
class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.newTabIndex = 1;
    const panes = [{ title: '用户管理', content: this.renderProInfo(), key: '0', closable: false }];

    this.state = {
      activeKey: panes[0].key,
      panes,
    };
  }

  onChange = activeKey => {
    this.setState({ activeKey });
  };

  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };

  add = () => {
    const { panes } = this.state;
    const activeKey = `newTab${this.newTabIndex++}`;
    panes.push({ title: 'New Tab', content: 'Content of new Tab', key: activeKey });
    this.setState({ panes, activeKey });
  };
  remove = targetKey => {
    let { activeKey } = this.state;
    let lastIndex;
    this.state.panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes = this.state.panes.filter(pane => {
      return pane.key !== targetKey;
    });
    if (lastIndex >= 0 && activeKey === targetKey) {
      activeKey = panes[lastIndex].key;
    }
    this.setState({ panes, activeKey });
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields(err => {
      if (!err) {
        // console.log('Received values of form: ', values);
      }
    });
  };
  addNewUser = () => {
    const { panes } = this.state;
    const activeKey = `newTab${this.newTabIndex++}`;
    panes.push({
      title: '编辑',
      content: <AddNewUser />,
      key: activeKey,
    });
    this.setState({ panes, activeKey });
  };
  /**
   * 渲染表格
   * @param {Object} dataSource 表行
   * @param {Object} columns 表头
   */
  renderProInfo = () => {
    const dataSource = [
      {
        index: 1,
        key: '1',
        num: '1',
        account: '487154848454',
        realName: '张三',
        contactWay: '152659889',
        email: '48548648@qq.com',
        wechat: '484684',
        QQ: '86689698',
        operation: '编辑 删除',
      },
      {
        key: '2',
        num: '2',
        account: '487154848454',
        realName: '张三',
        contactWay: '152659889',
        email: '48548648@qq.com',
        wechat: '484684',
        QQ: '86689698',
        operation: '编辑 删除',
      },
      {
        key: '3',
        num: '3',
        account: '487154848454',
        realName: '张三',
        contactWay: '152659889',
        email: '48548648@qq.com',
        wechat: '484684',
        QQ: '86689698',
        operation: '编辑 删除',
      },
      {
        key: '4',
        num: '4',
        account: '487154848454',
        realName: '张三',
        contactWay: '152659889',
        email: '48548648@qq.com',
        wechat: '484684',
        QQ: '86689698',
        operation: '编辑 删除',
      },
      {
        key: '5',
        num: '5',
        account: '487154848454',
        realName: '张三',
        contactWay: '152659889',
        email: '48548648@qq.com',
        wechat: '484684',
        QQ: '86689698',
        operation: '编辑 删除',
      },
    ];

    const columns = [
      {
        title: '序号',
        dataIndex: 'num',
        key: 'num',
      },
      {
        title: '账号',
        dataIndex: 'account',
        key: 'account',
      },
      {
        title: '真实姓名',
        dataIndex: 'realName',
        key: 'realName',
      },
      {
        title: '联系方式',
        dataIndex: 'contactWay',
        key: 'contactWay',
      },
      {
        title: '邮箱',
        dataIndex: 'email',
        key: 'email',
      },
      {
        title: '微信',
        dataIndex: 'wechat',
        key: 'wechat',
      },
      {
        title: 'QQ',
        dataIndex: 'QQ',
        key: 'QQ',
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        render: () => {
          return (
            <div>
              <div
                onClick={() => {
                  const { panes } = this.state;
                  const activeKey = `newTab${this.newTabIndex++}`;
                  panes.push({
                    title: '编辑',
                    content: <AddNewUser index={activeKey} remove={this.remove} />,
                    key: activeKey,
                  });
                  this.setState({ panes, activeKey });
                }}
              >
                编辑
              </div>
              <div>删除</div>
            </div>
          );
        },
      },
    ];

    return (
      <div className="proDataWrap">
        <SearchBar />
        <div style={{ marginBottom: '10px' }}>
          <Button type="primary" className="marginR" onClick={this.addNewUser}>
            新增用户
          </Button>
        </div>
        <Table dataSource={dataSource} columns={columns} />
      </div>
    );
  };
  render() {
    return (
      <Tabs
        className="productVariants"
        onChange={this.onChange}
        activeKey={this.state.activeKey}
        type="editable-card"
        onEdit={this.onEdit}
      >
        {this.state.panes.map(pane => (
          <TabPane
            tab={pane.title}
            key={pane.key}
            closable={pane.closable}
            className="proTabs"
            style={{ marginBottom: '0px' }}
          >
            {pane.content}
          </TabPane>
        ))}
      </Tabs>
    );
  }
}
export default UserList;
