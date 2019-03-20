import React from 'react';
import { Select, Input, Button } from 'antd';

require('./index.less');

const { Option } = Select;

class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      prompt: props.prompt || '',
      options: props.options || [],
      hidden: props.hidden || false,
      sKey: props.defaultKey || props.options && props.options[0].key,
      search: props.defaultValue || '',
    };
  }

  handleChange = (key) => {
    this.setState({
      sKey: key,
      search: '',
    });
  }

  handleSearch = (e) => {
    this.setState({ search: e.target.value });
  }

  submit = () => {
    const { search, sKey } = this.state;
    if(this.props.onClick){
      this.props.onClick(sKey, search);
    }
  }
  render() {
    const { prompt, search,  hidden, options, sKey } = this.state;
    console.log('sss',sKey,search)
    return (
      <div>
        <div style={{ marginBottom: '10px' }}>
          {!hidden && options && (
            <Select
              defaultValue={sKey}
              style={{ width: 120 }}
              onChange={this.handleChange.bind(this)}
              className="marginR"
              showSearch
              optionFilterProp='children'
            > 
              {options.map(esco=>{
                return (<Option value={esco.key}>{esco.label}</Option>)
              })}
            </Select>
          )}
          <Input placeholder={prompt} value={search} className="marginR searchInput" onChange={this.handleSearch} />
          <Button type="primary" size="small" className="marginR" onClick={this.submit}>
            搜索
          </Button>
        </div>
      </div>
    );
  }
}
export default SearchBar;
