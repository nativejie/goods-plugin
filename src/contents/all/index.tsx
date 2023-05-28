import {
    Button,
    Input,
    Modal,
    Space,
    Table,
    TableColumnProps,
    Tag,
    Typography,
} from '@arco-design/web-react';
import { IconBytedanceColor } from '@arco-design/web-react/icon';
import dayjs from 'dayjs';
import { CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';

// import XLSX from 'xlsx';
import '@arco-design/web-react/dist/css/arco.css';
import './style.scss';

console.log(`Current page's url must be prefixed with https://github.com`);

function triggerMouseoverEvent(element: any) {
    if (!element) {
        return;
    }
    const event = new MouseEvent('mouseover', {
        bubbles: true,
        cancelable: true,
        view: window,
    });
    element.dispatchEvent(event);
}

// chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
//     if (request.action === 'getContactInfo') {
function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
async function findDOmReady(fn: any) {
    let count = 0;
    while (!document.querySelector('.product-shop__shop-title')?.textContent) {
        await sleep(1000);
        count++;
        if (count > 8) {
            break;
        }
    }
    fn();
}
function loadFunction() {
    if (!window.location.href.includes('merch-picking-hall/merch_promoting')) {
        return;
    }

    const port = chrome.runtime.connect({ name: 'contentScript' });
    // 获取URL的ID参数
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (!id) {
        return;
    }
    var result = {} as any;
    const element = document.querySelector('.product-info__button--more');
    triggerMouseoverEvent(element);
    setTimeout(() => {
        var eyes = document.querySelectorAll('span[class*=index__eye]');
        if (eyes.length > 0) {
            for (var i = 0; i < eyes.length; i++) {
                (eyes[i] as any).click();
            }
        }
        setTimeout(() => {
            result['wechat'] = document.querySelectorAll(
                'div[class^=index__right]',
            )?.[0]?.textContent;
            result['phone'] = document.querySelectorAll(
                'div[class^=index__right]',
            )?.[1]?.textContent;

            result['shop_score'] = Number(
                document.querySelector(
                    '.product-shop__shop-score-total .product-shop__shop-score-num',
                )?.textContent,
            );
            result['product_score'] = Number(
                document.querySelector(
                    '.product-shop__shop-score-product .product-shop__shop-score-num',
                )?.textContent,
            );
            result['logistics_score'] = Number(
                document.querySelector(
                    '.product-shop__shop-score-logistics .product-shop__shop-score-num',
                )?.textContent,
            );
            result['service_score'] = Number(
                document.querySelector(
                    '.product-shop__shop-score-seller .product-shop__shop-score-num',
                )?.textContent,
            );
            port.postMessage({ contactInfo: result, action: 'getContactInfo', id });
        }, 1000 * 3);
    }, 100);
}

(function () {
    if (document.readyState === 'complete') {
        findDOmReady(loadFunction);
    } else {
        window.addEventListener('load', () => {
            findDOmReady(loadFunction);
        });
    }
})();

// return true;
// }
// });

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

type TaksTableDTO = {
    id: string;
    title: string;
    count: number;
    current: number;
    status: string;
    time: string;
    action: string;
};

const TaskTable = ({ dataSource }: { dataSource: TaksTableDTO[] }) => {
    const columns: TableColumnProps<TaksTableDTO>[] = [
        {
            title: '标题',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: '采集条数',
            dataIndex: 'count',
            key: 'count',
        },
        {
            title: '当前进度',
            dataIndex: 'current',
            key: 'current',
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render(col, item) {
                if (col === 'success') {
                    return <Tag color="green">采集成功</Tag>;
                }

                if (col === 'error') {
                    return <Tag color="red">采集失败</Tag>;
                }

                if (col === 'waiting') {
                    return <Tag color="orange">等待中</Tag>;
                }

                if (col === 'processing') {
                    return <Tag color="arcoblue">采集中</Tag>;
                }

                return <Tag>{item.status}</Tag>;
            },
        },
        {
            title: '时间',
            dataIndex: 'time',
            key: 'time',
        },
        // {
        //     title: '操作',
        //     dataIndex: 'action',
        //     key: 'action',
        // },
    ];

    return <Table data={dataSource} columns={columns} />;
};

function SearchDialog() {
    const [visible, setVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [isStart, setIsStart] = useState(false);
    const [tableData, setTableData] = useState<TaksTableDTO[]>(
        JSON.parse(localStorage.getItem('collectionData') || '[]'),
    );
    const currentCollectTask = useRef<string>('');

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

    const handleAddTask = useCallback(() => {
        const tasks = searchText.split('#');
        const newTableData: TaksTableDTO[] = tasks.map((task) => ({
            id: uuidv4(),
            title: task,
            status: 'waiting',
            time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            action: 'action',
            count: 0,
            current: 0,
        }));
        setTableData((prev) => [...prev, ...newTableData]);
        setSearchText('');
    }, [searchText]);

    // 接收消息
    useEffect(() => {
        window.addEventListener('message', (event) => {
            if (event.data?.cmd === 'collectionFinishOnePage') {
                const taskId =
                    currentCollectTask.current || localStorage.getItem('currentCollectTask');
                const newTableData = tableData.map((item) => {
                    if (item.id === taskId) {
                        return {
                            ...item,
                            current: item.current + 1,
                        };
                    }
                    return item;
                });
                setTableData(newTableData);
            }
            if (event.data?.cmd === 'collectionFinishOneWord') {
                const taskId =
                    currentCollectTask.current || localStorage.getItem('currentCollectTask');
                const newTableData = tableData.map((item) => {
                    if (item.id === taskId) {
                        return {
                            ...item,
                            status: 'success',
                        };
                    }
                    return item;
                });
                const firstWaitingTask = newTableData.find((item) => item.status === 'waiting');
                if (firstWaitingTask) {
                    currentCollectTask.current = firstWaitingTask.id;
                } else {
                    currentCollectTask.current = '';
                    localStorage.setItem('isCollecting', 'false');
                    setIsStart(false);
                }
                localStorage.setItem('collectionData', JSON.stringify(newTableData));
                setTableData(newTableData);
            }
        });
    }, [tableData]);

    // 如果当前采集任务变动，重新开始采集下一个
    useEffect(() => {
        if (tableData.length <= 0) {
            return;
        }
        const data = tableData.find((item) => item.id === currentCollectTask.current);
        if (!data) {
            return;
        }
        if (data.status === 'success') {
            return;
        }
        const newTableData = tableData.map((item) => {
            if (item.id === currentCollectTask.current) {
                return {
                    ...item,
                    status: 'processing',
                };
            }
            return item;
        });
        setTableData(newTableData);
        localStorage.setItem('collectionData', JSON.stringify(newTableData));
        localStorage.setItem('isCollecting', 'true');
        localStorage.setItem('currentCollectTask', currentCollectTask.current);
        document.querySelector('.auxo-select-selector input')?.setAttribute('value', data?.title);
        const event = new Event('input', { bubbles: true });
        document.querySelector('.auxo-select-selector input')?.dispatchEvent(event);
        (document.querySelector('.auxo-input-search-button') as HTMLElement)?.click();
    }, [currentCollectTask.current]);

    useEffect(() => {
        if (tableData.length <= 0) {
            return;
        }
        const collectionData = localStorage.getItem('collectionData');
        const data = JSON.parse(collectionData || '[]') as TaksTableDTO[];
        if (collectionData?.length) {
            // 比对 tableData
            const newTableData = tableData.map((item: any) => {
                const index = data.findIndex((tableItem) => tableItem.id === item.id);
                if (index > -1) {
                    return {
                        ...tableData[index],
                        ...item,
                    };
                }
                return item;
            });
            localStorage.setItem('collectionData', JSON.stringify(newTableData));
        } else {
            localStorage.setItem('collectionData', JSON.stringify(tableData));
        }
    }, [tableData]);

    const handleStart = useCallback(() => {
        // TODO 添加 taskID uuid
        setIsStart(!isStart);
        if (isStart) {
        } else {
            const taksId = tableData.find((item) => item.status === 'waiting')?.id;
            if (!taksId) {
                setIsStart(false);
                return;
            }
            currentCollectTask.current = taksId;
        }
    }, [tableData, currentCollectTask.current, isStart]);

    const handleSendTest = () => {
        // 570d62d7-842f-4cb2-b415-431673ae2ea8
        chrome.runtime.sendMessage({
            action: 'collectSuccess',
            taskId: localStorage.getItem('currentCollectTask'),
        });
    };

    const handleClickExportAll = () => {
        chrome.runtime.sendMessage({
            action: 'exportAll',
        });
    };

    const handleClickStop = () => {
        localStorage.setItem('isCollecting', 'false');
        chrome.runtime.sendMessage({
            action: 'stopCollect',
        });
    };

    return (
        <>
            <Modal
                style={{ width: 800 }}
                visible={visible}
                onCancel={() => setVisible(false)}
                title="采集设置"
            >
                <Typography.Text bold>添加采集标题</Typography.Text>
                <Typography.Text type="secondary">（多条使用#分割）</Typography.Text>
                <Input.TextArea
                    value={searchText}
                    onChange={setSearchText}
                    allowClear
                    rows={2}
                    placeholder="请输入标题，如：标题1#标题2#标题3"
                    style={{ margin: '10px 0' }}
                />

                <div style={{ marginBottom: 16 }}>
                    <Space>
                        <Button type="primary" onClick={handleAddTask}>
                            添加任务
                        </Button>
                        <Button type="primary" status="warning" onClick={handleStart}>
                            开始采集
                        </Button>
                        <Button type="primary" status="success" onClick={handleClickExportAll}>
                            导出全部
                        </Button>
                        <Button type="primary" status="success" onClick={handleClickStop}>
                            停止
                        </Button>
                        <Button type="primary" onClick={handleSendTest}>
                            测试
                        </Button>
                    </Space>
                </div>
                <TaskTable dataSource={tableData} />
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
        const { promotions: products, has_more = false } = JSON.parse(event.data.data)?.data;
        if (has_more) {
            // 给custom.js发送消息 更新tableData
            window.postMessage({ cmd: 'collectionFinishOnePage' }, '*');
            chrome.runtime.sendMessage({
                action: 'collectProductData',
                products,
                taskId: localStorage.getItem('currentCollectTask'),
            });
            (document.querySelector('.auxo-pagination-next') as HTMLElement)?.click();
        } else {
            window.postMessage({ cmd: 'collectionFinishOneWord' }, '*');
            chrome.runtime.sendMessage({
                action: 'collectSuccess',
                taskId: localStorage.getItem('currentCollectTask'),
            });
        }
    }

    if (event.data && event.data.cmd === 'exportData') {
    }
}

window.addEventListener('message', handleMessage);
