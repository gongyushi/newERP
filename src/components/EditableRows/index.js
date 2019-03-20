import React from 'react';
import {
  Input,
  DatePicker,
  Select,
} from 'antd';
import moment from 'moment';

const { Option } = Select;

export default class EditableRows extends React.Component {
  state = {
    value: this.props.value,
    type: this.props.type,
    editable: this.props.editable,
  };
  componentWillReceiveProps(next){
    this.setState({
      editable: next.editable,
      value: next.value,
    });
  }
  handleChange = (e) => {
    const { value } = e.target;
    this.setState({ value });
    if(this.props.onChange){
      this.props.onChange(value);
    }
  }
  handleDate = (date, dateString) => {
    console.log(dateString)
    if(this.props.onChange){
      this.props.onChange(moment(dateString).format('YYYY-MM-DD'));
    }
  }
  handleSelect = (value) => {
    if(this.props.onChange){
      this.props.onChange(value);
    }
  }
  render() {
    const { editable, type } = this.state;
    let { value } = this.state;
    if(editable && type === 'time'){
      if(value){
        value = moment(value).format('YYYY-MM-DD');
      }else{
        value = moment(new Date()).format('YYYY-MM-DD');
      }
    }
    return (
      <div>
        {
          editable ? (
            <div>
              {
                type === 'select' ? (
                  <div>
                    <Select
                      style={{ width: 100 }}
                      value={String(value)}
                      onChange={this.handleTreeChange}
                      showSearch
                      optionFilterProp='children'
                    >
                      {
                        value.map((val) => (
                          <Option value={val.id} >
                            {val.title}
                          </Option>
                        ))
                      }
                    </Select>
                  </div>
                ) : type === 'time' ? (
                  <div>
                    <DatePicker style={{width:120}} value={moment(value,'YYYY-MM-DD')} allowClear={false} onChange={this.handleDate} />
                  </div>
                ) : (
                  <div>
                    <Input value={value} onChange={this.handleChange} style={{width:110}} />
                  </div>
                )
              }
            </div>
          ) : (
            <div>
              {
                value === null ? (
                  <div>
                    {
                      type === 'time' ? ('--') : (0)
                    }
                  </div>
                ) : (
                  value
                )
              }
            </div>
          )
        }
      </div>
    );
  }
}