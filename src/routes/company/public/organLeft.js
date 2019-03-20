import React from 'react';
import { Tree } from 'antd';
import styles from '../organization.less';

const { TreeNode } = Tree;

// 左边栏
class OrganLeft extends React.Component {
  state = {
    organList: [
      {
        title: '海豚集团',
        key: '0-0',
        children: [
          {
            title: '海豚博士有限公司',
            key: '0-0-0',
            children: [
              {
                title: '开发部',
                key: '0-0-0-0',
              },
              {
                title: '销售部',
                key: '0-0-0-1',
              },
              {
                title: '财务部',
                key: '0-0-0-2',
              },
            ],
          },
          {
            title: '数据原力有限公司',
            key: '0-0-1',
            children: [
              {
                title: '开发部',
                key: '0-0-1-0',
              },
              {
                title: '销售部',
                key: '0-0-1-1',
              },
              {
                title: '财务部',
                key: '0-0-1-2',
              },
            ],
          },
          {
            title: '格林德有限公司',
            key: '0-0-2',
            children: [
              {
                title: '开发部',
                key: '0-0-2-0',
              },
              {
                title: '销售部',
                key: '0-0-2-1',
              },
            ],
          },
        ],
      },
    ],
  };
  onSelect = (selectedKeys, info) => {
    console.log('selected', selectedKeys, info.selectedNodes[0]);
  };
  renderTreeNodes = data => {
    return data.map(item => {
      if (item.children) {
        return (
          <TreeNode title={item.title} key={item.key} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode {...item} />;
    });
  };
  render() {
    return (
      <div className={styles.organLeftBox}>
        <p className={styles.organLeftTitle}>架构图</p>
        <div className={styles.organTree}>
          <Tree showLine defaultExpandedKeys={['0-0-0']} onSelect={this.onSelect}>
            {this.renderTreeNodes(this.state.organList)}
            {/* <TreeNode title="海豚集团" key="0-0">
              <TreeNode title="海豚博士有限公司" key="0-0-0">
                <TreeNode title="开发部" key="0-0-0-0" />
                <TreeNode title="销售部" key="0-0-0-1" />
                <TreeNode title="财务部" key="0-0-0-2" />
              </TreeNode>
              <TreeNode title="数据原力有限公司" key="0-0-1">
                <TreeNode title="开发部" key="0-0-1-0" />
              </TreeNode>
              <TreeNode title="格林德有限公司" key="0-0-2">
                <TreeNode title="研发部" key="0-0-2-0" />
                <TreeNode title="销售部" key="0-0-2-1" />
              </TreeNode>
            </TreeNode> */}
          </Tree>
        </div>
      </div>
    );
  }
}

export default OrganLeft;
