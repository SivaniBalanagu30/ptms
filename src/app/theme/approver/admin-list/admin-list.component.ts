import { DatePipe } from '@angular/common';
import { Component, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ColumnApi, GridOptions, GridReadyEvent, IDatasource, IGetRowsParams } from 'ag-grid-community';
import * as moment from 'moment';
import { HttpService } from 'src/app/services/http-service/http.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { CustomDatePipe } from 'src/app/shared/datePipe/custom-date.pipe';
import { Constants, StaticDataEntity } from 'src/app/shared/static-data';
import { validateAllFormFields } from 'src/app/shared/utils/utils';
import pdfmake from 'pdfmake/build/pdfmake';
import { GeneratePdfService } from 'src/app/services/timesheet-generate-pdf/generate-pdf.service';
import { ToastService } from 'src/app/services/toast.service';
import { PageReloadService } from 'src/app/services/auto-reload/page-reload.service';
import { faL } from '@fortawesome/free-solid-svg-icons';
@Component({
  selector: 'app-admin-list',
  templateUrl: './admin-list.component.html',
  styleUrls: ['./admin-list.component.css']
})
export class AdminListComponent implements OnInit {
  timesheetList;
  public gridColumnApi: ColumnApi;
  private gridApi: any;
  private gridApiView: any;
  showApprove :Boolean = true;
  showReject:Boolean = true;
  disableButton: Boolean = true;
  // searchText = new Date();
  pageNumber = 1;
  startDate;
  endDate;
  dates;
  timesheetDetails;
  timesheetResourceDetails;
  datePickerConfig: any;
  minMonthDate;
  viewColumnsDefs;
  maxMonthDate;
  @ViewChild('timesheetData') timesheetDataModal;
  totalHours = 0;
  projectsList;
  resourcesList;
  lastFourWeeksDates;
  rowDetails;
  gridOptions: GridOptions = {
    pagination: true,
    rowModelType: 'infinite',
    cacheBlockSize: 10, // you can have your custom page size
    paginationPageSize: 10, //pagesize
    columnDefs: [
      { headerName: 'Project Name', field: 'project_name', tooltipField:'project_name', sortable: true, suppressSizeToFit: true, width: 180 },
      { headerName: 'Resource Name', field: 'resource_name', tooltipField:'resource_name', sortable: true, suppressSizeToFit: true, width: 210 },
      {
        headerName: 'Dates',
        field: 'start_date',
        // tooltipField:'start_date',
        sortable: true,
        suppressSizeToFit: true,
        width: 250,
        valueGetter: (params) => {
          const startandEndDate = params.data;
          if (startandEndDate) {
            const formattedStartDate = this.customDatePipe.transform(startandEndDate.start_date);
            const formattedEndDate = this.customDatePipe.transform(startandEndDate.end_date);
            return `${formattedStartDate} - ${formattedEndDate}`;
          }
          return '';
        },
        tooltipValueGetter:(params:any)=>{
          const startandEndDate = params.data;
          if (startandEndDate) {
            const formattedStartDate = this.customDatePipe.transform(startandEndDate.start_date);
            const formattedEndDate = this.customDatePipe.transform(startandEndDate.end_date);
            return `${formattedStartDate} - ${formattedEndDate}`;
          }
          return '';
        }
      },
      { 
        headerName: 'Timesheet Status', 
        field: 'status', 
        sortable: true, 
        suppressSizeToFit: true, 
        width: 220,
        valueFormatter: function(params) {
          if (params.value === 'Saved') {
            return 'Draft';
          } else if (params.value === 'NotSubmitted') {
            return 'Pending Submission';
          } else {
            return params.value;
          }
        },
        tooltipValueGetter:(params:any)=>{
          if (params.data?.status === 'Submitted') {
            return'Submitted';
          }
          if (params.data?.status === 'Approved' ) {
            return 'Approved'
          }
          if(params.data?.status === 'Rejected'){
            return 'Rejected';
          }
          if(params.data?.status === 'NotSubmitted'){
            return 'Pending Submission';
          }
          if(params.data?.status === 'Saved'){
            return 'Pending Submission';
          }
        },
        cellRenderer: (params: any) => {
          if (params.data?.status === 'Submitted') {
            return'<span style="color: green;">Submitted</span>';
          }
          if (params.data?.status === 'Approved' ) {
            return '<span style="color: #3F51B5;">Approved</span>'
          }
          if(params.data?.status === 'Rejected'){
            return '<span style="color: red;">Rejected</span>';
          }
          if(params.data?.status === 'NotSubmitted'){
            return '<span style="color: #bf9000;">Pending Submission</span>';
          }
          if(params.data?.status === 'Saved'){
            return '<span style= "color: #674ea7;">Pending Submission</span>';
          }
        }
      },
      
      
      // { headerName: 'Resource Name', field: 'resource_name', sortable: true, suppressSizeToFit: true, width: 210 },
      {
        headerName: 'Actions',
        field: '',
        tooltipField:'',
        sortable: true,
        suppressSizeToFit: true,
        width: 90,
        cellRenderer: (params: any) => {
          if (params.data?.status === 'Submitted') {
            // return '<i class="fa fa-eye" aria-hidden="true" style="cursor: pointer; margin-right: 5px;" data-toggle="tooltip" data-placement="top" title="View Timesheets"></i>';
            return "<i class='view mr-1 fas fa-file-lines' style='cursor:pointer;font-size:17px'  alt='fine-print--v1' data-toggle='tooltip' data-placement='top' title='View timesheets'></i>";
          }
          // if (params.data?.status === 'Approved' ) {
          //   return  "<i class='view mr-1 fas fa-file-lines'  style='cursor:pointer;font-size:17px' alt='fine-print--v1' data-toggle='tooltip' data-placement='top' title='View timesheets'></i>" + '<i class="fas fa-file-pdf" aria-hidden="true" style="cursor: pointer; font-size:17px; margin-left: 10px;color: red;" data-toggle="tooltip" data-placement="top" title="Download Timesheets"></i>'
          // }
          if (params.data?.status === 'Approved' &&  params.data?.allow_icon_status === 1) {
            return "<i class='view mr-1 fa-solid fa-file-lines'  style='cursor:pointer;font-size:17px;'  alt='fine-print--v1' data-toggle='tooltip' data-placement='top' title='View timesheets' />" + '<i class="fas fa-file-pdf" aria-hidden="true" style="cursor: pointer; font-size:17px; margin-left: 10px; color:red" data-toggle="tooltip" data-placement="top" title="Download Timesheets"></i>'
          }else if(params.data?.status === 'Approved' &&  params.data?.allow_icon_status === 2){
            return "<i class='fa-solid fa-file-circle-check mr-1'  style='cursor:pointer;font-size:17px;color: #DF920B;'  alt='fine-print--v1' data-toggle='tooltip' data-placement='top' title='Download uploaded document'></i>";
          }else if(params.data?.status === 'Approved' &&  params.data?.allow_icon_status > 2){
            return "<i class='view mr-1 fa-solid fa-file-lines'  style='cursor:pointer;font-size:17px;'  alt='fine-print--v1' data-toggle='tooltip' data-placement='top' title='View timesheets' />" + '<i class="fas fa-file-pdf" aria-hidden="true" style="cursor: pointer; font-size:17px; margin-left: 10px; color:red" data-toggle="tooltip" data-placement="top" title="Download Timesheets"></i>'+"<i class='fa-solid fa-file-circle-check mr-1'  style='cursor:pointer;margin-left: 10px;font-size:17px;color: #DF920B;'  alt='fine-print--v1' data-toggle='tooltip' data-placement='top' title='Download uploaded document'></i>"
          }
          if(params.data?.status === 'Rejected'){
            return "<i class='view mr-1 fas fa-file-lines'  style='cursor:pointer;font-size:17px'  alt='fine-print--v1' data-toggle='tooltip' data-placement='top' title='View timesheets'></i>"
            // return '<i class="fa fa-eye" aria-hidden="true" style="cursor: pointer; margin-right: 5px;" data-toggle="tooltip" data-placement="top" title="View Timesheets"></i>';
          }
          return '';
        },
        onCellClicked: (params: any) => {
          const iconName = params.event.target.className;
          if(iconName.includes('fa-solid fa-file-circle-check mr-1')){
            this.downloadApprovedTimesheetFile(params.data);
          }
          if (iconName.includes('view')) {
            this.showModal(params.data);
            this.rowDetails = params.data;
          } 
          if (iconName.includes('fas fa-file-pdf')) {
            //   this.viewTimesheet(params.data);
            // setTimeout(()=>{
            //   this.generatePDF(params.data);
            //   },220)
            let payload = {
              "resource_id": params.data?.resource_id,
              "project_id": params.data?.project_id,
              "start_date": params.data?.start_date,
              "end_date": params.data?.end_date,
            }
            this.httpService.doPost(StaticDataEntity.viewResourceTimesheet, payload).subscribe((response)=>{
              if(response){
                this.timesheetResourceDetails = response.resource_details;
                this.timesheetDetails = response.timesheets;
                // this.generatePDF(params.data);
                this.generatePdfservice.generatePDF(params.data,response.timesheets,response.resource_details);
              }
            })
          }
        }
      }
      
      
      
      
    ]
  };

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

  downloadApprovedTimesheetFile(row) {
    let payload = {
      "project_id": row.project_id,
      "resource_id": row.resource_id,
      "week_start_date": row.start_date,
      "week_end_date": row.end_date
    }
    this.httpService.doPost(StaticDataEntity.clientApprovedTimesheet, payload).subscribe((response: any) => {
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
  weekSelectionChanged(){
    this.disableButton = false;
  }


  dataSource: IDatasource = {
    getRows: (params: IGetRowsParams) => {
      let payload = {
        "start_date": this.startDate,
        "end_date": this.endDate,
        "project_id": null,
        "resource_id": null,
      }
      this.httpService.doPost(`approverApproveTimesheets?pageNumber=${Number(this.pageNumber)}&pageSize=${Number(10)}`, payload).subscribe((result) => {
        this.timesheetList = result;
        if (this.gridApi) {
          if (this.timesheetList?.results.length === 0) {
            this.gridApi.showNoRowsOverlay(); // Show "No data to show" message
          } else {
            this.gridApi.hideOverlay(); // Hide the overlay message
          }
        }
        params.successCallback(
          result.results,
          result.total_records
        );
      })
    }
  }

  approverForm: FormGroup
  addCommentsForm:FormGroup;
  @Output() gridReadyEvent: EventEmitter<GridReadyEvent> = new EventEmitter<GridReadyEvent>();
  timeSheetStatus: any;
  showComments: boolean;
  constructor(private inactivityService: PageReloadService,private toast: ToastService, private router: Router,private customDatePipe: CustomDatePipe, private fb: FormBuilder, private httpService: HttpService, private piper: DatePipe, private notificationService: NotificationService,private generatePdfservice : GeneratePdfService) { 
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
  this.approverForm = this.fb.group({
    project: [''],
    resource: [''],
    dateRange: [''],
    searchText:[new Date()]
  });
  this.addCommentsForm = this.fb.group({
    comments:[null,Validators.required]
  });

  }
  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:keydown', ['$event'])

  onUserActivity(event: Event) {
    this.inactivityService.resetInactivityTimer();
  }

ngOnInit(): void {
  this.inactivityService.startInactivityTimer();
  this.getLastFourWeeksInfo();
  this.calculateWeekDates();
  this.getProjects();
  this.getResouces();
  this.approverForm.patchValue({
    dateRange: this.lastFourWeeksDates[0]
  });

 
}

  stopManualEntry(event: KeyboardEvent) {
    const key = event.key;
    if (key === "Backspace" || key === "Delete") {
    } else {
      event.preventDefault();
    }
  }
calculateWeekDates() {
  const currentDate = moment();
  const currentDay = currentDate.day(); // 0 (Sunday) to 6 (Saturday)
  const startOfWeek = moment(currentDate).startOf('isoWeek');
  const endOfWeek = moment(currentDate).endOf('isoWeek');

  // Set the time from currentDate to startOfWeek
  startOfWeek.set({
    hour: currentDate.hours(),
    minute: currentDate.minutes(),
    second: currentDate.seconds()
  });

  // Set the time from currentDate to endOfWeek
  endOfWeek.set({
    hour: currentDate.hours(),
    minute: currentDate.minutes(),
    second: currentDate.seconds()
  });

  this.startDate = startOfWeek.format('YYYY-MM-DD');
  this.endDate = endOfWeek.format('YYYY-MM-DD');
}

getLastFourWeeksInfo() {
  let currentDate: any = new Date();
  let startDate: any = new Date(currentDate.getFullYear(), 0, 1);
  var days = Math.floor((currentDate - startDate) /
    (24 * 60 * 60 * 1000));

    var weekNumber = moment().isoWeek()
  let lastFourWeeks = [];
  for (let i = weekNumber; i >= weekNumber - 3; --i) {
    lastFourWeeks.push(i)
  }
  this.lastFourWeeksDates = [];
  lastFourWeeks.forEach((element) => {
    let firstDate = moment().day("Monday").week(element).format(Constants.dateShortFormat);
    // let lastDate = moment().day("Saturday").week(element).format(Constants.dateFormat);
    let date = moment().week(element).toDate();
    let formateedDate = new Date(moment(date).format('YYYY-MM-DD'));
    let last =new Date(date.setDate(formateedDate.getDate() - (formateedDate.getDay() - 1) + 6));
    let lastDate= moment(last).format(Constants.dateShortFormat);
    this.lastFourWeeksDates.push(firstDate + ' - ' + lastDate)
  })
}

selectMyTimesheet() {
  let currentDate: any = new Date(this.approverForm.get('searchText').value);
  let year = currentDate.getFullYear();
  let month = currentDate.getMonth();
  let startOfMonth = moment(currentDate).startOf('month');
  let endOfMonth = moment(currentDate).endOf('month');
  let firstWeekNumber = startOfMonth.week();
  let lastWeekNumber = endOfMonth.week();
  let lastFourWeeks = [];
  for (let i = lastWeekNumber; i >= firstWeekNumber; --i) {
    lastFourWeeks.push(i);
  }
  this.lastFourWeeksDates = [];
  lastFourWeeks.forEach((weekNumber) => {
    let firstDate = moment().day("Monday").year(year).week(weekNumber);
    let lastDate = moment().day("Sunday").year(year).week(weekNumber).add(7, 'day');
    let formattedFirstDate = firstDate.format('dddd MMMM Do, YYYY');
    let formattedLastDate = lastDate.format('dddd MMMM Do, YYYY');
    this.lastFourWeeksDates.push(`${formattedFirstDate} - ${formattedLastDate}`);
  });
  this.approverForm.patchValue({
    dateRange: this.lastFourWeeksDates[0]
  });

}

// calculateWeekDates() {
//   const currentDate = new Date();
//   const currentDay = currentDate.getDay(); // 0 (Sunday) to 6 (Saturday)
//   const startOfWeek = new Date(currentDate);
//   startOfWeek.setDate(currentDate.getDate() - currentDay + 1); // Start of the week (Monday)
//   const endOfWeek = new Date(currentDate);
//   endOfWeek.setDate(currentDate.getDate() + (7 - currentDay)); // End of the week (Sunday)
//   this.startDate = this.piper.transform(startOfWeek, 'yyyy-MM-dd'),
//     this.endDate = this.piper.transform(endOfWeek, 'yyyy-MM-dd')
// }

getTimeSheets() {
  let payload = {
    "start_date": this.startDate,
    "end_date": this.endDate,
    "project_id": null,
    "resource_id": null,
  }
  this.httpService.doPost(`approverApproveTimesheets?pageNumber=${Number(this.pageNumber)}&pageSize=${Number(10)}`, payload).subscribe((result) => {
    this.timesheetList = result.results;
  })
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

onGridReadyView(event: GridReadyEvent): void {
  this.gridReadyEvent.emit(event);
  this.gridApiView = event.api;
  this.gridColumnApi = event.columnApi;
  this.gridApiView.sizeColumnsToFit();
  this.gridApiView.setDomLayout('autoHeight');
  window.onresize = () => {
    this.gridApiView.sizeColumnsToFit();
  }
}

onPaginationChanged(event: any): void {
  // Check if the event is triggered by user interaction
  if (event.api.paginationGetCurrentPage() !== undefined) {
    const pageNumber = event.api.paginationGetCurrentPage() + 1;
    if (this.pageNumber !== pageNumber) {
      this.pageNumber = pageNumber;
      this.getTimeSheets();
    }
  }
}


showModal(data) {
  this.timeSheetStatus = data.status
  this.timesheetDataModal.show();
  if(this.timeSheetStatus === 'Approved'){
    this.showApprove = false;
    this.showReject = false;
    this.showComments = false;

  }else if(this.timeSheetStatus === 'Rejected'){
    this.showReject = false;
    this.showApprove = false;
    this.showComments = false;
  }else if (this.timeSheetStatus === 'Submitted' || this.timeSheetStatus === 'NotSubmitted' || this.timeSheetStatus === 'Saved'){
    this.showApprove = true;
    this.showReject = true;
    this.showComments = true;
  }
  this.viewTimesheet(data)
  this.viewColumnsDefs = [
    { headerName: 'Date', field: 'ts_date', sortable: true, suppressSizeToFit: true, width: 150,
    valueGetter:(params)=>{
      return this.customDatePipe.transform(params.data.ts_date);
    },
    tooltipValueGetter:(params:any)=>{
      return this.customDatePipe.transform(params.data.ts_date);
    }
  },
  { headerName: 'Milestone', field: 'milestone_name', tooltipField:'milestone_name', sortable: true, suppressSizeToFit: true, width: 80 },
    { headerName: 'Start Time', field: 'ts_start_time', tooltipField:'ts_start_time', sortable: true, suppressSizeToFit: true, width: 100 },
    { headerName: 'Meal Start', field: 'meal_start_time', tooltipField:'meal_start_time', sortable: true, suppressSizeToFit: true, width: 100 },
    { headerName: 'Meal End', field: 'meal_end_time', tooltipField:'meal_end_time', sortable: true, suppressSizeToFit: true, width: 100 },
    { headerName: 'End Time', field: 'ts_end_time', tooltipField:'ts_end_time', sortable: true, suppressSizeToFit: true, width: 100 },
    { headerName: 'Work Hours', field: 'work_hour', tooltipField:'work_hour', sortable: true, suppressSizeToFit: true, width: 100 },
    // { headerName: 'Project Name', field: 'project_name', sortable: true, suppressSizeToFit: true, width: 170 },
    { headerName: 'Approver Name', field: 'approver_name', tooltipField:'approver_name', sortable: true, suppressSizeToFit: true, width: 180 },

    { headerName: 'Status', field: 'status', tooltipField:'status', sortable: true, suppressSizeToFit: true, width: 100, cellRenderer: (params: any) => {
      if (params.data?.status === 'Submitted') {
        return'<span style="color: green;">Submitted</span>';
      }
      if (params.data?.status === 'Approved' ) {
        return '<span style="color: #3F51B5;">Approved</span>'
      }
      if(params.data?.status === 'Rejected'){
        return '<span style="color: red;">Rejected</span>';
      }
      if(params.data?.status === 'NotSubmitted'){
        return '<span style="color: #bf9000;">Pending Submission</span>';
      }
      if(params.data?.status === 'Saved'){
        return '<span style= "color: #674ea7;">Pending Submission</span>';
      }
    } },
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


  ]
 

}
hideModal() {
  this.addCommentsForm.reset();
  this.timesheetDataModal.hide();
}
getProjects() {
  this.httpService.doGet(StaticDataEntity.projectList).subscribe((result: any) => {
    this.projectsList = result;
  })
}

getResouces() {
  this.httpService.doGet(StaticDataEntity.resourceList).subscribe((result: any) => {
    this.resourcesList = result;
  })
}
viewTimesheet(data) {
  let payload = {
    "resource_id": data.resource_id,
    "project_id": data.project_id,
    "start_date": data.start_date,
    "end_date": data.end_date,
  }
  this.httpService.doPost(StaticDataEntity.viewResourceTimesheet, payload).subscribe((result: any) => {
    this.totalHours = 0;
    this.timesheetResourceDetails = result.resource_details;
    this.timesheetDetails = result.timesheets;
    this.timesheetDetails.forEach(element => {
      element.work_hour = Number(element.work_hour)
      this.totalHours = this.totalHours + element.work_hour
    });
  })

}

onProjectChange(project) {
  this.disableButton = false
  this.httpService.doGet(StaticDataEntity.projectByResource.replace(/{id}/g, project)).subscribe((result: any) => {
    this.resourcesList = result;
  })
}

onResourceChange(){
  this.disableButton = false
}

reset(){
  this.approverForm.patchValue({
    dateRange:this.lastFourWeeksDates[0],
    project:'',
    resource:'',
    searchText:new Date()
  })
  this.getLastFourWeeksInfo();
  this.approverForm.patchValue({
    dateRange: this.lastFourWeeksDates[0]
  });
  this.resetGetTimeSheet();
  this.getResouces();
}

@HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
  this.addCommentsForm.reset();
}

resetGetTimeSheet(){
  let payload = {
    "start_date": this.startDate,
    "end_date": this.endDate,
    "project_id": null,
    "resource_id": null,
  }
  this.dataSource.getRows = (params: IGetRowsParams) => {
    this.httpService.doPost(`approverApproveTimesheets?pageNumber=${Number(this.pageNumber)}&pageSize=${Number(10)}`, payload).subscribe((result) => {
      this.timesheetList = result.timesheets;
      params.successCallback(result.results, result.total_records);

    })
  }
    this.gridApi.setDatasource(this.dataSource);
}

submit() {
  let form = this.approverForm.value
  let startDate = this.approverForm.get('dateRange').value?.split('-')

  let payload = {
    "resource_id": form.resource,
    "project_id": form.project,
    "start_date": moment(moment(startDate[0].trim(), Constants.dateFormat).toDate()).format('YYYY-MM-DD'),
    "end_date": moment(moment(startDate[1].trim(), Constants.dateFormat).toDate()).format('YYYY-MM-DD'),
  }
  this.dataSource.getRows = (params: IGetRowsParams) => {
    this.httpService.doPost(`approverApproveTimesheets?pageNumber=${Number(this.pageNumber)}&pageSize=${Number(10)}`, payload).subscribe((result) => {
      this.timesheetList = result.timesheets;
      if (result.results?.length === 0) {
        this.gridApi.showNoRowsOverlay(); // Show "No data to show" message
      } else {
        this.gridApi.hideOverlay(); // Hide the overlay message
      }
      params.successCallback(result.results, result.total_records);
      this.disableButton = true

    })
  }
  this.gridApi.setDatasource(this.dataSource);
}

approve(type) {
  if(this.addCommentsForm.valid){
    let todayDate = new Date();
    const approverComments = this.addCommentsForm.get('comments').value;
  let payload = {
    resource_id: this.rowDetails.resource_id,
    project_id: this.rowDetails.project_id,
    start_date: this.rowDetails.start_date,
    end_date: this.rowDetails.end_date,
    approver_comments : approverComments,
    approved_date: this.piper.transform(todayDate, 'yyyy-MM-dd'),
  };

  if (type === 'Approve') {
    payload['status'] = 'Approved';
  } else {
    payload['status'] = 'Rejected';
  }
  this.httpService.doPost(StaticDataEntity.approveOrReject, payload).subscribe((result) => {
    if(result.message){
      // this.notificationService.showSucessNotification("Success",result.message);
      this.toast.showSuccess("success", "Success", result.message);
      this.timesheetDataModal.hide();
      this.submit();
      this.addCommentsForm.patchValue({
        comments:'',
      })
    }
  });
  }else{
    validateAllFormFields(this.addCommentsForm);
  }
}
}

