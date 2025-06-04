import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { ApproverRoutingModule } from './approver-routing.module';
import { ApproversListComponent } from './approvers-list/approvers-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { CustomDatePipe } from 'src/app/shared/datePipe/custom-date.pipe';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { AdminListComponent } from './admin-list/admin-list.component';
import { MatTabsModule } from '@angular/material/tabs';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ToastModule } from 'primeng/toast';
import {MatTooltipModule} from '@angular/material/tooltip';



@NgModule({
  declarations: [
    ApproversListComponent,
    AdminListComponent,
    
  ],
  imports: [
    CommonModule,
    ApproverRoutingModule,
    FormsModule, ReactiveFormsModule,
    AgGridModule,
    ModalModule.forRoot(),
    SharedModule,
    MatFormFieldModule,
    MatSelectModule,
    TabsModule.forRoot(),
    MatTabsModule,
    BsDatepickerModule,
    ToastModule,
    MatTooltipModule
    
  ],
  providers:[
    CustomDatePipe

  ]
})
export class ApproverModule { }
