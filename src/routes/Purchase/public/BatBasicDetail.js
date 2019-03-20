import React from 'react';
import { Steps, Card, Table, Button, message, Select } from 'antd';
import moment from 'moment';
import EditableRows from '../../../components/EditableRows';
import ProductCell from '../../../components/ProductCell';
import { erpPost } from '../../../services/ajax';
import Prompt from '../../../components/Prompt';

const { Step } = Steps;
const { Option } = Select;

export default class BatBasicDetail extends React.Component {
  state = {
    proList: [],
    proColumns: [],
    showButton: '', // 可编辑行
    disabled: this.props.status !== 3, // 行编辑状态
    status: this.props.status,
    purchase_id: this.props.purchase_id,
    id: this.props.batch_id,
    personList: [], // 人员列表
  };
  componentDidMount() {
    this.initColumns();
    this.getList();
    this.getPersonList();
  }
  componentWillReceiveProps(next) {
    this.setState({
      status: next.status,
      disabled: next.status !== 3,
    });
  }
  getList = () => {
    const { id, purchase_id } = this.state;
    erpPost('purchase-batch/item/index', { purchase_id, id }, res => {
      this.setState({
        proList: res.data.data,
      });
    });
  }
  getPersonList = () => {
    erpPost('organization/person/index', {}, res => {
      this.setState({
        personList: res.data.data,
      });
    });
  }
  initColumns = () => {
    const proColumns = [
      {
        title: '产品信息',
        dataIndex: 'id',
        key: 'id',
        width: 400,
        render: (value, record) => {
          return (
            <ProductCell
              product_no={record.product_no}
              title={record.title}
              image_url={record.image_url}
              product_sku={record.product_sku}
              category={record.category_name_arr}
            />
          )
        },
      },
      {
        title: '单价（USD）',
        dataIndex: 'cost',
        key: 'cost',
        width: 100,
        render: value => value || 0,
      },
      {
        title: '生产（件）',
        dataIndex: 'batch_plan_quantity',
        key: 'batch_plan_quantity',
        width: 100,
        render: value => value || 0,
      },
      {
        title: '良品（件）',
        dataIndex: 'qualified_quantity',
        key: 'qualified_quantity',
        width: 100,
        render: (value, record, index) => {
          return (
            <EditableRows
              type='input'
              editable={this.state.showButton === index}
              value={value}
              onChange={this.handleChange.bind(this, 'qualified_quantity', index)}
            />
          );
        },
      },
      {
        title: '次品（件）',
        dataIndex: 'unqualified_quantity',
        key: 'unqualified_quantity',
        width: 100,
        render: (value, record, index) => {
          return (
            <EditableRows
              type='input'
              editable={this.state.showButton === index}
              value={value}
              onChange={this.handleChange.bind(this, 'unqualified_quantity', index)}
            />
          );
        },
      },
      {
        title: '次品率',
        dataIndex: 'unqualified_ratio',
        key: 'unqualified_ratio',
        width: 100,
        render: value => value || 0,
      },
      {
        title: '质检员',
        dataIndex: 'testing_name',
        key: 'testing_name',
        width: 100,
        render: (value, record, index) => {
          let person = '';
          const { personList } = this.state;
          if (this.state.showButton === index) {
            person = (
              <Select
                showSearch
                value={record.testing_person_id || undefined}
                style={{ width: 150 }}
                onChange={this.handleChange.bind(this, 'testing_person_id', index)}
                optionFilterProp='children'
                placeholder='请选择'
              >
                {
                  personList.map(list =>
                    <Option key={list.id} value={list.id}>{list.real_name}</Option>
                  )
                }
              </Select>
            );
          } else {
            person = value;
          }
          return person;
        },
      },
      {
        title: '质检时间',
        dataIndex: 'testing_at',
        key: 'testing_at',
        width: 100,
        render: (value, record, index) => {
          value = value ? moment(value).format('YYYY-MM-DD') : null;
          return (
            <EditableRows
              type='time'
              editable={this.state.showButton === index}
              value={value}
              onChange={this.handleChange.bind(this, 'testing_at', index)}
            />
          );
        },
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        width: 100,
        render: (value, record, index) => {
          return (
            <div>
              {
                this.state.showButton === index ? (
                  <div>
                    <div>
                      <Button
                        size='small'
                        type='primary'
                        ghost
                        onClick={this.handleSave.bind(this, record.id, index)}
                      >
                        保存
                      </Button>
                    </div>
                    <div>
                      <Button
                        size='small'
                        type='primary'
                        ghost
                        onClick={this.handleCancel.bind(this)}
                      >
                        取消
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Button
                      size='small'
                      type='primary'
                      ghost={!this.state.disabled}
                      onClick={this.handleCheck.bind(this, index)}
                      disabled={this.state.disabled}
                    >
                      质检
                    </Button>
                  </div>
                )
              }
            </div>
          );
        },
      },
    ];
    this.setState({ proColumns });
  }
  // 质检（编辑）
  handleCheck = (idx) => {
    this.setState({
      showButton: idx,
      disabled: true,
    });
  }
  // 保存
  handleSave = (batch_item_id, idx) => {
    const { purchase_id, id } = this.state;
    const { qualified_quantity, unqualified_quantity, testing_person_id } = this.state.proList[idx];
    let  {testing_at } = this.state.proList[idx];
    testing_at = testing_at || moment(new Date()).format('YYYY-MM-DD');
    if (qualified_quantity === '' || unqualified_quantity === '' || testing_person_id === '') {
      Prompt.warning({content:'请全部填写完成'});
      return;
    }
    const data = {
      purchase_id,
      id,
      batch_item_id,
      qualified_quantity,
      unqualified_quantity,
      testing_person_id,
      testing_at: moment(testing_at).format('YYYY-MM-DD'),
    };
    erpPost('purchase-batch/quality-testing', data, () => {
      Prompt.success();
      this.handleCancel();
    }, () => {
      // message.error('质检失败，请检查', 2);
    });
  }
  // 取消
  handleCancel = () => {
    this.setState({
      showButton: '',
      disabled: false,
    });
    this.getList();
  }
  // 行编辑
  handleChange = (key, idx, value) => {
    const { proList } = this.state;
    proList[idx][key] = value;
    this.setState({ proList });
  }
  render() {
    const { proColumns, proList } = this.state;
    let { status } = this.state;
    status = ( status === 0 || status === 1 ) ? 0 : status -1;
    return (
      <div>
        {/* 处理进度 */}
        <div className='cardHeadStyle'>
          <Card title='处理进度' bordered={false}>
            <div>
              <Steps progressDot current={status} className='step'>
                <Step title='工厂确认' />
                <Step title='备料完成' />
                <Step title='生产完成' />
                <Step title='质检完成' />
                <Step title='部分在途' />
                <Step title='全部在途' />
                <Step title='完结' />
              </Steps>
            </div>
          </Card>
        </div>
        {/* 产品列表 */}
        <div className='cardHeadStyle'>
          <Card title='产品列表' bordered={false}>
            <Table dataSource={proList} columns={proColumns} className='table-four-line' rowKey='id' pagination={false} />
          </Card>
        </div>
      </div>
    );
  }
}
