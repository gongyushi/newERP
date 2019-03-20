import React, { PureComponent } from 'react';
import { Input, Select, TreeSelect, DatePicker, Form } from 'antd';
import moment from 'moment';
// import styles from './index.less';
import Action from '../Action';
import TimeCel from '../Time';

require('./index.less');

// const {RangePicker} = DatePicker;

const { Option } = Select;
const { TreeNode } = TreeSelect;
// const { RangePicker } = DatePicker;
// const FormItem = Form.Item;

class WrappedApp extends PureComponent {
  state = {
    value: this.props.value,
    treeValue: this.props.orgId,
    type: this.props.type,
    name:this.props.name,
    // id:this.props.id,
    editable: this.props.editable,
    option: [
      { key: '1', value: '人事部' },
      { key: '2', value: '技术部' },
      { key: '3', value: '销售部' },
      { key: '4', value: '营销部' },
    ],
  };

  componentWillReceiveProps(val) {
    this.setState({
      editable: val.editable,
    });
    // if (val.saveState && typeof this.props.onCellChange==='function') {
    //    this.props.onCellChange(this.props.id, this.props.name,this.state.value)
    // }
  }

  // componentDidUpdate() {
  //   if (typeof this.props.onRef === 'function') {
  //     this.props.onRef(this);
  //   }
  //   // this.props.onRef(this)
  // }
  // 输入框
  onChange = e => {
    const { value } = e.target;
    // this.props.onCellChange(this.props.id, this.props.name,value)
    this.setState({ value });
    if (this.props.onChange) {
      this.props.onChange(this.state.name,value);
    }
  };
  handleTreeChange = value => {
    if(value){
      this.setState({ treeValue: value });
      if (this.props.onChange) {
        this.props.onChange(this.state.name,value);
      }
    }
   
  }
  myName = () => {
    const obj = {
      name: this.props.name,
      value: this.state.value,
    };
    if(this.state.type === 'select'){
      obj.value = this.state.treeValue;
    }
    return obj;
  };
  // 下拉选项
  handleChange = e => {
    this.setState({ value: e });
  };
  timeChange = (dates, val) => {
    this.setState({ value: val });
    if (this.props.onChange) {
      this.props.onChange(this.state.name,val);
    }
  };
  // check = () => {
  //   this.setState({ editable: false });
  //   if(this.props.type === 'select'){
  //     if (this.props.onChange) {
  //       this.props.onChange(this.state.name,this.state.treeValue);
  //     }
  //   }
  // }
 
  edit = () => {
    this.setState({ editable: true });
  };
  renderTreeNodes = data => {
    return data.map(item => {
      if ('children' in item) {
        return (
          <TreeNode title={item.org_name} value={item.id} key={item.id} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode title={item.org_name} value={item.id} key={item.id} dataRef={item} />;
    });
  };
  render() {
    const { value, editable, type, option } = this.state;
    const dateFormat = 'YYYY-MM-DD';
    return (
      <div className="editableRow">
        {editable ? (
          <div className="wrapper">
            {type === 'input' ? (
              <Input value={value} style={{ height: 26, width: 100 }} onChange={this.onChange} />
            ) : type === 'time' ? (
              <DatePicker
                defaultValue={moment(value, dateFormat)}
                format={dateFormat}
                onChange={this.timeChange}
              />
            ) : (
              <TreeSelect
                showSearch
                style={{ width: 200 }}
                value={String(this.state.treeValue)}
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                placeholder="Please select"
                treeDefaultExpandAll
                onChange={this.handleTreeChange}
              >
                {this.renderTreeNodes(this.props.treeData)}
              </TreeSelect>
            )}
            {/* <Icon type="check" className={styles.icon} onClick={this.check} /> */}
          </div>
        ) : (
          <div className="wrapper">
            {type === 'time' ? (
              <TimeCel date={this.props.value} />
            ) : (
              <p style={{ textAlign: 'center' }}>{this.props.value}</p>
            )}
            {/* <Icon type="edit" className={styles.icon} onClick={this.edit} /> */}
          </div>
        )}
      </div>
    );
  }
}

const EditableRow = Form.create()(WrappedApp);
export default EditableRow;
