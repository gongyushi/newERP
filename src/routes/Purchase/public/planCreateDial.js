import React from 'react';
import { Form, Input, Table, Tooltip} from 'antd';

require('../appropriationPlan.less')

const FormItem = Form.Item;
const { TextArea } = Input;

class Demo extends React.Component {
  state={
    dataSource: this.props.choseList,
    ids: this.props.selectedRowKeys,
  }
  componentDidMount() {
    this.props.onRef(this)
  }
  handleSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        values.ids=this.state.ids;
        this.props.generate(values)
      }
    });
  }
  render(){
    const { dataSource, ids}=this.state;
    const { getFieldDecorator } = this.props.form;
    const columns = [{
      title: '商品信息',
      dataIndex: 'prod_name',
      key: 'prod_name',
      width: 300,
      render: (text, val) => {
        const titles = (
          <div>
            <div>产品ID：{val.category_id}</div>
            <div>SKU：{val.product_sku}</div>
            <div>产品名称：{val.title}</div>
            <div>产品分类：{val.category_arr&&val.category_arr.join(">")}</div>
          </div>
        );
        return (
          <div>
            <div style={{ float: 'left', width: 50, height: 50, margin: '3% 0' }}>
              <img src={val.image_url} alt="商品图片" style={{ width: '100%' }} />
            </div>
            <Tooltip
              placement="bottom"
              title={titles}
            >
              <div style={{ float: 'left', width: '80%' }}>
                <p style={{ margin: 0, textAlign: 'left' }}>{val.category_id}</p>
                <p style={{ margin: 0, textAlign: 'left' }}>{val.product_sku}</p>
                <p style={{ height: 35, textAlign: 'left', width: '100%', overflow: 'hidden', margin: 0 }}>{val.title}</p>
              </div>
            </Tooltip>
          </div>
        );
      },

    }, {
      title: '成本价($)',
      dataIndex: 'cost',
      width: 100,
    }, {
      title: '计划调拨数量(件)',
      dataIndex: 'quantity',
      width: 100,
    }, {
      title: '计划到货时间(UTC)',
      dataIndex: 'plan_arrive_at',
      width: 100,
    }, {
      title: '操作',
      dataIndex: 'action',
      width: 100,
      render:(text,val)=>(
        <div 
          style={{color:'#4ca5ff',cursor:'pointer'}}
          onClick={()=>{
            const arr=dataSource.filter(list=>{
              return list.id!==val.id
            })
            const arr2=ids.filter(list=>list!==val.id)
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
    return(
      <div className='planCreateDital'>
        <div className='top'>
          <div>调入仓库 : {dataSource[0] && dataSource[0].inbound_warehouse_name}</div>
          <div>调出仓库 : {dataSource[0] && dataSource[0].outbound_warehouse_name}</div>
        </div>
        {/* <div className='top'>
          <div>
            <Button 
              type="primary" 
              size='small'
              onClick={this.props.onShowModal.bind(this,2)}
            >
              选择物流
            </Button>
          </div>
          <div>运单号 : --</div>
          <div>运费 : --</div>
        </div> */}
        <div>
          <Table
            columns={columns}
            dataSource={dataSource}
            rowKey='id'
            pagination={false}
            scroll={{ y: 240 }}
          />
        </div>
        <Form onSubmit={this.handleSubmit}>
          <FormItem
            label="备注"
            hasFeedback
          >
            {getFieldDecorator('remark', {
              rules: [
                {message: 'Please select your country!' },
              ],
            })(
              <TextArea 
                autosize={{minRows:6, maxRows:6}}
              />
            )}
          </FormItem>
        </Form>
      </div>
      
    )
  }
}

const PlanCreateDial = Form.create()(Demo);
export default PlanCreateDial;