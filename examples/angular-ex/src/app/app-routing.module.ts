import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxEchartsModule } from 'ngx-echarts';
import { ChartWithBusComponent } from './chart-with-bus/chart-with-bus.component';
import { ChatComponent } from './chart/chat.component';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { PageContentComponent } from './page-content/page-content.component';
import { CommonModule } from '@angular/common';

const routes: Routes = [
  { path: 'chart', component: ChatComponent },
  { path: 'chart-with-bus', component: ChartWithBusComponent },
  { path: '', pathMatch: 'full', redirectTo: '/chart' },
];

@NgModule({
  declarations: [ChatComponent, ChartWithBusComponent, PageContentComponent],
  imports: [CommonModule, NzSpinModule, RouterModule.forRoot(routes), NgxEchartsModule.forChild()],
  exports: [RouterModule],
})
export class AppRoutingModule {}
