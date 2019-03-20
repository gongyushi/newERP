import React from 'react';
import { Table, Progress, Button, DatePicker, Select, Input, Radio, Modal } from 'antd';
import { TimelineChart } from 'components/Charts';
import moment from 'moment';
import styles from '../onlineProducts.less';
import { erpPost } from '../../../services/ajax';

const { RangePicker } = DatePicker;
const { Option } = Select;
// const ButtonGroup = Button.Group;
class Replenish extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      // trendDetailData: '',
      repleniData: {},
      reple_demand_no: '',
      purch_num: 0,
      percent: 0, // 进度条
      percent1: 0, // 进度条
      percent2: 0, // 进度条
      percent3: 0, // 进度条
      percent4: 0, // 进度条
      trendOne: 'sales',
      trendTow: 'sales',
      dateFormat: 'YYYY/MM/DD', // 时间选择
      onlineChartOne: [
        {
          x: 0,
          y1: 0,
        },
      ],
      onlineChartTow: [
        {
          x: 0,
          y1: 0,
        },
      ],
      columns: [
        {
          title: '售价($)',
          dataIndex: 'tag_price',
          key: 'tag_price',
        },
        {
          title: '可用库存',
          dataIndex: 'avail_stock',
          key: 'avail_stock',
        },
        {
          title: '预计可售天数',
          dataIndex: 'predict_day',
          key: 'predict_day',
        },
        {
          title: '安全库存',
          dataIndex: 'safe_stock',
          key: 'safe_stock',
        },
        {
          title: 'FBA库存',
          dataIndex: 'fba_stock',
          key: 'fba_stock',
        },
        {
          title: '在途数',
          dataIndex: 'transit',
          key: 'transit',
        },
        {
          title: '日均销量',
          dataIndex: 'sales',
          key: 'sales',
        },
      ],
      dataSource: [],
    };
  }
  componentWillMount() {
    this.setState({
      repleniData: this.props.repleni,
    });
    this.handTrendOne('sales');
    this.prodView();
  }
  // 补货需求
  prodView = () => {
    erpPost('product/online/view', { user_product_id: this.props.id }, res => {
      const arr = [];
      arr.push(res.data.data);
      this.setState({
        dataSource: arr,
      });
    });
  };
  // 生成需求单号
  orderNo = () => {
    erpPost('purchase-order/no', {}, res => {
      this.setState({
        reple_demand_no: res.data.data,
      });
    });
  };
  // 进度条
  increase = () => {
    let percent = this.state.percent + 10;
    if (percent > 100) {
      percent = 100;
    }
    this.setState({ percent });
  };
  decline = () => {
    let percent = this.state.percent - 10;
    if (percent < 0) {
      percent = 0;
    }
    this.setState({ percent });
  };
  // 智能参数-下拉框
  handleChange = value => {
    console.log(`selected ${value}`);
  };

  handleBlur = () => {
    console.log('blur');
  };

  handleFocus = () => {
    console.log('focus');
  };
  // 趋势分析tab one
  handleSizeOne = e => {
    // console.log(e.target.value)
    this.setState({ trendOne: e.target.value });
    this.handTrendOne(e.target.value);
  };
  // 趋势分析tab Tow
  handleSizeTow = e => {
    this.setState({ trendTow: e.target.value });
  };
  // 趋势分析One接口
  handTrendOne = a => {
    const can = {
      asin: this.props.asin,
      from_created_at: '2014-01-02',
      to_created_at: '2019-06-05',
    };
    if (a === 'sales') {
      erpPost('product/trend', can, res => {
        this.setState({
          onlineChartOne: res.data.data,
        });
      });
    } else if (a === 'ranking') {
      erpPost('product/trend/sale', { ...can, type: '2' }, res => {
        this.setState({
          onlineChartOne: res.data.data,
        });
      });
    } else if (a === 'star') {
      erpPost('product/trend/sale', { ...can, type: '3' }, res => {
        this.setState({
          onlineChartOne: res.data.data,
        });
      });
    } else if (a === 'price') {
      erpPost('product/trend/sale', { ...can, type: '1' }, res => {
        this.setState({
          onlineChartOne: res.data.data,
        });
      });
    }
  };
  // 对话框
  showModal = () => {
    this.orderNo();
    this.setState({
      visible: true,
    });
  };
  handleOk = () => {
    this.setState({
      visible: false,
    });
    console.log(this.state.purch_num)
  };
  handleCancel = e => {
    console.log(e, '2');
    this.setState({
      visible: false,
    });
  };
  myTextInput = e => {
    this.setState({
      purch_num: e.target.value,
    });
  };
  render() {
    const { trendOne, trendTow, columns, dataSource, repleniData } = this.state;
    return (
      <div className={styles.replenish}>
        <ul className={styles.repChart}>
          <li>
            <Radio.Group value={trendOne} onChange={this.handleSizeOne}>
              <Radio.Button value="sales">销量</Radio.Button>
              <Radio.Button value="ranking">排名</Radio.Button>
              <Radio.Button value="star">星级</Radio.Button>
              <Radio.Button value="price">价格</Radio.Button>
            </Radio.Group>
            <TimelineChart
              height={300}
              data={this.state.onlineChartOne}
              titleMap={{ y1: '客流量', y2: '支付笔数' }}
            />
          </li>
          <li>
            <Radio.Group value={trendTow} onChange={this.handleSizeTow}>
              <Radio.Button value="sales">销量</Radio.Button>
              <Radio.Button value="ranking">排名</Radio.Button>
              <Radio.Button value="star">星级</Radio.Button>
              <Radio.Button value="price">价格</Radio.Button>
            </Radio.Group>
            <TimelineChart
              height={300}
              data={this.state.onlineChartTow}
              titleMap={{ y1: '客流量', y2: '支付笔数' }}
            />
          </li>
        </ul>
        <div className={styles.repContent}>
          <div className={styles.repContentTable}>
            <p className={styles.repContentTitle}>参考信息</p>
            <div>
              <div className={styles.repImg}>
                <img src={repleniData.image_urls} alt="" />
              </div>
              <div className={styles.repContentMessage}>
                <p>{repleniData.prod_name}</p>
                <p>SKU:{repleniData.sku}</p>
                <p>Asin:{repleniData.asin}</p>
              </div>
            </div>
            <Table rowKey="user_product_id" columns={columns} dataSource={dataSource} />
          </div>
          <div className={styles.parameter} style={{ paddingTop: 0 }}>
            <p className={styles.repContentTitle}>设置智能参数</p>
            <div>
              <ul>
                <li>
                  <b>销售旺季时间：</b>
                  <RangePicker
                    defaultValue={[
                      moment('2015/01/01', this.state.dateFormat),
                      moment('2015/01/01', this.state.dateFormat),
                    ]}
                    format={this.state.dateFormat}
                  />
                </li>
                <li>
                  <b>物流方式：</b>
                  <Select
                    showSearch
                    style={{ width: 200 }}
                    placeholder="Select a person"
                    optionFilterProp="children"
                    onChange={this.handleChange}
                    onFocus={this.handleFocus}
                    onBlur={this.handleBlur}
                    filterOption={(input, option) =>
                      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    <Option value="jack">Jack</Option>
                    <Option value="lucy">Lucy</Option>
                    <Option value="tom">Tom</Option>
                  </Select>
                </li>
                <li>
                  <b>促销力度：</b>
                  <Button onClick={this.decline} icon="minus" />
                  <Progress percent={this.state.percent} />
                  <Button onClick={this.increase} icon="plus" />
                </li>
                <li>
                  <b>物流时间：</b>
                  <Button onClick={this.decline} icon="minus" />
                  <Progress percent={this.state.percent1} />
                  <Button onClick={this.increase} icon="plus" />
                </li>
                <li>
                  <b>供货间隔时间：</b>
                  <Button onClick={this.decline} icon="minus" />
                  <Progress percent={this.state.percent2} />
                  <Button onClick={this.increase} icon="plus" />
                </li>
                <li>
                  <b>物流时间：</b>
                  <Button onClick={this.decline} icon="minus" />
                  <Progress percent={this.state.percent3} />
                  <Button onClick={this.increase} icon="plus" />
                </li>
                <li>
                  <b>预计到货时间：</b>
                  <Button onClick={this.decline} icon="minus" />
                  <Progress percent={this.state.percent4} />
                  <Button onClick={this.increase} icon="plus" />
                </li>
              </ul>
              <div style={{ margin: 20 }}>请根据 （在途天数） 及 （销售天数） 设置备货时间</div>
              <hr />
              <div className={styles.inventory}>
                <ul>
                  <li>
                    <b>安全库存：</b>
                    <span>200件</span>
                  </li>
                  <li>
                    <b>建议补货量：</b>
                    <span>2000件</span>
                  </li>
                  <li>
                    <b>实际补货量：</b>
                    <Input size="small" placeholder="2000" />
                    <span>件</span>
                  </li>
                </ul>
              </div>
              <div style={{ float: 'right', marginTop: 6 }}>
                <Button type="primary" onClick={this.showModal}>
                  提交补货建议
                </Button>
              </div>
            </div>
          </div>
        </div>
        <Modal
          className={styles.showModals}
          title="提交补货建议"
          visible={this.state.visible}
          onOk={this.handleOk}
          maskClosable={false}
          onCancel={this.handleCancel}
        >
          <div style={{ marginBottom: 20 }}>
            <span
              style={{ width: 100, display: 'inline-block', marginRight: 20, textAlign: 'right' }}
            >
              补货需求单号
            </span>
            <b>{this.state.reple_demand_no}</b>
          </div>
          <div>
            <span
              style={{ width: 100, display: 'inline-block', marginRight: 20, textAlign: 'right' }}
            >
              采购数量
            </span>
            <Input
              size="small"
              style={{ width: 200 }}
              placeholder="small size"
              onChange={this.myTextInput}
            />{' '}
            件
          </div>
        </Modal>
      </div>
    );
  }
}

export default Replenish;
