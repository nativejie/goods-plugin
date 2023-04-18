import { CSSProperties } from 'react';
import ReactDOM from 'react-dom';

import './style.scss';

// import { IconBytedanceColor } from '@arco-design/web-react/icon';
// import { Modal } from '@arco-design/web-react';

console.log(`Current page's url must be prefixed with https://github.com`);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Received message from background script');
    const { type, details } = request;
    console.log(type, details);
    console.log(sender);

    sendResponse('Response from content script');
});

// 向页面注入JS
function injectCustomJs(jsPath = 'js/inject.js') {
    const temp = document.createElement('script');
    temp.setAttribute('type', 'text/javascript');
    // 获得的地址类似：chrome-extension://ihcokhadfjfchaeagdoclpnjdiokfakg/js/inject.js
    temp.src = chrome.extension.getURL(jsPath);
    temp.addEventListener('load', function () {
        // 放在页面不好看，执行完后移除掉
        this.remove();
    });
    document.head.append(temp);
}

function SearchDialog() {
    // const [visible, setVisible] = useState(false);
    const wrapperStyle: CSSProperties = {
        position: 'fixed',
        right: 0,
        top: '50%',
        transform: 'translateX(-50%)',
        height: 80,
        width: 80,
        padding: 10,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        background: '#fff',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
        borderRadius: '50%',
        cursor: 'pointer',
        zIndex: 9999,
    };

    // const handleClickIcon = () => {
    //     setVisible(true);
    // };

    return (
        <>
            {/* <Modal visible={visible} title="采集设置">
                <div>123</div>
            </Modal> */}
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <div style={wrapperStyle}>
                {/* <IconBytedanceColor /> */}
                <div style={{ fontSize: 12 }}>打开抖客助手</div>
            </div>
        </>
    );
}

document.addEventListener('DOMContentLoaded', () => {
    injectCustomJs();
    const div = document.createElement('div');
    div.id = 'search-dialog';
    document.body.append(div);
    ReactDOM.render(<SearchDialog />, div);
});

// 监听Inject返回
function handleMessage(event: any) {
    if (event.data && event.data.cmd === 'products') {
        console.log('products:', event.data.data);
    }
}

window.addEventListener('message', handleMessage);
