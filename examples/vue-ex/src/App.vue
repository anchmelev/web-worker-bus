<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider :width="280" v-model:collapsed="collapsed" collapsible>
      <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline">
        <a-menu-item key="1">
          <pie-chart-outlined />
          <span>Chart</span>
        </a-menu-item>
        <a-menu-item key="2">
          <pie-chart-filled />
          <span>Chart with bus and observable</span>
        </a-menu-item>
        <a-menu-item key="3">
          <pie-chart-filled />
          <span>Chart with bus and promise</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-content style="margin: 0 16px">
        <ChartPage v-if="selectedKeys.includes('1')" />
        <ChartBusObservablePage v-if="selectedKeys.includes('2')" />
        <ChartBusPromisePage v-if="selectedKeys.includes('3')" />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script lang="ts" setup>
import { PieChartOutlined, PieChartFilled } from '@ant-design/icons-vue';
import { ref } from 'vue';
import ChartPage from './ChartPage.vue';
import ChartBusObservablePage from './ChartBusObservablePage.vue';
import ChartBusPromisePage from './ChartBusPromisePage.vue';

const collapsed = ref<boolean>(false);
const selectedKeys = ref<string[]>(['1']);
</script>

