console.log('This is background page!');

chrome.webRequest.onCompleted.addListener(
    (details) => {
        chrome.runtime.sendMessage({
            type: 'onCompleted',
            details,
        });
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

export {};
