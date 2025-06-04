import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { TimesheetRoutingModule } from './timesheet-routing.module';
import { MyTimesheetComponent } from './my-timesheet/my-timesheet.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TimeSheetEntryComponent } from './time-sheet-entry/time-sheet-entry.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule, DatePickerInnerComponent } from 'ngx-bootstrap/datepicker';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { AgGridModule } from 'ag-grid-angular';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { CustomDatePipe } from 'src/app/shared/datePipe/custom-date.pipe';
import {MatSelectModule} from '@angular/material/select';
import { TimerSelectionComponent } from './timer-selection/timer-selection.component';
import { ToastModule } from 'primeng/toast';
import {MatTooltipModule} from '@angular/material/tooltip';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';


@NgModule({
  declarations: [
    MyTimesheetComponent,
    TimeSheetEntryComponent,
    TimerSelectionComponent,

  ],
  imports: [
    CommonModule,
    ToastModule,
    TimesheetRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    BsDatepickerModule,
    TabsModule.forRoot(),
    MatTabsModule,
    MatIconModule,
    MatFormFieldModule,
    PopoverModule,
    TimepickerModule,
    AgGridModule,
    ModalModule.forRoot(),
    SharedModule,
    MatSelectModule,
    MatTooltipModule,
    NgxMatSelectSearchModule

  ],
  providers :[
    CustomDatePipe,
  DatePipe
  ]
})
export class TimesheetModule { }
