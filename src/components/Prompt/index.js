import { Modal } from 'antd';

/**
 * 提示的对话框
 * @author : wenjie.bao
 */
const Prompt = Prompt || {};
/**
 * 错作成功提示
 * Prompt.success({
          onOk: () => {
            // do something
          },
        });
 * @param props
 * @returns {{destroy: (()=>void)}}
 */
Prompt.success = function (props) {
  const config = {
    type: 'success',
    iconType: 'check-circle',
    okCancel: false,
    title: `系统提示`,
    content: `操作成功`,
    okText: '确 定',
    ...props,
  }; 
  const modal = Modal.success(config);
  setTimeout(()=>modal.destroy(),3000)
  return modal;
};

/**
 * 错作失败提示
 * Prompt.error({
          onOk: () => {
            // do something
          },
        });
 * @param props
 * @returns {{destroy: (()=>void)}}
 */
Prompt.error = function (props) {
  const config = {
    type: 'error',
    iconType: 'close-circle',
    okCancel: false,
    title: `系统提示`,
    content: `操作失败`,
    okText: '确 定',
    ...props,
  };
  const modal = Modal.error(config);
  setTimeout(()=>modal.destroy(),3000)
  return modal;
};

/**
 * 错作警告提示
 * Prompt.warning({
          onOk: () => {
            // do something
          },
        });
 * @param props
 * @returns {{destroy: (()=>void)}}
 */
Prompt.warning = function (props) {
  const config = {
    type: 'error',
    iconType: 'exclamation-circle',
    okCancel: false,
    title: `系统提示`,
    content: `请检查后操作`,
    okText: '确 定',
    ...props,
  };
  const modal = Modal.warning(config);
  setTimeout(()=>modal.destroy(),3000)
  return modal;
};

export default Prompt;
