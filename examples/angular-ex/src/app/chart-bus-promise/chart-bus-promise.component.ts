import { Component, Inject, OnInit } from '@angular/core';
import { getChartConfig } from '../get-chart-config';
import { EChartsOption, PieSeriesOption } from 'echarts';
import { USER_SERVICE_WITH_PROMISE } from '../services/user.worker.container';
import { UserServiceWithPromise } from '../services/user.service';

@Component({
  selector: 'app-chart-bus-promise',
  templateUrl: './chart-bus-promise.component.html',
  styleUrls: ['./chart-bus-promise.component.less'],
})
export class ChartBusPromiseComponent implements OnInit {
  constructor(@Inject(USER_SERVICE_WITH_PROMISE) private userService: UserServiceWithPromise) {}

  chartOption = getChartConfig('Fetch data with bus worker');
  mergeOptions: EChartsOption = {};
  loading = false;

  async ngOnInit() {
    this.loading = true;

    try {
      const userComments = await this.userService.getUserComments();
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
    } finally {
      this.loading = false;
    }
  }
}
