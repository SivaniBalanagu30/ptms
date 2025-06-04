import { Component } from '@angular/core';
import { LoaderComponent } from './shared/loader/loader.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'skiOffice_US';
  excludeApis = [
    'https://timesheet.prutech.com/approverProjectResourcesDropDown',
    'https://timesheet.prutech.com/resourceId',
    'https://timesheet.prutech.com/ClientProjectsDropDown',
    'https://timesheet.prutech.com/uploadTimesheetsCheck'
  ]
  public loaderComponent = LoaderComponent;
  public filteredUrlPatterns = ['referencedata-api', ...this.excludeApis];
  // public filteredUrlPatterns = ['referencedata-api'];
}
