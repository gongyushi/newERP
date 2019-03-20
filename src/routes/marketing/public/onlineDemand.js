import React from 'react';
// import { TimelineChart } from 'ant-design-pro/lib/Charts';
import { DatePicker, Radio } from 'antd';
import moment from 'moment';
import { TimelineChart } from 'components/Charts';
import styles from '../onlineProducts.less';
import onlineImg from '../../../assets/1.jpg';
import { erpPost } from '../../../services/ajax';

const { RangePicker } = DatePicker;
class OnlineDemand extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      trendOne: 'sales',
      trendDetailData: '',
      onlineChartData: [
        {
          x: 0,
          y1: 0,
        },
      ],
      dateFormat: 'YYYY/MM/DD',
      // monthFormat :'YYYY/MM',
    };
  }
  componentWillMount() {
    this.handTrendOne('sales');
    this.trendDetail();
  }
  handleSizeChange = e => {
    this.setState({ trendOne: e.target.value });
    this.handTrendOne(e.target.value);
  };
  // 趋势分析详情
  trendDetail = () => {
    erpPost('product/online/view', { user_product_id: this.props.id }, res => {
      this.setState({
        trendDetailData: res.data.data,
      });
    });
  };
  // 趋势分析One接口
  handTrendOne = a => {
    const can = {
      asin: this.props.asin,
      from_created_at: '2010-01-01',
      to_created_at: '2019-10-01',
    };
    if (a === 'sales') {
      erpPost('product/trend', can, res => {
        this.setState({
          onlineChartData: res.data.data,
        });
      });
    } else if (a === 'ranking') {
      erpPost('product/trend/sale', { ...can, type: '2' }, res => {
        this.setState({
          onlineChartData: res.data.data,
        });
      });
    } else if (a === 'star') {
      erpPost('product/trend/sale', { ...can, type: '3' }, res => {
        this.setState({
          onlineChartData: res.data.data,
        });
      });
    } else if (a === 'price') {
      erpPost('product/trend/sale', { ...can, type: '1' }, res => {
        this.setState({
          onlineChartData: res.data.data,
        });
      });
    }
  };
  render() {
    const { trendOne, trendDetailData } = this.state;
    return (
      <div className={styles.onlineDemand}>
        <div className={styles.demandTop}>
          <div className={styles.demandTopLeft}>
            <img src={onlineImg} alt="" />
          </div>
          <div className={styles.demandTopRight}>
            <p>YONOVO Kids Backpack with Leash Insulated Lunch Bag for Boys Gi</p>
            <table>
              <tbody>
                <tr>
                  <td>SKU</td>
                  <td>{trendDetailData.sku}</td>
                  <td>Asin</td>
                  <td>{trendDetailData.asin}</td>
                </tr>
                <tr>
                  <td>站点</td>
                  <td>{trendDetailData.pro_website}</td>
                  <td>店铺</td>
                  <td>{trendDetailData.sto_name}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <Radio.Group value={trendOne} onChange={this.handleSizeChange}>
            <Radio.Button value="sales">销量</Radio.Button>
            <Radio.Button value="ranking">排名</Radio.Button>
            <Radio.Button value="star">星级</Radio.Button>
            <Radio.Button value="price">价格</Radio.Button>
          </Radio.Group>
        </div>
        <div className={styles.chart}>
          <RangePicker
            defaultValue={[
              moment('2015/01/01', this.state.dateFormat),
              moment('2015/01/01', this.state.dateFormat),
            ]}
            format={this.state.dateFormat}
          />
          <TimelineChart
            height={300}
            data={this.state.onlineChartData}
            titleMap={{ y1: '客流量', y2: '支付笔数', y3: 'ssdsd' }}
          />
        </div>
      </div>
    );
  }
}

export default OnlineDemand;
