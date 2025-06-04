
import { HttpService } from 'src/app/services/http-service/http.service';
import { StaticDataEntity } from 'src/app/shared/static-data';
import { Router } from '@angular/router';
import { ColumnApi, GridOptions, GridReadyEvent, IDatasource, IGetRowsParams } from 'ag-grid-community';
import { ChangeDetectorRef, Component, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { PageReloadService } from 'src/app/services/auto-reload/page-reload.service';
@Component({
  selector: 'app-contractors-list',
  templateUrl: './contractors-list.component.html',
  styleUrls: ['./contractors-list.component.css']
})
export class ContractorsListComponent implements OnInit {
  contractorsList;
  resourcesColumnDefs;
  rowData = [];
  private gridApi: any;
  public gridColumnApi: ColumnApi;
  pageNumber= 1;
  searchText;
  type:string = "All";
  @Output() gridReadyEvent: EventEmitter<GridReadyEvent> = new EventEmitter<GridReadyEvent>();

  gridOptions: GridOptions = {
    pagination: true,
    rowModelType: 'infinite',
    cacheBlockSize: 10, // you can have your custom page size
    paginationPageSize: 10, //pagesize
    columnDefs : [
      { headerName: 'Vendor', field: 'contractor_details.company_name', tooltipField:'contractor_details.company_name', sortable: true, suppressSizeToFit: true, width: 180 },
      { headerName: 'Business Email', field: 'contractor_details.business_email', tooltipField:'contractor_details.business_email', sortable: true, suppressSizeToFit: true, width: 150 },
      { headerName: 'Vendor Status', field: 'contractor_details.status', tooltipField:'contractor_details.status', sortable: true, suppressSizeToFit: true, width: 120,cellRenderer:(params)=>{
        const status = params.value;
        // const cellValue = status === 'Active' ? '<span style="color: #3F51B5;">Active</span>' : '<span style="color: red;">Inactive</span>';
        // return cellValue;
        if(status == 'Active'){
          return '<span style="color: #3F51B5;">Active</span>'
        }
        if(status == 'Inactive'){
          return '<span style="color: red;">Inactive</span>'
        }
      }  },
      { headerName: 'Resources', field: 'resource_count', tooltipField:'resource_count', sortable: true, suppressSizeToFit: true, width: 90 },
      { headerName: 'Contact First Name', field: 'contractor_details.contact_first_name', tooltipField:'contractor_details.contact_first_name', sortable: true, suppressSizeToFit: true, width: 150 },
      { headerName: 'Contact Last Name', field: 'contractor_details.contact_last_name', tooltipField:'contractor_details.contact_last_name', sortable: true, suppressSizeToFit: true, width: 150 },
      { headerName: 'Contact Email Id', field: 'contractor_details.contact_email_id', tooltipField:'contractor_details.contact_email_id', sortable: true, suppressSizeToFit: true, width: 200 },
      { headerName: 'Contact Phone Number', field: 'contractor_details.contact_phone_number', tooltipField:'contractor_details.contact_phone_number', sortable: true, suppressSizeToFit: true, width: 155 },

      {
        headerName: 'Actions',
        field: 'resource_details.status',
        sortable: true,
        suppressSizeToFit: true,
        width: 100,
        cellRenderer: (params: any) => {
          if(params.data){
            // return '<i class="fa fa-eye" style="cursor: pointer; margin-right: 5px;" data-toggle="tooltip" data-placement="top" title="View Vendor"></i>' 
            return "<i data-toggle='tooltip' data-placement='top' title='Edit vendor' style='cursor: pointer; font-size: 17px; margin-left:20px'' class='edit fa-solid fas fa-file-pen'>" 

          }
                //  '<i class="fa fa-pencil-square-o" style="cursor: pointer;"></i>';
        },
        onCellClicked: (params: any) => {
          const iconName = params.event.target.className;
          // if (iconName.includes('view')) {
          //   let contractorId = params.data?.contractor_details.id;
          //   this.router.navigate(['/vendors-list','view-vendor', contractorId, 'view']);
          // }
          if (iconName.includes('edit')) {
            // this.router.navigate(['add-resource']);
            let contractorId = params.data?.contractor_details.id;
            this.router.navigate(['/vendors-list','view-vendor', contractorId, 'edit']);
          }
        }
      }
      
    ]
   
  };

  dataSource: IDatasource = {
    getRows: (params: IGetRowsParams) => {
      const payload = {
        status: this.type,
        search_key: this.searchText ? this.searchText : ''
      };
  
      this.doPostRequest(payload).subscribe((result) => {
        this.contractorsList = result;
        if (result.contractors?.length === 0) {
          this.gridApi.showNoRowsOverlay(); // Show "No data to show" message
        } else {
          this.gridApi.hideOverlay(); // Hide the overlay message
        }
        params.successCallback(result.contractors, result.total_count);
      });
    }
  }
  doPostRequest(payload: any) {
    return this.httpservice.doPost(`allContactors?pageNumber=${Number(this.pageNumber)}&pageSize=${Number(10)}`, payload);
  }
  getList(type: string) {
    this.type = type;
    return this.doPostRequest({ status: type });
  }
  getContractorsList(type: string) {
    this.type = type;
    this.searchText = "";
    const payload = {
      status: this.type,
      search_key: this.searchText ? this.searchText : ""
    };
  
    this.doPostRequest(payload).subscribe((result) => {
      this.contractorsList = result;
      if (this.gridApi) {
        this.gridApi.setDatasource(this.dataSource);
        this.gridApi.setFilterModel(null); // Clear any existing filter model
  
        if (result.contractors?.length === 0) {
          this.gridApi.showNoRowsOverlay(); // Show "No data to show" message
        } else {
          this.gridApi.hideOverlay(); // Hide the overlay message
        }
      }
    });
  }
  
  constructor(private inactivityService: PageReloadService,private httpservice: HttpService, private router: Router) { }
  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:keydown', ['$event'])

  onUserActivity(event: Event) {
    this.inactivityService.resetInactivityTimer();
  }
  ngOnInit(): void {
    // this.getContractors();
    this.inactivityService.startInactivityTimer();
    this.getList("All");
   
  }
  getContractors() {
    let payload ={
      status:'All'
    }
    this.httpservice.doPost(`allContactors?pageNumber=${Number(this.pageNumber)}&pageSize=${Number(10)}`, payload).subscribe((result) => {
      this.contractorsList = result
    })
  }
  search(){
      const payload = {
        status: this.type,
        search_key: this.searchText ? this.searchText : ''
      };
    
      this.doPostRequest(payload).subscribe((result) => {
        this.contractorsList = result;
        this.gridApi.setDatasource(this.dataSource);
      });
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

  onPaginationChanged(event: any): void {
    // Check if the event is triggered by user interaction
    if (event.api.paginationGetCurrentPage() !== undefined) {
      const pageNumber = event.api.paginationGetCurrentPage() + 1;
      if (this.pageNumber !== pageNumber) {
        this.pageNumber = pageNumber;
        this.getContractors();
      }
    }
  }
}
