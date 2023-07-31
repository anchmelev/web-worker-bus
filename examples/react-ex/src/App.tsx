import React from 'react';
import './App.css';
import { PieChartOutlined } from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import { Content } from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';
import { ChartPage } from './ChartPage';

export function App() {
  return (
    <Layout className="app">
      <Sider trigger={null}>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          items={[
            {
              key: '1',
              icon: <PieChartOutlined />,
              label: 'Chart',
            },
          ]}
        />
      </Sider>
      <Layout className="site-layout">
        <Content className="site-layout-background">
          <ChartPage />
        </Content>
      </Layout>
    </Layout>
  );
}
