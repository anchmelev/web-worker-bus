import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import ReactEcharts from 'echarts-for-react';
import { EChartsCoreOption } from 'echarts/core';
import { PieSeriesOption } from 'echarts';
import { notification } from 'antd';

const chartDataService = chartWorkerFactory<ChartDataService>(TYPES.ChartDataService, ReturnType.rxjsObservable);

export const ChartPage = () => {
  const [chartData, setChartData] = useState<UserCommentChartData[]>([]);

  useEffect(() => {
    const subscription$ = chartDataService.getDataChart().subscribe({
      next: (v) => setChartData(v),
      error: (message) => {
        console.log('message', message);
        notification.error({
          type: 'error',
          message: 'Error',
          description: message,
        });
      },
    });

    return () => subscription$.unsubscribe();

    // chartDataService
    //   .getDataChartV2()
    //   .then((x) => {
    //     setChartData(x);
    //   })
    //   .catch((e) => {
    //     debugger;
    //     console.log("message", e);
    //     notification.error({
    //       type: "error",
    //       message: "Error",
    //       description: e,
    //     });
    //   });
  }, []);

  const option = useMemo(() => {
    const pie: PieSeriesOption = {
      type: 'pie',
      radius: '50%',
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
      data: chartData.map((item) => ({
        id: item.userId,
        value: item.commentCount,
        name: item.userName,
      })),
    };

    return {
      title: {
        text: 'User with count comments',
        subtext: 'Fake Data',
        left: 'center',
      },
      tooltip: {
        trigger: 'item',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
      },
      series: [pie],
    } as EChartsCoreOption;
  }, [chartData]);

  return <ReactEcharts option={option} style={{ height: '100%', width: '100%' }} className="pie-chart" />;
};
