import { Component, Inject, OnInit } from '@angular/core';
import { getChartConfig } from '../get-chart-config';
import { EChartsOption, PieSeriesOption } from 'echarts';
import { USER_SERVICE } from '../services/user.worker.container';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-chart-with-bus',
  templateUrl: './chart-with-bus.component.html',
  styleUrls: ['./chart-with-bus.component.less'],
})
export class ChartWithBusComponent implements OnInit {
  constructor(@Inject(USER_SERVICE) private userService: UserService) {}

  chartOption = getChartConfig('Fetch data with bus worker');
  mergeOptions: EChartsOption = {};
  loading = false;

  ngOnInit() {
    this.loading = true;
    this.userService.getUserCommentsByObservable().subscribe({
      next: (chartData: any) => {
        const series = this.chartOption.series as PieSeriesOption[];

        this.mergeOptions = {
          series: [
            {
              ...series[0],
              data: chartData.map((item: any) => ({
                id: item.userId,
                value: item.commentCount,
                name: item.userName,
              })),
            },
          ],
        };
      },
      error: (e: any) => console.error(e),
      complete: () => (this.loading = false),
    });
  }
}
