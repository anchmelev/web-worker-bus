import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-content',
  templateUrl: './page-content.component.html',
  styleUrls: ['./page-content.component.less'],
})
export class PageContentComponent {
  @Input() loading = false;
}
