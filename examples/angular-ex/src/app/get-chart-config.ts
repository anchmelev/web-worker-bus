import { EChartsOption } from 'echarts';

export function getChartConfig(subtext: string): EChartsOption {
  return {
    title: {
      text: 'User with count comments',
      subtext: subtext,
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        type: 'pie',
        radius: '50%',
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        data: [],
      },
    ],
  };
}
