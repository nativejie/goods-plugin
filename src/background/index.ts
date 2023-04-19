import Dexie from 'dexie';

console.log('This is background page!');

type DbProduct = {
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
    is_processed?: boolean;
    process_time?: number;
    task_id?: string;
};

type Task = {
    task_id: string;
    title: string;
    status: string;
};

class ProductDexie extends Dexie {
    products!: Dexie.Table<DbProduct>;
    tasks!: Dexie.Table<Task>;

    constructor() {
        super('douke-dashboard');

        this.version(1).stores({
            products:
                '++id, promotion_id, product_name, product_url, store_name, store_score, product_score, logistics_score, service_score, phone, wechat, is_processed, process_time, task_id',
            tasks: '++id, task_id, title, status',
        });
    }
}

const db = new ProductDexie();
// let productQueue: Product[] = [];

// chrome.webRequest.onCompleted.addListener(
//     (details) => {
//         chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//             chrome.tabs.sendMessage(tabs?.[0]?.id as number, {
//                 type: 'onCompleted',
//                 details,
//             });
//         });
//         // console.log(`onCompleted: ${JSON.stringify(details)}`);
//     },
//     {
//         urls: ['https://mcs.snssdk.com/v1/list'],
//     },
//     ['responseHeaders'],
// );

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

function createTask(data: any) {
    const { task_id, title } = data;
    db.tasks
        .get({
            task_id,
        })
        .then((value: Task | undefined) => {
            if (!value) {
                db.tasks.add({
                    task_id: task_id,
                    title,
                    status: 'processing',
                });
            } else {
                value.status = 'processing';
                db.tasks.update({ task_id }, value);
            }
        });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('request', request, sendResponse, sender);
    if (request.action === 'openNewTab') {
        chrome.tabs.create({ url: request.url });
    }
    if (request.action === 'startCollect') {
        createTask(request.data);
    }
    if (request.action === 'collectProductData') {
        // productQueue = request.products;
        const insertProducts = (request.products || []).map((product: Product) => {
            const { promotion_id, title, shop_name } = product;
            return {
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
                is_processed: false,
                process_time: 0,
            } as DbProduct;
        });
        db.products.bulkPut(insertProducts);
        // processNextProduct();
    }
});
