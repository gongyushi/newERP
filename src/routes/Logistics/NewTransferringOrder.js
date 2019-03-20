import React from 'react';
import { Form, Input, Button, Select, Table, Popconfirm, message, Modal } from 'antd';
import SearchBar from '../../components/SearchBar';
import EditableItem from '../../components/EditableItem';
import { erpPost } from '../../services/ajax';

require('../FormAndList.less');

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;

// function handleChange(value) {
//   console.log(`selected ${value}`);
// }

@Form.create()
class NewTransferringOrder extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      dataSource: [],
      page: {
        pageSize: 10,
        total: 0,
        curren: 1,
        showSizeChanger: true,
      },
      columns: [
        {
          title: '图片',
          dataIndex: 'image_urls',
        },
        {
          title: '采购单号',
          dataIndex: 'order',
        },
        {
          title: 'SKU',
          dataIndex: 'sku',
        },
        {
          title: '款号',
          dataIndex: 'num',
        },
        {
          title: '颜色/规格',
          dataIndex: 'color',
        },
        {
          title: '商品名称',
          dataIndex: 'prod_name',
        },
        {
          title: '可用库存',
          dataIndex: 'availablestock',
        },
        {
          title: '良品可用数',
          dataIndex: 'goodproducts',
        },
        {
          title: '不良品可用数',
          dataIndex: 'badproducts',
        },
        {
          title: '价格(￥)',
          dataIndex: 'price',
        },
        {
          title: '良品调拨数',
          dataIndex: 'good_quantity',
          render: (text, record) => (
            <EditableItem
              value={text}
              onChange={this.onCellChange.bind(this, record.key, 'good_quantity')}
            />
          ),
        },
        {
          title: '不良品调拨数',
          dataIndex: 'bad_quantity',
          render: (text, record) => (
            <EditableItem
              value={text}
              onChange={this.onCellChange.bind(this, record.key, 'bad_quantity')}
            />
          ),
        },
        {
          title: '操作',
          dataIndex: 'operation',
          render: (text, record) => {
            return this.state.dataSource.length > 1 ? (
              <Popconfirm title="确认删除?" onConfirm={() => this.onDelete(record.key)}>
                <span>删除</span>
              </Popconfirm>
            ) : null;
          },
        },
      ],
      addProDataSource: [
        {
          key: '1',
          img: '1',
          sku: 'BH32-4',
          proName: 'sony',
          replenishmentNum: '200件',
          price: '25.00',
          good: '500件',
          bad: '500件',
          operation: '取消选择',
        },
        {
          key: '2',
          img: '1',
          sku: 'BH32-49',
          proName: 'sony',
          replenishmentNum: '200件',
          price: '25.00',
          good: '500件',
          bad: '500件',
          operation: '选择',
        },
      ],
      addProColumns: [
        {
          title: '图片',
          dataIndex: 'img',
          key: 'img',
        },
        {
          title: 'SKU',
          dataIndex: 'sku',
          key: 'sku',
        },
        {
          title: '商品名称',
          dataIndex: 'proName',
          key: 'proName',
        },
        {
          title: '可用库存',
          dataIndex: 'replenishmentNum',
          key: 'replenishmentNum',
        },
        {
          title: '单价(￥)',
          dataIndex: 'price',
          key: 'price',
        },
        {
          title: '良品调拨',
          dataIndex: 'good',
          key: 'good',
          render: text => {
            return (
              <div>
                <Input defaultValue={text} style={{ width: '60px' }} />
              </div>
            );
          },
        },
        {
          title: '不良品调拨',
          dataIndex: 'bad',
          key: 'bad',
          render: text => {
            return (
              <div>
                <Input defaultValue={text} style={{ width: '60px' }} />
              </div>
            );
          },
        },
        {
          title: '操作',
          dataIndex: 'operation',
          key: 'operation',
          render: text => {
            return (
              <div>
                <span style={{ color: '#518DED' }}>{text}</span>
              </div>
            );
          },
        },
      ],
      visible: false,
      //   count: 2,
    };
  }
  componentWillMount() {
    if (this.props.requisitionid === 0) {
      // 获取单号
      this.getOrder();
    } else {
      // 获取详情页
      // this.getDetail(this.data.page,this.data.orders);
    }
  }

  // 改变表格中的值
  onCellChange = (key, dataIndex, data) => {
    // console.log(key,'key')
    // console.log(data,'data')
    // console.log(dataIndex,'dataIndex')
    // return (value) => {
    // console.log(value)
    const dataSource = [...this.state.dataSource];
    const target = dataSource.find(item => {
      return item.key === key;
    });
    if (target) {
      target[dataIndex] = data;
      // console.log(addDataSource)
      this.setState({ dataSource });
    }
    console.log(this.state.dataSource);
    // };
  };
  onDelete = key => {
    const dataSource = [...this.state.dataSource];
    this.setState({ dataSource: dataSource.filter(item => item.key !== key) });
  };
  onTableChange = (pageNumber, filters, sorte) => {
    const order = [];
    order.push({ field: sorte.field, order: sorte.order });
    this.getDetail(pageNumber, order);
  };
  // 获取详情页
  getDetail = (pageNumber, orders) => {
    const can = {
      page: pageNumber,
      order: orders,
    };
    erpPost('requisition/view', { requisition_id: this.props.requisitionid }, can, res => {
      const detailData = res.data.data;
      const obj = {
        req_no: detailData.req_no,
        delivery_wh_id: detailData.delivery_wh_id,
        receipt_wh_id: detailData.receipt_wh_id,
        good_quantity: detailData.good_quantity,
        bad_quantity: detailData.bad_quantity,
        fare: detailData.fare,
        remark: detailData.remark,
      };
      this.props.form.setFieldsValue(obj);
      detailData.order_item.map((val, index) => {
        val.key = index;
        return val;
      });
      this.setState({
        dataSource: detailData.order_item,
        // orders: res.data.order,
        page: res.data.page,
      });
    });
  };
  // 获取单号
  getOrder = () => {
    erpPost('purchase-order/no', {}, res => {
      this.props.form.setFieldsValue({ req_no: res.data.data });
    });
  };
  // 添加商品
  showAddPro = () => {
    this.setState({
      visible: true,
    });
  };
  // 弹框提交
  handleOk = () => {
    setTimeout(() => {
      this.setState({ visible: false });
    }, 3000);
  };
  // 弹框关闭
  handleCancel = () => {
    this.setState({ visible: false });
  };
  // 保存
  handleSubmit = (val, e) => {
    console.log(e, 'e');
    console.log(val, 'val');
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const addTable = [];
        this.state.dataSource.map(res => {
          const obj = {};
          obj.product_id = res.product_id;
          obj.good_quantity = res.good_quantity;
          obj.bad_quantity = res.bad_quantity;
          addTable.push(obj);
          return res;
        });
        values.attribute = JSON.stringify(addTable);
        console.log(values.attribute);
        if (this.props.requisitionid === 0) {
          erpPost('requisition/add', values, res => {
            if (val === 0) {
              message.success(res.data.mesg);
            } else {
              this.saveSubmit(res.data.requisition_id);
            }
          });
        } else {
          values.requisition_id = this.props.requisitionid;
          erpPost('requisition/edit', values, res => {
            if (val === 0) {
              message.success(res.data.mesg);
            } else {
              this.saveSubmit(this.props.requisitionid);
            }
          });
        }
      }
    });
  };
  // 保存并提交
  saveSubmit = id => {
    erpPost('requisition/commit', { requisition_id: id }, res => {
      message.success(res.data.mesg);
    });
  };
  render() {
    const { dataSource, columns, addProDataSource, addProColumns, page } = this.state;
    const { visible } = this.state;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name,
      }),
    };
    return (
      <div className="contentWrap">
        <Form className="ant-advanced-search-form" onSubmit={this.handleSubmit.bind(this, 0)}>
          <FormItem {...formItemLayout} label="调拨单号">
            {getFieldDecorator('req_no', {
              rules: [
                {
                  required: true,
                  message: '请输入调拨单号！',
                },
              ],
            })(<Input disabled placeholder="请输入调拨单号！" />)}
          </FormItem>
          <FormItem {...formItemLayout} label="运费">
            {getFieldDecorator('fare', {
              rules: [
                {
                  required: true,
                  message: '请输入运费！',
                },
              ],
            })(<Input placeholder="请输入运费！" />)}
          </FormItem>
          <FormItem {...formItemLayout} label="发货仓库" hasFeedback>
            {getFieldDecorator('delivery_wh_id', {
              rules: [{ required: true, message: '请选择发货仓库!' }],
            })(
              <Select 
                placeholder="请选择发货仓库!"
                showSearch
                optionFilterProp='children'
              >
                <Option value={0}>China</Option>
                <Option value={1}>U.S.A</Option>
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="收货仓库" hasFeedback>
            {getFieldDecorator('receipt_wh_id', {
              rules: [{ required: true, message: '请选择收货仓库!' }],
            })(
              <Select 
                placeholder="请选择收货仓库!"
                showSearch
                optionFilterProp='children'
              >
                <Option value={0}>China</Option>
                <Option value={1}>U.S.A</Option>
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="备注">
            {getFieldDecorator('remark', {
              rules: [
                {
                  required: true,
                  message: '请填写备注！',
                },
              ],
            })(<TextArea placeholder="请填写备注！" />)}
          </FormItem>
        </Form>
        <div>
          <div className="newAlloButton">
            <Button type="primary" onClick={this.showAddPro}>
              添加商品
            </Button>
            {/* 添加商品弹框 */}
            <Modal
              visible={visible}
              title="添加商品"
              onOk={this.handleOk}
              onCancel={this.handleCancel}
              className="addProduct"
              maskClosable={false}
              footer={[
                <Button key="submit" type="primary">
                  批量选择
                </Button>,
                <Button key="back" onClick={this.handleCancel}>
                  关闭
                </Button>,
              ]}
            >
              <SearchBar />
              <Table
                dataSource={addProDataSource}
                columns={addProColumns}
                onChange={this.onTableChange}
                pagination={page}
                rowSelection={rowSelection}
                pagination={true}
                style={{ marginBottom: '50px' }}
              />
            </Modal>
            <Button type="primary">导出</Button>
            <Button type="primary">删除</Button>
          </div>
          <Table rowSelection={rowSelection} dataSource={dataSource} columns={columns} />
        </div>
        <div>
          <Button
            type="primary"
            style={{ marginRight: 10 }}
            onClick={this.handleSubmit.bind(this, 0)}
            htmlType="submit"
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
      </div>
    );
  }
}
export default NewTransferringOrder;
