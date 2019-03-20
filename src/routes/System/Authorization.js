import React from 'react';
import { Tabs, Form, Input, Select, TreeSelect, Collapse, Button } from 'antd';

require('./Authorization.less');

const { TabPane } = Tabs;
const FormItem = Form.Item;
const { Option } = Select;
const { SHOW_PARENT } = TreeSelect;
const { Panel } = Collapse;

const treeData = [
  {
    label: '产品',
    value: '0-0',
    key: '0-0',
    children: [
      {
        label: '产品列表',
        value: '0-0-0',
        key: '0-0-0',
      },
    ],
  },
  {
    label: '营销',
    value: '0-1',
    key: '0-1',
    children: [
      {
        label: '竞品监控',
        value: '0-1-0',
        key: '0-1-0',
      },
      {
        label: '在线商品',
        value: '0-1-1',
        key: '0-1-1',
      },
      {
        label: '在线商品',
        value: '0-1-2',
        key: '0-1-2',
      },
    ],
  },
  {
    label: '物流',
    value: '0-2',
    key: '0-2',
    children: [
      {
        label: '物流委派',
        value: '0-2-0',
        key: '0-2-0',
      },
      {
        label: '需求管理',
        value: '0-2-1',
        key: '0-2-1',
      },
      {
        label: '仓库调拨',
        value: '0-2-2',
        key: '0-2-2',
      },
    ],
  },
];
class Authorization extends React.Component {
  constructor(props) {
    super(props);
    this.authorityIndex = 2;
    const panes = [
      // { title: '权限添加1', content: this.newAuthority(), key: '3' },
    ];
    this.state = {
      // activeKey: panes[0].key,
      panes,
      value: ['0-0-0'],
    };
  }
  onChange = value => {
    console.log('onChange ', value);
    this.setState({ value });
  };
  callback = key => {
    console.log(key);
  };
  addAuthority = () => {
    const { panes } = this.state;
    const activeKey = `${this.authorityIndex++}`;
    panes.push({ title: '权限添加', content: this.newAuthority(), key: activeKey });
    this.setState({ panes, activeKey });
  };
  removeAuthority = targetKey => {
    let { activeKey } = this.state;
    let lastIndex;
    this.state.panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes = this.state.panes.filter(pane => pane.key !== targetKey);
    if (lastIndex >= 0 && activeKey === targetKey) {
      activeKey = panes[lastIndex].key;
    }
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
      console.log(targetKey, pane.key, 'targetKey,pane.key');
      return pane.key !== targetKey;
    });
    if (lastIndex >= 0 && activeKey === targetKey) {
      activeKey = panes[lastIndex].key;
    }
    this.setState({ panes, activeKey });
  };
  newAuthority = () => {
    return (
      <Form>
        <FormItem label={<span>权限状态</span>}>
          <Select
            showSearch
            style={{ width: '400px', height: '26px' }}
            placeholder="请选择2"
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            <Option value="enable">启用</Option>
            <Option value="disable">禁用</Option>
          </Select>
        </FormItem>
        <FormItem label={<span>功能权限</span>}>
          <TreeSelect style={{ width: '370px' }} />
        </FormItem>
      </Form>
    );
  };
  header = index => (
    <Form>
      <FormItem label={<span>权限名称</span>}>
        <div>
          <Input onChange={this.handleNumberChange} style={{ width: '400px' }} />
          <span
            style={{ marginLeft: '130px', color: '#518DED' }}
            onClick={() => this.removeAuthority(index)}
          >
            删除
          </span>
        </div>
      </FormItem>
    </Form>
  );
  render() {
    const tProps = {
      treeData,
      value: this.state.value,
      onChange: this.onChange,
      treeCheckable: true,
      showCheckedStrategy: SHOW_PARENT,
      searchPlaceholder: '请选择1',
      style: {
        width: 370,
      },
    };
    return (
      <div>
        <Tabs onChange={this.callback} type="card">
          <TabPane tab="权限管理" key="1">
            <Collapse defaultActiveKey={['1']} onChange={this.callback}>
              <Panel
                header={
                  <div>
                    <Form>
                      <FormItem label={<span>权限名称</span>}>
                        <div>
                          <Input
                            onChange={this.handleNumberChange}
                            style={{ width: '400px' }}
                            readOnly="readonly"
                            // disabled="true"
                            value="默认"
                          />
                        </div>
                      </FormItem>
                    </Form>
                  </div>
                }
                key="1"
              >
                <Form>
                  <FormItem label={<span>权限状态</span>}>
                    <Select
                      showSearch
                      style={{ width: '400px', height: '26px' }}
                      placeholder="请选择1"
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      <Option value="enable">启用</Option>
                      <Option value="disable">禁用</Option>
                    </Select>
                  </FormItem>
                  <FormItem label={<span>功能权限</span>}>
                    <TreeSelect {...tProps} />
                  </FormItem>
                </Form>
              </Panel>
              {this.state.panes.map(pane => (
                <Panel
                  header={this.header(pane.key)}
                  tab={pane.title}
                  key={pane.key}
                  style={{ marginBottom: '0px' }}
                >
                  {pane.content}
                </Panel>
              ))}
            </Collapse>
            <div className="addNew">
              <span onClick={this.addAuthority}>+ 新增权限管理</span>
            </div>
            <div style={{ width: '1180px', margin: '20px auto' }}>
              <Button type="primary" style={{ marginLeft: '95%', marginTop: '50px' }}>
                保存
              </Button>
            </div>
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
export default Authorization;
