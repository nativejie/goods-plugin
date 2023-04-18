import { Button, Input, InputNumber, Modal, Space, Typography } from '@arco-design/web-react';
import { IconBytedanceColor } from '@arco-design/web-react/icon';
import { CSSProperties, useState } from 'react';
import ReactDOM from 'react-dom';

import './style.scss';

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
    const [visible, setVisible] = useState(false);
    const wrapperStyle: CSSProperties = {
        position: 'fixed',
        right: 0,
        top: '50%',
        transform: 'translateX(-50%)',
        height: 80,
        width: 80,
        padding: 10,
        boxSizing: 'border-box',
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

    const handleClickIcon = () => {
        setVisible(true);
    };

    const footer = (
        <Space>
            <Button type="outline">开始采集</Button>
            <Button type="outline" status="success">
                导出结果
            </Button>
        </Space>
    );

    return (
        <>
            <Modal
                footer={footer}
                visible={visible}
                onCancel={() => setVisible(false)}
                title="采集设置"
            >
                <Space>
                    <Typography.Text>每采集</Typography.Text>
                    <InputNumber
                        mode="button"
                        defaultValue={30}
                        suffix="条"
                        style={{ width: 160, margin: '10px 24px 10px 0' }}
                    />
                    <Typography.Text>等待</Typography.Text>
                    <InputNumber
                        mode="button"
                        defaultValue={60}
                        suffix="秒"
                        style={{ width: 160, margin: '10px 24px 10px 0' }}
                    />
                </Space>
                <div style={{ height: 20 }} />
                <Typography.Text bold>标题配置</Typography.Text>
                <Typography.Text type="secondary">（多条使用#分割）</Typography.Text>
                <Input.TextArea
                    allowClear
                    rows={4}
                    placeholder="请输入标题，如：标题1#标题2#标题3"
                    style={{ margin: '10px 0' }}
                />
                <div>
                    <Typography.Text type="secondary">
                        当前采集第 <Typography.Text bold>999</Typography.Text> 页 共{' '}
                        <Typography.Text bold>1000</Typography.Text> 页
                    </Typography.Text>
                </div>
                <Typography.Text type="secondary">
                    已采集 <Typography.Text bold>2000</Typography.Text> 条记录
                </Typography.Text>
            </Modal>
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <div style={wrapperStyle} onClick={() => handleClickIcon()}>
                <IconBytedanceColor fontSize={30} />
                <div style={{ fontSize: 12 }}>打开助手</div>
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
