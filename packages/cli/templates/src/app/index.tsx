import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import styles from './index.scss';

const componentName = 'App';

export interface AppProps {}
export const App: React.FC<AppProps> = (props) => {
  return <div className={classNames(styles[componentName])}>app</div>;
};

App.displayName = 'App';

ReactDOM.render(<App />, document.getElementById('root'));
