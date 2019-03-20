import React from 'react';
import { Table, Card } from 'antd';
import { erpPost } from '../../../services/ajax';

export default class PurOperationLog extends React.Component {
  state = {
    opeColumns: [],
    opeList: [],
    id: this.props.purchase_id,
    page: {
      pageSize: 5,
      total: 0,
      current: 1,
      showSizeChanger: true,
    },
  };
  componentDidMount(){
    const { page } = this.state;
    this.initColumns();
    this.getList({page});
  }

  getList = (page) => {
    const { id } = this.state;
    erpPost('purchase/log/index',{purchase_id: id,...page}, res => {
      this.setState({
        opeList: res.data.data,
        page: res.data.page,
      });
    });
  }

  initColumns = () => {
    const opeColumns = [
      {
        title: '操作类型',
        dataIndex: 'type',
        key: 'type',
      },
      {
        title: '操作人员',
        dataIndex: 'real_name',
        key: 'real_name',
      },
      {
        title: '操作时间（UTC）',
        dataIndex: 'created_at',
        key: 'created_at',
      },
      {
        title: '内容',
        dataIndex: 'content',
        key: 'content',
      },
    ];
    this.setState({opeColumns});
  }
  handleTableChange = (page) => {
    this.getList({page});
  }
  render() {
    const {opeColumns, opeList, page} = this.state;
    return (
      <div>
        <div className='cardHeadStyle'>
          <Card title='操作日志'  bordered={false}>
            <div>
              <Table 
                columns={opeColumns} 
                dataSource={opeList} 
                rowKey='id' 
                pagination={page} 
                onChange={this.handleTableChange}
              />
            </div>
          </Card>
        </div>
      </div>
    );
  }
}