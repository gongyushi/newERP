import React from 'react';
import { Table, Tabs, Form, Button } from 'antd';
import { erpPost } from '../../services/ajax';
import SearchBar from '../../components/SearchBar';

require('../ListStyle.less');

const { TabPane } = Tabs;

/* 把from添加天props里 */

@Form.create()
class Inventory extends React.Component {
  constructor(props) {
    super(props);
    this.newTabIndex = 0;
    this.state = {
      panes: [],
      dataSource: [],
      columns: [
        {
          title: '产品图片',
          dataIndex: 'image_urls',
          key: 'image_urls',
          render: text => (
            <img src={text} alt="商品图片" style={{ width: '50px', border: '1px solid #dcdcdc' }} />
          ),
        },
        {
          title: '产品名称',
          dataIndex: 'prod_name',
          key: 'prod_name',
        },
        {
          title: 'SKU',
          dataIndex: 'sku',
          key: 'sku',
        },
        {
          title: '颜色',
          dataIndex: 'color',
          key: 'color',
        },
        {
          title: '尺码',
          dataIndex: 'size',
          key: 'size',
        },
        {
          title: '仓库',
          dataIndex: 'wh_name',
          key: 'wh_name',
        },
        {
          title: '采购在途仓库',
          dataIndex: 'onPassage',
          key: 'onPassage',
        },
        {
          title: '可销售库存',
          dataIndex: 'marketability',
          key: 'marketability',
        },
        {
          title: '良品',
          dataIndex: 'good_num',
          key: 'good_num',
        },
        {
          title: '不良品',
          dataIndex: 'bad_num',
          key: 'bad_num',
        },
      ],
    };
    // const panes = [{ title: '库存清单', content: this.renderProInfo(), key: '1', closable: false }];
    // this.state = {
    //   activeKey: panes[0].key,
    //   panes,
    // };
  }
  componentDidMount() {
    erpPost('stock/index', {}, res => {
      this.setState({
        dataSource: res.data.data,
      });
      this.mounting();
    });
  }

  onChange = activeKey => {
    this.setState({ activeKey });
  };
  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };

  // 页码
  onTableChange = (pageNumber, filters, sorte) => {
    const order = [];
    order.push({ field: sorte.field, order: sorte.order });
    this.userManageList(pageNumber, order);
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
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields(err => {
      if (!err) {
        // console.log('Received values of form: ', values);
      }
    });
  };
  mounting = () => {
    let { panes } = this.state;
    if (panes.length === 0) {
      panes = [{ title: '库存清单', content: this.renderProInfo(), key: '1', closable: false }];
    } else {
      panes[0].content = this.renderProInfo();
    }
    const activeKey = panes[0].key;
    this.setState({
      activeKey,
      panes,
    });
  };
  /**
   * 渲染表格
   * @param {Object} dataSource 表行
   * @param {Object} columns 表头
   */
  renderProInfo = () => {
    const { dataSource, columns } = this.state;
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name,
      }),
    };
    return (
      <div className="proDataWrap">
        <SearchBar />
        <div style={{ marginBottom: '10px' }}>
          <Button type="primary" className="marginR">
            导出
          </Button>
        </div>
        <Table
          rowKey="stock_id"
          dataSource={dataSource}
          columns={columns}
          rowSelection={rowSelection}
        />
      </div>
    );
  };
  render() {
    return (
      <Tabs
        hideAdd
        className="productVariants"
        onChange={this.onChange}
        activeKey={this.state.activeKey}
        type="editable-card"
        onEdit={this.onEdit}
      >
        {this.state.panes.map(pane => (
          <TabPane
            tab={pane.title}
            key={pane.key}
            closable={pane.closable}
            className="proTabs"
            style={{ marginBottom: '0px' }}
          >
            {pane.content}
          </TabPane>
        ))}
      </Tabs>
    );
  }
}
export default Inventory;
