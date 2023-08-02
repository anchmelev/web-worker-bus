<template>
  <div class="wrapper">
    <a-spin v-if="loading" class="spinner" />
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Spin } from 'ant-design-vue';

export default defineComponent({
  components: {
    'a-spin': Spin,
  },
  props: {
    loading: {
      type: Boolean,
      required: true,
    },
  },
});
</script>

<style scoped>
.wrapper {
  padding: 16px;
  width: 800px;
  position: relative;
  height: 600px;
}

.spinner {
  position: absolute;
  left: calc(50% - 13px);
  top: 70px;
}
</style>
