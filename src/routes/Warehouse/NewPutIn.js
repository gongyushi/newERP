import React from 'react';
import { Form, Input, Button, Select, Table } from 'antd';
import { erpPost } from '../../services/ajax';
import EditableItem from '../../components/EditableItem';

require('../FormAndList.less');

const FormItem = Form.Item;
const { Option } = Select;

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
// function handleChange(value) {
//   console.log(`selected ${value}`);
// }
const rowSelection = {
  onChange: (selectedRowKeys, selectedRows) => {
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  },
  getCheckboxProps: record => ({
    disabled: record.name === 'Disabled User', // Column configuration not to be checked
    name: record.name,
  }),
};

@Form.create()
class NewPutIn extends React.Component {
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
          title: '图片',
          dataIndex: 'image_urls',
        },
        {
          title: 'SKU',
          dataIndex: 'sku',
        },
        {
          title: '商品',
          dataIndex: 'prod_name',
        },
        {
          title: '预入库存',
          dataIndex: 'predictRepertory',
        },
        {
          title: '预入良品数',
          dataIndex: 'predictGoodProducts',
        },
        {
          title: '预入不良品数',
          dataIndex: 'predictRejects',
        },
        {
          title: '良品入库数',
          dataIndex: 'insto_good_num',
          render: (text, record) => (
            // console.log(record)
            <EditableItem
              value={text}
              onChange={this.onCellChange.bind(this, record.inbound_item_id, 'insto_good_num')}
            />
          ),
        },
        {
          title: '不良品入库数',
          dataIndex: 'insto_bad_num',
          render: (text, record) => (
            <EditableItem
              value={text}
              onChange={this.onCellChange.bind(this, record.inbound_item_id, 'insto_bad_num')}
            />
          ),
        },
        {
          title: '操作',
          dataIndex: 'operation',
          render: (text, val) => {
            return (
              <span
                onClick={() => {
                  console.log(val);
                }}
              >
                入库
              </span>
            );
          },
        },
      ],
    };
  }
  // componentWillMount() {
  //   if (this.props.inboundid === 0) {
  //     console.log(this.props.inboundid);
  //   } else {
  //     this.getstorage();
  //   }
  // }
  componentWillMount() {
    if (this.props.inboundid === 0) {
      console.log(this.props.inboundid);
    } else {
      this.getstorage(this.state.page, this.state.orders);
    }
  }
  onCellChange = (key, dataIndex, data) => {
    const dataSource = [...this.state.dataSource];
    const target = dataSource.find(item => {
      return item.inbound_item_id === key;
    });
    if (target) {
      target[dataIndex] = data;
      this.setState({ dataSource });
    }
  };
  onDelete = key => {
    const dataSource = [...this.state.dataSource];
    this.setState({ dataSource: dataSource.filter(item => item.key !== key) });
  };
  // 控制行
  onCellChange = (key, dataIndex, data) => {
    const dataSource = [...this.state.dataSource];
    const target = dataSource.find(item => {
      return item.inbound_item_id === key;
    });
    if (target) {
      target[dataIndex] = data;
      this.setState({ dataSource });
    }
  };
  // 获取页面详情
  getstorage = (pageNumber, orders) => {
    const can = {
      page: pageNumber,
      order: orders,
    };
    erpPost('inbound/view', { inbound_id: this.props.inboundid }, can, res => {
      const obj = res.data.data;
      const newPuthForm = {
        inbound_no: obj.inbound_no,
        wh_id: obj.wh_id,
        created_at: obj.created_at,
        associated_no: obj.associated_no,
        storage_type: obj.storage_type,
      };
      this.props.form.setFieldsValue(newPuthForm);
      this.setState({
        dataSource: obj.order_item,
        orders: res.data.order,
        page: res.data.page,
      });
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log(this.state.dataSource);
        const source = this.state.dataSource;
        source.map(res => {
          if (values.insto_good_num) {
            values.insto_good_num += Number(res.insto_good_num);
            values.insto_bad_num += Number(res.insto_bad_num);
          } else {
            values.insto_good_num = Number(res.insto_good_num);
            values.insto_bad_num = Number(res.insto_bad_num);
          }

          return values;
        });
        const obj = {
          inbound_no: values.inbound_no,
          wh_id: values.wh_id,
          storage_type: values.storage_type,
          insto_good_num: values.insto_good_num,
          insto_bad_num: values.insto_bad_num,
          remark: values.remark,
          attribute: JSON.stringify(this.state.dataSource),
          inbound_id: this.props.inboundid,
        };
        erpPost('inbound/edit', obj, () => {
          this.props.onedit();
        });
        console.log('Received values of form: ', values);
      }
    });
  };

  render() {
    const { dataSource, columns, page } = this.state;
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="contentWrap">
        <Form onSubmit={this.handleSubmit}>
          <div className="ant-advanced-search-form">
            <FormItem className="newPuthForm" {...formItemLayout} label="入库单号">
              {getFieldDecorator('inbound_no', {
                rules: [
                  {
                    message: '请输入入库单号！',
                  },
                ],
              })(
                <Input
                  className="disabledInput"
                  disabled
                  style={{ width: 200 }}
                  placeholder="请输入入库单号！"
                />
              )}
            </FormItem>
            <FormItem className="newPuthForm" {...formItemLayout} label="入库仓库" hasFeedback>
              {getFieldDecorator('wh_id', {
                rules: [{ required: true, message: 'Please select your country!' }],
              })(
                <Select style={{ width: 200 }} placeholder="Please select a country">
                  <Option value={0}>China</Option>
                  <Option value={1}>U.S.A</Option>
                </Select>
              )}
            </FormItem>
            <FormItem className="newPuthForm" {...formItemLayout} label="创建时间">
              {getFieldDecorator('created_at', {
                rules: [
                  {
                    message: '请输入创建时间！',
                  },
                ],
              })(
                <Input
                  className="disabledInput"
                  disabled
                  style={{ width: 200 }}
                  placeholder="请输入创建时间！"
                />
              )}
            </FormItem>
            <FormItem className="newPuthForm" {...formItemLayout} label="关联单号">
              {getFieldDecorator('associated_no', {
                rules: [
                  {
                    message: '请输入关联单号！',
                  },
                ],
              })(
                <Input
                  className="disabledInput"
                  disabled
                  style={{ width: 200 }}
                  placeholder="请输入关联单号！"
                />
              )}
            </FormItem>
            <FormItem className="newPuthForm" {...formItemLayout} label="入库类型" hasFeedback>
              {getFieldDecorator('storage_type', {
                rules: [{ required: true, message: '请选择入库类型！' }],
              })(
                <Select style={{ width: 200 }} placeholder="请选择入库类型！">
                  <Option value={0}>China</Option>
                  <Option value={1}>U.S.A</Option>
                </Select>
              )}
            </FormItem>
          </div>
          <div>
            <div style={{ margin: '10px 0' }}>
              <Button type="primary" style={{ marginRight: '10px' }}>
                导出
              </Button>
              <Button type="primary">导入</Button>
            </div>
            <Table
              rowKey="inbound_item_id"
              rowSelection={rowSelection}
              dataSource={dataSource}
              columns={columns}
              onChange={this.onTableChange}
              pagination={page}
            />
          </div>
          <FormItem>
            <Button type="primary" htmlType="submit" style={{ marginRight: '10px' }}>
              入库
            </Button>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}
export default NewPutIn;
