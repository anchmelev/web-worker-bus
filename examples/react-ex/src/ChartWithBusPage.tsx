import { useEffect, useState } from 'react';
import ReactEcharts from 'echarts-for-react';
import { ChartDataItem, useChartConfig } from './useChartConfig';
import { UserService } from './Services/UserService';
import { PageContent } from './PageContent/PageContent';
import { MainThreadBus, ObjectCopyTransport, ReturnType } from 'web-worker-bus';
import { USER_SERVICE } from './Services/UserWorkerContainer';

const worker = new Worker(new URL('./Services/UserWorker', import.meta.url));
const userTransport = new ObjectCopyTransport(worker);
MainThreadBus.instance.registerBusWorkers([userTransport]);
const userWorkerFactory = MainThreadBus.instance.createFactoryService(userTransport);
const userService = userWorkerFactory<UserService>(USER_SERVICE, ReturnType.rxjsObservable);

export const ChartWithBusPage = () => {
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const subscription$ = userService.getUserCommentsByObservable().subscribe({
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
