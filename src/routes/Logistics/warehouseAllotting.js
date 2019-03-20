import React from 'react';
import { Table, Tabs, Form, Button, message } from 'antd';
import SearchBar from '../../components/SearchBar';
import NewTransferringOrder from './NewTransferringOrder';
import { erpPost } from '../../services/ajax';

require('../ListStyle.less');

const { TabPane } = Tabs;
const NewAllotting = Form.create()(NewTransferringOrder);
/* 把from添加天props里 */

@Form.create()
class warehouseAllotting extends React.Component {
  constructor(props) {
    super(props);
    this.newTabIndex = 0;
    this.state = {
      panes: [],
      dataSource: [],
      page: {
        // defaultCurrent: 1,  // 默认的当前页数
        pageSize: 10, // 每页显示条数
        total: 0, // 总页数
        current: 1, // 当前页数
        showSizeChanger: true,
        // showQuickJumper:true,
      },
      columns: [
        {
          title: '调拨单号',
          dataIndex: 'req_no',
          key: 'req_no',
        },
        {
          title: '关联单号',
          dataIndex: 'relevanceONum',
          key: 'relevanceONum',
        },
        {
          title: '调出仓库',
          dataIndex: 'delivery_wh',
          key: 'delivery_wh',
        },
        {
          title: '调入仓库',
          dataIndex: 'receipt_wh',
          key: 'receipt_wh',
        },
        {
          title: '调拨数量',
          dataIndex: 'quantity',
          key: 'quantity',
        },
        {
          title: '状态',
          dataIndex: 'status',
          key: 'status',
        },
        {
          title: '操作',
          dataIndex: 'operation',
          key: 'operation',
          render: (text, val) => {
            // console.log(text, record, 'text,record');
            return (
              <div>
                <div
                  onClick={() => {
                    const { panes } = this.state;
                    const activeKey = `newTab${this.newTabIndex++}`;
                    panes.push({
                      title: '编辑',
                      content: (
                        <NewAllotting
                          requisitionid={val.requisition_id}
                          detaildata={val}
                          index={activeKey}
                        />
                      ),
                      key: activeKey,
                    });
                    this.setState({ panes, activeKey });
                  }}
                >
                  <div>
                    <Button size="small" type="primary" className="buttonBul" ghost>
                      编辑
                    </Button>
                  </div>
                  {/* {text} */}
                </div>
                <div
                  onClick={() => {
                    erpPost('requisition/delete', { requisition_id: val.requisition_id }, res => {
                      message.success(res.data.mesg);
                      const dataSource = [...this.state.dataSource];
                      this.setState({
                        dataSource: dataSource.filter(
                          item => item.requisition_id !== val.requisition_id
                        ),
                      });
                      this.mounting();
                    });
                  }}
                >
                  <Button
                    size="small"
                    style={{ width: 60 }}
                    type="primary"
                    className="buttonDel"
                    ghost
                  >
                    删除
                  </Button>
                </div>
              </div>
            );
          },
        },
      ],
    };
  }
  componentWillMount() {
    // 请求数据列表
    this.warehouseAllot(this.state.page, this.state.orders);
  }
  onChange = activeKey => {
    this.setState({ activeKey });
  };

  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };
  // 页码
  onTableChange = (pageNumber, filters, sorte) => {
    const order = [];
    order.push({ field: sorte.field, order: sorte.order });
    this.warehouseAllot(pageNumber, order);
  };
  add = () => {
    const { panes } = this.state;
    const activeKey = `newTab${this.newTabIndex++}`;
    panes.push({ title: 'New Tab', content: 'Content of new Tab', key: activeKey });
    this.setState({ panes, activeKey });
  };
  // 请求数据列表
  warehouseAllot = (pageNumber, orders) => {
    const can = {
      page: pageNumber,
      order: orders,
    };
    erpPost('requisition/index', can, res => {
      const arr = res.data.data;
      arr.map((val, index) => {
        val.key = index;
        return val;
      });
      this.setState({
        dataSource: arr,
        orders: res.data.order,
        page: res.data.page,
      });
      // 加载页面内容
      this.mounting();
    });
  };
  // 加载页面内容
  mounting = () => {
    let { panes } = this.state;
    if (panes.length === 0) {
      panes = [{ title: '仓库调拨', content: this.renderProInfo(), key: '0', closable: false }];
    } else {
      panes[0].content = this.renderProInfo();
    }
    const activeKey = panes[0].key;
    this.setState({
      activeKey,
      panes,
    });
  };
  remove = targetKey => {
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

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields(err => {
      if (!err) {
        // console.log('Received values of form: ', values);
      }
    });
  };
  AddNewTransferringOrder = () => {
    const { panes } = this.state;
    const activeKey = `newTab${this.newTabIndex++}`;
    panes.push({
      title: '新建调拨单',
      content: <NewAllotting requisitionid={0} index={activeKey} />,
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
    const { dataSource, columns, page } = this.state;
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name,
      }),
    };
    // return  <Table dataSource={dataSource} columns={columns} />;
    return (
      <div className="proDataWrap">
        <SearchBar />
        <div style={{ marginBottom: '10px' }}>
          <Button type="primary" className="marginR" onClick={this.AddNewTransferringOrder}>
            新增调拨单
          </Button>
        </div>
        <Table
          dataSource={dataSource}
          columns={columns}
          rowSelection={rowSelection}
          onChange={this.onTableChange}
          pagination={page}
        />
      </div>
    );
  };
  //   <div className="moduleTitle">
  //   <span className="moduleTitleF"></span>
  // </div>

  render() {
    return (
      <Tabs
        hideAdd
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

export default warehouseAllotting;
