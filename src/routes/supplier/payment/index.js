import React from 'react';
import { Table, Button } from 'antd';
import Prompt from '../../../components/Prompt';
import PermissionButton from '../../../components/PermissionButton';
import { erpPost } from '../../../services/ajax';
import { getActionList } from '../../../utils/authority';
import DeleteConfirmModal from '../../../components/DeleteConfirm';
import AddComponent from './add';

require('../../../utils/utils');

class Index extends React.Component {
  constructor(props) {
    super(props);
    const { dataSource, params } = props;
    this.state = {
      supplierId: params.Get('supplier_id', 0),
      dataSource,
      addComponentHidden: true,
    };
  };
  componentWillReceiveProps = (nextProps) => {
    this.setState({
      supplierId: nextProps.params.Get('supplier_id', 0),
      dataSource: nextProps.dataSource,
    });
  };
  refresh = () => {
    this.props.refresh();
  };
  handleShowAddModel = () => {
    this.setState({
      addComponentHidden: false,
    });
  };
  handleDelete = id => {
    erpPost('supplier/payment/delete',{ id }, res=>{
      Prompt.success({content: res.data.msg });
      this.refresh();
    });
  };
  handleAddClose = () => {
    this.refresh();
    this.setState({
      addComponentHidden: true,
    });
  };
  renderTable = () => {
    const { dataSource, loading } = this.state;
    const columns = [{
      title: '开户行',
      dataIndex: 'bank_name',
    }, {
      title: '银行账号',
      dataIndex: 'bank_no',
    }, {
      title: '开户人姓名',
      dataIndex: 'account',
    }, {
      title: '操作',
      dataIndex: 'action',
      className: 'width180',
        render: (text, val) => {
          return (
            <DeleteConfirmModal
              content='确认删除该支付信息？'
              onOk={this.handleDelete.bind(this, val.id)}
              action="supplier/payment/delete"
            >
              <Button
                size="small"
                type="primary"
                className="buttonDel"
                ghost
              >
                删除
              </Button>
            </DeleteConfirmModal>
          );
        },
      },
    ];

    return (
      <Table
        rowKey='id'
        pagination={false}
        className='table-one-line'
        dataSource={dataSource}
        columns={columns}
        loading={loading}
        onChange={this.onTableChange}
      />
    );
  };
  render() {
    const { addComponentHidden, supplierId } = this.state;

    const actionList = JSON.parse(getActionList());
    if(
      toString.call(actionList) === '[object Array]' &&
      actionList.indexOf('supplier/payment/index') <= -1
    ) return "";

    return (
      <div className="paymentModule">
        <div className="moduleTitle">
          <h3 style={{ float: 'left' }}>支付信息</h3>
          <span style={{float:'right'}}>
            <PermissionButton
              type="primary"
              size='small'
              onClick={this.handleShowAddModel}
              action="supplier/payment/add"
            >
              添加
            </PermissionButton>
          </span>
        </div>
        <div className="ant-advanced-search-form">
          { this.renderTable() }
          {addComponentHidden === true ? ('') : (
            <AddComponent
              params={new URLSearchParams({ supplier_id: supplierId })}
              onClose={this.handleAddClose}
            />
          )}
        </div>
      </div>
    );
  };
};
export default Index;
