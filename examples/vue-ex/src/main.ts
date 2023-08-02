import './assets/main.css';

import { createApp } from 'vue';
import App from './App.vue';
import Antd from 'ant-design-vue';
import { use } from 'echarts';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components';

use([CanvasRenderer, PieChart, TitleComponent, TooltipComponent, LegendComponent]);

const app = createApp(App);

app.use(Antd);

app.mount('#app');
