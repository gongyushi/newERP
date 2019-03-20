import React from 'react';
import { Redirect, Switch, Route } from 'dva/router';
import DocumentTitle from 'react-document-title';
import styles from './UserLayout.less';
// import logo from '../assets/logo.png';
import { getRoutes } from '../utils/utils';
import logo from '../assets/logo.png';

class UserLayout extends React.PureComponent {
  getPageTitle() {
    const { routerData, location } = this.props;
    const { pathname } = location;
    let title = 'Dataforce';
    if (routerData[pathname] && routerData[pathname].name) {
      title = `${routerData[pathname].name} - Dataforce`;
    }
    return title;
  }

  render() {
    const { routerData, match } = this.props;
    return (
      <DocumentTitle title={this.getPageTitle()}>
        <div className={styles.container}>
          <div className={styles.logo}>
            <img src={logo} alt="" />
          </div>
          <div className={styles.content}>
            <Switch>
              {getRoutes(match.path, routerData).map(item => {
                return (
                  <Route
                    key={item.key}
                    path={item.path}
                    component={item.component}
                    exact={item.exact}
                  />
                );
              })}
              <Redirect exact from="/user" to="/user/login" />
            </Switch>
          </div>
          {/* <GlobalFooter links={links} copyright={copyright} /> */}
        </div>
      </DocumentTitle>
    );
  }
}

export default UserLayout;
