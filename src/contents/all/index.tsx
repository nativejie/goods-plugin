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

function initCustomPanel() {
    const panel = document.createElement('div');
    panel.className = 'chrome-plugin-demo-panel';
    panel.innerHTML = `
		<h2>injected-script操作content-script演示区：</h2>
		<div class="btn-area">
			<a href="javascript:sendMessageToContentScriptByPostMessage('你好，我是普通页面！')">通过postMessage发送消息给content-script</a><br>
			<a href="javascript:sendMessageToContentScriptByEvent('你好啊！我是通过DOM事件发送的消息！')">通过DOM事件发送消息给content-script</a><br>
			<a href="javascript:invokeContentScript('sendMessageToBackground()')">发送消息到后台或者popup</a><br>
		</div>
		<div id="my_custom_log">
		</div>
	`;
    document.body.append(panel);
}

document.addEventListener('DOMContentLoaded', () => {
    injectCustomJs();
    initCustomPanel();
});

// 监听Inject返回
function handleMessage(event: any) {
    if (event.data && event.data.cmd === 'xhr-response') {
        console.log('Received xhr response:', event.data.data);
    }
}

window.addEventListener('message', handleMessage);
