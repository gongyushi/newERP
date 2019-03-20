// 这边放一些全局变量配置信息
export default (() => {
  window.gconfig = {};
  (function(global) {
    const url = new URL(window.location.href);
    if(url.host === 'localhost:8000'){ // url.host !== 'erp.dev.cn'
      global.urlHeader = 'http://erp.dev.cn/';
    } else {
      global.urlHeader = `${url.origin}/`;
    }

    global.urlService = 'http://rap2api.taobao.org/app/mock/7430/comment/';
    global.urlTaoBao = 'http://rap2api.taobao.org/app/mock/7430/dolphierp.cn/';
  })(window.gconfig);
})();
