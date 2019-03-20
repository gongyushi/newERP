import React from 'react';
import { Form, TreeSelect, Button, Select, Table, Modal, Icon, message } from 'antd';
import ErpSearch from './erpSearch';
import { erpPost } from '../../../services/ajax';
import ListingCell from '../../../components/ListingCell';
import Prompt from '../../../components/Prompt';

const { TreeNode } = TreeSelect;
const { Option } = Select;
const FormItem = Form.Item;

require('../bonus.less');

class Demo extends React.Component {
  state = {
    page: {
      pageSize: 10, // 每页显示条数
      total: 0, // 总页数
      current: 1, // 当前页数
      showSizeChanger: true,
    },
    visible: false, 
    selectedRowKeys: [],  // 商品列表复选框
    prodId:0,
    store_ids: [], // 选中的id
    loadingTable: false,
    condition: {
      store_id: null,
      type: null,
      content: null,
      category: null,
    },
    personList: [], // 所有人员列表
    loading: false, 
  };
  componentDidMount() {
    this.productListing(this.state.page, this.state.condition);
  }
  // 页码
  onTableChange = (pageNumber) => {
    this.productListing(pageNumber, this.state.condition);
  };
  getPersonList = (store_id) => {
    erpPost('organization/person/index',{store_id},res => {
      this.setState({
        personList: res.data.data,
      });
    });
  }
  // 添加
  handleSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log(values)
        values.position = this.state.station;
        values.real_name = this.state.personName;
      } else {
        Prompt.error();
      }
    });
  };
  // 商品列表
  productListing = (pageNumber, condition) => {
    condition.page = pageNumber;
    erpPost('listing/index', condition, res => {
      this.setState({
        prodSetData: res.data.data,
        page: res.data.page,
        loadingTable: false,
      });
    }, () => {
      this.setState({
        prodSetData: [],
        loadingTable: false,
        page: {
          pageSize: 10, // 每页显示条数
          total: 0, // 总页数
          current: 1, // 当前页数
          showSizeChanger: true,
        },
      });
    });
  };
  // 搜索
  search=(value)=>{
    this.setState({
      condition: value,
    });
    this.productListing(this.state.page, value);
  }
  // 弹框
  showModal = () => {
    const { selectedRowKeys, prodSetData } = this.state;
    let storeList = prodSetData.map(val => val.store_id);
    storeList = storeList.filter((val,idx) => selectedRowKeys.indexOf(idx) !== -1);
    storeList = storeList.filter((val,idx,self) => self.indexOf(val) === idx);
    if(storeList.length > 1){
      Prompt.warning({content:'请选择同一商铺商品进行分配'});
      return ;
    }
    if (selectedRowKeys.length>0){
      this.setState({
        visible: true,
        prodId:0,
      });
      this.getPersonList(storeList[0]);
    }else{
      Prompt.warning({content:'请选择需要分配的商品'});
    }
  }

  handleOk = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          loading: true,
        });
        console.log(values, this.state.store_ids);
        if (this.state.prodId === 0) {
          values.listing_ids = this.state.store_ids.join(',');
          erpPost('commission/listing/batch-deploy', values, () => {
            Prompt.success();
            this.productListing(this.state.page, this.state.condition);
            this.setState({
              visible: false,
              loading: false,
              selectedRowKeys:[],
            });
          },() => {
            Prompt.error();
            this.setState({
              loading: false,
            });
          })
        } else {
          values.listing_id = this.state.prodId;
          erpPost('commission/listing/deploy', values, () => {
            Prompt.success();
            this.productListing(this.state.page, this.state.condition);
            this.setState({
              visible: false,
            });
          },() => {
            Prompt.error();
            this.setState({
              loading: false,
            });
          });
        }
      } 
    });
  }

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  }
  handleOpenModal = (prodId,storeId) => {
    this.setState({
      visible: true,
      prodId,
    });
    this.getPersonList(storeId);
  }
  // 组织架构-结构
  renderTreeNodes = data => {
    return data.map((item) => {
      return (
        <TreeNode
          title={`${item.org_name} ${item.id}`}
          value={item.id}
          // arr={item}
          key={item.enter_no ? item.enter_no : item.org_no}
        >
          {item.children ? this.renderTreeNodes(item.children) : null}
        </TreeNode>
      );
    });
  };
  render() {
    const { prodSetData, 
      page, 
      loadingTable,
      personList,
      loading} = this.state;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys,selectedRows) => {
        this.setState({
          selectedRowKeys,
          store_ids: selectedRows.map(val => val.id),
        });
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name,
      }),
    };
    const prodSetColumns = [
      {
        title: '商品信息',
        dataIndex: 'prod_name',
        key: 'prod_name',
        width: 350,
        render: (value,record) => (
          <ListingCell
            image_url={record.image_url}
            title={record.title}
            seller_sku={record.seller_sku}
            category={record.category}
            asin={record.asin}
          />
        ),
      },
      {
        title: '店铺',
        dataIndex: 'store_name',
        key: 'store_name',
        width: 100,
        render:(text,val)=>{
          return (
            <div>
              {val.store?val.store.store_name:null}
            </div>
          );
        },
      },
      {
        title: '销售人员',
        dataIndex: 'real_name',
        key: 'real_name',
        width: 100,
        render: (text, val) => (
          <div>
            {val.seller?val.seller.real_name :null}
          </div>
        ),
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        width: 200,
        render:(text,val)=>(
          <div>
            <Button type='primary' ghost size='small' onClick={this.handleOpenModal.bind(this,val.id,val.store_id)}>
              分配人员
            </Button>
          </div>
        ),
      },
    ];
    return (
      <div className='shopDeploy'>
        <ErpSearch search={this.search} />
        <div style={{marginBottom:10}}>
          <Button 
            type="primary" 
            size='small'
            onClick={this.showModal}
          >
            批量分配
          </Button>
        </div>
        <div>
          <Table
            onChange={this.onTableChange}
            loading={loadingTable}
            rowKey='id'
            dataSource={prodSetData}
            pagination={page}
            columns={prodSetColumns}
            rowSelection={rowSelection}
          />
        </div>
        <Modal
          title="分配人员"
          visible={this.state.visible}
          onOk={this.handleOk}
          destroyOnClose='true'
          onCancel={this.handleCancel}
          loading={loading}
          maskClosable={false}
        >
          <Form>
            <FormItem
              {...formItemLayout}
              label="销售人员"
            >
              {getFieldDecorator('person_id', {
                rules: [
                  { required: true, message: '请选择人员' },
                ],
              })(
                <Select
                  className='width200'
                  placeholder="请选择人员"
                  showSearch
                  optionFilterProp="children"
                >
                  {personList && personList.length > 0 && personList.map((val) => {
                    return (
                      <Option key={val.id} value={val.id}>{val.real_name}</Option>
                    )
                  })}
                </Select>
              )}
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}
const ShopDeploy = Form.create()(Demo);
export default ShopDeploy;
