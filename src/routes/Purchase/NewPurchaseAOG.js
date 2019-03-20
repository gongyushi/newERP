import React from 'react';
import { Form, Input, Button, Table, Popconfirm, message, Modal } from 'antd';
import { connect } from 'dva';
import { erpPost } from 'services/ajax';
import EditTableItem from 'components/EditableItem';

require('../FormAndList.less');

const FormItem = Form.Item;
// const { Option } = Select;

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

// 到货编辑表单
const PurchaseForm = Form.create({
  mapPropsToFields(props) {
    return {
      parrival_no: Form.createFormField({
        value: props.parrival_no,
      }),
      tracking_no: Form.createFormField({
        value: props.tracking_no,
      }),
      sname: Form.createFormField({
        value: props.sname,
      }),
      wh_name: Form.createFormField({
        value: props.wh_name,
      }),
      delivery_mode: Form.createFormField({
        value: props.delivery_mode,
      }),
      fare: Form.createFormField({
        value: props.fare,
      }),
      other_fare: Form.createFormField({
        value: props.other_fare,
      }),
      amount: Form.createFormField({
        value: props.amount,
      }),
      num: Form.createFormField({
        value: props.num,
      }),
      boxes_num: Form.createFormField({
        value: props.boxes_num,
      }),
    };
  },
})(props => {
  const { getFieldDecorator } = props.form;

  function handleSubmit() {
    props.form.validateFields((err, value) => {
      if (!err) {
        const { orderItem } = props;
        value.purch_arrival_id = props.purch_arrival_id;
        value.attribute = [];
        if (orderItem.length) {
          orderItem.map(item => {
            value.attribute.push({
              porder_item_id: item.porder_item_id,
              boxes_num: item.boxes_num,
              num: item.num,
              amount: item.amount,
              product_id: item.product_id,
            });
            return item;
          });
          value.attribute = JSON.stringify(value.attribute);
        }

        props.dispatch(
          'purchaseIndex/submitPurchase',
          {
            type: props.type,
            values: value,
          },
          data => {
            if (data.code === 1) {
              props.close();
              message.success('保存成功');
            } else {
              message.warning('保存失败');
            }
          }
        );
      }
    });
  }
  return (
    <Form className="ant-advanced-search-form" onSubmit={this.handleSubmit}>
      <FormItem {...formItemLayout} label="采购单号">
        <div>
          {getFieldDecorator('parrival_no', {
            rules: [{ require: true, message: '' }],
            initialValue: [props.searchKey],
          })(
            <Input
              placeholder="placeholder"
              // style={{ width: '250px', heigth: '26px' }}
              onChange={e => props.changeSearchKey(e.target.value)}
            />
          )}
        </div>
      </FormItem>
      <FormItem {...formItemLayout} label="提货单号">
        {getFieldDecorator('tracking_no', {
          rules: [{ require: false, message: '' }],
        })(
          <Input
            placeholder="请输入提货单号"
            className="disabledInput"
            disabled
            style={{ border: 'none' }}
          />
        )}
      </FormItem>
      <FormItem {...formItemLayout} label="供应商">
        {getFieldDecorator('sname', {
          rules: [{ require: false, message: '' }],
        })(
          <Input
            placeholder="请输入供应商"
            className="disabledInput"
            disabled
            style={{ border: 'none' }}
          />
        )}
      </FormItem>
      <FormItem {...formItemLayout} label="入库仓库">
        {getFieldDecorator('wh_name', {
          rules: [{ require: false, message: '' }],
        })(<Input placeholder="请输入入库仓库" />)}
      </FormItem>
      <FormItem {...formItemLayout} label="提货方式">
        {getFieldDecorator('delivery_mode', {
          rules: [{ require: false, message: '' }],
        })(<Input placeholder="请输入提货方式" />)}
      </FormItem>
      <FormItem {...formItemLayout} label="运单号">
        {getFieldDecorator('运单号', {
          rules: [{ require: false, message: '' }],
        })(<Input placeholder="请输入运单号" />)}
      </FormItem>
      <FormItem {...formItemLayout} label="运费">
        {getFieldDecorator('fare', {
          rules: [{ require: false, message: '' }],
        })(<Input placeholder="请输入运费" />)}
      </FormItem>
      <FormItem {...formItemLayout} label="其他费用">
        {getFieldDecorator('other_fare', {
          rules: [{ require: false, message: '' }],
        })(<Input placeholder="情输入其他费用" />)}
      </FormItem>
      <FormItem {...formItemLayout} label="到货数量">
        {getFieldDecorator('num', {
          rules: [{ require: false, message: '', type: 'number' }],
        })(
          <Input
            placeholder="到货数量系统自动计算"
            className="disabledInput"
            disabled
            // style={{ width: '250px', heigth: '26px' }}
          />
        )}
      </FormItem>
      <FormItem {...formItemLayout} label="到货金额">
        {getFieldDecorator('amount', {
          rules: [{ require: false, message: '', type: 'number' }],
        })(
          <Input
            placeholder="到货金额系统自动计算"
            className="disabledInput"
            disabled
            // style={{ width: '250px', heigth: '26px' }}
          />
        )}
      </FormItem>
      <FormItem {...formItemLayout} label="箱数">
        {getFieldDecorator('boxes_num', {
          rules: [{ require: false, message: '', type: 'number' }],
        })(
          <Input
            placeholder="箱数系统自动计算"
            className="disabledInput"
            disabled
            // style={{ width: '250px', heigth: '26px' }}
          />
        )}
      </FormItem>
      {/* <Row gutter={24}>
        <Col span={12}>
          
        </Col>
        <Col span={12}>
          
        </Col>
      </Row> */}

      {/* {!props.isCommit && (
        <div>
          <Button type="primary" style={{ marginRight: '15px' }}>
            提交
          </Button>
          <Button type="primary" onClick={handleSubmit} style={{ marginRight: '15px' }}>
            保存
          </Button>
        </div>
      )} */}
    </Form>
  );
});
class NewPurchaseAOG extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // 搜索窗是否可见
      visible: false,
      // 详情数据
      editData: {},
      // 采购单搜索的关键词
      searchKey: '',
      // 采购单搜索后选中的记录
      selectRows: [],
      // 确认的订单记录
      orderItem: [],
    };
    this.searchBoxColumns = [
      {
        title: '图片',
        dataIndex: 'image_urls',
      },
      {
        title: 'SKU',
        dataIndex: 'sku',
      },
      {
        title: '款号',
        dataIndex: '',
      },
      {
        title: '商品名称',
        dataIndex: 'prod_name',
      },
      {
        title: '颜色/规格',
        dataIndex: 'colors',
      },
      {
        title: '采购总数',
        dataIndex: 'prod_amount',
      },
      {
        title: '单价(￥)',
        dataIndex: 'unit_price',
      },
      {
        title: '已取消数量',
        dataIndex: '',
      },
      {
        title: '到货数量',
        dataIndex: 'num',
      },
      {
        title: '入库数量',
        dataIndex: '',
      },
    ];
    this.columns = [
      {
        title: '图片',
        dataIndex: 'image_urls',
        render: () => {
          return (
            <img
              src={require('../../assets/3.jpg')}
              alt="商品图片"
              style={{ width: '50px', border: '1px solid #dcdcdc' }}
            />
          );
        },
      },
      {
        title: '采购单号',
        dataIndex: 'purch_no',
      },
      {
        title: 'SKU',
        dataIndex: 'sku',
      },
      {
        title: '颜色/规格',
        dataIndex: 'colors',
      },
      {
        title: '商品名称',
        dataIndex: 'prod_name',
      },
      {
        title: '采购总数',
        dataIndex: 'prod_amount',
      },
      {
        title: '采购金额(￥)',
        dataIndex: 'purchasePrice',
      },
      {
        title: '箱数',
        dataIndex: 'boxes_num',
        render: (text, record) => {
          return (
            <EditTableItem
              value={text}
              onChange={this.onCellChange.bind(this, record.key, 'boxes_num')}
            />
          );
        },
      },
      {
        title: '到货数量',
        dataIndex: 'num',
        render: (text, recode) => {
          return (
            <EditTableItem
              value={text}
              onChange={this.onCellChange.bind(this, recode.key, 'num')}
            />
          );
        },
      },
      {
        title: '单价(￥)',
        dataIndex: 'unit_price',
      },
      {
        title: '到货金额',
        dataIndex: 'amount',
        render: (text, recode) => {
          return (
            <EditTableItem
              value={text}
              onChange={this.onCellChange.bind(this, recode.key, 'amount')}
            />
          );
        },
      },
      {
        title: '操作',
        dataIndex: 'operation',
        render: (text, record) => {
          return this.state.orderItem.length > 0 ? (
            <Popconfirm title="确认删除?" onConfirm={() => this.onDelete(record.key)}>
              <span>删除</span>
            </Popconfirm>
          ) : null;
        },
      },
    ];

    this.sbRowSelection = {
      onChange: () => {},
      onSelect: (record, selected, selectedRows) => {
        this.setState({
          selectRows: selectedRows,
        });
        // this.dispatch('purchaseIndex/updateSelectedList', { rows: selectedRows });
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name,
      }),
    };
    this.rowSelection = {
      onChange: () => {},
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name,
      }),
    };
  }
  componentWillMount() {
    if (this.props.type === 'edit') {
      this.initEditData();
    } else {
      /* 获取随机生成单号 */
      this.dispatch('purchaseIndex/fetchNewOrder', {});
    }
  }
  componentWillReceiveProps() {
    const { type } = this.props;
    if (type === 'add') {
      this.setState({
        editData: {
          tracking_no: this.props.newOrder,
        },
      });
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (
      nextProps.newOrder !== this.props.newOrder ||
      nextState.visible !== this.state.visible ||
      nextProps.goodsList !== this.props.goodsList ||
      nextState.editData !== this.state.editData ||
      this.props.serachLoading !== nextProps.serachLoading
    ) {
      return true;
    }
    return false;
  }
  componentWillUnmount() {
    /* 组件销毁清空一些数据 */
    this.dispatch('purchaseIndex/querySearchList', []);
  }
  // 界面上直接修改订单，同步数据
  onCellChange = (key, dataIndex, value) => {
    const order_item = [...this.state.orderItem];
    const target = order_item.find(item => item.key === key);
    if (target) {
      target[dataIndex] = value;
      this.setState({ orderItem: order_item });
    }
  };
  // 删除商品
  onDelete = key => {
    const dataSource = [...this.state.dataSource];
    const filterData = dataSource.filter(item => item.key !== key);
    this.setState({ dataSource: filterData });
  };
  // 初始化编辑页数据
  initEditData = () => {
    const { type } = this.props;
    erpPost(
      'purchase-arrival/view',
      {
        purch_arrival_id: this.props.purch_arrival_id,
      },
      res => {
        const { data } = res.data;
        // 具体到货列表数据
        const { order_item } = data;
        // 添加额外的属性
        const dataObj = Object.assign(
          {
            boxes_num: 0,
            num: 0,
            amount: 0,
          },
          data
        );
        if (order_item && order_item.length > 0) {
          /*
          1`遍历一下，给表格数据加上唯一key
          2`这边做求和:
            箱数 boxes_num
            到货金额 total
            到货数量 amount
          */
          order_item.map((item, index) => {
            item.key = index;
            dataObj.boxes_num += item.boxes_num === undefined ? 0 : parseFloat(item.boxes_num);
            dataObj.num += item.num === undefined ? 0 : parseFloat(item.num);
            dataObj.amount += item.amount === undefined ? 0 : parseFloat(item.amount);
            return item;
          });
        }
        this.setState({
          editData: type === 'edit' ? dataObj : {},
          orderItem: order_item,
          searchKey: dataObj.parrival_no,
        });
      }
    );
  };
  // 到货编辑保存
  handleSubmit = () => {
    this.props.form.validateFields((err, value) => {
      if (!err) {
        // console.log('get values from form:',value);
        value.purch_arrival_id = this.props.purch_arrival_id;
        value.attribute = [];
        // 拼接到货单项数据
        this.state.dataSource.map(item => {
          value.attribute.push({
            porder_item_id: item.porder_item_id,
            boxex_num: item.boxex_num,
            amount: item.amount,
          });
          return item;
        });
        value.attribute = JSON.stringify(value.attribute);
        this.props.dispatch({
          type: 'purchaseIndex/submitPurchase',
          payload: {
            type: this.props.type,
            values: value,
          },
          onCompleted: data => {
            if (data.code === 1) {
              message.success('保存成功');
            } else {
              message.warning('保存失败');
            }
          },
        });
      }
    });
  };
  // 到货编辑 提交
  handleCommit = () => {
    this.props.dispatch({
      type: 'purchaseIndex/commintPurchase',
      payload: {
        purch_arrival_id: this.props.purch_arrival_id,
      },
      onCompleted: data => {
        if (data.code === 1) {
          message.success('提交成功');
        } else {
          message.success('提交失败');
        }
      },
    });
  };
  // 显示添加商品弹窗
  showModal = () => {
    const { searchKey } = this.state;
    if (searchKey === '') {
      message.warning('请输入采购单号');
      return false;
    }
    this.setState({
      visible: true,
    });
    const { orderItem } = this.state;
    this.dispatch('purchaseIndex/fetchSearchBoxList', {
      purch_no: this.state.searchKey,
      // 如果有勾选项 则供应商id 要作为下一次调用查询接口的参数
      supplier_id: orderItem.length > 0 ? orderItem[0].supplier_id : null,
    });
  };
  // 隐藏添加商品弹窗
  hideModal = () => {
    const { searchKey, editData } = this.state;
    this.setState({
      visible: false,
      editData: Object.assign({}, editData, { parrival_no: searchKey }),
    });
  };
  // 搜索页面--确定
  sureClick = () => {
    const { selectRows, editData, searchKey } = this.state;
    this.setState({
      visible: false,
      orderItem: selectRows,
      editData: Object.assign({}, editData, { parrival_no: searchKey }),
    });
  };
  // 公用派发方法
  dispatch = (path, params, action) => {
    this.props.dispatch({ type: path, payload: params, onCompleted: action });
  };
  render() {
    const { columns } = this;
    const { editData } = this.state;
    return (
      <div className="contentWrap">
        <div>
          <PurchaseForm
            {...editData}
            showModal={this.showModal}
            dispatch={this.dispatch.bind(this)}
            isCommit={this.props.isCommit}
            type={this.props.type}
            purch_arrival_id={this.props.purch_arrival_id}
            onChange={this.handleChange}
            orderItem={this.state.orderItem}
            changeSearchKey={key => {
              this.setState({
                searchKey: key,
              });
            }}
            close={() => {
              this.props.onClose(this.props.index);
            }}
            searchKey={this.state.searchKey}
          />
          <Modal
            title="添加商品"
            wrapClassName="ant-modal-wrap"
            visible={this.state.visible}
            onOk={this.sureClick}
            maskClosable={false}
            onCancel={this.hideModal}
            okText="确认"
            cancelText="取消"
            className="addGoods"
          >
            <div className="toolBar">
              <span>采购单号</span>
              <Input
                placeholder="请输入采购单号"
                defaultValue={this.state.searchKey}
                style={{ width: '250px', heigth: '26px' }}
                onChange={e => {
                  this.setState({
                    searchKey: e.target.value,
                  });
                }}
              />
              <Button type="primary" onClick={this.showModal}>
                搜索
              </Button>
            </div>
            <Table
              rowSelection={this.sbRowSelection}
              columns={this.searchBoxColumns}
              dataSource={this.props.goodsList}
              loading={this.props.serachLoading}
            />
          </Modal>
        </div>
        <div style={{ paddingLeft: '20px', margin: '10px' }}>
          <Button type="primary" style={{ marginRight: '10px' }} onClick={this.props.showModal}>
            搜索
          </Button>
          <Button type="primary" style={{ marginRight: '10px' }}>
            导入
          </Button>
          <Button type="primary">删除</Button>
        </div>
        <div>
          <Table
            rowSelection={this.rowSelection}
            dataSource={this.state.orderItem}
            columns={columns}
          />
        </div>
        <div>
          <Button type="primary" style={{ marginRight: '15px' }}>
            提交
          </Button>
          <Button type="primary" onClick={this.handleSubmit} style={{ marginRight: '15px' }}>
            保存
          </Button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    goodsList: state.purchaseIndex.goodsList,
    newOrder: state.purchaseIndex.newOrder,
    serachLoading: state.loading.effects['purchaseIndex/fetchSearchBoxList'],
  };
};

export default connect(mapStateToProps)(NewPurchaseAOG);
