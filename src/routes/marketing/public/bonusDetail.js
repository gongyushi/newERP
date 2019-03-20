import React from 'react';
import { Table, Radio, message, Row, Col, Tooltip } from 'antd';
import EditableItem from '../../../components/EditableItem';
import { erpPost } from '../../../services/ajax';
import ErpPie from '../../../components/Charts/erpPie';
import Histogram from '../../../components/Charts/Histogram';

require('../bonus.less');

class BonusDetail extends React.Component {
  constructor(props) {
    super(props);
    this.newTabIndex = 0;
    this.state = {
      commission_id: this.props.commissionid,
      pieData: [
        { item: '事例一', count: 50 },
        { item: '事例二', count: 60 },
        { item: '事例三', count: 52 },
        { item: '事例四', count: 79 },
        { item: '事例五', count: 9 },
      ],
      rank:[],
      size:'stationRatioPie',
      prodSetData: [],
      personData: [],   // 成员提成设置-表格数据
      page: {
        pageSize: 10, // 每页显示条数
        total: 0, // 总页数
        current: 1, // 当前页数
        showSizeChanger: true,
      },
      total_target:0,   //  目标销售总额
    };
  }
  componentDidMount() {
    this.personAmortization();// 成员提成进度
    this.productListing(this.state.page); // 销售产品设置
  }
  // 改变表格中的值
  onCellChange = (key, dataIndex, data) => {
    const personData = [...this.state.personData];
    const target = personData.find(item => {
      return item.commission_person_id === key;
    });
    const can={
      commission_person_id: key,
      commission_id: this.state.commission_id,
      ratio:data,
    }
    if (target) {
      target[dataIndex] = data;
      erpPost('commission/person/set-ratio',can,res=>{
        message.success(res.data.msg)
        this.setState({ personData });
      })
      
    }
  };
  // 饼图的切换
  handleSizeChange=(e)=>{
    const name = e.target.value;
    const {personDetail}=this.state;
    this.setState({ 
      size: name,
      pieData: personDetail.ratioPie[name],
    });
  }
  // 成员提成进度-销售
  personAmortization = () => {
    erpPost('commission/person/amortization', { commission_id: this.state.commission_id }, res => {
      const list=res.data.data;
      list.rank.map(value => {
        Object.keys(value).map((val) => {
          if (val !== 'real_name') {
            value[val] = Number(value[val])
          }
          if (val === 'target_sales') {
            value['销售目标'] = value[val];
          }
          if (val === 'actual_sales') {
            value['实际销售额'] = value[val];
          }
          return val
        })
        return value;
      })
      console.log(list.rank)
      this.setState({
        personDetail:list,
        rank: list.rank,
        personData: list.amortizationList,
        pieData: list.ratioPie.stationRatioPie,
      })
    });
  };
  // 销售产品设置
  productListing = (pageNumber) => {
    const can={
      page: pageNumber,
      commission_id: this.state.commission_id,
    }
    erpPost('commission/person/listings',can, res => {
      console.log(res)
      this.setState({
        prodSetData:res.data.data,
        total_target: res.data.total_target,
        page: res.data.page,
      });
    });
  };

  render() {
    const {
      prodSetData,
      prodSetRowSelection,
      pieData,
      personData,
      personRowSelection,
      size,
      page,
      rank,
      total_target,
    } = this.state;
    const personColumns = [
      {
        title: '成员',
        dataIndex: 'real_name',
        key: 'real_name',
        className:'width100',
      },
      {
        title: '职位',
        dataIndex: 'position',
        key: 'position',
        className: 'width160',
        render:(text,val)=>(
          <div>
            {val.station === 0 ? '销售主管' : (val.station === 1 ? '服务人员' :'销售人员')}
          </div>
        ),
      },
      {
        title: '提成分配',
        dataIndex: 'ratio',
        key: 'ratio',
        className: 'width160',
        render: (text, record) => (
          <EditableItem
            value={text}
            onChange={this.onCellChange.bind(this, record.commission_person_id, 'ratio')}
          />
        ),
      },
      {
        title: '目标销售额($)',
        dataIndex: 'target_sales',
        key: 'target_sales',
        className: 'width160',
      },
      {
        title: '实际销售额($)',
        dataIndex: 'actual_sales',
        key: 'actual_sales',
        className: 'width160',
      },
      {
        title: '提成额($)',
        dataIndex: 'commission',
        key: 'commission',
        className: 'width160',
      },
    ];
    const prodSetColumns = [
      {
        title: '商品名称',
        dataIndex: 'prod_name',
        key: 'prod_name',
        width: 350,
        render: (text, val) => {
          const titles = (
            <div>
              <div>SellerSKU：{val.seller_sku}</div>
              <div>商品名称：{val.title}</div>
            </div>
          );
          return (
            <div>
              <Row>
                <Col span={4}>
                  <div style={{ width: 50, height: 50, marginTop: '20px' }}>
                    <img src={val ? val.image_url : null} alt="商品图片" style={{ width: '80%' }} />
                  </div>
                </Col>
                <Col span={20}>
                  <Tooltip
                    placement="bottom"
                    title={titles}
                  >
                    <div style={{ textAlign: 'left' }}>{val.seller_sku}</div>
                    <div style={{ height: 35, overflow: 'hidden', textAlign: 'left' }}>{val.title}</div>
                  </Tooltip>
                </Col>
              </Row>
            </div>
          );
        },

      },
      {
        title: 'SKU',
        dataIndex: 'seller_sku',
        key: 'seller_sku',
        width:100,
      },
      {
        title: '店铺',
        dataIndex: 'store_name',
        key: 'store_name',
        width:100,
      },
      {
        title: '销售人员',
        dataIndex: 'real_name',
        key: 'real_name',
        width:100,
      },
      {
        title: '上月销量(件)',
        dataIndex: 'lastSales',
        key: 'lastSales',
        width:150,
        children: [
          {
            title: '本周期销量(件)',
            dataIndex: 'thisSales',
            key: 'thisSales',
            width: 150,
            render: (text, record) => (
              <div>
                <p style={{ textAlign: 'right' }}>{record.last_month_actual_volumes}</p>
                <p style={{ textAlign: 'right' }}>{Number.parseInt(record.actual_sales / record.listing_price, 10)}</p>
              </div>
            ),
          },
        ],
      },
      {
        title: '上月销售额($)',
        dataIndex: 'lastPrice',
        key: 'lastPrice',
        width:150,
        children: [
          {
            title: '本周期销售额($)',
            dataIndex: 'thisPrice',
            key: 'thisPrice',
            width: 150,
            render: (text,record) => (
              <div>
                <p style={{ textAlign: 'right' }}>{(record.last_month_actual_volumes * record.listing_price).toFixed(2)}</p>
                <p style={{ textAlign: 'right' }}>{record.actual_sales}</p>
              </div>
            ),
          },
        ],
      },
      {
        title: '目标销量(件)',
        dataIndex: 'salesTarget',
        key: 'salesTarget',
        width:150,
        render:(text,val)=>(
          <div>
            {Number.parseInt(val.target_sales / val.listing_price,10)}
          </div>
        ),
      },
      {
        title: '目标销售额($)',
        dataIndex: 'target_sales',
        key: 'target_sales',
        width:200,
      },
    ];
    return (
      <div className="bonusDetail">
        <h3>销售排行</h3>
        <div>
          <Histogram data={rank} list={['销售目标', '实际销售额']} />
        </div>
        <h3>成员提成设置</h3>
        <div className="detMiddle">
          <div className="detMiddleTable">
            <Table
              className="prodSet"
              pagination={false}
              rowKey='commission_person_id'
              dataSource={personData}
              columns={personColumns}
              rowSelection={personRowSelection}
            />
          </div>
          <div className="detMiddlePie">
            <Radio.Group value={size} onChange={this.handleSizeChange}>
              <Radio.Button value="stationRatioPie">职位占比</Radio.Button>
              <Radio.Button value="memberRatioPie">成员占比</Radio.Button>
            </Radio.Group>
            <ErpPie pieData={pieData} name='职位' />
          </div>
        </div>
        <h3>销售明细</h3>
        <div className="detBottom">
          <div>
            <div style={{ float: 'right' }}>
              目标销售额总计($)：<span>{total_target}</span>
            </div>
          </div>
          <div className="prodSet">
            <Table
              rowKey='key'  
              dataSource={prodSetData}
              pagination={page}
              columns={prodSetColumns}
              rowSelection={prodSetRowSelection}
              scroll={{ y: 240 }}
            />
          </div>
        </div>
      </div>
    );
  }
}
// const BonusDetail = Form.create()(DynamicRule);
export default BonusDetail;
