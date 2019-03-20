import React from 'react';
import { Table, Button } from 'antd';
import Prompt from '../../../components/Prompt';
import PermissionButton from '../../../components/PermissionButton';
import { getPageState } from '../../../utils/utils';
import { erpPost } from '../../../services/ajax';
import { getActionList } from '../../../utils/authority';
import DeleteConfirmModal from '../../../components/DeleteConfirm';
import EditComponent from './edit';
import ProductCell from '../../../components/ProductCell';

class Index extends React.Component {
  constructor(props) {
    super(props);
    const { dataSource, params } = props;
    this.state = {
      loading: true,
      dataSource,
      editComponentHidden: true,
      page: getPageState(props),
      search: {
        supplier_id: params.Get('supplier_id', 0),
      },
      editMode: true,
      detail: {},
    };
  };
  componentDidMount() {
    this.refresh();
  };
  componentDidUpdate(nextProps, nextState){
    if(
      nextState.page.current !== this.state.page.current ||
      nextState.page.pageSize !== this.state.page.pageSize
    ){
      this.refresh();
    }
  };
  refresh = () => {
    this.setState({ loading: true });
    const { page, search } = this.state;
    const params={
      page,
      ...search,
    };
    erpPost('supplier/product/index', params, res => {
      this.setState({
        dataSource: res.data.data,
        page: res.data.page,
        loading: false,
      });
    });
  };
  handleShowAddModel = () => {
    this.setState({
      editMode: false,
      editComponentHidden: false,
    });
  };
  handleShowEditModel = (val) => {
    this.setState({
      editMode: true,
      detail: val,
      editComponentHidden: false,
    });
  };
  handleDelete = id => {
    erpPost('supplier/product/delete',{ product_supplier_id:id }, res=>{
      Prompt.success({content: res.data.msg });
      this.refresh();
    });
  };
  handleAddClose = () => {
    this.refresh();
    this.setState({
      editComponentHidden: true,
    });
  };
  handleTableChange = (page, filters, sorte) => {
    this.setState({
      page,
    });
  };
  renderTable = () => {
    const { dataSource, loading, page } = this.state;
    const columns = [{
      title: '产品信息',
      dataIndex: 'product',
      render:(text,val)=> {
        return (
          <ProductCell
            product_no={val.product_no}
            title={val.title}
            image_url={val.image_url}
            product_sku={val.product_sku}
            category={val.category}
          />
        )
      },
    }, {
      title: '单价（CNY）',
      dataIndex: 'cost',
      className: 'width180',
      align: 'right',
      render: (text) => {
        return text.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      },
  }, {
      title: '操作',
      dataIndex: 'action',
      className: 'width180',
      render: (text, val) => {
        return (
          <div>
            <PermissionButton
              type="primary"
              ghost
              style={{marginRight:10}}
              size='small'
              onClick={this.handleShowEditModel.bind(this, val)}
              action="supplier/product/edit"
            >
              编辑
            </PermissionButton>
            <DeleteConfirmModal content='确认将该供应产品从供应商中移除？' onOk={this.handleDelete.bind(this, val.id)}>
              <Button
                size="small"
                type="primary"
                className="buttonDel"
                ghost
                action="supplier/product/delete"
              >
                删除
              </Button>
            </DeleteConfirmModal>
          </div>
        );
      },
      },
    ];

    return (
      <Table
        rowKey='id'
        className='table-one-line'
        dataSource={dataSource}
        columns={columns}
        pagination={page}
        loading={loading}
        onChange={this.handleTableChange}
      />
    );
  };
  render() {
    const { editComponentHidden, search, editMode, detail } = this.state;

    const actionList = JSON.parse(getActionList());
    if(
      toString.call(actionList) === '[object Array]' &&
      actionList.indexOf('supplier/product/index') <= -1
    ) return "";

    return (
      <div className="paymentModule">
        <div className="moduleTitle">
          <h3 style={{ float: 'left' }}>供应产品列表</h3>
          <span style={{float:'right'}}>
            <PermissionButton
              type="primary"
              size='small'
              onClick={this.handleShowAddModel}
              action="supplier/product/add"
            >
              添加
            </PermissionButton>
          </span>
        </div>
        <div className="ant-advanced-search-form">
          { this.renderTable() }
          {editComponentHidden === true ? ('') : (
            <EditComponent
              params={new URLSearchParams({
                supplier_id: search.supplier_id,
              })}
              detail={detail}
              onClose={this.handleAddClose}
              editMode={editMode}
            />
          )}
        </div>
      </div>
    );
  };
};
export default Index;
