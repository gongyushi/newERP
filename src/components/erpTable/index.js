import React from 'react';
import { Table } from 'antd';
import styles from './index.less';

class ErpTable extends React.Component {
  // 初始数据
  state = {
    // columns: this.props.columns,
    data: this.props.data,
    selectedRowKeys: [],
    // tableInput: true,
    // loading: false,
  };
  componentWillMount() {
    this.state.data.map((res, index) => {
      res.key = index;
      return 1;
    });
  }
  onSelectChange = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  };
  start = () => {
    setTimeout(() => {
      this.setState({
        selectedRowKeys: [],
      });
    }, 1000);
  };
  tableInputFun = () => {};
  // 渲染页面
  render() {
    const { selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    return (
      <div className={styles.erpTable}>
        <Table
          bordered
          onChange={this.props.onChange}
          pagination={this.props.pagination}
          rowSelection={this.props.rowSelection ? { rowSelection } : ''}
          columns={this.props.columns}
          dataSource={this.props.data}
        />
      </div>
    );
  }
}

export default ErpTable;
