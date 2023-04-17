import { Button, Form, Input, Typography } from '@arco-design/web-react';

import './App.scss';

const { Paragraph, Text } = Typography;
const App = () => (
    <div className="app">
        <div className="app__header">
            <div className="app__title">抖客助手</div>
        </div>
        <div className="app__content">
            <Form layout="vertical">
                <Form.Item label="激活码">
                    <Input />
                </Form.Item>
                <Form.Item>
                    <Button style={{ width: '100%' }} type="primary">
                        点击激活
                    </Button>
                </Form.Item>
            </Form>
            <div className="app__content__text">
                <Paragraph>
                    <ol>
                        <li>请联系客服获取激活码</li>
                        <li>请勿将激活码泄露给他人</li>
                        <li>
                            <Text type="primary">完整操作教程</Text>
                        </li>
                    </ol>
                </Paragraph>
            </div>
        </div>

        <div className="app__footer">
            <div className="app__footer__text">© 2023 抖客助手</div>
        </div>
    </div>
);

export default App;
