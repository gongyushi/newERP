import React from 'react';
import { connect } from 'dva';
import { Table, Tabs, Form, Button } from 'antd';
import SearchBar from '../../components/SearchBar';
import NewEXWarehouse from './NewEXWarehouse';

require('../ListStyle.less');

const { TabPane } = Tabs;

/* 把from添加天props里 */

@Form.create()
class EXWarehouse extends React.Component {
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
          title: '出库通知单',
          dataIndex: 'outbound_no',
          key: 'outbound_no',
          className: 'width200',
        },
        {
          title: '关联单号',
          dataIndex: 'relevanceOdd',
          key: 'relevanceOdd',
          className: 'width200',
        },
        {
          title: '仓库',
          dataIndex: 'wh_name',
          key: 'wh_name',
          className: 'width160',
        },
        {
          title: '预出总数',
          dataIndex: 'sum',
          key: 'sum',
          className: 'width140',
        },
        {
          title: '出库良品数',
          dataIndex: 'good_quantity',
          key: 'good_quantity',
          className: 'width140',
        },
        {
          title: '出库不良品数',
          dataIndex: 'bad_quantity',
          key: 'bad_quantity',
          className: 'width140',
        },
        {
          title: '类型',
          dataIndex: 'dely_type',
          key: 'dely_type',
          className: 'width140',
        },
        {
          title: '状态',
          dataIndex: 'status',
          key: 'status',
          className: 'width140',
        },
        {
          title: '创建时间',
          dataIndex: 'created_at',
          key: 'created_at',
          className: 'width140',
        },
        {
          title: '操作',
          dataIndex: 'operation',
          key: 'operation',
          className: 'width140',
          render: (text, val) => {
            return (
              <div>
                <div
                  onClick={() => {
                    const { panes } = this.state;
                    const activeKey = `newTab${this.newTabIndex++}`;
                    panes.push({
                      title: '编辑',
                      content: (
                        <NewEXWarehouse
                          index={activeKey}
                          outboundId={val.outbound_id}
                          whId={val.wh_id}
                          detailInfo={val}
                          type="detail"
                          isSubmit={val.status === 1 ? 1 : 0}
                        />
                      ),
                      key: activeKey,
                    });
                    this.setState({ panes, activeKey });
                  }}
                >
                  <Button size="small" type="primary" className="buttonBul" ghost>
                    查看
                  </Button>
                </div>
                <div>
                  <Button size="small" type="primary" className="buttonBul" ghost>
                    出库
                  </Button>
                </div>
                {/* {text} */}
              </div>
            );
          },
        },
      ],
    };
    // const panes = [
    //   { title: '出库管理', content: this.renderProInfo(), key: '1', closable: false },
    //   // { title: '新建出库', content: <NewEXWarehouse />, key: '2' },
    // ];

    // this.state = {
    //   activeKey: panes[0].key,
    //   panes,
    // };
  }

  componentWillMount() {
    this.getEXList(this.state.page, this.state.orders);
  }
  componentWillReceiveProps(nProps) {
    this.setState(
      {
        dataSource: nProps.exWarehouseIndex,
      },
      () => {
        this.mounting();
      }
    );
  }
  // 页码
  onTableChange = (pageNumber, filters, sorte) => {
    const order = [];
    order.push({ field: sorte.field, order: sorte.order });
    this.getEXList(pageNumber, order);
  };
  onChange = activeKey => {
    this.setState({ activeKey });
  };
  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };
  getEXList = (pageNumber, orders) => {
    const can = {
      page: pageNumber,
      order: orders,
    };
    this.props.dispatch({
      type: 'exWarehouseIndex/fetchEXList',
    });
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
  NewEXWarehouse = () => {
    const { panes } = this.state;
    const activeKey = `newTab${this.newTabIndex++}`;
    panes.push({
      title: '新建出库',
      content: <NewEXWarehouse index={activeKey} />,
      key: activeKey,
    });
    this.setState({ panes, activeKey });
  };
  // 渲染页面
  mounting = () => {
    let { panes } = this.state;
    if (panes.length === 0) {
      panes = [{ title: '出库管理', content: this.renderProInfo(), key: '1', closable: false }];
    } else {
      panes[0].content = this.renderProInfo();
    }
    const activeKey = panes[0].key;
    this.setState({
      activeKey,
      panes,
    });
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
          <Button type="primary" className="marginR" onClick={this.NewEXWarehouse}>
            新增出库
          </Button>
          <Button
            type="primary"
            className="marginR"
            onClick={() => {
              window.location.href = `${global.gconfig.urlHeader}warehouse/export`;
            }}
          >
            导出
          </Button>
          <Button type="primary" className="marginR">
            导入
          </Button>
        </div>
        <Table
          dataSource={dataSource}
          columns={columns}
          rowSelection={rowSelection}
          rowKey="outbound_id"
          onChange={this.onTableChange}
          pagination={page}
        />
      </div>
    );
  };
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
const mapStateToProps = state => {
  return {
    exWarehouseIndex: state.exWarehouseIndex.exWarehouseListData,
  };
};
export default connect(mapStateToProps)(EXWarehouse);
