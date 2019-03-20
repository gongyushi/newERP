import React from 'react';
import { Form, Input, Button, Tree } from 'antd';
import { erpPost } from '../../services/ajax';
import Prompt from '../../components/Prompt';

require('./common.less');

const { TreeNode } = Tree;
const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 12 },
  wrapperCol: { span: 12 },
};
const formTreeLayout = {
  labelCol: { span: 2 },
  wrapperCol: { span: 20 },
};

class AddNewRoleRule extends React.Component {
  state = {
    checkedKeys: [],
    selectedKeys: [],
    loading: false,
    treeData: [],
    activeKey: this.props.activeKey,
    search: {
      id: this.props.params.Get('id',undefined),
    },
  };
  componentDidMount() {
    this.getRoleDetail();
  }
  componentWillReceiveProps(nextProps){
    if(
      nextProps.activeKey === this.state.activeKey &&
      nextProps.refreshKeys.indexOf(this.state.activeKey) > -1
    )
    {
      // 切换页签， 重载数据
      this.getRoleDetail();
      // 删除 refreshKey
      this.props.onRemoveRefreshKey(this.state.activeKey);
    }
  }
  // 树形控件选中（点击树）
  onSelect = (selectedKeys) => {
    this.setState({ selectedKeys });
  };
  // 获取权限列表
  getPerList = () => {
    erpPost('permission/index', {}, res => {
      this.setState({
        treeData: res.data.data,
      });
      
    });
  }
  // 获取角色详情
  getRoleDetail = () => {
    const { search } = this.state;
    if(search.id === '0'){
      this.getPerList();
    }else{
      erpPost('role/view', { ...search }, res => {
        const obj = {
          role_name: res.data.data.role_name,
        };
        this.props.form.setFieldsValue(obj);
        this.setState({
          checkedKeys: res.data.data.per_ids,
        });
        this.getPerList();
      });
    }
  };

  // 树形控件选中（点击控件）
  handleCheck = checkedKeys => {
    this.setState({ checkedKeys });
  };
  // 保存
  submit = () => {
    const { activeKey } = this.state;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          loading: true,
        });
        values.per_ids = this.state.checkedKeys.join(';');
        if (this.state.search.id === '0') {
          //  创建角色 和编辑
          erpPost('role/add', values, () => {
            Prompt.success();
            this.setState({
              loading: false,
            });
            this.props.handleRemove(activeKey);
          });
        } else {
          values.id = this.props.roleId;
          erpPost('role/edit', values, () => {
            Prompt.success();
            this.setState({
              loading: false,
            });
            this.props.handleRemove(activeKey);
          });
        }
      }
    });
  };


  renderTreeNodes = data => {
    return data.map(item => {
      if (item.children.length!==0) {
        return (
          <TreeNode 
            title={item.title} 
            className={item.hidden === 1 ? 'hidden' : 'clearBoth'}
            key={item.value} 
            dataRef={item}
          >
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return (
        <TreeNode 
          title={item.title} 
          key={item.value} 
          dataRef={item} 
          className={item.hidden === 1 ? 'hidden' : 'tree-leaf'}
        />
      );
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { loading, treeData, search, checkedKeys } = this.state;
    return (
      <div className="tabs-form-wrapper">
        <div style={{display:'flex',justifyContent:'space-between'}}>
          <FormItem {...formItemLayout} label="角色名称">
            {getFieldDecorator('role_name', {
              rules: [
                {
                  required: true,
                  message: '请输入角色名称',
                },
              ],
            })(<Input placeholder="请输入角色名称" className="input-Width200" />)}
          </FormItem>
        </div>
        <div>
          {
            treeData.length > 0 && (
              <FormItem {...formTreeLayout} label="功能权限">
                <div className='tree-style'>
                  {getFieldDecorator('per_ids',{
                    initialValue: checkedKeys,
                  })(
                    <Tree
                      checkable
                      onCheck={this.handleCheck}
                      checkedKeys={this.state.checkedKeys}
                      onSelect={this.onSelect}
                      selectedKeys={this.state.selectedKeys}
                      defaultExpandAll
                      className='role'
                    >
                      {this.renderTreeNodes(treeData)}
                    </Tree>
                  )}
                </div>
              </FormItem>
            )
          }
          <div style={{display:'flex',justifyContent:'center'}}>
            <Button type="primary" loading={loading} onClick={this.submit} style={{ marginRight: '20px' }}>
              保存
            </Button>
            <Button type="primary" onClick={this.close}>
              取消
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
const AddNewRole = Form.create()(AddNewRoleRule);
export default AddNewRole;
