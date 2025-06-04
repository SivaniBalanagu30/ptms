import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { ProjectsRoutingModule } from './projects-routing.module';
import { ProjectListComponent } from './project-list/project-list.component';
import { AddProjectComponent } from './add-project/add-project.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { BsDatepickerModule, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ProjectViewComponent } from './project-view/project-view.component';
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { MyProjectsComponent } from './my-projects/my-projects.component';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { CustomDatePipe } from 'src/app/shared/datePipe/custom-date.pipe';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ToastModule } from 'primeng/toast';

@NgModule({
  declarations: [
    ProjectListComponent,
    AddProjectComponent,
    ProjectViewComponent,
    MyProjectsComponent,
  ],
  imports: [
    MatFormFieldModule,
    MatIconModule,
    MatTabsModule,
    ToastModule,
    CommonModule,
    ProjectsRoutingModule,
    FormsModule,
     ReactiveFormsModule ,
     AgGridModule,
     BsDatepickerModule.forRoot(),
     NgMultiSelectDropDownModule.forRoot(),
     TabsModule.forRoot(),
     ModalModule.forRoot(),
     SharedModule

    ],
    providers:[
      CustomDatePipe
    ]
})
export class ProjectsModule { }
