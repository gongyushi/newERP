import React from 'react';
import { Form, Select, Button, Input, Table } from 'antd';
import {
  // erpPost,
} from '../../services/ajax';

const FormItem = Form.Item;
const { Option } = Select;

require('../ListStyle.less');

class Demo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
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
          title: '订单号',
          dataIndex: 'orderNum',
          key: 'orderNum',
        },
        {
          title: '图片',
          dataIndex: 'img',
          key: 'img',
        },
        {
          title: '产品信息',
          dataIndex: 'proInfo',
          key: 'proInfo',
        },
        {
          title: 'sku',
          dataIndex: 'sku',
          key: 'sku',
        },
        {
          title: '价格($)',
          dataIndex: 'price',
          key: 'price',
        },
        {
          title: '数量',
          dataIndex: 'num',
          key: 'num',
        },
        {
          title: '仓库',
          dataIndex: 'warehouse',
          key: 'warehouse',
        },
      ],
    };
  }
  componentWillMount() {
    this.getOrderDetail(); // 获取详情
    this.getOrderDetail(this.state.page, this.state.orders);
  }
  // 页码
  onTableChange = (pageNumber, filters, sorte) => {
    const order = [];
    order.push({ field: sorte.field, order: sorte.order });
    this.userManageList(pageNumber, order);
  };
  // 获取详情
  getOrderDetail = (pageNumber, orders) => {
    console.log(orders)
    // const id = this.props.orderitemid;
    // const can = {
    //   page: pageNumber,
    //   order: orders,
    // };

    // erpTaoBao('order/item/view', { order_item_id: id }, can, res => {
    //   const detailData = res.data.data;
    //   this.setState({
    //     dataSource: res.data.data,
    //     orders: res.data.order,
    //     page: res.data.page,
    //   });
    //   const obj = {
    //     total: detailData.total,
    //     sto_name: detailData.sto_name,
    //     buyer_name: detailData.buyer_name,
    //     address: detailData.address,
    //     city: detailData.city,
    //     state_or_province: detailData.state_or_province,
    //     buyer_country: detailData.buyer_country,
    //     postal_code: detailData.postal_code,
    //     wh_id: detailData.warehouse.wh_id,
    //   };
    //   this.props.form.setFieldsValue(obj);
    // });
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };
    const { dataSource, 
      columns, 
      // page 
    } = this.state;
    return (
      <div className="proDataWrap orderDetail">
        <Form onSubmit={this.handleSubmit}>
          <h3 className="moduleTitle">订单信息</h3>
          <div className="ant-advanced-search-form">
            <FormItem {...formItemLayout} label="店铺">
              {getFieldDecorator('sto_name', {
                rules: [
                  {
                    message: '请输入店铺名称！',
                  },
                ],
              })(
                <Input
                  className="disabledInput"
                  style={{ width: 200 }}
                  placeholder="请输入店铺名称！"
                />
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="买家ID">
              {getFieldDecorator('buyer_name', {
                rules: [
                  {
                    message: '请输入买家ID！',
                  },
                ],
              })(
                <Input
                  className="disabledInput"
                  style={{ width: 200 }}
                  placeholder="请输入买家ID！"
                />
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="订单金额">
              {getFieldDecorator('total', {
                rules: [
                  {
                    message: '请输入订单金额！',
                  },
                ],
              })(
                <Input
                  className="disabledInput"
                  style={{ width: 200 }}
                  placeholder="请输入订单金额！"
                />
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="买家邮箱">
              {getFieldDecorator('nickname', {
                rules: [{ message: '请输入买家邮箱!', whitespace: true }],
              })(<Input style={{ width: 200 }} />)}
            </FormItem>
            <FormItem {...formItemLayout} label="发货仓库" hasFeedback>
              {getFieldDecorator('wh_id', {
                rules: [{ message: '请选择发货仓库!' }],
              })(
                <Select
                  style={{ width: 200 }}
                  placeholder="请选择发货仓库!"
                  showSearch
                  optionFilterProp='children'
                >
                  <Option value="0">China</Option>
                  <Option value="1">U.S.A</Option>
                </Select>
              )}
            </FormItem>
          </div>
          <Table
            dataSource={dataSource}
            columns={columns}
            pagination={false}
            style={{ width: '1220px', margin: '0 auto' }}
            onChange={this.onTableChange}
            // pagination={page}
          />
          <h3 className="moduleTitle">收货信息</h3>
          <div className="ant-advanced-search-form">
            <FormItem {...formItemLayout} label="收件人">
              {getFieldDecorator('buyer_name', {
                rules: [{ message: '请填写收件人姓名！', whitespace: true }],
              })(<Input className="disabledInput" style={{ width: 200 }} />)}
            </FormItem>
            <FormItem {...formItemLayout} label="地址">
              {getFieldDecorator('address', {
                rules: [{ message: '请填写地址!', whitespace: true }],
              })(<Input className="disabledInput" style={{ width: 200 }} />)}
            </FormItem>
            <FormItem {...formItemLayout} label="城市">
              {getFieldDecorator('city', {
                rules: [{ message: '请填写所属城市!', whitespace: true }],
              })(<Input className="disabledInput" style={{ width: 200 }} />)}
            </FormItem>
            <FormItem {...formItemLayout} label="省/州">
              {getFieldDecorator('state_or_province', {
                rules: [{ message: '请填写所属省/州!', whitespace: true }],
              })(<Input className="disabledInput" style={{ width: 200 }} />)}
            </FormItem>
            <FormItem {...formItemLayout} label="国家">
              {getFieldDecorator('buyer_country', {
                rules: [{ message: '请填写所属国家!', whitespace: true }],
              })(<Input className="disabledInput" style={{ width: 200 }} />)}
            </FormItem>
            <FormItem {...formItemLayout} label="邮编">
              {getFieldDecorator('postal_code', {
                rules: [{ message: '请填写邮编!', whitespace: true }],
              })(<Input className="disabledInput" style={{ width: 200 }} />)}
            </FormItem>
            <FormItem {...formItemLayout} label="电话">
              {getFieldDecorator('tel', {
                rules: [{ message: '请输入电话!', whitespace: true }],
              })(<Input className="disabledInput" style={{ width: 200 }} />)}
            </FormItem>
            <FormItem {...formItemLayout} label="手机">
              {getFieldDecorator('phone', {
                rules: [{ message: '请输入手机号!', whitespace: true }],
              })(<Input className="disabledInput" style={{ width: 200 }} />)}
            </FormItem>
          </div>
          <h3 className="moduleTitle">物流信息</h3>
          <div className="ant-advanced-search-form">
            <FormItem {...formItemLayout} label="买家指定邮寄方式">
              {getFieldDecorator('nickname0', {
                rules: [{ message: '请填写邮寄方式!', whitespace: true }],
              })(<Input className="disabledInput" style={{ width: 200 }} />)}
            </FormItem>
            <FormItem {...formItemLayout} label="物流方式" hasFeedback>
              {getFieldDecorator('select', {
                rules: [{ message: '请选择物流方式!' }],
              })(
                <Select
                  style={{ width: 200 }}
                  placeholder="请选择物流方式!"
                  showSearch
                  optionFilterProp='children'
                >
                  <Option value="china">China</Option>
                  <Option value="use">U.S.A</Option>
                </Select>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="运单号">
              {getFieldDecorator('nickname2', {
                rules: [{ message: '请输入运单号!', whitespace: true }],
              })(<Input className="disabledInput" style={{ width: 200 }} />)}
            </FormItem>
          </div>

          <h3 className="moduleTitle">报关信息</h3>
          <div className="ant-advanced-search-form">
            <FormItem {...formItemLayout} label="中文名称">
              {getFieldDecorator('nickname', {
                rules: [{ message: '请输入中文名称!', whitespace: true }],
              })(<Input style={{ width: 200 }} />)}
            </FormItem>
            <FormItem {...formItemLayout} label="英文名称">
              {getFieldDecorator('nickname', {
                rules: [{ message: '请输入英文名称!', whitespace: true }],
              })(<Input style={{ width: 200 }} />)}
            </FormItem>
            <FormItem {...formItemLayout} label="申报重量">
              {getFieldDecorator('nickname', {
                rules: [{ message: '请输入申报重量!', whitespace: true }],
              })(<Input style={{ width: 200 }} />)}
            </FormItem>
            <FormItem {...formItemLayout} label="申报金额">
              {getFieldDecorator('nickname', {
                rules: [{ message: '请输入申报金额!', whitespace: true }],
              })(<Input style={{ width: 200 }} />)}
            </FormItem>
            <FormItem {...formItemLayout} label="报关编码">
              {getFieldDecorator('nickname', {
                rules: [{ message: '请输入报关编码!', whitespace: true }],
              })(<Input style={{ width: 200 }} />)}
            </FormItem>
          </div>
          <div style={{ float: 'right', height: 50, marginRight: 100 }}>
            <FormItem {...formItemLayout}>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
            </FormItem>
          </div>
        </Form>
      </div>
    );
  }
}

const OrderDetail = Form.create()(Demo);

export default OrderDetail;
