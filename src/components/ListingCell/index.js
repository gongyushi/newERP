import React, { PureComponent } from 'react';
import { Tooltip, Row, Col, Icon } from 'antd';
import styles from './index.less';

/**
 * Listing 列表中的信息单元格
 * example:
 <ListingCell
 title="this title"
 image_url="http://erp.local.cn/a.jpg"
 seller_sku="this seller_sku"
 category=[]
 ></ListingCell>
 *
 * @author : wenjie.bao
 */
export default class ListingCell extends PureComponent {

  state = {
  };

  render() {
    const categoryArr = [];
    this.props.category && this.props.category.map(value => {
      categoryArr.push(value.name)
      return categoryArr;
    });
    const category = categoryArr.length ? categoryArr.join(">") : '--';
    const cate = this.props.category && this.props.category[this.props.category.length - 1] && this.props.category[this.props.category.length - 1].name || '--';
    const tips = (
      <div>
        <div>ASIN：{this.props.asin ? this.props.asin : '--'}</div>
        <div>SellerSKU：{this.props.seller_sku ? this.props.seller_sku : '--'}</div>
        <div>商品名称：{this.props.title ? this.props.title : '--'}</div>
        <div>商品分类：{category}</div>
      </div>
    );
    return (
      <div>
        <Row style={{display:'flex',alignItems:'center'}}>
          <Col className={styles.imgCol} span={4}>
            <div className={styles.imgDiv}>
              {this.props.image_url ? <img src={this.props.image_url} alt="商品图片" /> : <svg viewBox="100 100 800 800" width="55" height="55"><path fill="#81d4fa" d="M832 128H192c-35.2 0-64 28.8-64 64v640c0 35.2 28.8 64 64 64h640c35.2 0 64-28.8 64-64V192c0-35.2-28.8-64-64-64zM717.6 525.8C703.1 626.4 616.6 704 512 704c-104.5 0-191.1-77.6-205.6-178.2-19.8-5.9-34.4-24.1-34.4-45.8 0-26.5 21.5-48 48-48s48 21.5 48 48c0 20-12.2 37-29.5 44.3C352.1 607.9 424.6 672 512 672s159.9-64.1 173.5-147.7C668.2 517 656 500 656 480c0-26.5 21.5-48 48-48s48 21.5 48 48c0 21.7-14.6 39.9-34.4 45.8zM848 240c0 17.6-14.4 32-32 32H208c-17.6 0-32-14.4-32-32v-32c0-17.6 14.4-32 32-32h608c17.6 0 32 14.4 32 32v32z"></path></svg>}
            </div>
          </Col>
          <Col span={20} className={styles.txtDiv}>
            <Tooltip
              placement="bottom"
              title={tips}
            >
              <div style={{cursor:'pointer'}} onClick={this.props.onTurn && this.props.onTurn}>{this.props.asin ? this.props.asin : '--'}</div>
              <div>{this.props.seller_sku ? this.props.seller_sku : '--'}</div>
              <div>{this.props.title ? this.props.title : '--'}</div>
              <div>{cate}</div>
            </Tooltip>
          </Col>
        </Row>
      </div>
    )
  }
}
