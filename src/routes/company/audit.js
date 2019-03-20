import React from 'react';
import { Table, Tabs, Button, message, pagination, Modal, Input, Icon } from 'antd';
import NewPurchaseOrder from 'routes/Purchase/NewPurchaseOrder';
import SearchBar from '../../components/SearchBar';
import { erpPost } from '../../services/ajax';

require('../ListStyle.less');

const { TabPane } = Tabs;

/* 把from添加天props里 */

const dataSource = [
  {
    purch_no: '001',
    sname: '江南皮革厂',
    total:'500',
    reversibility: '200',
    canceled: '50',
    quantityGoods: '100',
    purchaseQuantity: '999',
    freight: '9.9',
    username: '张三',
    status: '2',
  },
  {
    purch_no: '002',
    sname: '鹅厂',
    total:'500',
    reversibility: '200',
    canceled: '50',
    quantityGoods: '100',
    purchaseQuantity: '999',
    freight: '9.9',
    username: '李四',
    status: '0',
  },
  {
    purch_no: '003',
    sname: '云南白药',
    total:'500',
    reversibility: '200',
    canceled: '50',
    quantityGoods: '100',
    purchaseQuantity: '999',
    freight: '9.9',
    username: '王五',
    status: '0',
  },
];

export default class Audit extends React.Component {
  constructor(props) {
    super(props);
    this.newTabIndex = 0;
    this.state = {
      selectedRowKeys: [],
      panes: [{ title: '经理审核', content: null, key: '1', closable: false }],
      activeKey: '1',
      orderList: [],
      visible: false,
      reason: '',
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
          title: '采购单号',
          dataIndex: 'purch_no',
          className: 'purch_no',
          key: 'purch_no',
        },
        {
          title: '供应商',
          dataIndex: 'sname',
          className: 'sname',
          key: 'sname',
        },
        {
          title: '采购数量',
          dataIndex: 'total',
          className: 'total',
          key: 'total',
        },
        {
          title: '可取消数量',
          dataIndex: 'reversibility',
          className: 'reversibility',
          key: 'reversibility',
        },
        {
          title: '已取消数量',
          dataIndex: 'canceled',
          className: 'canceled',
          key: 'canceled',
        },
        {
          title: '到货数量',
          dataIndex: 'quantityGoods',
          className: 'quantityGoods',
          key: 'quantityGoods',
        },
        {
          title: '入库总数',
          dataIndex: 'purchaseQuantity',
          className: 'purchaseQuantity',
          key: 'purchaseQuantity',
        },
        // {
        //   title: '良品',
        //   dataIndex: 'goodGoods',
        //   className: 'goodGoods',
        //   key: 'goodGoods',
        // },
        // {
        //   title: '不良品',
        //   dataIndex: 'badGoods',
        //   className: 'badGoods',
        //   key: 'badGoods',
        // },
        {
          title: '运费(￥)',
          dataIndex: 'freight',
          className: 'freight',
          key: 'freight',
        },
        {
          title: '采购员',
          dataIndex: 'username',
          className: 'username',
          key: 'username',
        },
        {
          title: '状态',
          dataIndex: 'status',
          className: 'status',
          key: 'status',
        },
        {
          title: '操作',
          dataIndex: 'operation',
          className: 'operation',
          key: 'operation',
          render: (value, record) => {
            return (
              <div>
                <div>
                  {/* 跳转采购详情页面 */}
                  <Button size="small" type="primary" className="buttonBul" onClick={this.handleAddDetail} ghost>
                    查看
                  </Button>
                </div>
                {/* 根据状态选择是否显示 */}
                <div>
                  <Button size="small" type="primary" className="buttonBul" ghost>
                    通过
                  </Button>
                </div>
                <div>
                  <Button size="small" type="primary" className="buttonDel" ghost onClick={this.handleOpenModal}>
                    驳回
                  </Button>
                </div>
                {/* {text} */}
              </div>
            );
          },
        },
      ],
    };
  }
  componentDidMount() {
    this.getList(this.state.page, this.state.orders);
  }

  onChange = activeKey => {
    this.setState({ activeKey });
  };

  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };
  // 获取列表接口
  // getList = () => {
  //   this.props.dispatch({
  //     type: 'purchaseOrder/fetch',
  //     payload: {
  //       purch_no: this.state.searchKey,
  //     },
  //   });
  // };
  // 页码
  onTableChange = (pageNumber, filters, sorte) => {
    const order = [];
    order.push({ field: sorte.field, order: sorte.order });
    this.getList(pageNumber, order);
  };
  getList = (pageNumber, orders) => {
    // const can = {
    //   page: pageNumber,
    //   order: orders,
    // };
    // // 获取列表
    // erpPost('purchaseOrder/fetch',can,res => {
    //   this.setState({
    //     orderList: res.data.data,
    //   });
    // });
    this.setState({
      orderList: dataSource,
    });
  };
  // 打开模态框
  handleOpenModal = () => {
    this.setState({
      visible: true,
    });
  }
  // 关闭
  handleCancel = () => {
    this.setState({
      visible: false,
      reason: '',
    });
  }
  handleOk = () => {
    const { reason } = this.state;
    if(reason === ''){
      message.info('请输入驳回理由',1);
    }else{
      // 提交
      message.success('提交成功',1);
      this.handleCancel();
    }
  }
  handleChange = (key,e) => {
    this.setState({
      [key]: e.target.value,
    });
  }
  add = () => {
    const { panes } = this.state;
    const activeKey = `newTab${this.newTabIndex++}`;
    panes.push({ title: 'New Tab', content: 'Content of new Tab', key: activeKey });
    this.setState({ panes, activeKey });
  };
  handleAddDetail = () => {
    const { panes } = this.state;
    const activeKey = `newTab${this.newTabIndex++}`;
    panes.push({ title: '采购单详情', content: '这里是采购单详情页面', key: activeKey });
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

  passOrNopass = ispass => {
    const { selectedRowKeys } = this.state;
    if (ispass) {
      // 批量通过
    }else{
      // 批量不通过
    }
  };
  /**
   * 渲染表格
   * @param {Object} dataSource 表行
   * @param {Object} columns 表头
   */
  // 选中表格项
  handleSelectChange = (selectedRowKeys) => {
    // selectedRowKeys 选中行的key
    this.setState({
      selectedRowKeys,
    });
  }
  renderProInfo = () => {
    const { columns, page } = this.state;
    const rowSelection = {
      onChange: this.handleSelectChange,
      getCheckboxProps: record => ({
        // 模拟2状态为已审核状态
        disabled: record.status === '2', // Column configuration not to be checked
        name: record.status,
      }),
    };

    // return  <Table dataSource={dataSource} columns={columns} />;
    return (
      <div className="proDataWrap">
        <SearchBar />
        <div style={{marginBottom: '10px'}}>
          <Button type="primary" size='small' className="marginR" onClick={this.passOrNopass.bind(this, true)}>
            通过
          </Button>
        </div>
        <Table
          rowKey="purch_no"
          dataSource={this.state.orderList}
          columns={columns}
          rowSelection={rowSelection}
          className="audit"
          pagination={page}
          onChange={this.onTableChange}
        />
      </div>
    );
  };
  render() {
    const { panes, activeKey } = this.state;
    panes[0].content = this.renderProInfo();
    // console.log(this.props.orderList, 'render');
    return (
      <div>
        <Tabs
          hideAdd
          className="productVariants"
          onChange={this.onChange}
          activeKey={activeKey}
          type="editable-card"
          onEdit={this.onEdit}
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
        <Modal
          visible={this.state.visible}
          title={(
            <div style={{display:'flex',justifyContent:'center'}}>
              <span style={{opacity:'0.8'}}>是否驳回</span>
              <div style={{position:'absolute',top:8,right:8}}>
                <Icon 
                  type='close' 
                  style={{fontSize:32,color:'#333',opacity:'0.5',cursor:'pointer'}} 
                  onClick={this.handleCancel}
                />
              </div>
            </div>
          )}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          maskClosable={false}
          width='350px'
          footer={null}
          closable={false}
          centered
        >
          <div style={{padding:'2px 5px',margin:'0 auto'}}>
            <div style={{marginBottom:10}}>
              <span>下一个审核人：</span>
              <span>张三</span>
            </div>
            <div style={{display:'flex',justifyContent:'center'}}>
              <div style={{display:'flex',alignItems:'center'}}>
                <span>驳回原因：</span>
              </div>
              <div>
                <textarea rows="5" style={{width:200}} onChange={this.handleChange.bind(this,'reason')} />
              </div>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:5}}>
              <div>
                <Button onClick={this.handleCancel} style={{borderColor:'#00EC00'}}>
                  取消
                </Button>
              </div>
              <div>
                <Button key="submit" type="primary" onClick={this.handleOk}>
                  确定
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

