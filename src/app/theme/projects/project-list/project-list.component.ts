import { HttpService } from 'src/app/services/http-service/http.service';
import { StaticDataEntity } from 'src/app/shared/static-data';
import { Router } from '@angular/router';
import { ColumnApi, GridOptions, GridReadyEvent, IDatasource, IGetRowsParams } from 'ag-grid-community';
import { ChangeDetectorRef, Component, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { CustomDatePipe } from 'src/app/shared/datePipe/custom-date.pipe';
import { ActivatedRoute } from '@angular/router';
import { PageReloadService } from 'src/app/services/auto-reload/page-reload.service';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent implements OnInit {
  resourcesColumnDefs;
  myProjectsColumnsDefs;
  rowData = [];
  tabIndex;
  searchText;
  projectList;
  type:string = "All";
  private gridApiNew: any;
  role;
  myProjectsList;
  private gridApi: any;

  @Output() gridReadyEvent: EventEmitter<GridReadyEvent> = new EventEmitter<GridReadyEvent>();
  public gridColumnApi: ColumnApi;
  pageNumber=1;

  constructor(private inactivityService: PageReloadService,private httpservice: HttpService, private router: Router,private route: ActivatedRoute, private customDatePipe: CustomDatePipe) { }
  gridOptions: GridOptions = {
    pagination: true,
    rowModelType: 'infinite',
    cacheBlockSize: 10, // you can have your custom page size
    paginationPageSize: 10, //pagesize
    columnDefs :[
      { headerName: 'Project Name', field: 'project_details.project_name', tooltipField:'project_details.project_name',sortable: true, suppressSizeToFit: true, width: 190 },
      { headerName: 'Project Status', field: 'project_details.status', tooltipField:'project_details.status', sortable: true, suppressSizeToFit: true, width: 100,cellRenderer:(params)=>{
        const status = params.value;
        // const cellValue = status === 'Active' ? '<span style="color: #3F51B5;">Active</span>' : '<span style="color: red;">Inactive</span>';
        // return cellValue;
        if(status === 'Active'){
          return '<span style="color: #3F51B5;">Active</span>';
        }
        if(status === 'Inactive'){
          return '<span style="color: red;">Inactive</span>'
        }
      }  },

      { headerName: 'Client Name', field: 'project_details.client.client_name', tooltipField:'project_details.client.client_name', sortable: true, suppressSizeToFit: true, width: 150 },
      {
        headerName: 'Start Date',
        field: 'project_details.start_date',
        sortable: true,
        suppressSizeToFit: true,
        width: 150,
        valueGetter: (params) => {
          const startandEndDate = params.data?.project_details.start_date;
          if (startandEndDate) {
            const formattedStartDate = this.customDatePipe.transform(startandEndDate);
            return `${formattedStartDate}`;
          }
          return '';
        },
        tooltipValueGetter:(params:any)=>{
          const startandEndDate = params.data?.project_details.start_date;
          if (startandEndDate) {
            const formattedStartDate = this.customDatePipe.transform(startandEndDate);
            return `${formattedStartDate}`;
          }
          return '';
        }
      },
      {
        headerName: 'End Date',
        field: 'project_details.end_date',
        sortable: true,
        suppressSizeToFit: true,
        width: 150,
        valueGetter: (params) => {
          const startandEndDate = params.data?.project_details.end_date;
          if (startandEndDate) {
            const formattedStartDate = this.customDatePipe.transform(startandEndDate);
            return `${formattedStartDate}`;
          }
          return '';
        },
        tooltipValueGetter:(params:any)=>{
          const startandEndDate = params.data?.project_details.end_date;
          if (startandEndDate) {
            const formattedStartDate = this.customDatePipe.transform(startandEndDate);
            return `${formattedStartDate}`;
          }
          return '';
        }
      },
      { headerName: 'Resources', field: 'resource_count', tooltipField:'resource_count', sortable: true, suppressSizeToFit: true, width: 150 },

      {
        headerName: 'Actions',
        field: 'resource_details.status',
        tooltipField:'resource_details.status',
        sortable: true,
        suppressSizeToFit: true,
        width: 100,
        cellRenderer: (params: any) => {
          if(params.data){
            // return '<i class="fa fa-eye" style="cursor: pointer; margin-right: 5px;" data-toggle="tooltip" data-placement="top" title="View Project"></i>'
            return "<i data-toggle='tooltip' data-placement='top' title='Edit project' style='cursor: pointer; font-size: 17px; margin-left:20px;'' class='edit fa-solid fas fa-file-pen'>" 

          }
          //  '<i class="fa fa-pencil-square-o" style="cursor: pointer;"></i>';
        },
        onCellClicked: (params: any) => {
          const iconName = params.event.target.className;
          // if (iconName.includes('view')) {
          //   let clientId = params.data.project_details.id
          //   this.router.navigate(['/project-list','project-view', clientId, 'view']);
          // }
          if (iconName.includes('edit')) {
            // this.router.navigate(['add-resource']);
            let clientId = params.data.project_details.id
            this.router.navigate(['/project-list','project-view', clientId,'edit']);
          }
        }
      }

    ],
   
  };
  dataSource: IDatasource = {
    getRows: (params: IGetRowsParams) => {
      const payload = {
        status: this.type,
        search_key: this.searchText ? this.searchText : ''
      };
  
      this.doPostRequest(payload).subscribe((result) => {
        this.projectList = result;
        if (result.projects?.length === 0) {
          this.gridApi.showNoRowsOverlay(); // Show "No data to show" message
        } else {
          this.gridApi.hideOverlay(); // Hide the overlay message
        }
    params.successCallback(result.projects, result.total_count);
      });
    }
  }
  doPostRequest(payload: any) {
    return this.httpservice.doPost(`allProjects?pageNumber=${Number(this.pageNumber)}&pageSize=${Number(10)}`, payload);
  }
  getList(type: string) {
    this.type = type;
    return this.doPostRequest({ status: type });
  }
  getProjectsList(type:string){
    this.type = type;
    this.searchText = "";
    const payload = {
      status: this.type,
      search_key: this.searchText ? this.searchText : ""
    };
  
    this.doPostRequest(payload).subscribe((result) => {
      this.projectList = result;
      if (this.gridApi) {
        this.gridApi.setDatasource(this.dataSource);
        this.gridApi.setFilterModel(null); // Clear any existing filter model
  
        if (result.projects?.length === 0) {
          this.gridApi.showNoRowsOverlay(); // Show "No data to show" message
        } else {
          this.gridApi.hideOverlay(); // Hide the overlay message
        }
      }
    });
  }
  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:keydown', ['$event'])

  onUserActivity(event: Event) {
    this.inactivityService.resetInactivityTimer();
  }

  ngOnInit(): void {
    this.inactivityService.startInactivityTimer();
    this.role = localStorage.getItem('role')
    this.getList("All");
    this.route.queryParams.subscribe(params => {
      const storedTabIndex = params['id'];
      if (storedTabIndex === '1' ) {
        this.tabIndex = 1;
      } else {
        this.tabIndex = 0;
      }
    });
   
  }

  getProjects() {
    let payload = {
      status: 'All'
    }
    this.httpservice.doPost(StaticDataEntity.allProjects, payload).subscribe((result: any) => {
      this.projectList = result
    })
  }

  search(){
    const payload = {
      status: this.type,
      search_key: this.searchText ? this.searchText : ''
    };
  
    this.doPostRequest(payload).subscribe((result) => {
        this.projectList = result;
    this.gridApi.setDatasource(this.dataSource);
    });
  }
  onPaginationChanged(event: any): void {
    // Check if the event is triggered by user interaction
    if (event.api.paginationGetCurrentPage() !== undefined) {
      const pageNumber = event.api.paginationGetCurrentPage() + 1;
      if (this.pageNumber !== pageNumber) {
        this.pageNumber = pageNumber;
        this.getProjects();
      }
    }
  }






  onGridReady(event: GridReadyEvent): void {
    this.gridReadyEvent.emit(event);
    this.gridApi = event.api;
    this.gridColumnApi = event.columnApi;
    this.gridApi.sizeColumnsToFit();
    this.gridApi.setDomLayout('autoHeight');
    this.gridApi.setDatasource(this.dataSource)
    window.onresize = () => {
      this.gridApi.sizeColumnsToFit();
  }
  }
  onGridReadyMyProjects(event: GridReadyEvent): void {
    this.gridReadyEvent.emit(event);
    this.gridApiNew = event.api;
    this.gridColumnApi = event.columnApi;
    this.gridApiNew.sizeColumnsToFit();
    this.gridApiNew.setDomLayout('autoHeight');
    window.onresize = () => {
      this.gridApiNew.sizeColumnsToFit();
    }
  }



}
