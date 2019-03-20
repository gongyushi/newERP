import React from 'react';
import {
  Modal,
  Button,
  Table,
  Icon,
  Input,
  DatePicker,
  Form,
  Row,
  Col,
  Card,
  Select,
} from 'antd';
import moment, { max } from 'moment';
import EditableItem from './../../../components/EditableItem';
import PurBatchDetail from './PurBatchDetail';
import { erpPost } from '../../../services/ajax';
import ProductCell from '../../../components/ProductCell';
import Prompt from '../../../components/Prompt';

const FormItem = Form.Item;
const { Option } = Select;

class PurchaseBatch extends React.Component {
  state = {
    batColumns: [],
    proBatColumns: [],
    proBatEditColumns: [],
    batList: [],
    proBatList: [],
    title: [],
    visible: false,
    loading: false,
    id: this.props.purchase_id,
    batch_id: '', // 批次ID
    purchase_items: [], // 本批次生产数量列表
    purStatus: this.props.status, // 采购单状态 3时显示新增批次
    personList: [], // 人员列表
  };
  componentDidMount() {
    this.initColumns();
    this.getList();
    this.getPersonList();
  }
  componentWillReceiveProps(next){
    this.setState({
      purStatus: next.status,
    });
  }
  // 获取批次列表
  getList = () => {
    const { id } = this.state;
    erpPost('purchase-batch/index', { purchase_id: id }, res => {
      this.setState({
        batList: res.data.data,
      });
    })
  }
  // 获取批次产品列表
  getProBatList = (bat_id, plan_finish_at, batch_no) => {
    const { id } = this.state;
    if (bat_id === 0) {
      erpPost('purchase/product/index', { id }, res => {
        this.setState({
          proBatList: res.data.data.map(val => this.handleData({ ...val })),
          purchase_items: new Array(res.data.data.length),
        });
      });
    } else {
      this.setState({
        batch_id: bat_id,
      });
      if (plan_finish_at) {
        plan_finish_at = moment(plan_finish_at, 'YYYY-MM-DD');
      }
      this.props.form.setFieldsValue({ plan_finish_at, batch_no });
      erpPost('purchase-batch/item/index', { purchase_id: id, id: bat_id }, res => {
        this.setState({
          proBatList: res.data.data,
          purchase_items: new Array(res.data.data.length),
        });
      });
    }
  }
  getPersonList = () => {
    erpPost('organization/person/index', {}, res => {
      this.setState({
        personList: res.data.data,
      });
    });
  }
  // 处理数据
  handleData = ({ plan_quantity, batch_unpruduct_count, production_count,
    pruducted_uninbound_count, inbounded_count, ...data }) => {
    plan_quantity = plan_quantity || 0;
    batch_unpruduct_count = batch_unpruduct_count || 0;
    production_count = production_count || 0;
    pruducted_uninbound_count = pruducted_uninbound_count || 0;
    inbounded_count = inbounded_count || 0;
    let batch_plan_quantity = plan_quantity - batch_unpruduct_count - production_count
      - pruducted_uninbound_count - inbounded_count;
    batch_plan_quantity = batch_plan_quantity >= 0 ? batch_plan_quantity : 0;
    return ({
      plan_quantity, batch_unpruduct_count, production_count, batch_plan_quantity,
      pruducted_uninbound_count, inbounded_count, ...data,
    });
  }
  initColumns = () => {
    const status = {
      0: '草稿',
      1: '工厂确认',
      2: '备料完成',
      3: '生产完成',
      4: '质检完成',
      5: '部分发货',
      6: '全部发货',
      7: '已完成',
    };
    const batColumns = [
      {
        title: '批次编号',
        dataIndex: 'batch_no',
        key: 'batch_no',
        width: 200,
      },
      {
        title: '总价（USD）',
        dataIndex: 'amount',
        key: 'amount',
        width: 200,
        render: value => value || '0',
      },
      {
        title: '开始时间',
        dataIndex: 'created_at',
        key: 'created_at',
        width: 200,
        render: value => value ? moment(value).format('YYYY-MM-DD') : '--',
      },
      {
        title: '计划完成时间',
        dataIndex: 'plan_finish_at',
        key: 'plan_finish_at',
        width: 200,
        render: value => value ? moment(value).format('YYYY-MM-DD') : '--',
      },
      {
        title: '完成时间',
        dataIndex: 'finish_at',
        key: 'finish_at',
        width: 200,
        render: value => value ? moment(value).format('YYYY-MM-DD') : '--',
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 200,
        render: value => status[value],
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        width: 200,
        render: (value, record) => (
          <div>
            <Button
              size='small'
              style={{ borderColor: '#6F9EEF', color: '#6F9EEF', marginRight: 10 }}
              onClick={this.handleDetail.bind(this, record.id)}
            >
              详情
            </Button>
            <Button
              size='small'
              style={{ borderColor: '#6F9EEF', color: '#6F9EEF' }}
              onClick={this.handleOpenModal.bind(this, '编辑批次', record.id, record.plan_finish_at, record.batch_no)}
            >
              编辑
            </Button>
          </div>
        ),
      },
    ];
    const proBatColumns = [
      {
        title: '产品编号',
        dataIndex: 'id',
        key: 'id',
        width: 400,
        render: (value,record) => (
          <ProductCell 
            image_url={record.image_url}
            product_no={record.product_no}
            title={record.title}
            product_sku={record.product_sku}
            category={record.category_name_arr}
          />
        ),
      },
      {
        title: '单价（USD）',
        dataIndex: 'cost',
        key: 'cost',
        width: 80,
      },
      {
        title: '计划采购数量（件）',
        dataIndex: 'plan_quantity',
        key: 'plan_quantity',
        render: val => val || '0',
        width: 80,
      },
      {
        title: '待批次生成数量（件）',
        dataIndex: 'batch_plan_unquantity',
        key: 'batch_plan_unquantity',
        width: 80,
        render: (val,record) => {
          val = val || 0;
          val = (record.plan_quantity || 0)  - (record.batch_plan_quantity || 0);
          val = val >= 0 ? val : 0;
          return val;
        },
      },
      {
        title: '本批次生产数量',
        dataIndex: 'item_plan_quantity',
        key: 'item_plan_quantity',
        width: 80,
        render: (value, record, idx) => {
          let batch_plan_unquantity = (record.plan_quantity || 0)  - (record.batch_plan_quantity || 0);
          batch_plan_unquantity = batch_plan_unquantity >= 0 ? batch_plan_unquantity : 0;
          return <Input style={{width:80}} value={value} onChange={this.handleCellChange.bind(this, record.id, idx, batch_plan_unquantity)} />
        },
      },
    ];
    const proBatEditColumns = [
      {
        title: '产品编号',
        dataIndex: 'id',
        key: 'id',
        width: 400,
        render: (value,record) => (
          <ProductCell 
            image_url={record.image_url}
            product_no={record.product_no}
            title={record.title}
            product_sku={record.product_sku}
            category={record.category_name_arr}
          />
        ),
      },
      {
        title: '单价（USD）',
        dataIndex: 'cost',
        key: 'cost',
        width: 80,
      },
      {
        title: '计划采购数量（件）',
        dataIndex: 'plan_quantity',
        key: 'plan_quantity',
        width: 80,
        render: val => val || '0',
      },
      {
        title: '本批次生产数量',
        dataIndex: 'item_plan_quantity',
        key: 'item_plan_quantity',
        width: 80,
        render: (value, record, idx) => {
          value = value || record.batch_plan_quantity;
          return <Input style={{width:80}} value={value} onChange={this.handleCellChange.bind(this, record.id, 0, idx)} />;
        },
      },
    ];
    this.setState({ batColumns, proBatColumns, proBatEditColumns, status });
  }
  // 添加批次详情页面
  handleDetail = (batch_id) => {
    const { id } = this.state;
    if (this.props.onAddPane) {
      this.props.onAddPane('批次详情', <PurBatchDetail batch_id={batch_id} purchase_id={id} />);
    }
  }
  // 打开模态框
  handleOpenModal = (title, id, plan_finish_at, batch_no) => {
    this.setState({
      title,
      visible: true,
    });
    this.getProBatList(id, plan_finish_at, batch_no);
  }

  handleClose = () => {
    this.setState({
      loading: false,
      visible: false,
    });
    this.props.form.resetFields();
  }
  // 提交
  handleSubmitModal = () => {
    const { title, id } = this.state;
    let { purchase_items } = this.state;
    this.setState({
      loading: true,
    });
    this.props.form.validateFields((err, values) => {
      if (!err) {
        purchase_items = purchase_items.filter(val => val.item_plan_quantity);
        if (!purchase_items) {
          purchase_items = undefined;
        }
        values.plan_finish_at = values.plan_finish_at.format('YYYY-MM-DD');
        const data = {
          purchase_id: id,
          ...values,
          purchase_items,
        };
        if (title === '新增批次') {
          erpPost('purchase-batch/add', data, () => {
            Prompt.success();
            this.getList();
            this.handleClose();
          }, () => {
            this.setState({
              loading: false,
            });
          });
        } else {
          const { batch_id } = this.state;
          data.batch_id = batch_id;
          data.purchase_batch_items = purchase_items;
          data.purchase_items = undefined;
          erpPost('purchase-batch/edit', data, () => {
            Prompt.success();
            this.getList();
            this.handleClose();
          }, () => {
            this.setState({
              loading: false,
            });
          });
        }
      } else {
        this.setState({
          loading: false,
        });
      }
    });
  }
  handleCellChange = (id, idx, maxValue, e) => {
    const { purchase_items, proBatList } = this.state;
    const { value } = e.target;
    console.log(value,maxValue)
    if (maxValue) {
      if (Number(value) > Number(maxValue)) {
        Prompt.warning({content:'本批次生产数量已大于待生成数量'});
      }
    }
    purchase_items[idx] = {
      item_id: id,
      item_plan_quantity: value,
    };
    proBatList[idx].item_plan_quantity = value;
    this.setState({
      purchase_items,
      proBatList,
    });
  }
  render() {
    const { purStatus, batColumns, batList, visible, loading, title, proBatColumns, 
      proBatEditColumns, proBatList, personList } = this.state;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        // xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapCol: {
        // xs: { span: 24 },
        sm: { span: 8 },
      },
    };
    return (
      <div>
        {/* 批次列表 */}
        <div className='cardHeadStyle'>
          <Card
            title={(
              ( purStatus === 3 || purStatus === 4 ) && (
                <Button
                  type='primary'
                  onClick={this.handleOpenModal.bind(this, '新增批次', 0)}
                >
                  新增批次
                </Button>
              )
            )}
            bordered={false}
          >
            <div>
              <Table
                columns={batColumns}
                dataSource={batList}
                pagination={false}
                rowKey='id'
              />
            </div>
          </Card>
        </div>
        {/* 新增、编辑模态框 */}
        <Modal
          className='purchase'
          visible={visible}
          maskClosable={false}
          title={(
            <div>
              <span style={{ opacity: 0.6 }}>{title}</span>
              <Icon
                type='close'
                style={{ fontSize: 30, opacity: 0.6, position: 'absolute', top: 5, right: 5, cursor: 'pointer' }}
                onClick={this.handleClose}
              />
            </div>
          )}
          onOk={this.handleSubmitModal}
          closable={false}
          centered
          width='900px'
          footer={[
            <Button style={{ borderColor: '#00EC00', marginRight: 10 }} onClick={this.handleClose}>
              取消
            </Button>,
            <Button type='primary' loading={loading} onClick={this.handleSubmitModal}>
              确定
            </Button>,
          ]}
        >
          <div>
            <Form>
              <Row style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Col span='8'>
                  <FormItem {...formItemLayout} label='批次编号'>
                    {
                      getFieldDecorator('batch_no', {
                        rules: [
                          {
                            required: true,
                            message: '请填写批次编号',
                          },
                        ],
                      })(
                        <Input style={{ width: 150 }} />
                      )
                    }
                  </FormItem>
                </Col>
                <Col span='8'>
                  <FormItem {...formItemLayout} label='计划完成时间'>
                    {
                      getFieldDecorator('plan_finish_at', {
                        rules: [
                          {
                            required: true,
                            message: '请选择计划完成时间',
                          },
                        ],
                      })(
                        <DatePicker format='YYYY-MM-DD' style={{ width: 150 }} />
                      )
                    }
                  </FormItem>
                </Col>
                <Col span='8'>
                  <FormItem {...formItemLayout} label='质检员'>
                    {
                      getFieldDecorator('real_testing_person_id', {
                        rules: [
                          {
                            required: true,
                            message: '请选择质检员',
                          },
                        ],
                      })(
                        <Select
                          showSearch
                          style={{ width: 150 }}
                          optionFilterProp='children'
                          placeholder='请选择'
                        >
                          {
                            personList.map(list =>
                              <Option key={list.id} value={list.id}>{list.real_name}</Option>
                            )
                          }
                        </Select>
                      )
                    }
                  </FormItem>
                </Col>
              </Row>
            </Form>
            <div style={{ marginTop: 10 }}>
              <Table columns={title === '新增批次' ? proBatColumns : proBatEditColumns} rowKey='id' dataSource={proBatList} pagination={false} />
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

export default Form.create()(PurchaseBatch);
