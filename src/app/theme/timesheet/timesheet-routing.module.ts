import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyTimesheetComponent } from './my-timesheet/my-timesheet.component';

const routes: Routes = [{ path: '', component: MyTimesheetComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TimesheetRoutingModule { }
