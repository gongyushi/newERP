import React, { PureComponent } from 'react';
import { Button } from 'antd';
import {
    getActionList,
} from '../../utils/authority';
/**
 * 权限按钮
 * example:
 <PermissionButton
 action="/product/index"
 ></PermissionButton>
 *
 * @author : wenjie.bao
 */
export default class PermissionButton extends Button {
    constructor(props) {
        super(props);
    };

    render() {
        const parent = super.render();
        const { action } = this.props;
        const actionList = JSON.parse(getActionList());

        return (
                (
                    toString.call(action) === '[object Undefined]' ||
                    toString.call(actionList) !== '[object Array]' ||
                    actionList.indexOf(action) > -1
                ) ? parent : ""
        )
    }
}
