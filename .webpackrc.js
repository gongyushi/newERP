const path = require('path');

export default {
  entry: 'src/index.js',
  extraBabelPlugins: [['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }]],
  env: {
    development: {
      extraBabelPlugins: ['dva-hmr'],
    },
  },
  alias: {
    components: path.resolve(__dirname, 'src/components/'),
    routes: path.resolve(__dirname, 'src/routes/'),
    services: path.resolve(__dirname, 'src/services/'),
    store: path.resolve(__dirname, 'src/store/'),
    utils: path.resolve(__dirname, 'src/utils'),
  },
  ignoreMomentLocale: true,
  theme: './src/theme.js',
  html: {
    template: './src/index.ejs',
  },
  disableDynamicImport: true,
  publicPath: '/',
  hash: true,
  // proxy: {
  //   '/app': {
  //     target: 'http://rap2api.taobao.org/',
  //     changeOrigin: true,
  //   },
  // },
  proxy: {
    'http://localhost:8000/': {
      target: 'http://dolphierp.cn/',
      changeOrigin: true,
    },
  },
};
