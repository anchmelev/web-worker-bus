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
import { ReturnType } from 'web-worker-bus';
import { USER_SERVICE_WITH_OBSERVABLE } from './services/UserWorkerContainer';
import PageContent from './PageContent.vue';
import { userWorkerFactory } from './userWorkerFactory';

const userService = userWorkerFactory<UserServiceWithObservable>(
  USER_SERVICE_WITH_OBSERVABLE,
  ReturnType.rxjsObservable,
);

const loading = ref(false);
const option = ref(getChartConfig('Simple fetch data'));

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
