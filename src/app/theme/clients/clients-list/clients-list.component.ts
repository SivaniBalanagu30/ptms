import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ColumnApi, GridOptions, GridReadyEvent, IDatasource, IGetRowsParams } from 'ag-grid-community';
import { PageReloadService } from 'src/app/services/auto-reload/page-reload.service';
import { HttpService } from 'src/app/services/http-service/http.service';
import { CustomDatePipe } from 'src/app/shared/datePipe/custom-date.pipe';

@Component({
  selector: 'app-clients-list',
  templateUrl: './clients-list.component.html',
  styleUrls: ['./clients-list.component.css']
})
export class ClientsListComponent implements OnInit {
  rowData = [];
  private gridApi: any;
  clientsColumnDefs: any;
  clientList: any;
  pageNumber= 1;
  public gridColumnApi: ColumnApi;
  searchText;
  type:string = "All";
  @Output() gridReadyEvent: EventEmitter<GridReadyEvent> = new EventEmitter<GridReadyEvent>();

  gridOptions: GridOptions = {
    pagination: true,
    rowModelType: 'infinite',
    cacheBlockSize: 10, // you can have your custom page size
    paginationPageSize: 10, //pagesize
    columnDefs : [
      { headerName: 'Client Name', field: 'client_details.client_name', tooltipField:'client_details.client_name',sortable: true, suppressSizeToFit: true, width: 190 },
      { headerName: 'Client Status', field: 'client_details.status', tooltipField:'client_details.status', sortable: true, suppressSizeToFit: true, width: 120,cellRenderer:(params)=>{
        const status = params.value;
        // const cellValue = status === 'Active' ? '<span style="color: #3F51B5;">Active</span>' : '<span style="color: red;">Inactive</span>';
        // return cellValue;
        if(status === 'Active'){
          return '<span style="color: #3F51B5;">Active</span>'
        }
        if(status === 'Inactive'){
          return '<span style="color: red;">Inactive</span>'
        }
      }  },
      { headerName: 'Projects', field: 'project_count', tooltipField:'project_count', sortable: true, suppressSizeToFit: true, width: 120 },
      { headerName: 'Contact Email Id', field: 'client_details.email_id', tooltipField:'client_details.email_id', sortable: true, suppressSizeToFit: true, width: 200 },
      { headerName: 'Contact Phone Number', field: 'client_details.primary_phone_number', tooltipField:'client_details.primary_phone_number', sortable: true, suppressSizeToFit: true, width: 190 },
      // { headerName: 'Contract Executed', field: 'client_details.contract_executed_date', sortable: true, suppressSizeToFit: true, width: 150 },
      {
        headerName: 'Contract Executed',
        field: 'client_details.contract_agreement_executed',
        sortable: true,
        suppressSizeToFit: true,
        width: 200,
        cellRenderer:(params:any)=>{
          if(params.data){
            const executed = params.value == true ? '<span class="form-label">Yes</span>' : '<span class="form-label">No</span>';
            return executed;
          }
        },
        tooltipValueGetter:(params:any)=>{
          if(params.data){
            const executed = params.value == true ? 'Yes' : 'No';
            return executed;
          }
        }
      },
      {
        headerName: 'Actions',
        field: 'status',
        tooltipField:'status',
        sortable: true,
        suppressSizeToFit: true,
        width: 100,
        cellRenderer: (params: any) => {
          if(params.data){
            // return '<i class="fa fa-eye" style="cursor: pointer; margin-right: 5px;" data-toggle="tooltip" data-placement="top" title="View client"></i>'
            return "<i data-toggle='tooltip' data-placement='top' title='Edit client' style='cursor: pointer;margin-left:20px; font-size: 17px'' class='edit fa-solid fas fa-file-pen'>" 
          }
          //  '<i class="fa fa-pencil-square-o" style="cursor: pointer;"></i>';
        },
        onCellClicked: (params: any) => {
          const iconName = params.event.target.className;
          // if (iconName.includes('view')) {
          //   let clientId = params.data.client_details.id
          //   this.router.navigate(['/clients-list','client-view', clientId, 'view']);
          // } 
          if (iconName.includes('edit')) {
            // this.router.navigate(['add-client']);
            let clientId = params.data.client_details.id
            this.router.navigate(['/clients-list','client-view', clientId, 'edit']);
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
        this.clientList = result;
        if (result.clients?.length === 0) {
          this.gridApi.showNoRowsOverlay(); // Show "No data to show" message
        } else {
          this.gridApi.hideOverlay(); // Hide the overlay message
        }
        
    params.successCallback(result.clients, result.total_count);
      });
    }
  }
  doPostRequest(payload: any) {
    return this.httpService.doPost(`allClients?pageNumber=${Number(this.pageNumber)}&pageSize=${Number(10)}`, payload);
  }
  
  getList(type: string) {
    this.type = type;
    return this.doPostRequest({ status: type });
  }
  getClientsList(type:string){
    this.type = type;
    this.searchText = "";
    const payload = {
      status: this.type,
      search_key: this.searchText ? this.searchText : ""
    };
  
    this.doPostRequest(payload).subscribe((result) => {
      this.clientList = result;
      if (this.gridApi) {
        this.gridApi.setDatasource(this.dataSource);
        this.gridApi.setFilterModel(null); // Clear any existing filter model
  
        if (result.clients?.length === 0) {
          this.gridApi.showNoRowsOverlay(); // Show "No data to show" message
        } else {
          this.gridApi.hideOverlay(); // Hide the overlay message
        }
      }
    });
  }

  constructor(private inactivityService: PageReloadService,private router: Router, private httpService: HttpService, private customDatePipe: CustomDatePipe) {

   }

   @HostListener('document:mousemove', ['$event'])
  @HostListener('document:keydown', ['$event'])

  onUserActivity(event: Event) {
    this.inactivityService.resetInactivityTimer();
  }
 
  ngOnInit(): void {
    this.inactivityService.startInactivityTimer();
    //this.getAllClients();
    this.getList("All");
  }
 
  getAllClients() {
    let payload = {
      status: 'All',
    }
      this.httpService.doPost(`allClients?pageNumber=${Number(this.pageNumber)}&pageSize=${Number(10)}`, payload).subscribe((result) => {
        this.clientList = result;
      })

  }

  search(){
  const payload = {
    status: this.type,
    search_key: this.searchText ? this.searchText : ''
  };

  this.doPostRequest(payload).subscribe((result) => {
        this.clientList = result;
  this.gridApi.setDatasource(this.dataSource);
  });
  
  }
  onPaginationChanged(event: any): void {
    // Check if the event is triggered by user interaction
    if (event.api.paginationGetCurrentPage() !== undefined) {
      const pageNumber = event.api.paginationGetCurrentPage() + 1;
      if (this.pageNumber !== pageNumber) {
        this.pageNumber = pageNumber;
        this.getAllClients();
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

}
