import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { ResourceDashboardComponent } from './resource-dashboard/resource-dashboard.component';
import { ApproverDashboardComponent } from './approver-dashboard/approver-dashboard.component';
import { AgGridModule } from 'ag-grid-angular';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { CustomDatePipe } from 'src/app/shared/datePipe/custom-date.pipe';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';


@NgModule({
  declarations: [
    AdminDashboardComponent,
    ResourceDashboardComponent,
    ApproverDashboardComponent,
    
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    AgGridModule,
    ModalModule.forRoot(),
    SharedModule,
    ReactiveFormsModule,
    ToastModule


  ], providers:[
    CustomDatePipe
  ]
})
export class DashboardModule { }
