import React from 'react';
import { Form, Row, Col, Input, Button, Select, Table, Popconfirm, message } from 'antd';
import EditableItem from '../../components/EditableItem';
import { erpPost } from '../../services/ajax';

require('../FormAndList.less');

const FormItem = Form.Item;
const { Option } = Select;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 6 },
};
function handleChange(value) {
  console.log(`selected ${value}`);
}
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
class NewEXWarehouse extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      wareList: [],
      dataSource: [],
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
          render: (text, record) => (
            <EditableItem
              value={text}
              onChange={this.onCellChange.bind(this, record.key, 'prod_name')}
            />
          ),
        },
        {
          title: '预出库存',
          dataIndex: 'predictEXRepertory',
        },
        {
          title: '预出良品数',
          dataIndex: 'predictEXGoodProducts',
        },
        {
          title: '预出不良品数',
          dataIndex: 'predictEXRejects',
        },
        {
          title: '良品出库数',
          dataIndex: 'good_quantity',
          render: (text, record) => (
            <EditableItem
              value={text}
              onChange={this.onCellChange.bind(this, record.key, 'good_quantity')}
            />
          ),
        },
        {
          title: '不良品出库数',
          dataIndex: 'bad_quantity',
          render: (text, record) => (
            <EditableItem
              value={text}
              onChange={this.onCellChange.bind(this, record.key, 'bad_quantity')}
            />
          ),
        },
        {
          title: '类型',
          dataIndex: 'type',
        },
        {
          title: '操作',
          dataIndex: 'operation',
          render: () => {
            return this.state.dataSource.length > 1 ? (
              <Popconfirm title="是否出库?">
                <span>出库</span>
              </Popconfirm>
            ) : null;
          },
        },
      ],
      //   count: 2,
    };
  }
  componentWillMount() {
    //  this.getWarehouseList();
    //  this.getDetail();
  }
  componentDidMount() {
    if (this.props.type === 'detail') {
      this.getWarehouseList();
      this.getDetail();
    } else {
      this.NewEXWarehouse();
    }
  }
  componentWillUnmount() {}
  // 表格编辑
  onCellChange = (key, dataIndex, data) => {
    const dataSource = [...this.state.dataSource];
    const target = dataSource.find(item => {
      return item.key === key;
    });
    if (target) {
      target[dataIndex] = data;
      this.setState({ dataSource });
    }
  };
  onCellChange = (key, dataIndex) => {
    return value => {
      const dataSource = [...this.state.dataSource];
      const target = dataSource.find(item => item.key === key);
      if (target) {
        target[dataIndex] = value;
        this.setState({ dataSource });
      }
    };
  };

  onDelete = key => {
    const dataSource = [...this.state.dataSource];
    this.setState({ dataSource: dataSource.filter(item => item.key !== key) });
  };
  // 获取详情 调拨出库 0
  getDetail = () => {
    erpPost('outbound/view', { outbound_id: this.props.outboundId }, res => {
      const detailData = res.data.data;
      // console.log(detailData)
      // 不能为空，暂时做处理
      if (detailData.dely_type === null) {
        detailData.dely_type = 0;
      }
      const formData = {
        wh_id: detailData.wh_id,
        wh_name: detailData.wh_name,
        dely_type: detailData.dely_type,
        // time: detailData.time,创建时间
        outbound_no: detailData.outbound_no,
        remark: detailData.remark,
      };
      this.props.form.setFieldsValue(formData);
      this.setState({
        dataSource: detailData.order_item,
      });
    });
  };
  // 获取仓库
  getWarehouseList = () => {
    erpPost('warehouse/index', {}, res => {
      this.setState({
        wareList: res.data.data,
      });
    });
  };
  NewEXWarehouse = () => {};
  // 保存
  handleSearch = (val, e) => {
    console.log(e, 'e');
    console.log(val, 'val');
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (this.props.outbound_id === 0) {
          console.log('新建');
        } else {
          values.outbound_id = this.props.detailInfo.outbound_id;
          console.log(this.props.detailInfo);
          console.log(values);
          erpPost('outbound/edit', values, res => {
            if (val === 0) {
              message.success(res.data.mesg);
            } else {
              this.saveSubmit(this.props.detailInfo.outbound_id);
              this.saveSubmit(this.props.whId);
            }
          });
        }
      }
    });
  };
  // 保存并提交
  saveSubmit = id => {
    erpPost('outbound/commit', { outbound_id: id }, res => {
      message.success(res.data.mesg);
    });
  };
  render() {
    const { dataSource, columns } = this.state;
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="contentWrap">
        <Form className="ant-advanced-search-form" onSubmit={this.handleSearch.bind(this, 0)}>
          <Row gutter={24}>
            <Col span={6}>
              <FormItem {...formItemLayout} label={<span>选择仓库</span>}>
                {getFieldDecorator('wh_id', {
                  rules: [{ required: false, message: '选择仓库!' }],
                })(
                  <Select
                    // defaultValue="whA"
                    onChange={handleChange}
                    style={{ width: '250px', heigth: '26px' }}
                  >
                    {this.state.wareList.map(res => {
                      return (
                        <Option key={res.wh_id} value={res.wh_id}>
                          {res.wh_name}
                        </Option>
                      );
                    })}
                  </Select>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label={<span>出库类型</span>}>
                {getFieldDecorator('putInstyle', {
                  rules: [{ required: false, message: '出库类型!' }],
                })(
                  <Select
                    initialValue="0"
                    onChange={handleChange}
                    style={{ width: '250px', heigth: '26px' }}
                  >
                    <Option value="0">调拨出库</Option>
                    {/* <Option value="1">1</Option>
                    <Option value="2">2</Option> */}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} label={<span>创建时间</span>}>
                {getFieldDecorator('time', {
                  rules: [{ required: false, message: '创建时间!', whitespace: true }],
                })(
                  // <Input placeholder="placeholder" style={{ width: '250px', heigth: '26px' }} />
                  <span>2018-03-08</span>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label={<span>采购退货单号</span>}>
                {getFieldDecorator('outbound_no', {
                  rules: [{ required: false, message: '采购退货单号!', whitespace: true }],
                })(<Input style={{ width: '250px', heigth: '26px' }} disabled />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem {...formItemLayout} label={<span>备注</span>}>
                {getFieldDecorator('remark', {
                  rules: [{ required: false, message: '备注!', whitespace: true }],
                })(
                  // <Input placeholder="placeholder" style={{ width: '250px', heigth: '26px' }} />
                  <textarea placeholder="placeholder" className="remarks" />
                )}
              </FormItem>
            </Col>
          </Row>
          <div style={{ paddingLeft: '20px', marginBottom: '20px' }}>
            <Select
              initialValue="lucy"
              style={{ width: '120px', marginRight: '15px' }}
              onChange={handleChange}
            >
              <Option value="jack">入库通知单</Option>
              <Option value="lucy">111</Option>
              <Option value="disabled">2222</Option>
              <Option value="Yiminghe">3333</Option>
            </Select>
            <Input placeholder="default size" style={{ width: '200px', marginRight: '15px' }} />
            <Button type="primary" style={{ marginRight: '15px' }}>
              搜索
            </Button>
          </div>
          <div style={{ paddingLeft: '20px', margin: '10px' }}>
            <Button type="primary" style={{ marginRight: '15px' }}>
              导出
            </Button>
            <Button type="primary">导入</Button>
          </div>
          <div>
            <Table rowSelection={rowSelection} dataSource={dataSource} columns={columns} />
          </div>
          <FormItem wrapperCol={{ span: 12, offset: 6 }} style={{ marginTop: '40px' }}>
            <Button
              type="primary"
              style={{ marginRight: '15px' }}
              onClick={this.handleSearch.bind(this, 1)}
            >
              出库
            </Button>
            <Button type="primary" htmlType="submit" style={{ marginRight: '15px' }}>
              保存
            </Button>
            <Button type="primary">关闭</Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}
export default NewEXWarehouse;
