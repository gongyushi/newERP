import React from 'react';
import { Table, Tabs, Form, Button, Popconfirm } from 'antd';
import SearchBar from '../../components/SearchBar';
import AddNewRole from './AddRole';

require('../ListStyle.less');

const { TabPane } = Tabs;

/* 把from添加天props里 */

@Form.create()
class RoleList extends React.Component {
  constructor(props) {
    super(props);
    this.newTabIndex = 1;
    this.state = {
      dataSource: [
        {
          index: 1,
          key: '0',
          num: '1',
          roleName: '张三',
          operation: '编辑 删除',
        },
        {
          key: '1',
          num: '2',
          roleName: '李四',
          operation: '编辑 删除',
        },
        {
          key: '2',
          num: '3',
          roleName: '王五',
          operation: '编辑 删除',
        },
        {
          key: '3',
          num: '4',
          roleName: '小明',
          operation: '编辑 删除',
        },
        {
          key: '4',
          num: '5',
          roleName: '张三',
          operation: '编辑 删除',
        },
      ],
    };
    const panes = [{ title: '角色管理', content: this.renderProInfo(), key: '0', closable: false }];
    this.state = {
      activeKey: panes[0].key,
      panes,
    };
  }
  onChange = activeKey => {
    this.setState({ activeKey });
  };
  onTableDelete = () => {
    // const dataSource = [...this.state.dataSource];
    // this.setState({ dataSource: dataSource.filter(item => item.key !== key) });
  };
  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };
  add = () => {
    const { panes } = this.state;
    const activeKey = `newTab${this.newTabIndex++}`;
    panes.push({ title: '新的Tab', content: '这是内容啊', key: activeKey });
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
  addNewRole = () => {
    const { panes } = this.state;
    const activeKey = `newTab${this.newTabIndex++}`;
    panes.push({
      title: '编辑',
      content: <AddNewRole />,
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
    const { dataSource } = this.state;
    const columns = [
      {
        title: '序号',
        dataIndex: 'num',
        key: 'num',
      },
      {
        title: '角色名称',
        dataIndex: 'roleName',
        key: 'roleName',
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        render: record => {
          return (
            <div>
              <div
                onClick={() => {
                  const { panes } = this.state;
                  const activeKey = `newTab${this.newTabIndex++}`;
                  panes.push({
                    title: '编辑',
                    content: <AddNewRole index={activeKey} remove={this.remove} />,
                    key: activeKey,
                  });
                  this.setState({ panes, activeKey });
                }}
              >
                编辑
              </div>
              <div>
                <Popconfirm title="确定删除?" onConfirm={() => this.onTableDelete(record.key)}>
                  <span>删除</span>
                </Popconfirm>
                {/* 删除 */}
              </div>
            </div>
          );
        },
      },
    ];

    return (
      <div className="proDataWrap">
        <SearchBar />
        <div style={{ marginBottom: '10px' }}>
          <Button type="primary" className="marginR" onClick={this.addNewRole}>
            新增角色
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
        // onEdit={this.onEdit}
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
export default RoleList;
