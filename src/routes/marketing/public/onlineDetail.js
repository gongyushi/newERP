import React from 'react';
import {
  Table,
  Button,
  Input,
  Modal,
  message,
  Select  } from 'antd';
import moment from 'moment';
import BrokenLine from '../../../components/Charts/BrokenLine';
import EditableItem from '../../../components/EditableItem';
import { erpPost } from '../../../services/ajax';

const {Option} = Select;
require('../onlineProducts.less');
// const { RangePicker } = DatePicker;
class OnlineDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      trendOne: '',
      id:this.props.id,
      competVisible: false,
      visibleLoading:false,
      newAddValue:'',
      listingDetail:{},
      syncLoading:false,  // 同步加载
      // trendSalsData:[],  //  销量趋势数据
      trendPriceData:[],  // 价格趋势数据
      trendStarData:[],  // 星级趋势数据
      trendRankData:[],   //  排名趋势数据
      categoryList: [],   // 获取在线商品分类
      trendExpectData: [],  // 销量预期趋势数据
      logPage: {
        // defaultCurrent: 1,  // 默认的当前页数
        pageSize: 10, // 每页显示条数
        total: 0, // 总页数
        current: 1, // 当前页数
        showSizeChanger: true,
      },
      salesData :[{
        key: '1',
        mouth: '7',
        systemPrediction: 10,
        dailySales: 11,
        monthlySales: 12,
        time: 2018-8-12,
      }, {
        key: '2',
        mouth: '7',
        systemPrediction: 10,
        dailySales: 11,
        monthlySales: 12,
        time: 2018 - 8 - 12,
      }, {
        key: '3',
        mouth: '7',
        systemPrediction: 10,
        dailySales: 11,
        monthlySales: 12,
        time: 2018 - 8 - 12,
      }],
      logData: [],
      // dateFormat: 'YYYY/MM/DD',
      // monthFormat :'YYYY/MM',
    };
  }
  componentWillMount() {
    this.getListingDetail();// 在线商品详情
    this.getChart('landed_price');  // 在线商品详情页价格、星级折线图
    this.getChart('star');  // 在线商品详情页价格、星级折线图
    this.getSaleChart();  // 在线商品详情页销售预期折线图
    this.getListingCategory(); // 获取在线商品分类

    this.getLogList(); //   获取日志列表
    this.getSalesList();  // 在线商品详情页销售预期列表
  }
  // 页码
  onTableChange = (pageNumber, filters, sorte) => {
    const order = [];
    order.push({ field: sorte.field, order: sorte.order });
    this.getLogList(pageNumber, order)
  };
  // 单元格编辑
  onCellChange = (key,dataIndex,values) => {
    const can={
      listing_dynamic_sale_id:key,
      manual_volumes: values,
    }
    erpPost('listing-dynamic-sales/update',can,res=>{
      message.success(res.data.msg)
      this.getSalesList();  // 在线商品详情页销售预期列表
    });
  };
  //  竞品ASIN编辑
  onCompetingEdit = (dataIndex, values)=>{
    this.setState({
      visibleLoading: true,
    });
    const can={
      listing_id:this.state.id,
      asin: values || this.state.newAddValue,
    }
    erpPost('listing/detail/set-competitive',can,res=>{
      this.getListingDetail()
      message.success(res.data.msg)
      this.setState({
        competVisible: false,
        visibleLoading:false,
      });
    },()=>{
      this.setState({
        visibleLoading: false,
      });
    });
  }
  // 在线商品详情
  getListingDetail=()=>{
    erpPost('listing/detail', { listing_id: this.state.id }, res => {
      this.setState({
        listingDetail:res.data.data,
      });
    });
  }
  // 在线商品详情页价格、星级折线图
  getChart=(types)=>{
    const can={
      type:types,
      listing_id:this.state.id,
    }
    erpPost('listing/detail/get-chart',can,res=>{
      const data = res.data.data.map(item=>{
        return {month: item.month, '自品': item.self, '竞品': item.competive};
      });
      if (types ==='landed_price'){
        this.setState({
          trendPriceData: data,
        })
      }else if(types==='star'){
        this.setState({
          trendStarData: data,
        })
      }
    });
  }
  // 在线商品详情页销售预期折线图
  getSaleChart=()=>{
    erpPost('listing/detail/get-sale-chart', { listing_id: this.state.id}, res => {
      const data = res.data.data.map(item=>{
        return {month: item.month, '实际销量': item.actual, '智能预测': item.auto, '人工预测': item.manual};
      });
      this.setState({
        trendExpectData: data,
      });
    });
  }
  // 获取在线商品分类
  getListingCategory=()=>{
    erpPost('listing-product-category/get-listing-category', { listing_id: this.state.id }, res => {

      this.setState({
        categoryList: res.data.data,
        trendOne: res.data.data[0].id,
      });
      if (res.data.data[0]){
        this.getRankChart(res.data.data[0].id);// 在线商品详情页分类排名折线图
      }
    });
  }
  // 在线商品详情页分类排名折线图
  getRankChart=(typeId)=>{
    const can = {
      category_id: typeId,
      listing_id: this.state.id,
    }
    erpPost('listing/detail/get-rank-chart', can, res => {
      const data = res.data.data.map(item=>{
        return {month: item.month, '自品': item.self, '竞品': item.competive};
      });
      this.setState({
        trendRankData: data,
      });
    });
  }

  // 在线商品详情页销售预期列表
  getSalesList=()=>{
    erpPost('listing-dynamic-sales/index', { listing_id: this.state.id }, res => {
      this.setState({
        salesData: res.data.data,
      });
    });
  }
  // 获取日志列表
  getLogList=()=>{
    erpPost('listing-dynamic-sales/log-list', { listing_id: this.state.id},res=>{
      this.setState({
        logData:res.data.data,
        logPage:res.data.data,
      });
    });
  }
  // 同步单个在线商品
  listingSync=()=>{
    this.setState({
      syncLoading: true,
    });
    erpPost('listing/sync', { listing_id: this.state.id }, res => {
      message.success(res.data.msg)
      this.setState({
        syncLoading:false,
      });
    },()=>{
      this.setState({
        syncLoading: false,
      });
    });
  }
  // 线型图切换
  handleSizeChange = value => {
    this.getRankChart(value); // 在线商品详情页分类排名折线图
  };
  // 弹框
  showModal = (e) => {
    console.log(e)
    this.setState({
      competVisible: true,
    });
  }


  handleCancel = (e) => {
    console.log(e);
    this.setState({
      competVisible: false,
    });
  }
  render() {
    const {
      trendOne,
      salesData,
      listingDetail,
      syncLoading,
      trendPriceData,
      trendStarData,
      trendRankData,
      trendExpectData,
      categoryList,
      logPage,
      logData,
      competVisible,
      visibleLoading,
    } = this.state;
    const salesColumns = [
      {
        title: '预测月份',
        dataIndex: 'dt_id',
        key: 'dt_id',
        render: (text)=>{
          console.log(text)
          text = text ? text.split('-') : '--';
          return <div>{`${text[0]}-${text[1]}`}</div>
        },
      },
      {
        title: '系统预测日销量（件）',
        dataIndex: 'auto_volumes',
        key: 'auto_volumes',
      },
      {
        title: '预测日销量（件）',
        dataIndex: 'manual_volumes',
        key: 'manual_volumes',
        render: (text, record) => (
          <div style={{ width: 100 }}>
            <EditableItem
              style={{ display: 'inline-block' }}
              type='inputNumber'
              value={record.manual_volumes}
              onChange={this.onCellChange.bind(this, record.listing_dynamic_sales_id,'manual_volumes')}
            />
          </div>
        ),
      },
      {
        title: '预测月销量（件）',
        dataIndex: 'monthlySales',
        key: 'monthlySales',
        render:(text,record)=>{
          const today = new Date(record.dt_id);
          const year = today.getFullYear();
          const month = `0 + ${today.getMonth() + 1}`.slice(-2);
          const time = new Date(year,month,0);
          const d = time.getDate();
          const monthData = record.manual_volumes*d;
          return <div>{monthData}</div>
        },
      },
      {
        title: '修订时间',
        dataIndex: 'updated_at',
        render:(text)=>{
          return <div>{ moment(text).format('YYYY-MM-DD HH:mm') }</div>
        },
      },
    ];
    const logColumns = [
      {
        title: '操作时间',
        dataIndex: 'created_at',
        key: 'created_at',
      },
      {
        title: '操作人员',
        dataIndex: 'person',
        key: 'person',
        render:(text,record)=>(
          <div>
            {record.person.real_name}
          </div>
        ),
      },
      {
        title: '预测月份',
        dataIndex: 'manual_time',
        key: 'manual_time',
      },
      {
        title: '预测日销量',
        dataIndex: 'manual_volumes',
        key: 'manual_volumes',
      },
    ];
    return (
      <div className='onlineDemand'>
        <div>
          <div className='title'>
            <h3>基础信息</h3>
            <div>
              最近一次同步： {listingDetail.sync_at}
              <Button
                type="primary"
                size='small'
                style={{width:80,marginLeft:10}}
                loading={syncLoading}
                onClick={this.listingSync}
              >同步
              </Button>
            </div>
          </div>
          <ul className='content baseList'>
            <li>
              <span>商品名称：</span>
              <span>
                {listingDetail.title}
              </span>
            </li>
            <li>
              <ul>
                <li>
                  <span>商品ID：</span>
                  <span>{listingDetail.product_id}</span>
                </li>
                <li>
                  <span>SellerSKU：</span>
                  <span>{listingDetail.seller_sku}</span>
                </li>
                <li>
                  <span>ASIN：</span>
                  <span>{listingDetail.asin}</span>
                </li>
                <li>
                  <span>吊牌价：</span>
                  <span>USD {listingDetail.regular_price}</span>
                </li>
                <li>
                  <span>售价：</span>
                  <span>USD {listingDetail.listing_price}</span>
                </li>
                <li>
                  <span>现价：</span>
                  <span>USD {listingDetail.landed_price}</span>
                </li>
                <li>
                  <span>运费：</span>
                  <span>USD {listingDetail.shipping_price}</span>
                </li>
                <li>
                  <span>状况：</span>
                  <span>{listingDetail.status === 0 ? '在售' : (listingDetail.status === 1?'未同步':'已下架')}</span>
                </li>
                <li>
                  <span>子状况：</span>
                  <span>{listingDetail.item_condition}</span>
                </li>
              </ul>
            </li>
          </ul>
        </div>
        <div>
          <div className='title'>
            <h3>动态趋势</h3>
            <div>
              <div>竞品ASIN:  </div>
              <div style={{width:140,marginLeft:10}}>
                <EditableItem
                  style={{ display: 'inline-block' }}
                  value={listingDetail.competitor_asin}
                  onChange={this.onCompetingEdit.bind(this,'competitor_asin')}
                />
              </div>
              {/* <div>
                <Button
                  type="primary"
                  size='small'
                  onClick={this.showModal}
                >
                  添加竞品
                </Button>
              </div> */}
            </div>
          </div>
          <div className='content'>
            {/* <div className="chart">
              <BrokenLine
                height={300}
                data={trendSalsData}
              />
            </div> */}
            <div className="chart">
              <div>价格</div>
              <BrokenLine
                height={300}
                data={trendPriceData}
                name='价格'
              />
            </div>
            <div className="chart">
              <div>星级</div>
              <BrokenLine
                height={300}
                data={trendStarData}
                name='星级'
              />
            </div>
            <div className="chart">
              <div className='tabs'>
                <Select
                  defaultValue={trendOne}
                  style={{ width: 120 }}
                  onChange={this.handleSizeChange}
                  showSearch
                  optionFilterProp='children'
                >
                  {categoryList.map(val => {
                    return (
                      <Option key={val.id} value={val.id}>{val.name}</Option>
                    )
                  })}
                </Select>
              </div>
              <div style={{marginTop:60}}>
                <BrokenLine
                  height={300}
                  data={trendRankData}
                  name='排名'
                />
              </div>
            </div>

          </div>


        </div>
        <div>
          <div className='title'>
            <h3>销量预期</h3>

          </div>
          <div className='content'>
            <div className="chart">
              <BrokenLine
                height={300}
                data={trendExpectData}
                name='销量预期'
              />
            </div>
            <div className="expectTable" style={{marginTop:10,maxHeight:422}}>
              <Table
                scroll={{ y: 500 }}
                // pagination={page}
                pagination={false}
                onChange={this.onTableChange}
                rowKey="listing_dynamic_sales_id"
                style={{ overflowY: 'auto' }}
                dataSource={salesData}
                columns={salesColumns}

              // scroll={{ x: '100%'}}
              />
            </div>
          </div>
        </div>
        <div>
          <div className='title'>
            <h3>日志</h3>
          </div>
          <div className='content'>
            <div>
              <Table
                // scroll={{ y: 800 }}
                // pagination={page}
                onChange={this.onTableChange}
                pagination={logPage}
                rowKey="id"
                className="onlineProd"
                style={{ overflowY: 'auto' }}
                dataSource={logData}
                columns={logColumns}

              // scroll={{ x: '100%'}}
              />
            </div>
          </div>
        </div>
        <Modal
          title="新增竞品报告"
          visible={competVisible}
          confirmLoading={visibleLoading}
          destroyOnClose='true'
          onOk={this.onCompetingEdit}
          maskClosable={false}
          onCancel={this.handleCancel}
        >
          <span>竞品ASIN：</span>
          <Input
            style={{width:180}}
            placeholder='请输入竞品ASIN'
            onChange={(e)=>{
              this.setState({
                newAddValue: e.target.value,
              })
            }}
          />
        </Modal>
      </div>
    );
  }
}

export default OnlineDetail;
