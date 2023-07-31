import { EChartsOption } from 'echarts';
import { useMemo } from 'react';

export type ChartDataItem = {
  id: string;
  value: number;
  name: string;
};

export function useChartConfig(subtext: string, data: ChartDataItem[]): EChartsOption {
  return useMemo(() => {
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
          data: data,
        },
      ],
    };
  }, [subtext, data]);
}
