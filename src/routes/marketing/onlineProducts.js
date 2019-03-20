import React from 'react';
import { Tabs, Button, Table,  message } from 'antd';
import ErpSearch from './public/erpSearch';
import OnlineDetail from './public/onlineDetail';
import {erpPost } from '../../services/ajax';
import ListingCell from '../../components/ListingCell';

require('../ListStyle.less');
require('./onlineProducts.less');

const { TabPane } = Tabs;


// 渲染到页面上
class OnlineProducts extends React.Component {
  constructor(props) {
    super(props);
    this.newTabIndex = 0;
    this.state = {
      panes: [{ title: '在线商品', content: '', key: '1', closable: false }],
      activeKey:'1',
      dataSource: [],
      loadTable:false,
      syncLoad:false,
      condition:{
        store_id: null,
        type: null,
        content: null,
        category: null,
      },
      order:[],
      page: {
        // defaultCurrent: 1,  // 默认的当前页数
        pageSize: 10, // 每页显示条数
        total: 0, // 总页数
        current: 1, // 当前页数
        showSizeChanger: true,
      },
    };
  }
 
  componentDidMount() {
    this.getOnlineList(this.state.page, this.state.order,this.state.condition);
  }
  // 页码
  onTableChange = (pageNumber, filters, sorte) => {
    const order = [];
    order.push({ field: sorte.field, order: sorte.order });
    this.getOnlineList(pageNumber, order, this.state.condition)
  };
  
  onChange = activeKey => {
    this.setState({ activeKey });
  };
  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };
  // 在线商品列表获取
  getOnlineList = (pageNumber, orders,condition) => {
    condition.page = pageNumber;
    condition.order = orders;
    // const can={
    //   page: pageNumber,
    // }
    erpPost('listing/index', condition, res => {
      this.setState({
        dataSource: res.data.data,
        page:res.data.page,
        loadTable:false,
      });
    },()=>{
      this.setState({
        dataSource:[],
        loadTable: false,
      });
    });
  };
  
  
  // 搜索
  search=(e)=>{
    this.setState({
      condition:e,
    })
    this.getOnlineList(this.state.page, this.state.order, e);
  }
  // 同步
  synchronization = () => {
    this.setState({
      syncLoad:true,
    })
    erpPost('listing/sync-list',{},res=>{
      message.success(res.data.msg)
      this.setState({
        syncLoad: false,
      })
    },()=>{
      this.setState({
        syncLoad: false,
      })
    })
  };
  add = () => {
    const { panes } = this.state;
    const activeKey = `newTab${this.newTabIndex++}`;
    panes.push({ title: 'New Tab', content: 'Content of new Tab', key: activeKey });
    this.setState({ panes, activeKey });
  };
  remove = targetKey => {
    let { activeKey } = this.state;
    let lastIndex;
    this.state.panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes = this.state.panes.filter(pane => pane.key !== targetKey);
    if (lastIndex >= 0 && activeKey === targetKey) {
      activeKey = panes[lastIndex].key;
    }
    this.setState({ panes, activeKey });
  };
  // 在线商品列表
  reonlineList = () => {
    const { dataSource, page, loadTable, treeData } = this.state;
    const columns = [
      {
        title: '商品信息',
        dataIndex: 'prod_name',
        key: 'prod_name',
        width:400,
        render: (text, val) => {
          return(
            <ListingCell
              image_url={val.image_url}
              seller_sku={val.seller_sku}
              title={val.title}
              category={val.category}
              asin={val.asin}
            />
          );
        },
          
      },
      {
        title: '3 日均量(件)',
        dataIndex: 'three_days_sale',
        key: 'three_days_sale',
        width:100,
        sorter: true,
        children: [
          {
            title: '15日均量(件)',
            dataIndex: 'half_month_sale',
            key: 'half_month_sale',
            width: 100,
            sorter: true,
            render: (val, record) => (
              <div>
                <p>{record.three_days_sale}</p>
                <p>{record.half_month_sale}</p>
                {/* <p>近7日:{val.sales.seven_day}</p> */}
              </div>
            ),
          },
        ],
      },
      {
        title: '昨日广告($)',
        dataIndex: 'totalConsumption',
        key: 'totalConsumption',
        sorter: true,
        width: 100,
        children: [
          {
            title: '昨日CPC($)',
            dataIndex: 'cpcConsumption',
            key: 'cpcConsumption',
            sorter: true,
            width: 100,
            render: () => (
              <div>
                <p style={{ textAlign: 'right' }}>4.63</p>
                <p style={{ textAlign: 'right' }}>2.01</p>
              </div>
            ),
          },
        ],
      },
      {
        title: '昨日点击数(次)',
        dataIndex: 'hits',
        key: 'hits',
        sorter: true,
        width: 100,
        children: [
          {
            title: '昨日展示数(次)',
            dataIndex: 'photoNum',
            key: 'photoNum',
            width: 100,
            sorter: true,
            render: () => (
              <div>
                <p>55</p>
                <p>66</p>
              </div>
            ),
          },
        ],
      },
      {
        title: '30天浏览量(次)',
        dataIndex: 'pageView',
        key: 'pageView',
        sorter: true,
        width: 100,
        children: [
          {
            title: '30天转化率(%)',
            dataIndex: 'percentConversion',
            key: 'percentConversion',
            sorter: true,
            width: 100,
            render: () => (
              <div>
                <p>123</p>
                <p>6</p>
              </div>
            ),
          },
        ],
      },
      {
        title: 'FBA库存(件)',
        dataIndex: 'stock',
        key: 'stock',
        sorter: true,
        width: 100,
        render: val => val || '0',
      },
      {
        title: '采购中(件)',
        dataIndex: 'caigou',
        key: 'caigou',
        sorter: true,
        width: 100,
        children: [
          {
            title: '在途数(件)',
            dataIndex: 'transit',
            key: 'transit',
            sorter: true,
            width: 100,
            render: () => (
              <div>
                <p>99</p>
                <p>66</p>
              </div>
            ),
          },
        ],
      },
      {
        title: '星级(星)',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        sorter: true,
        children: [
          {
            title: '差评(条)',
            dataIndex: 'bad',
            key: 'bad',
            width: 100,
            sorter: true,
            render: () => (
              <div>
                <p>5.0</p>
                <p>1000</p>
              </div>
            ),
          },
        ],
      },
      {
        title: '总评(条)',
        dataIndex: 'generalComment',
        key: 'generalComment',
        sorter: true,
        width: 100,
        children: [
          {
            title: '留评率(%)',
            dataIndex: 'LeaveReview',
            key: 'LeaveReview',
            sorter: true,
            width: 100,
            render: () => (
              <div>
                <p>1000</p>
                <p>25</p>
              </div>
            ),
          },
        ],
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        className: 'operation',
        render: (text, val) => {
          return (
            <div>
              <Button
                size="small"
                type="primary"
                className="buttonBul"
                ghost
                onClick={
                  () => {
                    const { panes } = this.state;
                    const activeKey = `newTab${this.newTabIndex++}`;
                    panes.push({ title: '商品详情', content: <OnlineDetail id={val.id} />, key: activeKey });
                    this.setState({ panes, activeKey });
                  }
                }
              >
                详情
              </Button>
            </div>
          );
        },
      },
    ];
    return (
      <div className='onlineProducts'>
        
        <div>
          <ErpSearch treeData={treeData} search={this.search} />
        </div>
        <div className='onlineButton' style={{marginBottom:10}}>
          <Button 
            size="small" 
            type="primary" 
            onClick={this.synchronization}
            loading={this.state.syncLoad}
          >
            同步
          </Button>
        </div>
        <Table
          // scroll={{ y: 800 }}
          // pagination={page}
          onChange={this.onTableChange}
          pagination={page}
          rowKey="id"
          className="onlineProd table-three-line"
          style={{ overflowY: 'auto' }}
          loading={loadTable}
          dataSource={dataSource}
          columns={columns}
        // scroll={{ x: '100%'}}
        />

      </div>
    );
  };
  render() {
    const {panes } = this.state;
    panes[0].content = this.reonlineList();
    return (
      <Tabs
        onChange={this.onChange}
        activeKey={this.state.activeKey}
        type="editable-card"
        onEdit={this.onEdit}
      >
        {this.state.panes.map(pane => (
          <TabPane tab={pane.title} key={pane.key} closable={pane.closable}>
            {pane.content}
          </TabPane>
        ))}
      </Tabs>
    );
  }
}
export default OnlineProducts;
