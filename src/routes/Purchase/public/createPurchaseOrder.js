import React from 'react';
import moment from 'moment';
import { Form, Input, Table } from 'antd';
import ProductCell from '../../../components/ProductCell';

require('../shoppingList.less')

const FormItem = Form.Item;
const { TextArea } = Input;

class CreatePurchaseOrder extends React.Component {
  state = {
    dataSource: this.props.choseList,
    ids: this.props.selectedRowKeys,
    total:0,
  }
  componentWillMount() {
    this.actionData(this.state.dataSource)
  }
  componentDidMount() {
    
    this.props.onRef(this)
  }

  // 操作数据
  actionData=(list)=>{
    let number = 0;
    list.map(val => {
      number += val.cost * val.quantity
      return val;
    })
    this.setState({
      total: number,
    })
  }
  handleSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log(values)
        values.ids = this.state.ids;
        this.props.generate(values)
      }
    });
  }
  render() {
    const { dataSource, ids, total } = this.state;
    const { getFieldDecorator } = this.props.form;
    const columns = [{
      title: '产品信息',
      dataIndex: 'information',
      width: 540,
      render: (text, record) => {
        return (
          <ProductCell
            product_no={record.product_no}
            title={record.title}
            image_url={record.image_url}
            product_sku={record.product_sku}
            category={record.category_name_arr}
          />
        );
      },
    }, {
      title: '单价(USD)',
      dataIndex: 'cost',
      width: 100,
    }, {
      title: '计划采购数量(件)',
      dataIndex: 'quantity',
      width: 100,
    }, {
      title: '计划到货时间(UTC)',
      dataIndex: 'plan_arrive_at',
      width: 100,
      render: (text)=>{
        return moment(text).format('YYYY-MM-DD')
      },
    }, {
      title: '操作',
      dataIndex: 'action',
      width: 100,
      render: (text, val) => (
        <div
          style={{ color: '#4ca5ff', cursor: 'pointer' }}
          onClick={() => {
            const arr = dataSource.filter(list => {
              return list.id !== val.id
            })
            this.actionData(arr);
            const arr2 = ids.filter(list => list !== val.id)
            this.props.removeChild(arr2)
            this.setState({
              dataSource: arr || [],
              ids: arr2,
            })
            
          }}
        >
          移除
        </div>
      ),
    }];
    return (
      <div className='planCreateDital'>
        <div className='top'>
          <div>采购仓库 : {dataSource[0] && dataSource[0].warehouse_name}</div>
          <div>供应商 : {dataSource[0] && dataSource[0].name}</div>
          <div>总价（USD）：{total}</div>
        </div>
        <div>
          <Table
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            rowKey='id'
          />,
        </div>
        <Form onSubmit={this.handleSubmit}>
          <FormItem
            label="备注"
            hasFeedback
          >
            {getFieldDecorator('remark', {
              rules: [
                { message: 'Please select your country!' },
              ],
            })(
              <TextArea
                autosize={{ minRows: 6, maxRows: 6 }}
              />
            )}
          </FormItem>
        </Form>
      </div>

    )
  }
}

export default Form.create()(CreatePurchaseOrder);