import { HttpService } from 'src/app/services/http-service/http.service';
import { StaticDataEntity } from 'src/app/shared/static-data';
import { Router } from '@angular/router';
import { ColumnApi, GridOptions, GridReadyEvent, IDatasource, IGetRowsParams } from 'ag-grid-community';
import { ChangeDetectorRef, Component, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { PageReloadService } from 'src/app/services/auto-reload/page-reload.service';


@Component({
  selector: 'app-my-projects',
  templateUrl: './my-projects.component.html',
  styleUrls: ['./my-projects.component.css']
})
export class MyProjectsComponent implements OnInit {
  myProjectsColumnsDefs;
  myProjectsList;
  private gridApi: any;

  @Output() gridReadyEvent: EventEmitter<GridReadyEvent> = new EventEmitter<GridReadyEvent>();
  public gridColumnApi: ColumnApi;
  role: any;
  constructor(private inactivityService: PageReloadService,private httpservice: HttpService, private router: Router) { }
  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:keydown', ['$event'])

  onUserActivity(event: Event) {
    this.inactivityService.resetInactivityTimer();
  }
  ngOnInit(): void {
    this.inactivityService.startInactivityTimer();
    this.role = localStorage.getItem('role')
    this.getMyProjects();

    this.myProjectsColumnsDefs = [
      { headerName: 'Project Name', field: 'project.project_name', tooltipField:'project.project_name', sortable: true, suppressSizeToFit: true, width: 200 },
      { headerName: 'Client Name', field: 'project.client.client_name', tooltipField:'project.client.client_name', sortable: true, suppressSizeToFit: true, width: 180 },

      {
        headerName: 'Reporting Manager',
        field: 'project.project_manager.first_name + " " + project.project_manager.middle_name + " " + project.project_manager.last_name',
        sortable: true,
        suppressSizeToFit: true,
        width: 150,
        valueGetter: (params) => {
          const projectManager = params.data.project?.project_manager;
          if (projectManager) {
            return `${projectManager.first_name} ${projectManager.middle_name} ${projectManager.last_name}`;
          }
          return '';
        },
        tooltipValueGetter:(params:any)=>{
          const projectManager = params.data.project?.project_manager;
          if (projectManager) {
            return `${projectManager.first_name} ${projectManager.middle_name} ${projectManager.last_name}`;
          }
          return '';
        }
      },
      {
        headerName: 'Time Approver', field: 'project.time_approver.first_name + project.time_approver.middle_name + project.time_approver.last_name', sortable: true, suppressSizeToFit: true, width: 150,
        valueGetter: (params) => {
          const time_approver = params.data.project?.time_approver;
          if (time_approver) {
            return `${time_approver.first_name} ${time_approver.middle_name} ${time_approver.last_name}`;
          }
          return '';
        },
        tooltipValueGetter:(params:any)=>{
          const time_approver = params.data.project?.project_manager;
          if (time_approver) {
            return `${time_approver.first_name} ${time_approver.middle_name} ${time_approver.last_name}`;
          }
          return '';
        }
      },


      { headerName: 'Work Hours Limit', field: 'work_hour_limit', tooltipField:'work_hour_limit', sortable: true, suppressSizeToFit: true, width: 150 },

      { headerName: 'Status', field: 'status', tooltipField:'status', sortable: true, suppressSizeToFit: true, width: 100, cellRenderer:(params)=>{
        const status = params.value;
        const cellValue = status === 'Assigned' ? '<span style="color: green;">Assigned</span>' : '<span style="color: red;">Unassigned</span>';
        return cellValue;
      }   },

    ]
  }

  getMyProjects() {
    this.httpservice.doGet(StaticDataEntity.myProjectsList).subscribe((result: any) => {
      this.myProjectsList = result;
    })
  }

  onGridReady(event: GridReadyEvent): void {
    this.gridReadyEvent.emit(event);
    this.gridApi = event.api;
    this.gridColumnApi = event.columnApi;
    this.gridApi.sizeColumnsToFit();
    this.gridApi.setDomLayout('autoHeight');
    window.onresize = () => {
      this.gridApi.sizeColumnsToFit();
  }
  }


}
