import Dexie from 'dexie';
import XLSX from 'xlsx';

console.log('This is background page!');

type DbProduct = {
    id?: number;
    taskId?: string;
    promotion_id?: string;
    product_name?: string;
    product_url?: string;
    store_name?: string;
    store_score?: number;
    product_score?: number;
    logistics_score?: number;
    service_score?: number;
    phone?: string;
    wechat?: string;
    is_processed?: number;
    process_time?: number;
};

class ProductDexie extends Dexie {
    products!: Dexie.Table<DbProduct>;

    constructor() {
        super('douke-dashboard');

        this.version(1).stores({
            products:
                '++id, taskId, promotion_id, product_name, product_url, store_name, store_score, product_score, logistics_score, service_score, phone, wechat, is_processed, process_time',
        });
    }
}

const db = new ProductDexie();
// let productQueue: Product[] = [];

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

// function processNextProduct() {
//     if (productQueue.length === 0) {
//         return;
//     }

//     const product = productQueue.shift();
//     const url = `https://arco.design/react/components/button/${product?.promotion_id}`;

//     chrome.tabs.create({ url: url }, (tab) => {
//         if (!tab) {
//             return;
//         }
//         chrome.tabs.executeScript(tab.id!, { file: 'js/inject.js' });

//         chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
//             if (tabId === tab.id && changeInfo.status === 'complete') {
//                 chrome.tabs.onUpdated.removeListener(listener);
//                 chrome.tabs.remove(tab.id);
//                 processNextProduct();
//             }
//         });
//     });
// }
let currentTabId = 0;

chrome.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener((msg) => {
        if (msg.action === 'getContactInfo') {
            // 向新标签的 content_script 发送消息
            const { id, contactInfo } = msg;
            db.products
                .where('promotion_id')
                .equals(id)
                .toArray()
                .then((products) => {
                    if (products.length === 0) {
                        return;
                    }
                    const product = products[0];
                    db.products
                        .update(product.id!, {
                            ...contactInfo,
                            is_processed: 1,
                            process_time: Date.now(),
                        })
                        .then(() => {
                            chrome.tabs.remove(currentTabId);
                            createTabToMatchContactInfo(product.taskId!);
                        });
                });
        }
    });
    chrome.runtime.onConnect.removeListener(() => {});
});

function createTabToMatchContactInfo(taskId: string) {
    // 根据taskId获取未处理的product
    db.products
        .where('taskId')
        .equals(taskId)
        .and((product) => product.is_processed === 0)
        .toArray()
        .then((products) => {
            if (products.length === 0) {
                return;
            }
            const product = products[0];
            const url = `https://buyin.jinritemai.com/dashboard/merch-picking-hall/merch_promoting?id=${product.promotion_id}`;
            chrome.tabs.create({ url: url }, (tab) => {
                if (!tab) {
                    return;
                }
                currentTabId = tab.id!;

                // chrome.webNavigation.onCompleted.addListener(function listener(details) {
                //     if (details.tabId === tab.id && details.frameId === 0) {
                //         // 从监听器中移除，避免重复监听
                //         chrome.webNavigation.onCompleted.removeListener(listener);

                //         setTimeout(() => {
                //             // 向新标签的 content_script 发送消息
                //             chrome.tabs.sendMessage(tab.id!, { action: "getContactInfo" }, (response) => {
                //                 currentTabId = tab.id!
                //                 if (chrome.runtime.lastError) {

                //                 }
                //                 if (response) {

                //                 }
                //             });
                //         }, 2000)
                //     }
                //     // if (details.frameId === 0) {
                //     //     setTimeout(() => {
                //     //         chrome.tabs.executeScript(tab.id!,
                //     //             {
                //     //                 code: `
                //     //                     var result = {};
                //     //                     var eyes = document.querySelectorAll('span[class*=index__eye]');
                //     //                     if (eyes.length > 0) {
                //     //                         for (var i = 0; i < eyes.length; i++) {
                //     //                             eyes[i].click();
                //     //                         };
                //     //                     };
                //     //                     result["phone"] =document.querySelectorAll('div[class*=index__right]>span')?.[0]?.textContent;
                //     //                     result["wechat"] =document.querySelectorAll('div[class*=index__right]>span')?.[1]?.textContent;

                //     //                     result["shop_score"] = Number(document.querySelector('.product-shop__shop-score-total .product-shop__shop-score-num')?.textContent);
                //     //                     result['product_score'] = Number(document.querySelector('.product-shop__shop-score-product .product-shop__shop-score-num')?.textContent);
                //     //                     result['logistics_score'] = Number(document.querySelector('.product-shop__shop-score-logistics .product-shop__shop-score-num')?.textContent);
                //     //                     result['service_score'] = Number(document.querySelector('.product-shop__shop-score-seller .product-shop__shop-score-num')?.textContent);

                //     //                     result;
                //     //                 `

                //     //             }
                //     //             , (results) => {
                //     //                 if (chrome.runtime.lastError) {
                //     //                     console.error(chrome.runtime.lastError.message);
                //     //                     return;
                //     //                 }
                //     //                 console.log('result', results);
                //     //                 const [domResult] = results;
                //     //                 db.products.update(product.id, {
                //     //                     ...(domResult || {}),
                //     //                     is_processed: true,
                //     //                     process_time: Date.now(),

                //     //                 }).then(() => {
                //     //                     chrome.tabs.remove(tab.id!);
                //     //                     createTabToMatchContactInfo(taskId);
                //     //                 })

                //     //             });
                //     //     }, 1000)
                //     // }
                // });

                // chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
                //     if (tabId === tab.id && changeInfo.status === 'complete') {
                //         chrome.tabs.onUpdated.removeListener(listener);
                //         chrome.tabs.remove(tab.id);
                //         createTabToMatchContactInfo(taskId);
                //     }
                // });
            });
        });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('request', request, sendResponse, sender);
    if (request.action === 'openNewTab') {
        chrome.tabs.create({ url: request.url });
    }
    if (request.action === 'collectSuccess') {
        const { taskId } = request;
        createTabToMatchContactInfo(taskId);
    }
    if (request.action === 'findProductInfoSuccess') {
        const { taskId, product } = request;
        db.products
            .update(product.id, {
                ...(product || {}),
                is_processed: 1,
                process_time: Date.now(),
            })
            .then(() => {
                createTabToMatchContactInfo(taskId);
            });
    }
    if (request.action === 'collectProductData') {
        // productQueue = request.products;
        const taskId = request.taskId;
        const insertProducts = (request.products || []).map((product: Product) => {
            const { promotion_id, title, shop_name } = product;
            return {
                taskId,
                promotion_id,
                product_name: title,
                store_name: shop_name,
                product_url: `https://buyin.jinritemai.com/dashboard/merch-picking-hall/merch_promoting?id=${promotion_id}`,
                store_score: -1,
                product_score: -1,
                logistics_score: -1,
                service_score: -1,
                phone: '',
                wechat: '',
                is_processed: 0,
                process_time: 0,
            } as DbProduct;
        });
        db.products.bulkPut(insertProducts);
        // processNextProduct();
    }

    if (request.action === 'exportAll') {
        // 获取所有产品数据
        db.products
            .where('is_processed')
            .equals(1)
            .toArray()
            .then((products) => {
                XLSX.writeFile(
                    {
                        SheetNames: ['sheet1'],
                        Sheets: {
                            sheet1: XLSX.utils.json_to_sheet(products),
                        },
                    },
                    'products.xlsx',
                );
            });
    }
});
