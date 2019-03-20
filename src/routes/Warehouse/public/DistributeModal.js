import React from 'react';
import { Button, Form, Modal, Table, message, Tooltip, Input, Select } from 'antd';

const FormItem = Form.Item;
const { Option } = Select;

class DistributeModal extends React.Component {
  state = {
    list: [],
    columns: [],
    visible: false,
    id: this.props.id,
    loading: false,
    selectData: [],
    selectedRowKeys: [],
  };
  componentDidMount() {
    this.initColumns();
    this.getList();
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      visible: nextProps.visible,
      id: nextProps.id,
    });
    // this.getList();
  }
  onSearch = () => {
    this.props.form.getFieldsValue((err,values) => {
      if(!err){
        console.log(values);
      }
    });
  }
  getList = () => {
    const { id } = this.state;
    // 根据id获取数据
    const list = [
      {
        id: '01',
        storeNo: 'FBA4Q9BL3H',
        name: 'FBA (5/9/17 11:25 PM) - 1',
        store: '美国分店',
        state: '已完成',
      },
    ];
    this.setState({ list });
  }
  initColumns = () => {
    const columns = [
      {
        title: '配送入库编号',
        dataIndex: 'storeNo',
        key: 'storeNo',
      },
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '店铺',
        dataIndex: 'store',
        key: 'store',
      },
      {
        title: '目标配送中心ID',
        dataIndex: 'targetId',
        key: 'targetId',
      },
      {
        title: '已发货（件）',
        dataIndex: 'diliverNum',
        key: 'diliverNum',
      },
      {
        title: '已收货（件）',
        dataIndex: 'receiveNum',
        key: 'receiveNum',
      },
      {
        title: '状态',
        dataIndex: 'state',
        key: 'state',
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        render: (value,record) => (
          <Button type='primary' ghost size='small' onClick={this.skipToDetail.bind(this,record.id)}>
            详情
          </Button>
        ),
      },
    ];
    const selectData = [
      {
        name: '全部',
        value: '0',
      },
      {
        name: '美国分店',
        value: '1',
      },
      {
        name: '加拿大分店',
        value: '2',
      },
      {
        name: '日本分店',
        value: '3',
      },
    ];
    this.setState({ columns, selectData });
  }
  skipToDetail = () => {
    message.info('跳转去详情',1);
  }
  handleClose = () => {
    if (this.props.onClose) {
      this.props.onClose('modalVisible');
    }
    this.setState({
      loading: false,
    });
  }
  handleSubmit = () => {
    message.success('入库成功', 1);
    // 表格多选项
    console.log(this.state.selectedRowKeys);
    this.setState({
      loading: true,
    });
    this.handleClose();
  }
  handleSelectChange = (selectedRowKeys,selectRows) => {
    this.setState({selectedRowKeys});
    console.log(selectedRowKeys,selectRows)
  }
  render() {
    const { list, columns, visible, loading, selectData, selectedRowKeys } = this.state;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 6},
    };
    return (
      <Modal
        title='配送入库清单'
        visible={visible}
        onCancel={this.handleClose}
        maskClosable={false}
        centered
        width='800px'
        footer={[
          <Button 
            type='primary' 
            ghost
            key='back' 
            onClick={this.handleClose}
          >
            返回
          </Button>,
          <Button 
            type='primary' 
            key='inStore' 
            onClick={this.handleSubmit}
            loading={loading}
          >
            确定
          </Button>,
        ]}
      >
        <div>
          <Form layout='inline'>
            <FormItem label='配送入库单' {...formItemLayout} >
              {
                getFieldDecorator('storeNo')(
                  <Input style={{width:200, marginRight:16}} placeholder='请输入' />
                )
              }
            </FormItem>
            <FormItem label='店铺' {...formItemLayout}>
              {
                getFieldDecorator('store')(
                  <Select style={{width:200}}>
                    {
                      selectData.map(val => {
                        return (<Option key={val.value}>{val.name}</Option>)
                      })
                    }
                  </Select>
                )
              }
            </FormItem>
            <Button
              type="primary"
              style={{position:'relative',top:4, marginLeft:10}}
              onClick={this.onSearch}
              size='small'
            >
              搜索
            </Button>
          </Form>
          <Table 
            dataSource={list} 
            columns={columns} 
            pagination={false} 
            rowKey='id' 
            rowSelection={{selectedRowKeys,onChange: this.handleSelectChange}}
          />
        </div>
      </Modal>
    );
  }
}

export default Form.create()(DistributeModal);