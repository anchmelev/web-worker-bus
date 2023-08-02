import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxEchartsModule } from 'ngx-echarts';
import { ChartBusObservableComponent } from './chart-bus-observable/chart-bus-observable.component';
import { ChatComponent } from './chart/chat.component';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { PageContentComponent } from './page-content/page-content.component';
import { CommonModule } from '@angular/common';
import { ChartBusPromiseComponent } from './chart-bus-promise/chart-bus-promise.component';

const routes: Routes = [
  { path: 'chart', component: ChatComponent },
  { path: 'chart-bus-and-observable', component: ChartBusObservableComponent },
  { path: 'chart-bus-and-promise', component: ChartBusPromiseComponent },
  { path: '', pathMatch: 'full', redirectTo: '/chart' },
];

@NgModule({
  declarations: [ChatComponent, ChartBusObservableComponent, ChartBusPromiseComponent, PageContentComponent],
  imports: [CommonModule, NzSpinModule, RouterModule.forRoot(routes), NgxEchartsModule.forChild()],
  exports: [RouterModule],
})
export class AppRoutingModule {}
