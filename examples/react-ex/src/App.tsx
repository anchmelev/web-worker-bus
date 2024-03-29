import './App.css';
import { PieChartOutlined, PieChartFilled } from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import { Content } from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';
import { ChartPage } from './ChartPage';
import { useState } from 'react';
import { ChartBusObservablePage } from './ChartBusObservablePage';
import { ChartBusPromisePage } from './ChartBusPromisePage';

export function App() {
  const [selectedItem, setSelectedItem] = useState('1');

  return (
    <Layout className="app">
      <Sider trigger={null} width={280}>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={[selectedItem]}
          onSelect={(event) => setSelectedItem(event.key)}
          items={[
            {
              key: '1',
              icon: <PieChartOutlined />,
              label: 'Chart',
            },

            {
              key: '2',
              icon: <PieChartFilled />,
              label: 'Chart with bus and observable',
            },
            {
              key: '3',
              icon: <PieChartFilled />,
              label: 'Chart with bus and promise',
            },
          ]}
        />
      </Sider>
      <Layout className="site-layout">
        <Content className="site-layout-background">
          {selectedItem === '1' && <ChartPage />}
          {selectedItem === '2' && <ChartBusObservablePage />}
          {selectedItem === '3' && <ChartBusPromisePage />}
        </Content>
      </Layout>
    </Layout>
  );
}
