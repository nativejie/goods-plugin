import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';

import App from './App';

import '@arco-design/web-react/dist/css/arco.css';
import './App.scss';

ReactDOM.render(
    <HashRouter>
        <App />
    </HashRouter>,
    document.querySelector('#root'),
);
