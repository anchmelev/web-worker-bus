import { useEffect, useState } from 'react';
import ReactEcharts from 'echarts-for-react';
import { ChartDataItem, useChartConfig } from './useChartConfig';
import { UserServiceWithObservable } from './Services/UserService';
import { PageContent } from './PageContent/PageContent';

const userService = new UserServiceWithObservable();

export const ChartPage = () => {
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const subscription$ = userService.getUserComments().subscribe({
      next: (userComments) => {
        const data = userComments.map((item) => ({
          id: item.userId,
          value: item.commentCount,
          name: item.userName,
        }));
        setChartData(data);
      },
      error: (e) => {
        setLoading(false);
      },
      complete: () => {
        setLoading(false);
      },
    });

    return () => subscription$.unsubscribe();
  }, []);

  const option = useChartConfig('Simple fetch data', chartData);

  return (
    <PageContent loading={loading}>
      <ReactEcharts option={option} style={{ height: '100%', width: '100%' }} className="pie-chart" />;
    </PageContent>
  );
};
