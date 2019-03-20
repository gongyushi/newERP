import '@babel/polyfill';
import 'url-polyfill';
import dva from 'dva';
import createHistory from 'history/createHashHistory';
// user BrowserHistory
// import createHistory from 'history/createBrowserHistory';
import createLoading from 'dva-loading';
import 'moment/locale/zh-cn';
import './rollbar';
import './config';

import './index.less';
// 1. Initialize
const app = dva({
  history: createHistory(),
});

// 2. Plugins
app.use(createLoading({ effects: true }));

// 3. Register global model
app.model(require('./models/global').default);
app.model(require('./models/purchaseOrder').default);
app.model(require('./models/purchaseIndex').default);
app.model(require('./models/warehouse').default);
app.model(require('./models/exWarehouse').default);
app.model(require('./models/targetCharge').default);
app.model(require('./models/bonus').default);
app.model(require('./models/erpHome').default);
app.model(require('./models/commonUse').default);
app.model(require('./models/system').default);
app.model(require('./models/company').default);

// 4. Router
app.router(require('./router').default);

// 5. Start
app.start('#root');
export default app._store; // eslint-disable-line
