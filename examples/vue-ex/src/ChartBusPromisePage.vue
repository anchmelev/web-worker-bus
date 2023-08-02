<template>
  <PageContent :loading="loading">
    <v-chart :option="option" />
  </PageContent>
</template>

<script lang="ts" setup>
import VChart from 'vue-echarts';
import { ref } from 'vue';
import { getChartConfig } from './getChartConfig';
import { UserServiceWithPromise } from './services/UserService';
import { ReturnType } from 'web-worker-bus';
import { USER_SERVICE_WITH_PROMISE } from './services/UserWorkerContainer';
import PageContent from './PageContent.vue';
import { userWorkerFactory } from './userWorkerFactory';

const userService = userWorkerFactory<UserServiceWithPromise>(USER_SERVICE_WITH_PROMISE, ReturnType.promise);

const loading = ref(false);
const option = ref(getChartConfig('Simple fetch data'));

loading.value = true;
userService
  .getUserComments()
  .then((userComments) => {
    const data = userComments.map((item) => ({
      id: item.userId,
      value: item.commentCount,
      name: item.userName,
    }));

    const pieSeries = option.value.series[0];
    pieSeries.data = data;
  })
  .finally(() => (loading.value = false));
</script>
