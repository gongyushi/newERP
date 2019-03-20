import React from 'react';
import { Steps, Table, message, Button, Card } from 'antd';
import moment from 'moment';
import { erpPost } from '../../../services/ajax';
import EditableRows from '../../../components/EditableRows';
import ProductCell from '../../../components/ProductCell';
import Prompt from '../../../components/Prompt';

require('./common.less');

const { Step } = Steps;

export default class PurBasicDetail extends React.Component {
  state = {
    proColumns: [],
    id: this.props.purchase_id,
    disabled: false, // 行编辑状态
    showButton: '', // 可编辑行
    proList: this.props.detail.product_list,
  };
  componentDidMount(){
    this.initColumns();
  }
  initColumns = () => {
    const proColumns = [
      {
        title: '产品信息',
        dataIndex: 'product',
        key: 'product',
        className: 'goods-message',
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
        render: (value,record,index) => (
          <EditableRows 
            editable={this.state.showButton === index}
            type='input'
            value={value}
            onChange={this.handleChange.bind(this,'cost',index)}
          />
        ),
      },
      {
        title: '计划到货日期（UTC）',
        dataIndex: 'plan_arrive_at',
        key: 'plan_arrive_at',
        render: (value,record,index) => {
          value = value ? moment(value).format('YYYY-MM-DD') : null;
          return(
            <EditableRows 
              editable={this.state.showButton === index}
              type='time'
              value={value}
              onChange={this.handleChange.bind(this,'plan_arrive_at',index)}
            />
          );
        },
      },
      {
        title: '计划采购数量（件）',
        dataIndex: 'plan_quantity',
        key: 'plan_quantity',
        render: (value,record,index) => (
          <EditableRows 
            editable={this.state.showButton === index}
            type='input'
            value={value}
            onChange={this.handleChange.bind(this,'plan_quantity',index)}
          />
        ),
      },
      {
        title: '批次未生产（件）',
        dataIndex: 'batch_unpruduct_count',
        key: 'batch_unpruduct_count',
        render: value => value || 0,
      },
      {
        title: '生产中（件）',
        dataIndex: 'production_count',
        key: 'production_count',
        render: value => value || 0,
      },
      {
        title: '已生产未入库（件）',
        dataIndex: 'pruducted_uninbound_count',
        key: 'pruducted_uninbound_count',
        render: (val,record) => {
          val = (record.producted_count || 0) - (record.inbounded_count || 0);
          val = val >= 0 ? val : 0;
          return val;
        },
      },
      {
        title: '已入库（件）',
        dataIndex: 'inbounded_count',
        key: 'inbounded_count',
        render: value => value || 0,
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
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
                      ghost
                      onClick={this.handleCheck.bind(this, index)}
                      disabled={this.state.disabled}
                    >
                      编辑
                    </Button>
                  </div>
                )
              }
            </div>
          );
        },
      },
    ];
    this.setState({proColumns});
  }
  // 编辑
  handleCheck = (idx) => {
    this.setState({
      showButton: idx,
      disabled: true,
    });
  }
  // 保存
  handleSave = (product_id, idx) => {
    const { cost, plan_arrive_at, plan_quantity } = this.state.proList[idx];
    const { id } = this.state;
    const data = {
      cost,
      plan_arrive_at,
      plan_quantity,
      purchase_id: id,
      purchase_item_id: product_id,
    };
    erpPost('purchase/product/edit',data,() => {
      Prompt.success();
      this.handleCancel();
    },() => {
      // message.error('保存失败，请检查',2);
    });
  }
  // 取消
  handleCancel = () => {
    this.setState({ 
      showButton: '',
      disabled: false,
    });
  }
  // 行编辑
  handleChange = (key, idx, value) => {
    const { proList } = this.state;
    proList[idx][key] = value;
    this.setState({ proList });
  }
  render() {
    const {proColumns, proList } = this.state;
    const { audit_schedule, base } = this.props.detail;
    console.log( this.props.detail );
    return (
      <div style={{margin:0,padding:0}}>
        {/* 采购进度 */}
        <div className='cardHeadStyle'>
          <Card title='处理进度' bordered={false}>
            <div>
              {
                base.status === 6 ? 
                (
                  <Steps progressDot current={1} className='step'>
                    <Step title='创建' />
                    <Step title='废弃' />
                  </Steps>
                ) : (
                  <Steps progressDot current={base.status} className='step'>
                    <Step title='创建' />
                    <Step title='审核中' />
                    <Step title='审核通过' />
                    <Step title='已下单' />
                    <Step title='执行中' />
                    <Step title='完结' />
                  </Steps>
                )
              }
            </div>
          </Card>
        </div>
        {/* 审核进度 */}
        {
          audit_schedule.list && (
            <div className='cardHeadStyle'>
              <Card title='审核进度' bordered={false}>
                <div>
                  <Steps progressDot current={(audit_schedule.status > 1 && audit_schedule.status < 6) ? audit_schedule.list.length : audit_schedule.current_audit_id - 2} className='step'>
                    {
                      audit_schedule.list.map(val => <Step title={val.node_name} key={`${val.node_id}`} description={val.audit_date} />)
                    }
                  </Steps>
                </div>
              </Card>
            </div>
          )
        }
        {/* 产品列表 */}
        <div className='cardHeadStyle'>
          <Card title='产品列表' bordered={false}>
            <div>
              <Table dataSource={proList} columns={proColumns} className='table-four-line' rowKey='id' pagination={false} />
            </div>
          </Card>
        </div>
      </div>
    );
  }
}