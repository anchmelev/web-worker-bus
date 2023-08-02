import { Component, Inject, OnInit } from '@angular/core';
import { getChartConfig } from '../get-chart-config';
import { EChartsOption, PieSeriesOption } from 'echarts';
import { USER_SERVICE_WITH_OBSERVABLE } from '../services/user.worker.container';
import { UserServiceWithObservable } from '../services/user.service';

@Component({
  selector: 'app-chart-bus-observable',
  templateUrl: './chart-bus-observable.component.html',
  styleUrls: ['./chart-bus-observable.component.less'],
})
export class ChartBusObservableComponent implements OnInit {
  constructor(@Inject(USER_SERVICE_WITH_OBSERVABLE) private userService: UserServiceWithObservable) {}

  chartOption = getChartConfig('Fetch data with bus worker');
  mergeOptions: EChartsOption = {};
  loading = false;

  ngOnInit() {
    this.loading = true;
    this.userService.getUserComments().subscribe({
      next: (userComments) => {
        const series = this.chartOption.series as PieSeriesOption[];

        this.mergeOptions = {
          series: [
            {
              ...series[0],
              data: userComments.map((item) => ({
                id: item.userId,
                value: item.commentCount,
                name: item.userName,
              })),
            },
          ],
        };
      },
      error: () => (this.loading = false),
      complete: () => (this.loading = false),
    });
  }
}
