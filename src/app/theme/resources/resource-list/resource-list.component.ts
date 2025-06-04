
import { StaticDataEntity } from 'src/app/shared/static-data';
import { Router } from '@angular/router';
import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { ColumnApi, GridOptions, GridReadyEvent,IDatasource,IGetRowsParams } from 'ag-grid-community';
import { HttpService } from 'src/app/services/http-service/http.service';
import { HttpParams } from '@angular/common/http';
import { PageReloadService } from 'src/app/services/auto-reload/page-reload.service';

@Component({
  selector: 'app-resource-list',
  templateUrl: './resource-list.component.html',
  styleUrls: ['./resource-list.component.css']
})
export class ResourceListComponent implements OnInit {
  resourceList: any;
  rowData = [];
  type:string = "All";
  resourcesColumnDefs: any;
  private gridApi: any;
  searchText;
  public gridColumnApi: ColumnApi;
  gridOptions: GridOptions = {
    pagination: true,
    rowModelType: 'infinite',
    cacheBlockSize: 10, // you can have your custom page size
    paginationPageSize: 10, //pagesize
    columnDefs: [
      { headerName: 'Resource ID', field: 'resource_details.resource_number', tooltipField:'resource_details.resource_number', sortable: true, suppressSizeToFit: true, width: 120 },
      { headerName: 'Resource Status', field: 'resource_details.status', tooltipField:'resource_details.status', sortable: true, suppressSizeToFit: true, width: 120, cellRenderer:(params)=>{
        const status = params.value;
        // const cellValue = status === 'Active' ? '<span style="color: #3F51B5;">Active</span>' : '<span style="color: red;">Inactive</span>';
        // return cellValue;
        if(status === 'Active'){
          return '<span style="color: #3F51B5;">Active</span>'
        }
        if(status === 'Inactive'){
          return '<span style="color: red;">Inactive</span>';
        }
      } },
      { headerName: 'First Name', field: 'resource_details.first_name', tooltipField:'resource_details.first_name', sortable: true, suppressSizeToFit: true, width: 120 },
      { headerName: 'Last Name', field: 'resource_details.last_name', tooltipField:'resource_details.last_name', sortable: true, suppressSizeToFit: true, width: 100 },
      { headerName: 'Email Id', field: 'resource_details.email_id', tooltipField:'resource_details.email_id', sortable: true, suppressSizeToFit: true, width: 210 },
      { headerName: 'Phone Number', field: 'resource_details.primary_phone_number', tooltipField:'resource_details.primary_phone_number', sortable: true, suppressSizeToFit: true, width: 170 },
      {
        headerName: 'Projects',
        field: 'resource_projects',
        sortable: true,
        suppressSizeToFit: true,
        width: 150,
        cellRenderer: (params: any) => {
          const projects = params.value;
          if (projects && projects.length > 0) {
            return projects.map((project: any) => project.project_name).join(', ');
          } else {
            return '';
          }
        },
        tooltipValueGetter:(params:any)=>{
          const projects = params.value;
          if (projects && projects.length > 0) {
            return projects.map((project: any) => project.project_name).join(', ');
          } else {
            return '';
          }
        }
      },
      { headerName: 'Employment Type', field: 'resource_details.employement_type.type', tooltipField:'resource_details.employement_type.type', sortable: true, suppressSizeToFit: true, width: 150 },
      {
        headerName: 'Actions',
        field: 'resource_details.status',
        // tooltipField:'resource_details.status',
        sortable: true,
        suppressSizeToFit: true,
        width: 100,
        cellRenderer: (params: any) => {
          if(params.data){
            // return '<i class="fa fa-eye" style="cursor: pointer; margin-right: 5px;" data-toggle="tooltip" data-placement="top" title="View Resource"></i>'
            // return "<img class='edit-view' width='32px' style='cursor:pointer' data-toggle='tooltip' data-placement='top' title='View/ Edit resource' src='../../../../assets/images/editview.png'>"
            return "<i data-toggle='tooltip' data-placement='top' title='Edit resource' style='margin-right:10px; cursor: pointer; font-size: 17px;'' class='edit fa-solid fas fa-file-pen'></i> <i class='view mr-1 fa-solid fa-file-lines'  style='cursor:pointer; font-size:17px' alt='fine-print--v1' data-toggle='tooltip' data-placement='top' title='View resource'></i>" 
          }
                //  '<i class="fa fa-pencil-square-o" style="cursor: pointer;"></i>';
        },
        onCellClicked: (params: any) => {
          const iconName = params.event.target.className;
          if (iconName.includes('view')) {
            let resourceId = params.data.resource_details.id;
            this.router.navigate(['/resources-list', 'view-resource', resourceId, 'view']);
          } else if (iconName.includes('edit')) {
            let resourceId = params.data.resource_details.id;
            this.router.navigate(['/resources-list', 'view-resource', resourceId, 'edit']);
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
        this.resourceList = result;
        if (result.resource_list?.length === 0) {
          this.gridApi.showNoRowsOverlay(); // Show "No data to show" message
        } else {
          this.gridApi.hideOverlay(); // Hide the overlay message
        }
        params.successCallback(result.resource_list, result.total_count);
      });
    }
  };
  
  doPostRequest(payload: any) {
    return this.httpservice.doPost(`allResourcesByStatus?pageNumber=${Number(this.pageNumber)}&pageSize=${Number(10)}`, payload);
  }
  
  getList(type: string) {
    this.type = type;
    return this.doPostRequest({ status: type });
  }
  
  getResourceList(type: string) {
    this.type = type;
    this.searchText = "";
    const payload = {
      status: this.type,
      search_key: this.searchText ? this.searchText : ""
    };
  
    this.doPostRequest(payload).subscribe((result) => {
      this.resourceList = result;
      if (this.gridApi) {
        this.gridApi.setDatasource(this.dataSource);
        this.gridApi.setFilterModel(null); // Clear any existing filter model
  
        if (result.resource_list?.length === 0) {
          this.gridApi.showNoRowsOverlay(); // Show "No data to show" message
        } else {
          this.gridApi.hideOverlay(); // Hide the overlay message
        }
      }
    });
  }

  @Output() gridReadyEvent: EventEmitter<GridReadyEvent> = new EventEmitter<GridReadyEvent>();
  pageNumber= 1;

  constructor(private inactivityService: PageReloadService,private httpservice: HttpService, private router:Router) { }

  ngOnInit(): void {
    // this.getResource();
    this.getList("All");
    this.inactivityService.startInactivityTimer();
  }
  
  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:keydown', ['$event'])

  onUserActivity(event: Event) {
    this.inactivityService.resetInactivityTimer();
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

  getResource() {
    let payload = {
      status: 'All', 
    };
      this.httpservice.doPost(`allResourcesByStatus?pageNumber=${Number(this.pageNumber)}&pageSize=${Number(10)}`, payload).subscribe((result) => {
        this.resourceList = result;
   
    });
  }  
   
  search() {
    const payload = {
      status: this.type,
      search_key: this.searchText ? this.searchText : ''
    };
  
    this.doPostRequest(payload).subscribe((result) => {
      this.resourceList = result;
      this.gridApi.setDatasource(this.dataSource);
    });
  }
  
  
  onPaginationChanged(event: any): void {
    // Check if the event is triggered by user interaction
    if (event.api.paginationGetCurrentPage() !== undefined) {
      const pageNumber = event.api.paginationGetCurrentPage() + 1;
      if (this.pageNumber !== pageNumber) {
        this.pageNumber = pageNumber;
        this.getResource();
      }
    }
  }
 
}