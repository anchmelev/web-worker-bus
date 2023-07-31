import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule, NgZone } from '@angular/core';
import { NgObjectCopyTransport } from './ng-object-copy-transport';
import { NgxEchartsModule } from 'ngx-echarts';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { PieChartFill, PieChartOutline } from '@ant-design/icons-angular/icons';
import { USER_SERVICE } from './services/user.worker.container';
import { UserService } from './services/user.service';
import { MainThreadBus, ReturnType } from 'web-worker-bus';

const worker = new Worker(new URL('./services/user.worker', import.meta.url));
const userTransport = new NgObjectCopyTransport(worker);
MainThreadBus.instance.registerBusWorkers([userTransport]);
const userWorkerFactory = MainThreadBus.instance.createFactoryService(userTransport);

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
    NzIconModule.forChild([PieChartFill, PieChartOutline]),
  ],
  providers: [
    {
      provide: USER_SERVICE,
      useFactory: () => userWorkerFactory<UserService>(USER_SERVICE, ReturnType.rxjsObservable),
    },
    UserService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(private ngZone: NgZone) {
    userTransport.ngZone = this.ngZone;
  }
}
