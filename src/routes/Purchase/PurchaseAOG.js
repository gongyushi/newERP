import React from 'react';
import { connect } from 'dva';
// import axios from 'axios';
import { Table, Tabs, Form, Button, message } from 'antd';
import SearchBar from '../../components/SearchBar';
import NewPurchaseAOG from './NewPurchaseAOG';
import {
  // erpPost,
  erpPostAll,
} from '../../services/ajax';

require('../ListStyle.less');

const { TabPane } = Tabs;

/* 把from添加天props里 */

@Form.create()
class PurchaseAOG extends React.Component {
  constructor(props) {
    super(props);
    this.newTabIndex = 0;
    this.state = {
      page: {
        // defaultCurrent: 1,  // 默认的当前页数
        pageSize: 10, // 每页显示条数
        total: 0, // 总页数
        current: 1, // 当前页数
        showSizeChanger: true,
        // showQuickJumper:true,
      },
      // 默认的标签页
      panes: [
        {
          title: '采购到货',
          content: null,
          key: '1',
          closable: false,
        },
      ],
      // 当前显示的标签页key，默认为标签页key值
      activeKey: '1',
      columns: [
        {
          title: '到货单号',
          dataIndex: 'parrival_no',
          key: 'parrival_no',
          className: 'width200',
        },
        {
          title: '采购单号',
          dataIndex: 'purch_no',
          key: 'purch_no',
          className: 'width200',
        },
        {
          title: '供应商',
          dataIndex: 'sname',
          key: 'sname',
          className: 'width200',
        },
        {
          title: '仓库',
          dataIndex: 'wh_name',
          key: 'wh_name',
          className: 'width100',
        },
        {
          title: '到货数量',
          dataIndex: 'AOGQuantity',
          key: 'AOGQuantity',
          className: 'width100',
        },
        {
          title: '到货金额(￥)',
          dataIndex: 'AOGSum',
          key: 'AOGSum',
          className: 'width100',
        },
        {
          title: '入库总数',
          dataIndex: 'putInNum',
          key: 'putInNum',
          className: 'width100',
        },
        {
          title: '良品',
          dataIndex: 'goodGoods',
          key: 'goodGoods',
          className: 'width100',
        },
        {
          title: '不良品',
          dataIndex: 'badGoods',
          key: 'badGoods',
          className: 'width100',
        },
        {
          title: '运费(￥)',
          dataIndex: 'fare',
          key: 'fare',
          className: 'width100',
        },
        {
          title: '状态',
          dataIndex: 'status',
          key: 'status',
          className: 'width100',
          render: text => {
            return text === 1 ? <span style={{ color: 'green' }}>提交</span> : '未提交';
          },
        },
        {
          title: '操作',
          dataIndex: 'operation',
          key: 'operation',
          className: 'width140',
          render: (text, record) => {
            // console.log(text, record, 'text,record');
            return (
              <div
                onClick={() => {
                  const { panes } = this.state;
                  const activeKey = `newTab${this.newTabIndex++}`;
                  panes.push({
                    title: '编辑',
                    content: (
                      <NewPurchaseAOG
                        index={activeKey}
                        type="edit"
                        purch_arrival_id={record.purch_arrival_id}
                        isCommit={record.status === 1 ? 1 : 0}
                      />
                    ),
                    key: activeKey,
                  });
                  this.setState({ panes, activeKey });
                }}
              >
                <Button size="small" type="primary" className="buttonBul" ghost>
                  {record.status === '0' ? '提交' : '查看'}
                </Button>
              </div>
            );
          },
        },
      ],
      selectedRows: [],
    };
  }
  componentWillMount() {
    this.getIndexList(this.state.page, this.state.orders); //
  }
  // 页码
  onTableChange = (pageNumber, filters, sorte) => {
    const order = [];
    order.push({ field: sorte.field, order: sorte.order });
    this.getIndexList(pageNumber, order);
  };
  // 获取列表数据
  // getIndexList = () => {
  //   this.props.dispatch({
  //     type: 'purchaseIndex/fetchIndexList',
  //   });
  // };
  getIndexList = (pageNumber, orders) => {
    const can = {
      page: pageNumber,
      order: orders,
    };
    this.props.dispatch({
      type: 'purchaseIndex/fetchIndexList',
      payload: can,
    });
  };
  // 删除记录
  deleteRow = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length) {
      const urlArr = selectedRows.map(item => {
        return {
          url: 'purchase-arrival/delete',
          data: {
            purch_arrival_id: item.purch_arrival_id,
          },
        };
      });
      // 同步多个请求产生一个回调
      erpPostAll(urlArr, resArr => {
        console.log(resArr);
        this.getIndexList();
        message.success('删除成功');
      });
    } else {
      message.error('请勾选要删除的记录');
    }
  };
  // 采购到货提交
  commitRow = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length) {
      for (let i = 0, len = selectedRows.length; i < len; i++) {
        const item = selectedRows[i];
        if (item.status === 1) {
          console.log(`已提交记录，不可重复提交${item.key}`);
        } else {
          this.props.dispatch({
            type: 'purchaseIndex/commintPurchase',
            payload: {
              purch_arrival_id: item.purch_arrival_id,
            },
            onCompleted: data => {
              if (data.code === 1) {
                message.success('提交成功');
              } else {
                message.success('提交失败');
              }
            },
          });
        }
      }
    } else {
      message.warning('请至少勾选一条未提交的记录');
    }
  };
  // 关闭页签
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
  // 新增采购单
  AddNewPurchaseAOG = () => {
    const { panes } = this.state;
    const activeKey = `newTab${this.newTabIndex++}`;
    panes.push({
      title: '新增采购到货',
      content: (
        <NewPurchaseAOG
          index={activeKey}
          type="add"
          onClose={key => {
            this.remove(key);
          }}
        />
      ),
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
    const { columns, page } = this.state;
    const { dataSource } = this.props;
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        this.setState({
          selectedRows,
        });
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name,
      }),
    };
    return (
      <div className="proDataWrap">
        <SearchBar />
        <div style={{ marginBottom: '10px' }}>
          <Button type="primary" className="marginR" onClick={this.AddNewPurchaseAOG}>
            新增到货单
          </Button>
          <Button type="primary" onClick={this.commitRow} className="marginR">
            提交
          </Button>
          <Button type="primary" onClick={this.deleteRow} className="marginR buttonDel">
            删除
          </Button>
        </div>
        <Table
          dataSource={dataSource}
          columns={columns}
          rowKey="purch_arrival_id"
          rowSelection={rowSelection}
          loading={this.props.IndexLoading}
          onChange={this.onTableChange}
          pagination={page}
        />
      </div>
    );
  };
  render() {
    const { panes } = this.state;
    panes[0].content = this.renderProInfo();

    return (
      <Tabs
        hideAdd
        className="productVariants"
        onChange={activeKey => {
          this.setState({ activeKey });
        }}
        activeKey={this.state.activeKey}
        type="editable-card"
        onEdit={(targetKey, action) => {
          this[action](targetKey);
        }}
      >
        {panes.map(pane => (
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
    dataSource: state.purchaseIndex.purchaseList,
    IndexLoading: state.loading.effects['purchaseIndex/fetchIndexList'],
  };
};
export default connect(mapStateToProps)(PurchaseAOG);
