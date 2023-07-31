import { Component, OnInit } from '@angular/core';
import { EChartsOption, PieSeriesOption } from 'echarts';
import { getChartConfig } from '../get-chart-config';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.less'],
})
export class ChatComponent implements OnInit {
  constructor(private userService: UserService) {}

  chartOption = getChartConfig('Simple fetch data');
  mergeOptions: EChartsOption = {};
  loading = false;

  ngOnInit() {
    this.loading = true;
    this.userService.getUserCommentsByObservable().subscribe({
      next: (chartData) => {
        const series = this.chartOption.series as PieSeriesOption[];

        this.mergeOptions = {
          series: [
            {
              ...series[0],
              data: chartData.map((item) => ({
                id: item.userId,
                value: item.commentCount,
                name: item.userName,
              })),
            },
          ],
        };
      },
      error: (e) => console.error(e),
      complete: () => (this.loading = false),
    });
  }
}
