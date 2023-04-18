console.log('This is background page!');
let productQueue: Product[] = [];

console.log('This is background page! productList', productQueue);
chrome.webRequest.onCompleted.addListener(
    (details) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs?.[0]?.id as number, {
                type: 'onCompleted',
                details,
            });
        });
        // console.log(`onCompleted: ${JSON.stringify(details)}`);
    },
    {
        urls: ['https://mcs.snssdk.com/v1/list'],
    },
    ['responseHeaders'],
);

function processNextProduct() {
    if (productQueue.length === 0) {
        return;
    }

    const product = productQueue.shift();
    const url = `https://arco.design/react/components/button/${product?.promotion_id}`;

    chrome.tabs.create({ url: url }, (tab) => {
        if (!tab) {
            return;
        }
        chrome.tabs.executeScript(tab.id!, { file: 'js/inject.js' });

        chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
            if (tabId === tab.id && changeInfo.status === 'complete') {
                chrome.tabs.onUpdated.removeListener(listener);
                chrome.tabs.remove(tab.id);
                processNextProduct();
            }
        });
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('request', request, sendResponse, sender);
    if (request.action === 'openNewTab') {
        chrome.tabs.create({ url: request.url });
    }
    if (request.action === 'collectProductData') {
        productQueue = request.products;
        processNextProduct();
    }
});

export {};
