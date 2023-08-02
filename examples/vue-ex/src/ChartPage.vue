<template>
  <PageContent :loading="loading">
    <v-chart :option="option" />
  </PageContent>
</template>

<script lang="ts" setup>
import VChart from 'vue-echarts';
import { onUnmounted, ref } from 'vue';
import { getChartConfig } from './getChartConfig';
import { UserServiceWithObservable } from './services/UserService';
import PageContent from './PageContent.vue';

const loading = ref(false);
const option = ref(getChartConfig('Simple fetch data'));
const userService = new UserServiceWithObservable();

loading.value = true;
const subscription$ = userService.getUserComments().subscribe({
  next: (userComments) => {
    const data = userComments.map((item) => ({
      id: item.userId,
      value: item.commentCount,
      name: item.userName,
    }));

    const pieSeries = option.value.series[0];
    pieSeries.data = data;
  },
  error: (e) => {
    loading.value = false;
  },
  complete: () => {
    loading.value = false;
  },
});

onUnmounted(() => subscription$.unsubscribe());
</script>
