import { useEffect, useState } from 'react';
import ReactEcharts from 'echarts-for-react';
import { ChartDataItem, useChartConfig } from './useChartConfig';
import { PageContent } from './PageContent/PageContent';
import { ReturnType } from 'web-worker-bus';
import { UserServiceWithPromise } from './Services/UserService';
import { USER_SERVICE_WITH_OBSERVABLE } from './Services/UserWorkerContainer';
import { userWorkerFactory } from './userWorkerFactory';

const userService = userWorkerFactory<UserServiceWithPromise>(USER_SERVICE_WITH_OBSERVABLE, ReturnType.promise);

export const ChartBusPromisePage = () => {
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    userService
      .getUserComments()
      .then((userComments) => {
        const data = userComments.map((item) => ({
          id: item.userId,
          value: item.commentCount,
          name: item.userName,
        }));
        setChartData(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const option = useChartConfig('Simple fetch data', chartData);

  return (
    <PageContent loading={loading}>
      <ReactEcharts option={option} style={{ height: '100%', width: '100%' }} className="pie-chart" />;
    </PageContent>
  );
};
