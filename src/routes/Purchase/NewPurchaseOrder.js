import React from 'react';
import { Form, Input, Button, Select, Table, Modal, Radio, message } from 'antd';
import EditableItem from '../../components/EditableItem';
import { erpPost } from '../../services/ajax';

require('../FormAndList.less');
require('../popUpStyle.less');

const FormItem = Form.Item;
const { Option } = Select;
const RadioGroup = Radio.Group;
const { Search } = Input;

@Form.create()
class NewPurchaseOrder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      // addTable:{},// 新增采购单表单选中数据
      addDataSource: [],
      prodDataSource: [],
      addColumns: [
        {
          title: '图片',
          dataIndex: 'image_urls',
          key: 'image_urls',
        },
        {
          title: 'SKU',
          dataIndex: 'sku',
          key: 'sku',
        },
        {
          title: '款号',
          dataIndex: 'styleNumber',
          key: 'styleNumber',
        },
        {
          title: '颜色/规格',
          dataIndex: 'colors',
          key: 'colors',
        },
        {
          title: '商品名称',
          dataIndex: 'prod_name',
          key: 'prod_name',
        },
        {
          title: '库存成本价',
          dataIndex: 'costPrice',
          key: 'costPrice',
        },
        {
          title: '采购单价（￥）',
          dataIndex: 'unit_price',
          key: 'unit_price',
          render: (text, record) => (
            <EditableItem
              value={text}
              onChange={this.onCellChange.bind(this, record.key, 'unit_price')}
            />
          ),
        },
        {
          title: '采购数量',
          dataIndex: 'totalPrices',
          key: 'totalPrices',
        },
        {
          title: '总价（￥）',
          dataIndex: 'cost',
          key: 'cost',
        },
        // {
        //   title: '已取消数量',
        //   dataIndex: 'canceledNum',
        //   key: 'canceledNum',
        // },
        // {
        //   title: '已到货数量',
        //   dataIndex: 'haveArrivedNum',
        //   key: 'haveArrivedNum',
        // },
        // {
        //   title: '入库数量',
        //   dataIndex: 'putInNum',
        //   key: 'putInNum',
        // },
        // {
        //   title: '良品数量',
        //   dataIndex: 'goodNum',
        //   key: 'goodNum',
        // },
        // {
        //   title: '不良品数量',
        //   dataIndex: 'badNum',
        //   key: 'badNum',
        // },
        // {
        //   title: '可取消数量',
        //   dataIndex: 'reversibilityNum',
        //   key: 'reversibilityNum',
        // },
        {
          title: '取消数量',
          dataIndex: 'total',
          key: 'total',
          render: (text, record) => (
            <EditableItem
              value={text}
              onChange={this.onCellChange.bind(this, record.key, 'total')}
            />
          ),
        },
      ],
      prodColumns: [
        // {
        //   title: '图片',
        //   dataIndex: 'image_urls',
        //   key: 'image_urls',
        // },
        {
          title: 'SKU',
          dataIndex: 'sku',
          key: 'sku',
        },
        {
          title: '商品名称',
          dataIndex: 'prod_name',
          key: 'prod_name',
          // className:'',
          render: (text, val) => <div>{val.prod_name}</div>,
        },
        {
          title: '可用库存',
          dataIndex: 'avail_stock',
          key: 'avail_stock',
        },
        {
          title: '单价(￥)',
          dataIndex: 'unit_price',
          key: 'unit_price',
        },
        {
          title: '数量',
          dataIndex: 'total',
          key: 'total',
        },
        // {
        //   title: '总价（￥）',
        //   dataIndex: 'cost',
        //   key: 'cost',
        // },
      ],
    };
  }
  componentWillMount() {
    console.log(this.props.puchaseorderid);
    // 获取产品列表
    this.prodList('');
    if (this.props.puchaseorderid === 0) {
      // 获取采购单号
      this.getNumber();
    } else {
      // 获取采购单详情
      this.purchaseDetail();
    }
  }
  // componentWillReceiveProps(val) {

  // }

  // 改变表格中的值
  onCellChange = (key, dataIndex, data) => {
    const addDataSource = [...this.state.addDataSource];
    const target = addDataSource.find(item => {
      return item.key === key;
    });
    if (target) {
      target[dataIndex] = data;
      // console.log(addDataSource)
      this.setState({ addDataSource });
    }
    // console.log(this.state.addDataSource);
    // };
  };
  // 获取采购单号
  getNumber = () => {
    erpPost('purchase-order/no', {}, res => {
      this.props.form.setFieldsValue({ purch_no: res.data.data });
    });
  };
  // 获取采购单详情
  purchaseDetail = () => {
    erpPost('purchase-order/view', { purchase_order_id: this.props.puchaseorderid }, res => {
      const detailData = res.data.data;
      const objForm = {
        purch_no: detailData.purch_no,
        buyer: detailData.buyer,
        pay_method: detailData.pay_method,
        total: detailData.total,
        cost: detailData.cost,
        supplier_id: detailData.supplier_id,
      };
      this.props.form.setFieldsValue(objForm);
      this.setState({
        addDataSource: detailData.order_item,
      });
    });
  };
  // 表单
  handleSubmit = (val, e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const arr = [];
        this.state.addDataSource.map(res => {
          const obj = {};
          obj.product_id = res.product_id;
          obj.unit_price = res.unit_price;
          obj.total = res.total;
          arr.push(obj);
          return res;
        });
        values.order_item = JSON.stringify(arr);

        // console.log(values);
        if (this.props.puchaseorderid === 0) {
          erpPost('purchase-order/add', values, res => {
            if (val === 0) {
              message.success(res.data.mesg);
            } else {
              this.saveSubmit(res.data.requisition_id);
            }
            this.props.getList();
          });
        } else {
          values.purchase_order_id = this.props.detailval.purchase_order_id;
          values.supplier_id = this.props.detailval.supplier_id;
          // console.log(values);
          erpPost('purchase-order/edit', values, res => {
            if (val === 0) {
              message.success(res.data.mesg);
            } else {
              this.saveSubmit(this.props.puchaseorderid);
            }
          });
        }
      }
    });
  };
  // 产品列表
  prodList = key => {
    const can = {
      keyword: key,
    };
    erpPost('product/info/index', can, res => {
      this.setState({
        prodDataSource: res.data.data,
      });
    });
  };
  // 弹出表单
  seachSubmit = e => {
    e.preventDefault();
    this.props.form_1.validateFields(err => {
      if (!err) {
        // console.log('Received values of form: ', values);
      }
    });
  };
  // 弹出框
  showModal = () => {
    this.setState({
      visible: true,
    });
  };
  handleOk = () => {
    // console.log(e);
    this.setState({
      visible: false,
    });
  };
  handleCancel = () => {
    // console.log(e);
    this.setState({
      visible: false,
    });
  };
  // 弹框下拉
  handleChange = value => {
    console.log(`selected ${value}`);
  };
  purchSave = () => {
    // console.log(this.state.addDataSource, 'addDataSource');
    // console.log(this.state.addTable,'addTable')
  };
  // 保存并提交
  saveSubmit = id => {
    erpPost('purchase-order/commit', { purchase_order_id: id }, res => {
      message.success(res.data.mesg);
    });
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };
    // 新增采购单复选框
    const addRowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(selectedRows, 'selectedRows');
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name,
      }),
    };
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        // selectedRows.map((val)=>{
        //   console.log(val)
        //   this.state.addDataSource.push(val)
        //   return val
        // })
        this.setState({
          addDataSource: selectedRows,
        });
      },
    };
    // const pagination={
    //   pagination:false,
    // }
    // console.log(this.state.addDataSource);
    return (
      <div className="contentWrap">
        <h3>采购详情基本信息</h3>
        <div>
          <Form className="ant-advanced-search-form" onSubmit={this.handleSubmit.bind(this, 0)}>
            <FormItem {...formItemLayout} label="采购单号">
              {getFieldDecorator('purch_no', {
                rules: [
                  {
                    required: this.state.checkNick,
                    message: '请输入采购单号！',
                  },
                ],
              })(<Input disabled placeholder="请输入采购单号！" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="采购员">
              {getFieldDecorator('buyer', {
                rules: [
                  {
                    required: this.state.checkNick,
                    message: '请填写采购员！',
                  },
                ],
              })(<Input placeholder="请填写采购员！" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="供应商" hasFeedback>
              {getFieldDecorator('supplier_id', {
                rules: [{ required: true, message: '请选择供应商!' }],
              })(
                <Select placeholder="请选择供应商!">
                  <Option value={0}>l688供应商</Option>
                  <Option value={1}>其他供应商</Option>
                </Select>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="商品总数">
              {getFieldDecorator('total', {
                rules: [
                  {
                    required: this.state.checkNick,
                    message: '请输入商品总数！',
                  },
                ],
              })(<Input placeholder="请输入商品总数！" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="付款方式">
              {getFieldDecorator('pay_method')(
                <RadioGroup>
                  <Radio value="0">货到付款</Radio>
                  <Radio value="1">分期付款</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="总额">
              {getFieldDecorator('cost', {
                rules: [
                  {
                    required: this.state.checkNick,
                    message: '请填写总金额！',
                  },
                ],
              })(<Input disabled placeholder="请填写总金额！" />)}
            </FormItem>

            {/* <FormItem wrapperCol={{ span: 12, offset: 6 }}>
              
            </FormItem> */}
          </Form>
        </div>
        <h3>采购明细</h3>
        <div className="purchButton">
          <div style={{ marginBottom: 10 }}>
            <Button type="primary" onClick={this.showModal}>
              添加商品
            </Button>
            <Button type="primary">导入</Button>
            <Button type="primary">删除</Button>
          </div>
          <Table
            rowKey="porder_item_id"
            rowSelection={addRowSelection}
            dataSource={this.state.addDataSource}
            // pagination={pagination}
            columns={this.state.addColumns}
            // scroll={{y: 500 }}
          />
        </div>
        <div>
          <Button type="primary" onClick={this.purchSave}>
            另存为
          </Button>
          <Button
            style={{ margin: '0 10px' }}
            type="primary"
            onClick={this.handleSubmit.bind(this, 0)}
          >
            保存
          </Button>
          <Button
            type="primary"
            onClick={this.handleSubmit.bind(this, 1)}
            // console.log(this.props.form.getFieldsValue())
          >
            保存并提交
          </Button>
        </div>
        <div>
          <Modal
            title="添加商品"
            visible={this.state.visible}
            onOk={this.handleOk}
            maskClosable={false}
            onCancel={this.handleCancel}
          >
            <div className="seachSubmit">
              <div style={{ marginBottom: 20 }}>
                {/* <Select
                  showSearch
                  style={{ width: 200 }}
                  placeholder="Select a person"
                  optionFilterProp="children"
                  onChange={this.state.handleChange}
                  // onFocus={handleFocus}
                  // onBlur={handleBlur}
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  <Option value="jack">Jack</Option>
                  <Option value="lucy">Lucy</Option>
                  <Option value="tom">Tom</Option>
                </Select> */}
                <Search
                  placeholder="input search text"
                  // size="small"
                  style={{ width: 200, marginLeft: 10 }}
                  onSearch={value => console.log(value)}
                  enterButton
                />
              </div>
              <div>
                <Table
                  scroll={{ y: 240 }}
                  dataSource={this.state.prodDataSource}
                  columns={this.state.prodColumns}
                  rowSelection={rowSelection}
                />
              </div>
            </div>
          </Modal>
        </div>
      </div>
    );
  }
}
export default NewPurchaseOrder;
