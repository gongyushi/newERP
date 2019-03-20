import React from "react";
import {
  Chart,
  Geom,
  Axis,
  Tooltip,
  Legend,
} from "bizcharts";
import DataSet from "@antv/data-set";

class BrokenLine extends React.Component {
  componentWillMount(){
    
  }
  render() {
    const { data}=this.props;
    data.map(res=>{
      Object.keys(res).map((val)=>{
        if (val !== 'month') {
          res[val] = Number(res[val])
        }
        return val
      })
      return res;
    })
    const arr = [];
    if(data.length>0){
      Object.keys(data[0]).map((val) => {
        if (val !=='month'){
          arr.push(val)
        }
        return arr;
      })
    }
    const ds = new DataSet();
    const dv = ds.createView().source(data);
    dv.transform({
      type: "fold",
      fields: arr,
      // 展开字段集
      key: "city",
      // key字段
      value: "temperature", // value字段
    });
    const cols = {
      month: {
        range: [0, 1],
      },
    };
    return (
      <div>
        <Chart style={{width:'100%'}} height={400} data={dv} scale={cols} forceFit>
          <Legend />
          <Axis name="month" />
          <Axis
            name="temperature"
            label={{
              formatter: val => `${val}`,
            }}
          />
          <Tooltip
            crosshairs={{
              type: "y",
            }}
          />
          <Geom
            type="line"
            position="month*temperature"
            size={2}
            color="city"
          />
          <Geom
            type="point"
            position="month*temperature"
            size={4}
            shape="circle"
            color="city"
            style={{
              stroke: "#fff",
              lineWidth: 1,
            }}
          />
        </Chart>
      </div>
    );
  }
}

export default BrokenLine;
