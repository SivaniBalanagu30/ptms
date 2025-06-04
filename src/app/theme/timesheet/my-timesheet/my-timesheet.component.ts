  
		  import { HttpService } from 'src/app/services/http-service/http.service';
      import { StaticDataEntity } from 'src/app/shared/static-data';
      import { ActivatedRoute, Router } from '@angular/router';
      import { ColumnApi, GridReadyEvent } from 'ag-grid-community';
      import { ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
      import { CustomDatePipe } from 'src/app/shared/datePipe/custom-date.pipe';
      import { DatePipe } from '@angular/common';
      import {SharedService} from 'src/app/services/shared-service'
      import { GeneratePdfService } from 'src/app/services/timesheet-generate-pdf/generate-pdf.service';
import * as moment from 'moment';
import { ToastService } from 'src/app/services/toast.service';
import { PageReloadService } from 'src/app/services/auto-reload/page-reload.service';

      @Component({
        selector: 'app-my-timesheet',
        templateUrl: './my-timesheet.component.html',
        styleUrls: ['./my-timesheet.component.css']
      })
      export class MyTimesheetComponent implements OnInit {
        tabIndex: number = 0;
        private gridApi: any;
        public gridColumnApi: ColumnApi;
        timeSheetList;
        datePickerConfig: any;
        startDate;
        @Input() params: any;
        endDate;
        timesheetDetails;
        timesheetColumnsDefs;
        totalHours = 0;
        maxMonthDate;
        backgroundColors = ["#f0f0f0","#F7FBFF"];
        gridConfigurations: any[] = [];
        viewColumnsDefs: any[]; // Declare the array to hold column definitions
        searchText = new Date();
        @ViewChild('timesheetData') timesheetDataModal;
        @Output() gridReadyEvent: EventEmitter<GridReadyEvent> = new EventEmitter<GridReadyEvent>();
        dates: any;
        minMonthDate;
        tableData: any;
        dd: {
          content: ({
            columns: { width: string; alignment: string; stack: { image: unknown; fit: number[]; alignment: string; margin: number[]; }[]; }[]; width?: undefined; text?: undefined; alignment?: undefined; bold?: undefined; // const totalHours = diffInMilliseconds / (1000 * 60 * 60);
            // const totalHours = diffInMilliseconds / (1000 * 60 * 60);
            color?: undefined; fontSize?: undefined; margin?: undefined; canvas?: undefined; stack?: undefined; columnGap?: undefined; pageBreak?: undefined;
          } | {
            width: string; text: string; alignment: string; bold: boolean; // Add bold font weight
            color: string; fontSize: number; margin: number[]; columns?: undefined; canvas?: undefined; stack?: undefined; columnGap?: undefined; pageBreak?: undefined;
          } | {
            canvas: {
              type: string; x1: number; y1: number; // Adjust the y1 coordinate to start at the same level as the previous element
              x2: number; // Subtracting the right margin
              y2: number; // Adjust the y2 coordinate to end at the same level as the previous element
              lineWidth: number; lineColor: string;
            }[]; columns?: undefined; width?: undefined; text?: undefined; alignment?: undefined; bold?: undefined; // const totalHours = diffInMilliseconds / (1000 * 60 * 60);
            // const totalHours = diffInMilliseconds / (1000 * 60 * 60);
            color?: undefined; fontSize?: undefined; margin?: undefined; stack?: undefined; columnGap?: undefined; pageBreak?: undefined;
          } | {
            text: string; margin: number[]; // Adjust the top and bottom padding here
            columns?: undefined; width?: undefined; alignment?: undefined; bold?: undefined; // const totalHours = diffInMilliseconds / (1000 * 60 * 60);
            // const totalHours = diffInMilliseconds / (1000 * 60 * 60);
            color?: undefined; fontSize?: undefined; canvas?: undefined; stack?: undefined; columnGap?: undefined; pageBreak?: undefined;
          } | {
            stack: {
              table: {
                headerRows: number; body: any[]; widths: number[]; // Set the desired width values for each column
                layout: { defaultBorder: boolean; hLineWidth: () => number; vLineWidth: () => number; hLineColor: () => string; vLineColor: () => string; };
              };
            }[]; margin: number[]; columns?: undefined; width?: undefined; text?: undefined; alignment?: undefined; bold?: undefined; // const totalHours = diffInMilliseconds / (1000 * 60 * 60);
            // const totalHours = diffInMilliseconds / (1000 * 60 * 60);
            color?: undefined; fontSize?: undefined; canvas?: undefined; columnGap?: undefined; pageBreak?: undefined;
          } | {
            columns: ({ width: number; text: string; alignment: string; color: string; bold: boolean; fontSize: number; margin: number[]; stack?: undefined; } | {
              width: string; stack: ({
                text: string; alignment: string; italics: boolean; color: string; fontSize: number; margin: number[]; // Adjust margin as needed
                canvas?: undefined;
              } | {
                canvas: {
                  type: string; x1: number; y1: number; x2: number; // Adjust the width of the line as needed
                  y2: number; lineWidth: number; lineColor: string; margin: number[]; // Adjust the gap between line and signature
                }[]; text?: undefined; alignment?: undefined; italics?: undefined; // const totalHours = diffInMilliseconds / (1000 * 60 * 60);
                color?: undefined; fontSize?: undefined; margin?: undefined;
              })[]; margin: number[]; // Adjust margin as needed
              text?: undefined; alignment?: undefined; // const totalHours = diffInMilliseconds / (1000 * 60 * 60);
              color?: undefined; bold?: undefined; // const totalHours = diffInMilliseconds / (1000 * 60 * 60);
              fontSize?: undefined;
            } | {
              width: string; text: string; alignment: string; color: string; fontSize: number; margin: number[]; bold?: undefined; // const totalHours = diffInMilliseconds / (1000 * 60 * 60);
              stack?: undefined;
            })[]; columnGap: number; width
            // Default return if none of the conditions match
            ?:
            // Default return if none of the conditions match
            undefined // Default return if none of the conditions match
            ; text // Default return if none of the conditions match
            ? // Default return if none of the conditions match
            : undefined; alignment?: undefined; bold?: undefined; // const totalHours = diffInMilliseconds / (1000 * 60 * 60);
            // const totalHours = diffInMilliseconds / (1000 * 60 * 60);
            color?: undefined; fontSize?: undefined; margin?: undefined; canvas?: undefined; stack?: undefined; pageBreak?: undefined;
          } | {
            text: string; pageBreak: string; columns?: undefined; width?: undefined; alignment // this.showModal();
              ? // this.showModal();
              : undefined // this.showModal();
              ; bold?: undefined; // const totalHours = diffInMilliseconds / (1000 * 60 * 60);
            // const totalHours = diffInMilliseconds / (1000 * 60 * 60);
            color?: undefined; fontSize?: undefined; margin?: undefined; canvas?: undefined; stack?: undefined; columnGap?: undefined;
          })[];
        };
        gridConfig: { rowData: any; columnDefs: any[]; pagination: boolean; paginationPageSize: number; };
        uploadOption: any;
        statusSortDirection: 'asc' | 'desc' = 'asc';
      
        constructor(private inactivityService: PageReloadService,private toast: ToastService, private httpservice: HttpService,private readonly activatedRoute: ActivatedRoute, private sharedService : SharedService,
           private router: Router,private datePipe: DatePipe,  private customDatePipe: CustomDatePipe, private genneratePdfservice: GeneratePdfService) { 
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth();
            this.maxMonthDate = new Date(currentYear, currentMonth);
            this.minMonthDate = new Date(currentYear, 0);
            this.datePickerConfig = {
              dateInputFormat: 'MM-YYYY',
              minMode: 'month',
              minDate: this.minMonthDate,
              maxDate: this.maxMonthDate
            };
                                 
        }

      
        @HostListener('document:mousemove', ['$event'])
        @HostListener('document:keydown', ['$event'])

        onUserActivity(event: Event) {
          this.inactivityService.resetInactivityTimer();
        }
        
        ngOnInit(): void {
          this.uploadOption = localStorage.getItem('uploadOption')
          this.inactivityService.startInactivityTimer();
          const storedTabIndex = localStorage.getItem('activeTabIndex');
          if (storedTabIndex) {
            this.tabIndex = parseInt(storedTabIndex, 10);
          }
          this.getTimeSheets();
          this.timesheetColumnsDefs = [
            {
              headerName: 'Dates',
              field: 'start_date+" - "+ end_date',
              sortable: true,
              suppressSizeToFit: true,
              width: 300,
              valueGetter: (params) => {
                const startandEndDate = params.data;
                if (startandEndDate) {
                  const formattedStartDate = this.customDatePipe.transform(
                    startandEndDate.start_date
                  );
                  const formattedEndDate = this.customDatePipe.transform(
                    startandEndDate.end_date
                  );
                  return `${formattedStartDate} - ${formattedEndDate}`;
                }
                return '';
              },
            },
            {
              headerName: 'Status',
              field: 'status',
              sortable: true,
              tooltipField: 'status',
              suppressSizeToFit: true,
              width: 200,
              cellRenderer: (params: any) => {
                if (params.data?.status === 'Submitted') {
                  return '<span style="color: green; class="form-label">Submitted</span>';
                }
                if (params.data?.status === 'Approved') {
                  return '<span style="color: #3F51B5;">Approved</span>';
                }
                if (params.data?.status === 'Rejected') {
                  return '<span style="color: red;" class="form-label">Rejected</span>';
                }
                if (params.data?.status === 'NotSubmitted') {
                  return '<span style="color: #bf9000;" class="form-label">Pending</span>';
                }
                if (params.data?.status === 'Saved') {
                  return '<span style= "color: #674ea7;" class="form-label">Draft</span>';
                }
              },
            },
            {
              headerName: 'Comments',
              field: 'approver_comments',
              sortable: true,
              supressSizeToFit: true,
              width: 120,
              valueGetter: (params) => {
                const approverComments = params.data?.approver_comments;
                if (approverComments) {
                  return `${approverComments}`;
                }
              },
            },
            {
              headerName: 'Actions',
              field: 'status',
              sortable: true,
              suppressSizeToFit: true,
              width: 150,
              cellRenderer: (params: any) => {

                if (params.data.status === 'Approved') {
                  return '<i class="fa fa-file-pdf-o" style="cursor: pointer; margin-right: 5px;color: red;" data-toggle="tooltip" data-placement="top" title="Download Timesheets"></i>';
                } else if (
                  params.data.status === 'Saved' ||
                  params.data.status === 'Submitted'
                ) {
                  return (
                    "<img class='view mr-1' width='17' height='17' style='cursor:pointer' src='https://img.icons8.com/ios/50/fine-print--v1.png' alt='fine-print--v1' data-toggle='tooltip' data-placement='top' title='View timesheets' />"+
                    '<i class="fa fa-pencil-square-o" style="cursor: pointer;color: #3F51B5; font-size: 17px; margin-right: 5px;" data-toggle="tooltip" data-placement="top" title="Edit Timesheets"></i>'
                  );
                } else if (params.data.status === 'NotSubmitted') {
                  return '<i class="fa fa-pencil-square-o" style="cursor: pointer; margin-right: 5px;" data-toggle="tooltip" data-placement="top" title="Edit Timesheets"></i>';
                }

                // Default return if none of the conditions match
                return '';
              },
              onCellClicked: (params: any) => {
                this.startDate = params.data.start_date;
                this.endDate = params.data.end_date;
                const iconName = params.event.target.className;
                if (iconName.includes('fa-eye')) {
                  // this.showModal();
                }
              },
            },
          ];
          this.viewColumnsDefs = [
            { headerName: 'Date', field: 'ts_date', sortable: true, suppressSizeToFit: true, width: 150,  valueGetter:(params)=>{
              return this.customDatePipe.transform(params.data.ts_date);
            },
            tooltipValueGetter:(params:any)=>{
              return this.customDatePipe.transform(params.data.ts_date);
            }
          },
            { headerName: 'Milestone', field: 'milestone_name', tooltipField: 'milestone_name', sortable: true, suppressSizeToFit: true, width: 100 },
            { headerName: 'Start Time', field: 'ts_start_time', tooltipField: 'ts_start_time', sortable: true, suppressSizeToFit: true, width: 100 },
            { headerName: 'Meal Start', field: 'meal_start_time', tooltipField: 'meal_start_time', sortable: true, suppressSizeToFit: true, width: 100 },
            { headerName: 'Meal End', field: 'meal_end_time', tooltipField: 'meal_end_time', sortable: true, suppressSizeToFit: true, width: 100 },
            { headerName: 'End Time', field: 'ts_end_time', tooltipField: 'ts_end_time', sortable: true, suppressSizeToFit: true, width: 100 },
            { headerName: 'Work Hours', field: 'work_hour', tooltipField: 'work_hour', sortable: true, suppressSizeToFit: true, width: 100 },
            { headerValueGetter: () => {
              if(this.gridConfig.rowData.resource_details?.timesheet_status == "Rejected"){
                return "Rejected By"
              }else{
                return "Approved By"
              }
            }, field: 'approver_name', tooltipField: 'approver_name', sortable: true, suppressSizeToFit: true, width: 150 },
            // { headerName: 'Status', field: 'status', sortable: true, suppressSizeToFit: true, width: 130,         cellRenderer: (params: any) => {
            //   if (params.data?.status === 'Submitted') {
            //     return'<span style="color: green;" class="form-label">Submitted</span>';
            //   }
            //   if (params.data?.status === 'Approved' ) {
            //     return '<span style="color: #3F51B5;" class="form-label">Approved</span>'
            //   }
            //   if(params.data?.status === 'Rejected'){
            //     return '<span style="color: red;" class="form-label">Rejected</span>';
            //   }
            //   if(params.data?.status === 'NotSubmitted'){
            //     return '<span style="color: #bf9000;" class="form-label">Pending Submission</span>';
            //   }
            //   if(params.data?.status === 'Saved'){
            //     return '<span style= "color: #674ea7;" class="form-label">Draft</span>';
            //   }
            // }},
            {
              headerName: 'Activity',
              field: 'comments',
              sortable: true,
              suppressSizeToFit: true,
              width: 100,
              tooltipField: 'comments',
              valueFormatter: function (params) {
                if (params.value && params.value.length > 10) {
                  return params.value.substring(0, 10) + '...';
                }
                return params.value; 
              },
            },
          ];
          if(this.activatedRoute.snapshot.queryParams['status'] == 2) {
            this.tabIndex = 1;
          }
      
        }

     

     
       
        
        
        
        
        
        

      

        editTimesheet(params: any) {
          this.sharedService.setParams(params);
          this.router.navigate(['/myTimeSheet'], {
            queryParams: {
              startDate: params.start_date,
              endDate: params.end_date,
              status: 2
            }
          }).then(() => {
            this.tabIndex = 1;
          });
        }
        onTabChange(event: any) {
          const params = this.sharedService.getParams();
          this.tabIndex = event.index;
          localStorage.setItem('activeTabIndex', this.tabIndex.toString());
          this.reloadComponent();
        }

        reloadComponent(): void {
          this.router.routeReuseStrategy.shouldReuseRoute = () => false;
          const currentUrl = this.router.url + '?';
          this.router.navigateByUrl(currentUrl).then(() => {
            this.router.navigated = false;
            this.router.navigate([this.router.url]);
          });
        }

        getStatusColor(status){
          if(status == 'NotSubmitted'){
            return '#bf9000';
          }
          if(status == 'Submitted'){
            return "green";
          }
          if(status == 'Approved'){
            return "#3F51B5";
          }
          if(status == 'Rejected'){
            return "red";
          }
          if(status == 'Saved'){
            return "#674ea7";
          }
      }
      showModal(data) {
        // Clear the grid configurations array before populating with new data
        this.gridConfigurations = [];
      
        // Call the getMyTimesheetView function to retrieve data for the grids
        this.getMyTimesheetView(data);
      }
      getMyTimesheetView(row) {
        let payload = {
          "start_date": row.start_date,
          "end_date": row.end_date
        };
        
        this.httpservice.doPost(StaticDataEntity.myTimesheetView, payload).subscribe((response) => {
          response.forEach((data) => {
            // Create a grid configuration for each set of data
            this.gridConfig = {
              rowData: data,
              columnDefs: this.viewColumnsDefs,
              pagination: true,
              paginationPageSize: 10
            };
      
            this.gridConfigurations.push(this.gridConfig); // Add the grid configuration to the array
          });
      
          // Show the modal after receiving the data and configuring the grids
          this.timesheetDataModal.show();
        });
      }
    
        onOpenCalendar(container) {
          container.monthSelectHandler = (event: any): void => {
            container._store.dispatch(container._actions.select(event.date));
          };
          container.setViewMode('month');
        }

         // Function to sort the "Status" column
  sortStatusColumn() {
    // Toggle the sorting direction when the column header is clicked
    this.statusSortDirection = this.statusSortDirection === 'asc' ? 'desc' : 'asc';

    // Implement your sorting logic here, e.g., sorting your timeSheetList based on the "status" field
    if (this.statusSortDirection === 'asc') {
      this.timeSheetList.sort((a, b) => (a.status > b.status ? 1 : -1));
    } else {
      this.timeSheetList.sort((a, b) => (a.status < b.status ? 1 : -1));
    }
  }
      
        viewTimesheet(data) {
          let payload = {
            "resource_id": localStorage.getItem('userId'),
            "start_date": data.start_date,
            "end_date": data.end_date
          }
          this.httpservice.doPost(StaticDataEntity.viewMytimesheet, payload).subscribe((result: any) => {
            this.timesheetDetails = result.timesheets;
            this.timesheetDetails.forEach(element => {
              element.work_hour = Number(element.work_hour)
              this.totalHours = this.totalHours + element.work_hour
            });
          })
      
        }
      
        hideModal() {
          this.timesheetDataModal.hide();
        }

        downloadTimesheetPDF(row){
          let payload = {
            "start_date":row.start_date,
            "end_date":row.end_date
          }
          this.httpservice.doPost(StaticDataEntity.myTimesheetView,payload).subscribe((response)=>{
            if(response){
              response.forEach((data)=>{
                // this.generatePDF(row,data.timesheets,data.resource_details,);
                this.genneratePdfservice.generatePDF(row,data.timesheets,data.resource_details);
              })
            }
          })
        }
      
      
        getTimeSheets() {
          let payload = {
            "start_date": null,
            "end_date": null,
            "current_date" :moment(new Date ()).format('YYYY-MM-DD')
          }
          this.httpservice.doPost(StaticDataEntity.myTimesheets, payload).subscribe((result: any) => {
            this.timeSheetList = result;
          }
          )
        }
      
        // onGridReady(event: GridReadyEvent): void {
        //   this.gridReadyEvent.emit(event);
        //   this.gridApi = event.api;
        //   this.gridColumnApi = event.columnApi;
        //   this.gridApi.sizeColumnsToFit();
        //   this.gridApi.setDomLayout('autoHeight');
        //   window.onresize = () => {
        //     this.gridApi.sizeColumnsToFit();
        //   }
        // }
  stopManualEntry(event: KeyboardEvent) {
    const key = event.key;
    if (key === "Backspace" || key === "Delete") {
    } else {
      event.preventDefault();
    }
  }
        selecMyTimeSheet() {
          if (this.searchText) {
            const currentDate = new Date(this.searchText); // Convert to Date object
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
          
            let payload = {
              "start_date": this.datePipe.transform(startOfMonth, 'yyyy-MM-dd'),
              "end_date": this.datePipe.transform(endOfMonth, 'yyyy-MM-dd'),
              "current_date" :moment(new Date ()).format('YYYY-MM-DD')

            };
          
            this.httpservice.doPost(StaticDataEntity.myTimesheets, payload).subscribe((result: any) => {
              this.timeSheetList = result;
            });
          }
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


        downloadApprovedTimesheetFile(row) {
          let payload = {
            "resource_id": localStorage.getItem('userId'),
            "week_start_date": row.start_date,
            "week_end_date": row.end_date
          }
          this.httpservice.doPost(StaticDataEntity.clientApprovedTimesheet, payload).subscribe((response: any) => {
            if(response.errorMessage){
              this.toast.showError("error","Error",response.errorMessage);
            }else{
              const fileData = response.file_data;
              const contentType = response.content_type;
          
              // Create a Blob from the base64 data
              const blob = this.base64toBlob(fileData, contentType);
          
              // Determine how to handle the file based on content type
              if (contentType === 'application/pdf') {
                // Display or download PDF
                this.displayOrDownloadPdf(blob);
              } else if (contentType.startsWith('image/')) {
                // Display or download image
                this.displayOrDownloadImage(blob);
              } else {
                // Handle other content types as needed
              }
            }
          });
        }
        
        // Helper function to display or download a PDF
        displayOrDownloadPdf(blob: Blob) {
          // You can customize this part based on your UI/UX
          const url = URL.createObjectURL(blob);
        
          // For example, you can open the PDF in a new tab
          window.open(url, '_blank');
        }
        
        // Helper function to display or download an image
        displayOrDownloadImage(blob: Blob) {
      
             // You can customize this part based on your UI/UX
             const url = URL.createObjectURL(blob);
        
             // For example, you can open the PDF in a new tab
             window.open(url, '_blank');
          // You can customize this part based on your UI/UX
        }
        
        // Helper function to convert base64 to Blob
        base64toBlob(base64Data, contentType) {
          const sliceSize = 512;
          const byteCharacters = atob(base64Data);
          const byteArrays = [];
        
          for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);
            const byteNumbers = new Array(slice.length);
        
            for (let i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
            }
        
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
          }
        
          return new Blob(byteArrays, { type: contentType });
        }


        
      
      }


      
      