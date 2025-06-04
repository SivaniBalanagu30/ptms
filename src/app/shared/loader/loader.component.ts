import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-loader',
  template: '<div class="loader-overlay"><div class="nettracer-dual-ring"></div></div>',
  styleUrls: [
    './loader.component.scss'
  ],
})
export class LoaderComponent {
  constructor() { }
}
