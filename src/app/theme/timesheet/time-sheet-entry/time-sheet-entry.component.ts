import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { HttpService } from 'src/app/services/http-service/http.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { Constants, StaticDataEntity } from 'src/app/shared/static-data';
import { getActualDate, isBlank, validateAllFormFields } from 'src/app/shared/utils/utils';
import { set } from 'lodash';
import { DatePipe } from '@angular/common';
import { TimepickerConfig } from 'ngx-bootstrap/timepicker';
import { ToastService } from 'src/app/services/toast.service';
import * as XLSX from 'xlsx'
import { PageReloadService } from 'src/app/services/auto-reload/page-reload.service';
// import {Workbook} from "exceljs";

type AOA = any[][];
@Component({
  selector: 'app-time-sheet-entry',
  templateUrl: './time-sheet-entry.component.html',
  styleUrls: ['./time-sheet-entry.component.css'],
  providers: [TimepickerConfig]

})
export class TimeSheetEntryComponent implements OnInit {
  timesheetEntryForm: FormGroup;
  selectedFileName:string = "";
  meridians = [ 'PM'];
  checkBoolean: boolean;
  timeForm: FormGroup;
  modifiedEndDate:any;
  modifiedStartDate:any;
  timeSheetDataSource;
  timesheetsList = [];
  projectsList;
  myActiveProjects;
  todayDate = new Date();
  lastFourWeeksDates;
  selectedDateRangeWeek;
  currentWeekNumber;
  minEndTime;
  maxEndTime;
  minMealstartTime;
  minMealEndTime;
  maxMealStartTime;
  maxMealEndTime
  hoursWorked;
  workTotalHours = [];
  mileStoneList: any = [];
  minStartTime = null;
  minMonthDate: Date;
  projectHours: Boolean = true;
  approvedProjectList = [];
  uploadFile:FormGroup;
  uploadApprovedFile:FormGroup;
  uploaded: boolean = false;
  @ViewChild("showData") showDataModal;
  @ViewChild("uploadAcceptance") uploadAcceptanceModal;
  @ViewChild("projectDataSave") projectSaveModal;
  @ViewChild("projectDataSubmit") projectSubmitModal;
  @ViewChild("uploadTimesheetsData") uploadTimesheetsData;
  @ViewChild("uploadApprovedTimesheetsData") uploadApprovedTimesheetsData;

  timesheetStatus: any;
  projectsListNew: any;
  projectName: any;
  workHourLimit: any;
  joiningDate: any;
  projectsListExccedingWorkHoursSave=[];
  projectsListExccedingWorkHoursSubmit=[]
  check2: boolean;
  projectListWithHoliday: any;
  requiredField: boolean = false;
  endRequiredField: boolean = false;
  initialValue: any;
  nextTime: any;
  mealNextTime: string;
  newProjectList=[];
  secNextTime: any;
  timerType: any;
  timer1: string;
  indexID: any;
  selectedStartTime:any;
  showAddButton: boolean = true;
  payloadArray={
    enabled:false
  }
  rowIndex: any;
  data;
  output: any;
  isHeaderFrozen = false;
  private inactivityTimer: ReturnType<typeof setTimeout>;
  dateList: any;
  enableSaveButton: boolean = false;
  isAllowUploadTimesheet: boolean;
  aprrovedTimesheets: any;
  apprvedSelectedFileName: string="";
  uploadApprovedFileDoc: boolean = false;
  isTimesheetSubmitted: boolean = false;
  joining_date: any;
  timesheetsData: any;
  joiningDateData: any;
  maxTime: string;
;
  constructor(private inactivityService: PageReloadService, private toast: ToastService, private readonly fb: FormBuilder, private timepickerConfig:TimepickerConfig,private piper: DatePipe, private readonly route: ActivatedRoute, private readonly httpService: HttpService, private readonly notificationService: NotificationService) {
    this.uploadFile = this.fb.group({
      fileUpload: ['', Validators.required]
    });
    this.uploadApprovedFile = this.fb.group({
      fileUpload: ['', Validators.required],
      projectName:['', Validators.required]
    });
    this.timepickerConfig.minuteStep = 15;

    this.timesheetEntryForm = fb.group({
      dateRange: ['', Validators.required],
      totalWorkingHours: [0]
    });
    this.timeForm = this.fb.group({
      questions: this.fb.array([
        this.initSubSection()
      ])
    });
    this.currentWeekNumber = this.getCurrentWeekNumber(new Date());
    this.selectedDateRangeWeek = this.getWeekNumber(new Date());
  }
  
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
  fileName: string = 'SheetJS.xlsx';

  getProjects() {
    this.httpService.doGet(StaticDataEntity.myActiveProjects).subscribe((result: any) => {
      this.projectsList = result;
      
      this.projectsList.sort((a, b) => {
        const nameA = a.project_name.toLowerCase();
        const nameB = b.project_name.toLowerCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      });
      this.projectsList.push({
        milestones: [],
        project_id: "Timeoff",
        project_name: "Time Off",
        work_hour_limit: 0
      })
      // this.projectListWithHoliday = result;

      // this.projectListWithHoliday.push({
      //   milestones: [],
      //   project_id: "Holiday",
      //   project_name: "Holiday",
      //   work_hour_limit: 0
      // })
    });
  }
 @HostListener('window:scroll', ['$event'])
    onWindowScroll(event: any) {
  const scrollY = window.scrollY || window.pageYOffset;
    // Adjust the scroll threshold as needed
    if (scrollY > 200) {
      this.isHeaderFrozen = true;
    } else {
      this.isHeaderFrozen = false;
    }
}


  ngOnInit(): void {
    this.joiningDate = localStorage.getItem('joiningDate');    
    this.getLastFourWeeksInfo();
    this.getProjects();
    this.bindCurrentWeekTimesheet();
    
    this.inactivityService.startInactivityTimer();
    this.getMyActiveProjects();
  }
  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:keydown', ['$event'])

  onUserActivity(event: Event) {
    this.inactivityService.resetInactivityTimer();
  }
  getMyActiveProjects(){
    this.httpService.doGet(StaticDataEntity.myActiveProjects).subscribe((response)=>{
      this.myActiveProjects = response;
    })
  }

  showModal() {
    this.showDataModal.show();
  }
  hideModal() {
    this.showDataModal.hide();
  }





  getLastFourWeeksInfo() {
    let currentDate: any = new Date();
    let startDate: any = new Date(currentDate.getFullYear(), 0, 1);
  

    var days = Math.floor((currentDate - startDate) /
      (24 * 60 * 60 * 1000));
    var weekNumber = moment().isoWeek();
    let lastFourWeeks = [];
    for (let i = weekNumber; i >= weekNumber - 3; --i) {
      lastFourWeeks.push(i)
    }
    this.lastFourWeeksDates = [];
    lastFourWeeks.forEach((element) => {
      let firstDate = moment().day("Monday").week(element).format(Constants.dateFormat);
      let date = moment().week(element).toDate();
      let startDate = moment(date).format('YYYY-MM-DD')

      let formateedDate = new Date(date);
      let last = new Date(date.setDate(formateedDate.getDate() - (formateedDate.getDay() - 1) + 6));
      let endDate = moment(last).format('YYYY-MM-DD')
      
      let lastDate = moment(last).format(Constants.dateFormat);
      
      let joindate = this.joining_date
      
      let newDate = moment(joindate).format('YYYY-MM-DD');

      if (new Date(newDate).getTime() >= new Date(startDate).getTime() && new Date(newDate).getTime() <= new Date(endDate).getTime()) {
        this.lastFourWeeksDates.push(firstDate + ' - ' + lastDate);
      }else if(new Date(newDate).getTime() <= new Date(startDate).getTime()){
        this.lastFourWeeksDates.push(firstDate + ' - ' + lastDate);
      }

      
    });
    
    if (!isBlank(this.route.snapshot.queryParams)) {
      let startDate = moment(this.route.snapshot.queryParams?.startDate, 'YYYY-MM-DD').toDate();
      let endDate = moment(this.route.snapshot.queryParams?.endDate, 'YYYY-MM-DD').toDate();

      if (!lastFourWeeks.includes(moment(this.route.snapshot.queryParams?.startDate, 'YYYY-MM-DD').week())) {
        this.lastFourWeeksDates.push(moment(startDate).format(Constants.dateFormat) + ' - ' + moment(endDate).format(Constants.dateFormat));
      }
    }
  }

  isProjectValid(project, date) {
    const tsDate = moment(date, 'dddd MMMM Do, YYYY').format('YYYY-MM-DD');
  
    if (project.end_date) {
      // Check if tsDate is within the range of project's start and end dates
      return tsDate >= project.start_date && tsDate <= project.end_date;
    }
  
    if (project.start_date) {
      // Check if tsDate is after or equal to the project's start date
      return tsDate >= project.start_date;
    }
  
    return true;
  }
 
  
  getWeekStartDate(week: number): string {
    const startDate: string = moment().day('Monday').week(week).format(Constants.dateFormat);
    return startDate;
  }
  
  getWeekEndDate(week: number): string {
    const endDate: string = moment().day('Sunday').week(week).format(Constants.dateFormat);
    return endDate;
  }
  
  bindCurrentWeekTimesheet() {
    // var pickedDate = new Date();

    // var startSunday: any = new Date(pickedDate);
    // startSunday.setDate(pickedDate.getDate() - pickedDate.getDay());
    // var startMonth: any = new Date(pickedDate);
    // startMonth.setDate(1);
    // var start: any = new Date(startMonth);
    // var startWeek: any = new Date(startSunday);
    // var startDate = Math.max(start, startWeek);

    // var endSaturday = new Date(pickedDate);
    // endSaturday.setDate(pickedDate.getDate() + (6 - pickedDate.getDay()));
    // var endMonth = new Date(pickedDate);
    // endMonth.setMonth(pickedDate.getMonth() + 1); //Add a month
    // endMonth.setDate(0); // to select last day of previous month.
    // var end: any = new Date(endMonth);
    // var endWeek: any = new Date(endSaturday);
    // var endDate = Math.min(end, endWeek);
    let startDate = moment(this.route.snapshot.queryParams?.startDate, 'YYYY-MM-DD').toDate();
    let endDate = moment(this.route.snapshot.queryParams?.endDate, 'YYYY-MM-DD').toDate();
    this.timesheetEntryForm.patchValue({
      dateRange: !isBlank(this.route.snapshot.queryParams) ? moment(startDate).format(Constants.dateFormat) + ' - ' + moment(endDate).format(Constants.dateFormat) : this.lastFourWeeksDates[0]
    });
    this.filterTimesheets();
  }
  initSubSection() {
    return this.fb.group({
      categoryType: [''],
      ts_date: [''],
      timesheet_type: [''],
      holiday_name: [''],
      ts_actual_date: [''],
      work: [0],
      nonWork: [0],
      options: this.fb.array([
        this.initOptions()
      ])
    })
  }
  initOptions() {
    return this.fb.group({
      timesheet_id: [0],
      timesheet_type: [''],
      ts_start_time: [''],
      ts_start_date: [''],
      start_time: [''],
      ts_end_time: [''],
      te_end_date: [''],
      meal_start: [''],
      meal_end: [''],
      meal_start_time: [''],
      meal_end_time: [''],
      end_time: [''],
      project_name: [''],
      holiday_name: [''],
      milestone: [''],
      comments: [''],
      status: [''],
      ts_date: [''],
      ts_day: [''],
      total_hours: [''],
      showHolidayProject:[false]
    });
    
  }
  getOptions(form) {
    return form.controls.options.controls;
  }
  checkHoliday(options) {
    if (options.some(x => x.timesheet_type === 'Holiday')) {
      return true;
    } else {
      false
    }
  }
  getHolidayName(options) {
    return options.filter(x => x.timesheet_type === 'Holiday')[0]?.holiday_name
  }
  filterTimesheets() {
    this.showAddButton = true;
    let startDate = this.timesheetEntryForm.get('dateRange').value?.split('-');
    let payload = {
      // resource_id: localStorage.getItem('userId'),
      start_date: moment(moment(startDate[0].trim(), Constants.dateFormat).toDate()).format('YYYY-MM-DD'),
      end_date: moment(moment(startDate[1].trim(), Constants.dateFormat).toDate()).format('YYYY-MM-DD')
    }
    // let payload = {
    //   start_date : moment(this.timesheetEntryForm.get('dateRange').value[0]).format('YYYY-MM-DD'),
    //   end_date : moment(this.timesheetEntryForm.get('dateRange').value[1]).format('YYYY-MM-DD')
    // }
    let joinedDate ;
    this.httpService.doPost(StaticDataEntity.timesheetsEntryFilter, payload).subscribe((result: any) => {
      this.timesheetsData = result
      this.joiningDateData = this.timesheetsData
      this.dateSelection(this.timesheetEntryForm.get('dateRange').value)
      this.timesheetsList = result?.timesheets;
      this.approvedProjectList = result?.approved_projects;
      this.timesheetStatus = result?.time_status;
      this.isAllowUploadTimesheet = result?.upload_signed_timesheet;
      this.joining_date = result?.joining_date
      this.getLastFourWeeksInfo();
      
      
      this.timeSheetDataSource = [];
      this.timeSheetDataSource = this.getDaysFromFilterRange(moment(startDate[0].trim(), Constants.dateFormat).toDate(), moment(startDate[1].trim(), Constants.dateFormat).toDate());
      let controlArray: any = this.timeForm.controls['questions'] as FormArray;
      for (let i = controlArray.length - 1; i >= 0; i--) {
        controlArray.removeAt(i)
      }
      let timeSheetData = [];
      let allHours = [];
      let allMealHours = [];
      this.timeSheetDataSource.forEach(element => {
        timeSheetData = [];
        let totalWorkHours = [];
        let totalMealHours = [];
        this.timesheetsList.forEach(ele => {
          if (ele.ts_date === element.ts_actual_date) {
            timeSheetData.push(ele);
            allHours.push(ele.work_hour);
            allMealHours.push(ele.meal_hours);
            totalWorkHours.push(ele.work_hour);
            totalMealHours.push(ele.meal_hours);
            set(element, 'timesheet_type', ele.timesheet_type);
            set(element, 'holiday_name', ele.Holiday_name);
          }
        });
        element['options'] = timeSheetData;
        const mealHoursSum = totalMealHours
          .filter(value => !isNaN(parseFloat(value))) // Filter out non-numeric values
          .reduce((a, b) => parseFloat(a) + parseFloat(b), 0);

        const workHoursSum = totalWorkHours
          .filter(value => !isNaN(parseFloat(value))) // Filter out non-numeric values
          .reduce((a, b) => parseFloat(a) + parseFloat(b), 0);

        element['work'] = mealHoursSum !== 0
          ? workHoursSum - mealHoursSum
          : workHoursSum;

      });
      const mealHoursSum = allMealHours
        .filter(value => !isNaN(parseFloat(value))) // Filter out non-numeric values
        .reduce((a, b) => parseFloat(a) + parseFloat(b), 0);

      const totalWorkingHours = mealHoursSum !== 0
        ? allHours
          .filter(value => !isNaN(parseFloat(value))) // Filter out non-numeric values
          .reduce((a, b) => parseFloat(a) + parseFloat(b), 0) - mealHoursSum
        : allHours
          .filter(value => !isNaN(parseFloat(value))) // Filter out non-numeric values
          .reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
        const roundedTotalHours = parseFloat(totalWorkingHours.toFixed(2));
      this.timesheetEntryForm.patchValue({
        totalWorkingHours: roundedTotalHours
      });

      let allForms = [];
      this.timeSheetDataSource.forEach((app, index) => {
        const fb: any = this.initSubSection();
        fb.patchValue(app);
        controlArray.push(fb);
        let segments = app.options;
        const formArray = new FormArray([]);
        if (segments && segments.length > 0) {
          segments.forEach(s => {
            if(s.ts_end_time === '12:00 AM'){
              app.options.forEach((ele:any,  i:number)=>{
                this.rowIndex = i
              })
              this.showAddButton = false
              formArray.push(this.fb.group({
                ts_start_time: [s.ts_start_time, Validators.required],
                timesheet_type: [s.timesheet_type],
                ts_end_time: "12:00 AM (Next Day)",
                start_time: [this.getTime(s.ts_start_time)],
                end_time: [this.getTime(s.ts_end_time)],
                project_name: !isBlank(s.project_id) ? s.project_id : s.timesheet_type === 'Timeoff' ? 'Timeoff' : (s.timesheet_type === 'Holiday' ? 'Holiday' : ''),
                milestone: !isBlank(s.milestone_id) ? s.milestone_id : '',
                // meal_start: !isBlank(s.meal_start_time) ? s.meal_start_time : '',
                // meal_end: !isBlank(s.meal_end_time) ? s.meal_end_time : '',
                meal_start_time: !isBlank(s.meal_start_time) ? s.meal_start_time : '',
                // meal_start_time: [this.getTime(s.meal_start_time)],
                meal_end_time: !isBlank(s.meal_end_time) ? s.meal_end_time : '',
                // meal_end_time: [this.getTime(s.meal_end_time)],
                holiday_name: [s.Holiday_name],
                comments: [s.comments],
                timesheet_id: s.id,
                status: s.status,
                showHolidayProject:false,
  
              }));
            }else{
              // this.showAddButton = true
              formArray.push(this.fb.group({
                ts_start_time: [s.ts_start_time, Validators.required],
                timesheet_type: [s.timesheet_type],
                ts_end_time: [s.ts_end_time, Validators.required],
                start_time: [this.getTime(s.ts_start_time)],
                end_time: [this.getTime(s.ts_end_time)],
                project_name: !isBlank(s.project_id) ? s.project_id : s.timesheet_type === 'Timeoff' ? 'Timeoff' : (s.timesheet_type === 'Holiday' ? 'Holiday' : ''),
                milestone: !isBlank(s.milestone_id) ? s.milestone_id : '',
                // meal_start: !isBlank(s.meal_start_time) ? s.meal_start_time : '',
                // meal_end: !isBlank(s.meal_end_time) ? s.meal_end_time : '',
                meal_start_time: !isBlank(s.meal_start_time) ? s.meal_start_time : '',
                // meal_start_time: [this.getTime(s.meal_start_time)],
                meal_end_time: !isBlank(s.meal_end_time) ? s.meal_end_time : '',
                // meal_end_time: [this.getTime(s.meal_end_time)],
                holiday_name: [s.Holiday_name],
                comments: [s.comments],
                timesheet_id: s.id,
                status: s.status,
                showHolidayProject:false,
  
              }));
            }
            
          });
          
          allForms.push(formArray)
          fb.setControl('options', formArray);
        }
      });
      
      setTimeout(() => {
        allForms.forEach((formData, index) => {
          this.mileStoneList[index] = []
          formData.value.forEach((element, i) => {
            this.mileStoneList[index].splice(i, 0, this.projectsList?.find(x => x.project_id === element.project_name)?.milestones);
          });
        })
      }, 500)
    })
    
    
  }
  getTime(dateTime) {
    if (!isBlank(dateTime)) {
      let timeMoment = moment(dateTime, 'HH:mm am');
      const time = new Date()
      time.setHours(Number(moment(timeMoment).format('HH')));
      time.setMinutes(Number(moment(timeMoment).format('mm')));
      time.setSeconds(Number(moment(timeMoment).format('ss')))
      return time;
    } else {
      return '';
    }
  }
  getLastTime(dateTime){
    if (!isBlank(dateTime)) {
      let timeMoment = moment('11:45 PM', 'HH:mm am');
      const time = new Date()
      time.setHours(Number(moment(timeMoment).format('HH')));
      time.setMinutes(Number(moment(timeMoment).format('mm'))+15);
      time.setSeconds(Number(moment(timeMoment).format('ss')))
      return time;
    } else {
      return '';
    }
  }
  getDaysFromFilterRange(fromDate, toDate) {
    var d = new Date(fromDate),
      a = [],
      y = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    while (d < toDate) {
      a.push({ categoryType: y[d.getDay()] });
      d.setDate(d.getDate() + 1);
    }
    if (d.getDay() === toDate.getDay())
      // include last day
      a.push({ categoryType: y[d.getDay()] });
    this.getDateArray(fromDate, toDate).forEach((element, index) => {
      a[index]['ts_date'] = moment(new Date(element.date)).format(Constants.dateFormat);
      a[index]['ts_actual_date'] = moment(new Date(element.date)).format('YYYY-MM-DD');
    })
    return a;
  }
  getDateArray(start, end) {
    var
      arr = new Array(),
      dt = new Date(start);
    while (dt <= end) {
      arr.push({ date: moment(new Date(dt)).format('MM/DD/YYYY') });
      dt.setDate(dt.getDate() + 1);
    }
    return arr;
  }
  add(j) {
    const control = <FormArray>this.timeForm.get(['questions', j, 'options']);
    control.push(this.initOptions());
    if (control.controls.length > 1) {
      control.controls.forEach((ele, index) => {
        this.updateValidations(ele, '', '')
      })
    }
    if(control.value[0].timesheet_type === 'Holiday'){
      const index =  control.length -1
      control.at(index).get("showHolidayProject").patchValue(true)
      
    }

  }
  updateValidations(time, question, index) {
    // if (time.get('timesheet_type').value == 2) {
    //   time.get('project_name').setValidators(Validators.required);
    //   time.get('project_name').updateValueAndValidity();
    //   time.get('ts_start_time').clearValidators();
    //   time.get('ts_start_time').updateValueAndValidity();
    //   time.get('ts_end_time').clearValidators();
    //   time.get('ts_end_time').updateValueAndValidity();

    //   //this.timeForm.mar();
    // } else {
    //   time.get('project_name').setValidators(Validators.required);
    //   time.get('project_name').updateValueAndValidity();
    //   time.get('ts_start_time').setValidators(Validators.required);
    //   time.get('ts_start_time').updateValueAndValidity();
    //   time.get('ts_end_time').setValidators(Validators.required);
    //   time.get('ts_end_time').updateValueAndValidity();
    //   time.get('comments').setValidators(Validators.required);
    //   time.get('comments').updateValueAndValidity();
    // }
    // if (time.get('timesheet_type').value == 3 || time.get('timesheet_type').value == 2 || time.get('timesheet_type').value == 4 || time.get('timesheet_type').value == 6) {
    //   time.get('comments').clearValidators();
    //   time.get('comments').updateValueAndValidity();


    // }

    // if (time.get('timesheet_type').value === 'Meal') {
    //   time.get('project_name').clearValidators();
    //   time.get('project_name').updateValueAndValidity();
    //   time.get('ts_start_time').setValidators(Validators.required);
    //   time.get('ts_start_time').updateValueAndValidity();
    //   time.get('ts_end_time').setValidators(Validators.required);
    //   time.get('ts_end_time').updateValueAndValidity();
    // }

  }
  deleteTimesheet(time, question, index, k, text) {
    if (time.value.timesheet_id === 0) {
      const control = this.timeForm.get(['questions', index, 'options']) as FormArray;
      if (control.controls.length > 1) {
        let currentObject = control.controls[k].value;
        let lastObject;
        let nextObject;
        if(control.controls[k-1]?.value){
          lastObject = control.controls[k-1].value;
        }
        if(control.controls[k+1]?.value){
          nextObject = control.controls[k+1].value
        }
        if (!isBlank(currentObject.ts_start_time) && !isBlank(currentObject.ts_end_time)) {

          if(question.controls.options.controls.length>k){
            question.controls.options.controls.forEach((ele:any, index:number)=>{
              // if(k != index && index>k){
              //   this.rowIndex = k
              // }
              if(ele.ts_end_time != '12:00 AM (Next Day)'){
                this.rowIndex = k
              }
            })
          }
          // if(control.controls[k-1]?.value){
          //   if(lastObject.ts_end_time !='12:00 AM (Next Day)'){
          //     this.showAddButton = false
          //     this.rowIndex = k
          //     // this.rowIndex = k
          //   }
          // }
          // if(control.controls[k+1]?.value){
          //   if(nextObject.ts_end_time != '12:00 AM (Next Day)'){
          //     this.showAddButton = false
          //     this.rowIndex = k
          //   }
          // }
          this.removeTimesheet(index, k);
        } else {
          this.removeTimesheet(index, k);
        }
      }
    } else {
      this.httpService.doDeleteWithParams(StaticDataEntity.deleteTimesheets.replace(/{id}/g, time.value.timesheet_id)).subscribe((result) => {
        // this.notificationService.showSucessNotification('', result?.message);
        this.toast.showSuccess("success", "Success", result?.message);
        this.filterTimesheets();
      });
    }
  }


  removeTimesheet(j, k) {
    const control = <FormArray>this.timeForm.get(['questions', j, 'options']); //also try this new syntax
    if (control.controls.length > 1) {
      control.controls.forEach((ele, index) => {
        // this.updateValidations(ele, '', '')
        // control.removeAt(k);
      });
      let timeSheet = control.controls[k];
      if (timeSheet.value.timesheet_id !== 0 && timeSheet.value.status === 'Saved') {
        let payload = {
          timesheetId: String(timeSheet.get('timesheet_id').value)
        };
        this.httpService.doDelete(StaticDataEntity.deleteTimesheets.replace(/{id}/g, String(timeSheet.get('timesheet_id').value)), payload).subscribe((result) => {
          // this.notificationService.showSucessNotification('', result?.message);
          this.toast.showSuccess("success", "Success", result?.message);
          this.filterTimesheets();
        })
      } else {
        control.removeAt(k);
      }

    }
  }
  saveTimesheets() {
    let submittedDate = new Date()
    let allDaysValue: any = this.timeForm['controls'].questions;
    let allControls = allDaysValue.controls;
    let isError = false;
    let isTimeoffError = false;
    let hoursErrorDate = '';
    allControls.forEach(element => {
      if (element.get('nonWork').value < 0 || element.get('work').value < 0) {
        isError = true;
        hoursErrorDate = element.get('ts_date').value;
        return;
      }
      element.controls.options.value.forEach(ele => {
        if (ele.project_name !== 'Timeoff' && ele.project_name !== '' && element.get('work').value === 0) {
          isTimeoffError = true;
          hoursErrorDate = element.get('ts_date').value;
          return;
        }
      })
      if (element.get('categoryType').value !== 'Saturday' && element.get('categoryType').value !== 'Sunday') {
        let control = element.controls.options;
        control.controls.forEach((ele,i) => {
          if(ele.value.project_name !='' || ele.value.ts_start_time !='' || ele.value.ts_end_time !=''){
            ele.get('project_name').setValidators(Validators.required);
            ele.get('project_name').updateValueAndValidity();
            ele.get('ts_start_time').setValidators(Validators.required);
            ele.get('ts_start_time').updateValueAndValidity();
            ele.get('ts_end_time').setValidators(Validators.required);
            ele.get('ts_end_time').updateValueAndValidity();
          }
        });
      }
    });
    if (isError) {
      // this.notificationService.showErrorNotification('Error', 'Daily total hours for ' + hoursErrorDate + ' cannot be less than 0');
      this.toast.showError("error", "Error", 'Daily total hours for ' + hoursErrorDate + ' cannot be less than 0');
      return;
    }
    if (isTimeoffError) {
      // this.notificationService.showErrorNotification('Error', 'Daily total hours for ' + hoursErrorDate + ' cannot be 0');
      this.toast.showError("error", "Error", 'Daily total hours for ' + hoursErrorDate + ' cannot be 0');
      return;
    }
    
    if (this.timeForm.valid) {
      
      let payload = (this.timeForm.get('questions') as FormGroup).getRawValue();
      const data = [];
      let allTimes = [];
      payload.map(element => {
        element.options.forEach(ele => {
          // ele['emailId'] = localStorage.getItem('user_name')
          if (!isBlank(ele['ts_start_time']) && ele.status !== 'Approved' && ele['timesheet_type'] !== 'Holiday') {
            let newElement = {};
            newElement['id'] = (!isBlank(ele['timesheet_id']) && ele['timesheet_id'] !== 0) ? ele['timesheet_id'] : null;
            newElement['ts_start_time'] = !isBlank(ele['ts_start_time']) ? ele['ts_start_time'] : "";
            // newElement['ts_end_time'] = !isBlank(ele['ts_end_time']) ? ele['ts_end_time'] : "";
            if(ele['ts_end_time']==='12:00 AM (Next Day)'){
              newElement['ts_end_time'] = '12:00 AM';
            }else{
              newElement['ts_end_time'] = !isBlank(ele['ts_end_time']) ? ele['ts_end_time'] : "";
            }
            newElement['comments'] = !isBlank(ele['comments']) ? ele['comments'] : null;
            newElement['meal_start_time'] = !isBlank(ele['meal_start_time']) ? ele['meal_start_time'] : "";
            newElement['meal_end_time'] = !isBlank(ele['meal_end_time']) ? ele['meal_end_time'] : "";
            newElement['milestone_id'] = !isBlank(ele['milestone']) ? ele['milestone'] : null;
            newElement['submited_date'] = moment(submittedDate).format('YYYY-MM-DD');
            newElement['project_id'] = !isBlank(ele['project_name']) && ele['project_name'] !== 'Timeoff' && ele['project_name'] !== 'Holiday' ? ele['project_name'] : null;
            newElement['status'] = (isBlank(ele['status']) || ele['status'] === 'Saved' || ele['status'] === 'Submitted' || ele['status'] === 'Rejected') ? 'Saved' : ele['status'];
            // newElement['status'] = (!isBlank(ele['status']) && (ele['status'] === 'Saved' || ele['status'] === 'Submitted' || ele['status'] === 'Rejected')) ? 'Saved' : ele['status'];
            newElement["timesheet_type"] = !isBlank(ele['project_name']) && ele['project_name'] !== 'Timeoff' && ele['project_name'] !== 'Holiday' ? "Work" :
            ele['project_name'] === 'Timeoff' ? 'Timeoff' :
            ele['project_name'] === 'Holiday' ? 'Holiday' : '';
            newElement['ts_date'] = !isBlank(element['ts_actual_date']) ? moment(element['ts_actual_date']).format('YYYY-MM-DD') : null;
            if (newElement['timesheet_type'] !== 'Holiday') {
              allTimes.push({ project: ele['project_name'], time: this.getDurationBetween2Dates(newElement['ts_start_time'], newElement['ts_end_time'],newElement['meal_start_time'],
                newElement['meal_end_time']) })
                 console.log(newElement['ts_start_time'], newElement['ts_end_time'],  newElement['meal_start_time'],
                newElement['meal_end_time'])
            }
            data.push(newElement)
          }
        });
      })
      const newData = data.map(({ ts_day, project_name, total_hours, ...rest }) => ({ ...rest }));
      allTimes = allTimes.reduce((a, { project, time }) => (a[project] = (a[project] || 0) + +time, a), {});
      allTimes = Object.entries(allTimes).map(([project, time]) => ({ project, time }));
      let allProjects = this.projectsList;
      let checkprojectExceeding = [];
      let exceededProjects = []; 
      let checkProjectTimeExceeds = allTimes.every(user => {
        const matchingProject = allProjects.find(project => project.project_id === user.project);
        if (matchingProject && user.time > matchingProject.work_hour_limit) {
          exceededProjects.push({
            project_name: matchingProject.project_name,
            work_hour_limit: matchingProject.work_hour_limit
          });
        }
        return true;
      });
      if (exceededProjects.length > 0) {
        exceededProjects.forEach((ele: any) => {
          if (ele.project_name !== 'Time Off') {
            this.projectsListExccedingWorkHoursSave.push(ele);
          }
        });
        
        // Create a Set with unique project names
        const uniqueProjectNamesSet = new Set(this.projectsListExccedingWorkHoursSave.map(project => project.project_name));
        
        // Convert the Set back to an array of unique objects
        this.projectsListExccedingWorkHoursSave = Array.from(uniqueProjectNamesSet).map(projectName => {
          // Find the first occurrence of each unique project_name
          return this.projectsListExccedingWorkHoursSave.find(project => project.project_name === projectName);
        });
        
        // Now, check if there is data in the projectsListExccedingWorkHoursSave
        const shouldShowPopup = this.projectsListExccedingWorkHoursSave.length > 0;
        // Show the popup based on the value of shouldShowPopup
        if (shouldShowPopup) {
         this.showProjectSave();
      } else {
          this.hideProjectSave();
          this.saveTimesheetAPI();
        }
      }
      else {
        this.httpService.doPost(StaticDataEntity.saveTimesheets, newData).subscribe((result) => {
          if (result && result['message']) {
            this.filterTimesheets();
            // this.notificationService.showSucessNotification('Success', result['message']);
            this.toast.showSuccess("success", "Success", result['message']);
          }
        })
      }

    }else {
      validateAllFormFields(this.timeForm)
      // this.notificationService.showErrorNotification('', 'Please select all the required fields')
      this.toast.showError("error","Error", 'Please select all the required fields');
    }
  } s
  submitTimesheets() {
    let submittedDate = new Date();
    let allDaysValue: any = this.timeForm['controls'].questions;
    let allControls = allDaysValue.controls;
    let isError = false;
    let isTimeoffError = false;
    let hoursErrorDate = '';
    allControls.forEach(element => {
      if (element.get('nonWork').value < 0 || element.get('work').value < 0) {
        isError = true;
        hoursErrorDate = element.get('ts_date').value;
        return;
      }
      element.controls.options.value.forEach(ele => {
        if (ele.project_name !== 'Timeoff' && ele.project_name !== '' && ele.project_name !== 'Holiday'  && (element.get('work').value === 0)) {
          isTimeoffError = true;
          hoursErrorDate = element.get('ts_date').value;
          return;
        }
      })
      if (element.get('categoryType').value !== 'Saturday' && element.get('categoryType').value !== 'Sunday' && element.get('timesheet_type').value !== 'Holiday') {
        let control = element.controls.options;
        control.controls.forEach(ele => {
          ele.get('project_name').setValidators(Validators.required);
          ele.get('project_name').updateValueAndValidity();
          ele.get('ts_start_time').setValidators(Validators.required);
          ele.get('ts_start_time').updateValueAndValidity();
          ele.get('ts_end_time').setValidators(Validators.required);
          ele.get('ts_end_time').updateValueAndValidity();
        });
      }
    });
    if (isError) {
      // this.notificationService.showErrorNotification('Error', 'Daily total hours for ' + hoursErrorDate + ' cannot be less than 0');
      this.toast.showError("error","Error",'Daily total hours for ' + hoursErrorDate + ' cannot be less than 0');
      return;
    }
    if (isTimeoffError) {
      // this.notificationService.showErrorNotification('Error', 'Daily total hours for ' + hoursErrorDate + ' cannot be 0');
      this.toast.showError("error", "Error", 'Daily total hours for ' + hoursErrorDate + ' cannot be 0');
      return;
    }
    let payload = (this.timeForm.get('questions') as FormGroup).getRawValue();
    payload.map(element => {
      element.options.forEach(ele => {
      })
    })

    if (this.timeForm.valid) {

      let payload = (this.timeForm.get('questions') as FormGroup).getRawValue();
      const data = [];
      let allTimes = [];
      payload.map(element => {
        element.options.forEach(ele => {
          if (!isBlank(ele['ts_start_time']) && ele.status !== 'Approved' && ele['timesheet_type'] !== 'Holiday') {
            let newElement = {};
            newElement['id'] = (!isBlank(ele['timesheet_id']) && ele['timesheet_id'] !== 0) ? ele['timesheet_id'] : null;
            newElement['ts_start_time'] = !isBlank(ele['ts_start_time']) ? ele['ts_start_time'] : "";
            if(ele['ts_end_time']==='12:00 AM (Next Day)'){
              newElement['ts_end_time'] = '12:00 AM';
            }else{
              newElement['ts_end_time'] = !isBlank(ele['ts_end_time']) ? ele['ts_end_time'] : "";
            }
            
            newElement['comments'] = !isBlank(ele['comments']) ? ele['comments'] : null;
            // newElement['meal_end_time'] = !isBlank(ele['meal_end']) ? ele['meal_end'] : null;
            // newElement['meal_start_time'] = !isBlank(ele['meal_start']) ? ele['meal_start'] : null;
            newElement['meal_end_time'] = !isBlank(ele['meal_end_time']) ? ele['meal_end_time'] : null;
            newElement['meal_start_time'] = !isBlank(ele['meal_start_time']) ? ele['meal_start_time'] : null;
            newElement['milestone_id'] = !isBlank(ele['milestone']) ? ele['milestone'] : null;
            newElement['submited_date'] = moment(submittedDate).format('YYYY-MM-DD');
            newElement['project_id'] = !isBlank(ele['project_name']) && ele['project_name'] !== 'Timeoff' && ele['project_name'] !== 'Holiday' ? ele['project_name'] : null;
            newElement['status'] = (isBlank(ele['status']) || ele['status'] === 'Saved' || ele['status'] === 'Submitted' || ele['status'] === 'Rejected') ? 'Submitted' : ele['status']; newElement["timesheet_type"] = !isBlank(ele['project_name']) && ele['project_name'] !== 'Timeoff' && ele['project_name'] !== 'Holiday' ? "Work" :
              ele['project_name'] === 'Timeoff' ? 'Timeoff' : 'Holiday',
              newElement['ts_date'] = !isBlank(element['ts_actual_date']) ? moment(element['ts_actual_date']).format('YYYY-MM-DD') : null;
            if (newElement['timesheet_type'] !== 'Holiday') {
              allTimes.push({ project: ele['project_name'], time: this.getDurationBetween2Dates(newElement['ts_start_time'], newElement['ts_end_time'], newElement['meal_start_time'],
        newElement['meal_end_time']) })
        console.log(newElement['ts_start_time'], newElement['ts_end_time'],  newElement['meal_start_time'],
          newElement['meal_end_time'])
            }
            data.push(newElement)
          }
        });
      })
      const newData = data.map(({ ts_day, project_name, total_hours, ...rest }) => ({ ...rest }));
      allTimes = allTimes.reduce((a, { project, time }) => (a[project] = (a[project] || 0) + +time, a), {});
      allTimes = Object.entries(allTimes).map(([project, time]) => ({ project, time }));
      let allProjects = this.projectsList;
      let checkprojectExceeding = [];
      let exceededProjects = []; 
      let checkProjectTimeExceeds = allTimes.every(user => {
        const matchingProject = allProjects.find(project => project.project_id === user.project);
        if (matchingProject && user.time > matchingProject.work_hour_limit) {
          exceededProjects.push({
            project_name: matchingProject.project_name,
            work_hour_limit: matchingProject.work_hour_limit
          });
        }
        return true;
      });
      if (exceededProjects.length > 0) {    

        exceededProjects.forEach((ele:any)=>{
          if(ele.project_name != 'Time Off'){
            this.projectsListExccedingWorkHoursSubmit.push(ele)

            // Create a Set with unique project names
            const uniqueProjectNamesSet = new Set(this.projectsListExccedingWorkHoursSubmit.map(project => project.project_name));

            // Convert the Set back to an array of unique objects
            this.projectsListExccedingWorkHoursSubmit = Array.from(uniqueProjectNamesSet).map(projectName => {

              // Find the first occurrence of each unique project_name
              return this.projectsListExccedingWorkHoursSubmit.find(project => project.project_name === projectName);
            });
          }
        })
        if(this.projectsListExccedingWorkHoursSubmit.length > 0){
          this.showProjectSubmit();
        }else{
          this.showModal();
        }
        // this.projectsListExccedingWorkHoursSubmit = exceededProjects;
      }else{
        this.showModal();
      }
    } else {
      validateAllFormFields(this.timeForm)
      this.timeForm.value.questions.forEach((element:any) => {
        element.options.forEach((ele:any)=>{
          if(ele.ts_start_time===""){
            this.requiredField = true
          } 
          if(ele.ts_end_time===""){
            this.endRequiredField = true
          }
        })
        
      });
      // this.notificationService.showErrorNotification('', 'Please select all the required fields')
      this.toast.showError("error", "Error", 'Please select all the required fields');
    }



  }
  submitTimesheetAPI() {
    let submittedDate = new Date();
    let payload = (this.timeForm.get('questions') as FormGroup).getRawValue();
    const data = [];
    let allTimes = [];
    payload.map(element => {
      element.options.forEach(ele => {
        if (!isBlank(ele['ts_start_time']) && ele.status !== 'Approved' && ele['timesheet_type'] !== 'Holiday') {
          let newElement = {};
          newElement['id'] = (!isBlank(ele['timesheet_id']) && ele['timesheet_id'] !== 0) ? ele['timesheet_id'] : null;
          newElement['ts_start_time'] = !isBlank(ele['ts_start_time']) ? ele['ts_start_time'] : "";
          // newElement['ts_end_time'] = !isBlank(ele['ts_end_time']) ? ele['ts_end_time'] : "";
          if(ele['ts_end_time']==='12:00 AM (Next Day)'){
            newElement['ts_end_time'] = '12:00 AM';
          }else{
            newElement['ts_end_time'] = !isBlank(ele['ts_end_time']) ? ele['ts_end_time'] : "";
          }
          newElement['comments'] = !isBlank(ele['comments']) ? ele['comments'] : null;
          // newElement['meal_end_time'] = !isBlank(ele['meal_end']) ? ele['meal_end'] : null;
          // newElement['meal_start_time'] = !isBlank(ele['meal_start']) ? ele['meal_start'] : null;
          newElement['meal_end_time'] = !isBlank(ele['meal_end_time']) ? ele['meal_end_time'] : null;
          newElement['meal_start_time'] = !isBlank(ele['meal_start_time']) ? ele['meal_start_time'] : null;
          newElement['milestone_id'] = !isBlank(ele['milestone']) ? ele['milestone'] : null;
          newElement['submited_date'] = moment(submittedDate).format('YYYY-MM-DD');
          newElement['project_id'] = !isBlank(ele['project_name']) && ele['project_name'] !== 'Timeoff' && ele['project_name'] !== 'Holiday' ? ele['project_name'] : null;
          newElement['status'] = (isBlank(ele['status']) || ele['status'] === 'Saved' || ele['status'] === 'Submitted' || ele['status'] === 'Rejected') ? 'Submitted' : ele['status'];
          newElement["timesheet_type"] = !isBlank(ele['project_name']) && ele['project_name'] !== 'Timeoff' && ele['project_name'] !== 'Holiday' ? "Work" :
            ele['project_name'] === 'Timeoff' ? 'Timeoff' : 'Holiday';
          newElement['ts_date'] = !isBlank(element['ts_actual_date']) ? moment(element['ts_actual_date']).format('YYYY-MM-DD') : null;
          if (newElement['timesheet_type'] !== 'Holiday') {
            allTimes.push({ project: ele['project_name'], time: this.getDurationBetween2Dates(newElement['ts_start_time'], newElement['ts_end_time'],  newElement['meal_start_time'],
              newElement['meal_end_time']) });
              console.log(newElement['ts_start_time'], newElement['ts_end_time'],  newElement['meal_start_time'],
                newElement['meal_end_time'])
          }
          data.push(newElement);
        }
      });
    });
    const newData = data.map(({ ts_day, project_name, total_hours, ...rest }) => ({ ...rest }));
    allTimes = allTimes.reduce((a, { project, time }) => (a[project] = (a[project] || 0) + +time, a), {});
    allTimes = Object.entries(allTimes).map(([project, time]) => ({ project, time }));
    this.httpService.doPost(StaticDataEntity.saveTimesheets, newData).subscribe((result) => {
      if (result && result['message']) {
        this.filterTimesheets();
        // this.notificationService.showSucessNotification('Success', result['message']);
        this.toast.showSuccess("success", "Success", result['message']);
        this.hideModal();
        this.hideProjectSubmit();
      }
    });
  }


  saveTimesheetAPI() {
    let submittedDate = new Date();
    let payload = (this.timeForm.get('questions') as FormGroup).getRawValue();
    const data = [];
    let allTimes = [];
    payload.map(element => {
      element.options.forEach(ele => {
        if (!isBlank(ele['ts_start_time']) && ele.status !== 'Approved' && ele['timesheet_type'] !== 'Holiday') {
          let newElement = {};
          newElement['id'] = (!isBlank(ele['timesheet_id']) && ele['timesheet_id'] !== 0) ? ele['timesheet_id'] : null;
          newElement['ts_start_time'] = !isBlank(ele['ts_start_time']) ? ele['ts_start_time'] : "";
          // newElement['ts_end_time'] = !isBlank(ele['ts_end_time']) ? ele['ts_end_time'] : "";
          if(ele['ts_end_time']==='12:00 AM (Next Day)'){
            newElement['ts_end_time'] = '12:00 AM';
          }else{
            newElement['ts_end_time'] = !isBlank(ele['ts_end_time']) ? ele['ts_end_time'] : "";
          }
          newElement['comments'] = !isBlank(ele['comments']) ? ele['comments'] : null;
          // newElement['meal_end_time'] = !isBlank(ele['meal_end']) ? ele['meal_end'] : null;
          // newElement['meal_start_time'] = !isBlank(ele['meal_start']) ? ele['meal_start'] : null;
          newElement['meal_end_time'] = !isBlank(ele['meal_end_time']) ? ele['meal_end_time'] : null;
          newElement['meal_start_time'] = !isBlank(ele['meal_start_time']) ? ele['meal_start_time'] : null;
          newElement['milestone_id'] = !isBlank(ele['milestone']) ? ele['milestone'] : null;
          newElement['submited_date'] = moment(submittedDate).format('YYYY-MM-DD');
          newElement['project_id'] = !isBlank(ele['project_name']) && ele['project_name'] !== 'Timeoff' && ele['project_name'] !== 'Holiday' ? ele['project_name'] : null;
          newElement['status'] = (isBlank(ele['status']) || ele['status'] === 'Saved' || ele['status'] === 'Submitted' || ele['status'] === 'Rejected') ? 'Saved' : ele['status'];
          // newElement["timesheet_type"] = !isBlank(ele['project_name']) && ele['project_name'] !== 'Timeoff' && ele['project_name'] !== 'Holiday' ? "Work" :
          //   ele['project_name'] === 'Timeoff' ? 'Timeoff' : 'Holiday';
          newElement["timesheet_type"] = !isBlank(ele['project_name']) && ele['project_name'] !== 'Timeoff' && ele['project_name'] !== 'Holiday' ? "Work" :
          ele['project_name'] === 'Timeoff' ? 'Timeoff' :
          ele['project_name'] === 'Holiday' ? 'Holiday' : '';
          newElement['ts_date'] = !isBlank(element['ts_actual_date']) ? moment(element['ts_actual_date']).format('YYYY-MM-DD') : null;
          if (newElement['timesheet_type'] !== 'Holiday') {
            allTimes.push({ project: ele['project_name'], time: this.getDurationBetween2Dates(newElement['ts_start_time'], newElement['ts_end_time'],  newElement['meal_start_time'],
              newElement['meal_end_time']) });
          }
          data.push(newElement);
        }
      });
    });
    const newData = data.map(({ ts_day, project_name, total_hours, ...rest }) => ({ ...rest }));
    allTimes = allTimes.reduce((a, { project, time }) => (a[project] = (a[project] || 0) + +time, a), {});
    allTimes = Object.entries(allTimes).map(([project, time]) => ({ project, time }));

    this.httpService.doPost(StaticDataEntity.saveTimesheets, newData).subscribe((result) => {
      if (result && result['message']) {
        this.filterTimesheets();
        // this.notificationService.showSucessNotification('Success', result['message']);
        this.toast.showSuccess("success", "Success", result['message']);
        this.hideModal();
        this.hideProjectSave();
      }
    });

  }
  checkTimeOffTwice(data) {
    this.newProjectList = data;
    const timeOffProjectsCount = this.newProjectList.filter(item => item.project_name === 'Timeoff').length;
    return timeOffProjectsCount !== 2;
  }

  projectHoursSubmit() {
    this.projectHours = true;
    this.hideProjectSubmit();
    this.showModal();
  }


  showProjectSave() {
    this.projectSaveModal.show();
  }

  hideProjectSave() {
    this.projectSaveModal.hide();
  }

  showProjectSubmit() {
    this.projectSubmitModal.show();
  }

  hideProjectSubmit() {
    this.projectSubmitModal.hide();
  }






  setStartTimeToPicker(timepicker, option, data, selectedTime, type) {
  

    if (!isBlank(selectedTime)) {
      let time = new Date();
      let hours = new Date(Number(moment(selectedTime, 'HH:mm am'))).getHours();
      let minutes = new Date(Number(moment(selectedTime, 'HH:mm am'))).getMinutes();
      let seconds = new Date(selectedTime).getSeconds();
      time.setHours(hours);
      time.setMinutes(minutes);
      // time.setSeconds(seconds);
      option.get(type).setValue(time)
    } else {
      option.get(type).markAsUntouched();
      // timepicker.hours =null;
      // timepicker.minutes =null;
      option.get(type).setValue(null)

    }

  }
  setMinTimeCheck(kIndex, options, option, startTimeIfExists) {
    if (kIndex > 0) {
      // option.get('ts_start_time').setValue('')
      return options[kIndex - 1]?.ts_end_time;
    } else {
      return null;
    }
    
  }
  setMinTime(kIndex, options, option, startTimeIfExists) {
    if (kIndex > 0) {
      this.minStartTime = this.getTime(options[kIndex - 1]?.end_time);
      // option.get('ts_start_time').setValidators(this.minStartTime)
      if(startTimeIfExists?.toString()?.split(' ')[4] < this.minStartTime?.toString()?.split(' ')[4]){
        option.get('ts_start_time').setValidators(Validators.min)
      }else{
        option.get('ts_start_time').clearValidators();
        option.get('ts_start_time').updateValueAndValidity();

      }
      if (isBlank(startTimeIfExists)) {
        option.get('start_time').setValue(this.getTime(options[kIndex - 1]?.end_time))
      }
      if (this.checkBoolean) {
        option.get('ts_start_time').Clear();
        option.get('ts_start_time').setValidators(Validators.required);
        option.get('start_time').Clear();
        this.check2 = true;
      }
    } else {
      this.minStartTime = null;
    }

  

  }

  dateEntry(option, pop, type) {
    if (type === 'ts_start_time') {
      const selectedTime = option.value.ts_start_time;
      if (selectedTime) {
        const formattedTime = this.formatTime(selectedTime);
        option.get('ts_start_time').setValue(formattedTime);
      } else {
        option.get('ts_start_time').setValue(null); // Clear the value if no time is selected
      }
    } else if (type === 'meal_start') {
      const selectedTime = option.value.meal_start;
      if (selectedTime) {
        const formattedTime = this.formatTime(selectedTime);
        option.get('meal_start').setValue(formattedTime);

      } else {
        option.get('meal_start').setValue(null); // Clear the value if no time is selected
      }

    } else if (type === 'meal_end') {
      const selectedTime = option.value.meal_end;
      if (selectedTime) {
        const formattedTime = this.formatTime(selectedTime);
        option.get('meal_end').setValue(formattedTime);

      } else {
        option.get('meal_end').setValue(null); // Clear the value if no time is selected
      }

    } else if (type === 'ts_end_time') {
      const selectedTime = option.value.ts_end_time;
      if (selectedTime) {
        const formattedTime = this.formatTime(selectedTime);
        option.get('ts_end_time').setValue(formattedTime);

      } else {
        option.get('ts_end_time').setValue(null); // Clear the value if no time is selected
      }
    }
  }


  formatTime(time: string): string {
    const formattedTime = moment(time, ['h:mma', 'h:mm a']).format('hh:mm A');
    return formattedTime;
  }

  onEnter(event: any, option, pop) {
    pop.hide();

  }

  updateStartTime(time, option, question, j, timeType, pop) {
    if (!time.invalidHours && !time.invalidMinutes && !time.invalidSeconds) {
      let formattedDateTime = '';
      // Convert the entered minutes to the desired values
      if (time.minutes > 0 && time.minutes <= 15) {
        time.minutes = 15;
      } else if (time.minutes > 15 && time.minutes <= 30) {
        time.minutes = 30;
      } else if (time.minutes > 30 && time.minutes <= 45) {
        time.minutes = 45;
      } else if (time.minutes > 45) {
        time.minutes = 0;
        time.hours = Number(time.hours) + 1; // Increment the hours by one
      } else {
        time.minutes = 0; // Set to 0 if not within the specified ranges
      }
      if (!isBlank(time.hours) && !isBlank(time.minutes)) {
        const formattedHours = (!isBlank(String(time.hours)) && String(time.hours).length >= 1 ? String(time.hours).padStart(2, '0') : '');
        const formattedMinutes = (!isBlank(time.minutes) ? ':' + String(time.minutes).padStart(2, '0') : '');
        formattedDateTime = formattedHours + formattedMinutes + (!isBlank(time.meridian) ? ' ' + time.meridian : '');
      } else {
        formattedDateTime = '';
      }
      if (!isBlank(formattedDateTime) && !isBlank(time.hours) && !isBlank(time.minutes)) {
        if (timeType === 'ts_start_time') {
          option.get('ts_start_time').setValue(formattedDateTime);
          option.get('start_time').setValue(formattedDateTime);
          pop.hide();
        } else if (timeType === 'ts_end_time') {
          option.get('ts_end_time').setValue(formattedDateTime);
          option.get('end_time').setValue(formattedDateTime);
          pop.hide();
        } else if (timeType === 'meal_start') {
          option.get('meal_start').setValue(formattedDateTime);
          option.get('meal_start_time').setValue(formattedDateTime);
          pop.hide();
        } else if (timeType === 'meal_end') {
          option.get('meal_end').setValue(formattedDateTime);
          option.get('meal_end_time').setValue(formattedDateTime);
          pop.hide();
        }
      }
      // else {
      //   this.notificationService.showWarningNotification('', 'Please Select Valid Time')
      // }

    }
  }

  mealStartTime(time, option, question, j, timeType, pop) {
    if (!time.invalidHours && !time.invalidMinutes && !time.invalidSeconds) {
      let formattedDateTime = '';
      if (!isBlank(time.hours) && !isBlank(time.minutes)) {
        formattedDateTime = (!isBlank(time.hours) && time.hours.length >= 1 ? time.hours : '') + (!isBlank(time.minutes) ? ':' + time.minutes : '') + (!isBlank(time.meridian) ? ' ' + time.meridian : '')
      } else {
        formattedDateTime = '';
      }
      if (!isBlank(formattedDateTime) && !isBlank(time.hours) && !isBlank(time.minutes)) {
        if (timeType === 'meal_start') {
          option.get('meal_start_time').setValue(formattedDateTime);
          option.get('meal_start').setValue(formattedDateTime);
          pop.hide();
        } else if (timeType === 'meal_end') {
          option.get('meal_end_time').setValue(formattedDateTime);
          option.get('meal_end').setValue(formattedDateTime);
          pop.hide();
        }
      }

    }


  }
  getMinTime(startTime) {
    let time = new Date();
    let hours = new Date(Number(moment(startTime, 'HH:mm am'))).getHours();
    let minutes = new Date(Number(moment(startTime, 'HH:mm am'))).getMinutes();
    time.setHours(hours);
    time.setMinutes(minutes);
    return time;
  }
  setValue(value, option, type, question, j,time,kIndex) {
    this.rowIndex = kIndex
    
    const currentDate = new Date();
    
    const startTime = new Date(`${currentDate.toDateString()} ${value}`);
    // this.selectedStartTime = startTime;

    const nextTime = new Date(startTime.getTime() + 15 * 60000);
    if (nextTime.getDate() !== startTime.getDate()) {
      nextTime.setDate(startTime.getDate() + 1);
    }
    const selectedOption = question.controls.options.controls[kIndex];


    question.value.options.forEach((ele:any, index:number)=>{

    // if(selectedOption){
      if(ele.project_name==='Timeoff'){
        this.indexID = kIndex
        option.get(type).setValue(value)
        if(type==='ts_start_time'){
          this.maxTime = '11:45 PM'
          this.timerType = type
          this.nextTime = nextTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          if(question.controls.options.controls[kIndex]?.get('ts_end_time').value != ''){
            let id;
            let startTime = question.controls.options.controls[kIndex]?.get('ts_start_time').value
            let endTime = question.controls.options.controls[kIndex]?.get('ts_end_time').value
            const time1 = new Date(`${currentDate.toDateString()} ${startTime}`);
            const time2 = new Date(`${currentDate.toDateString()} ${endTime}`);
            if (time1.getTime() < time2.getTime()) {
              id = 1// timeStr1 is earlier than timeStr2
            } else if (time1.getTime() > time2.getTime()) {
              id = 2 // timeStr1 is later than timeStr2
            } else {
              id = 0 // Both time strings are equal
            }
  
            if(id===2 || id===0){
              question.controls.options.controls[kIndex]?.get('ts_end_time').setValue('')
              // question.controls.options.controls[kIndex].get('meal_start_time').setValue('')
              // question.controls.options.controls[kIndex].get('meal_end_time').setValue('')

            }
          }
        }else if(type==='ts_end_time'){
          if(question.controls.options.controls[kIndex]?.get('ts_end_time').value === '12:00 AM (Next Day)'){
            this.showAddButton = false
            if(question.controls.options.controls.length>kIndex){
              question.controls.options.controls.forEach((ele:any, index:number)=>{
                if(kIndex != index && index>kIndex){
                  this.removeTimesheet(j,index)
                }
              })
            }
          }else{
            this.showAddButton = true
          }


          if(question.controls.options.controls[kIndex+1]?.get('ts_start_time').value != ''){
            let id;
            let startTime = question.controls.options.controls[kIndex+1]?.get('ts_start_time').value
            let endTime = question.controls.options.controls[kIndex]?.get('ts_end_time').value
            const time1 = new Date(`${currentDate.toDateString()} ${startTime}`);
            const time2 = new Date(`${currentDate.toDateString()} ${endTime}`);

            if (time1.getTime() < time2.getTime()) {
              id = 1// timeStr1 is earlier than timeStr2
            } else if (time1.getTime() > time2.getTime()) {
              id = 2 // timeStr1 is later than timeStr2
            } else {
              id = 0 // Both time strings are equal
            }

            if(id===1){
              question.controls.options.controls[kIndex+1]?.get('ts_start_time').setValue('')
            }

          }

          // if(question.controls.options.controls[kIndex]?.get('ts_start_time').value != ''){
          //   let id;
          //   let startTime = question.controls.options.controls[kIndex]?.get('ts_start_time').value
          //   let endTime = question.controls.options.controls[kIndex]?.get('ts_end_time').value
          //   const time1 = new Date(`${currentDate.toDateString()} ${startTime}`);
          //   const time2 = new Date(`${currentDate.toDateString()} ${endTime}`);

          //   if (time1.getTime() < time2.getTime()) {
          //     id = 1// timeStr1 is earlier than timeStr2
          //   } else if (time1.getTime() > time2.getTime()) {
          //     id = 2 // timeStr1 is later than timeStr2
          //   } else {
          //     id = 0 // Both time strings are equal
          //   }

          //   if(id===2 || id===0){
          //     question.controls.options.controls[kIndex]?.get('ts_start_time').setValue('')
          //   }

          // }


          if(question.controls.options.controls[kIndex]?.get('ts_start_time').value != ''){
            if(question.controls.options.controls[kIndex]?.get('ts_start_time').value === '12:00 AM'){
              let id;
              let startTime = question.controls.options.controls[kIndex].get('ts_start_time').value
              let endTime;
              if(question.controls.options.controls[kIndex].get('ts_end_time').value === '12:00 AM (Next Day)'){
                endTime = '12:00 AM'
              }else{
                endTime = question.controls.options.controls[kIndex].get('ts_end_time').value
              }
              
              const time1 = new Date(`${currentDate.toDateString()} ${startTime}`);
              const time2 = new Date(`${currentDate.toDateString()} ${endTime}`);
              if (time1.getTime() < time2.getTime()) {
                id = 1// timeStr1 is earlier than timeStr2
              } else if (time1.getTime() > time2.getTime()) {
                id = 2 // timeStr1 is later than timeStr2
              } else {
                id = 0 // Both time strings are equal
              }
    
              if( id===2){
                question.controls.options.controls[kIndex]?.get('ts_start_time').setValue('')
                question.controls.options.controls[kIndex]?.get('meal_start_time').setValue('')

              }
            }else{
              let id;
              let startTime = question.controls.options.controls[kIndex].get('ts_start_time').value
              let endTime;
              if(question.controls.options.controls[kIndex].get('ts_end_time').value === '12:00 AM (Next Day)'){
                endTime = '12:00 AM'
                const time1 = new Date(`${currentDate.toDateString()} ${startTime}`);
                const time2 = new Date(`${currentDate.toDateString()} ${endTime}`);
                if (time1.getTime() < time2.getTime()) {
                  id = 1// timeStr1 is earlier than timeStr2
                } else if (time1.getTime() > time2.getTime()) {
                  id = 2 // timeStr1 is later than timeStr2
                } else {
                  id = 0 // Both time strings are equal
                }
      
                if(id===0){
                  question.controls.options.controls[kIndex]?.get('ts_start_time').setValue('')
                  question.controls.options.controls[kIndex]?.get('meal_start_time').setValue('')

                }
              }else{
                endTime = question.controls.options.controls[kIndex].get('ts_end_time').value
                const time1 = new Date(`${currentDate.toDateString()} ${startTime}`);
                const time2 = new Date(`${currentDate.toDateString()} ${endTime}`);
                if (time1.getTime() < time2.getTime()) {
                  id = 1// timeStr1 is earlier than timeStr2
                } else if (time1.getTime() > time2.getTime()) {
                  id = 2 // timeStr1 is later than timeStr2
                } else {
                  id = 0 // Both time strings are equal
                }
      
                if( id===2 || id===0){
                  question.controls.options.controls[kIndex]?.get('ts_start_time').setValue('')
                  question.controls.options.controls[kIndex]?.get('meal_start_time').setValue('')

                }
              }
              
  
            }
          }
        }
        this.updateWorkHours(option, question, j, 'time off', '')

      }else{

        option.get(type).setValue(value)
        
        if(type==='ts_start_time'){
          this.indexID = kIndex
          this.maxTime = '11:45 PM'
          this.timerType = type
         

          if(question.controls.options.controls[kIndex]?.get('ts_end_time').value != ''){
            let id;
            let startTime = question.controls.options.controls[kIndex].get('ts_start_time').value
            let endTime = question.controls.options.controls[kIndex].get('ts_end_time').value
            const time1 = new Date(`${currentDate.toDateString()} ${startTime}`);
            const time2 = new Date(`${currentDate.toDateString()} ${endTime}`);
            if (time1.getTime() < time2.getTime()) {
              id = 1// timeStr1 is earlier than timeStr2
            } else if (time1.getTime() > time2.getTime()) {
              id = 2 // timeStr1 is later than timeStr2
            } else {
              id = 0 // Both time strings are equal
            }
  
            if(id===2 || id===0){
              question.controls.options.controls[kIndex].get('ts_end_time').setValue('')
              question.controls.options.controls[kIndex].get('meal_start_time').setValue('')
              question.controls.options.controls[kIndex].get('meal_end_time').setValue('')

            }
          }
          if(question.controls.options.controls[kIndex]?.get('meal_start_time').value != ''){
            let id;
            let startTime = question.controls.options.controls[kIndex].get('ts_start_time').value
            let endTime = question.controls.options.controls[kIndex].get('meal_start_time').value
            const time1 = new Date(`${currentDate.toDateString()} ${startTime}`);
            const time2 = new Date(`${currentDate.toDateString()} ${endTime}`);
            if (time1.getTime() < time2.getTime()) {
              id = 1// timeStr1 is earlier than timeStr2
            } else if (time1.getTime() > time2.getTime()) {
              id = 2 // timeStr1 is later than timeStr2
            } else {
              id = 0 // Both time strings are equal
            }
  
            if(id===2 || id===0){
              // question.controls.options.controls[kIndex].get('ts_end_time').setValue('')
              question.controls.options.controls[kIndex].get('meal_start_time').setValue('')
              question.controls.options.controls[kIndex].get('meal_end_time').setValue('')
            }
          }



          // if(kIndex>0){
          //   this.secNextTime = nextTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          // }else{
          //   this.nextTime = nextTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          // }

          this.nextTime = nextTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        }else if(type==='meal_end_time'){
          this.indexID = kIndex
          // option.get('ts_end_time').setValue('');
          question.controls.options.controls[kIndex]?.get('ts_end_time').setValue('')
          this.timerType = type
          this.timer1 = nextTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        }else if(type==='meal_start_time'){
          this.indexID = kIndex
          if(question.controls.options.controls[kIndex]?.get('ts_end_time').value != ''){
            let id;
            let startTime = question.controls.options.controls[kIndex]?.get('meal_start_time').value
            let endTime = question.controls.options.controls[kIndex]?.get('ts_end_time').value
            const time1 = new Date(`${currentDate.toDateString()} ${startTime}`);
            const time2 = new Date(`${currentDate.toDateString()} ${endTime}`);
            if (time1.getTime() < time2.getTime()) {
              id = 1 // timeStr1 is earlier than timeStr2
            } else if (time1.getTime() > time2.getTime()) {
              id = 2 // timeStr1 is later than timeStr2
            } else {
              id = 0 // Both time strings are equal
            }
  
            if(id===2 || id===0){
              question.controls.options.controls[kIndex]?.get('ts_end_time').setValue('')
              question.controls.options.controls[kIndex]?.get('meal_end_time').setValue('')

            }
          }
          if(question.controls.options.controls[kIndex]?.get('meal_end_time').value != ''){
            let id;
            let startTime = question.controls.options.controls[kIndex]?.get('meal_start_time').value
            let endTime = question.controls.options.controls[kIndex]?.get('meal_end_time').value
            const time1 = new Date(`${currentDate.toDateString()} ${startTime}`);
            const time2 = new Date(`${currentDate.toDateString()} ${endTime}`);
            if (time1.getTime() < time2.getTime()) {
              id = 1// timeStr1 is earlier than timeStr2
            } else if (time1.getTime() > time2.getTime()) {
              id = 2 // timeStr1 is later than timeStr2
            } else {
              id = 0 // Both time strings are equal
            }
  
            if(id===2 || id===0){
              question.controls.options.controls[kIndex]?.get('meal_end_time').setValue('')
            }
          }
          // option.get('meal_end_time').setValue('');

          this.mealNextTime = nextTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        }else if(type==='ts_end_time'){
          this.indexID = kIndex
          if(question.controls.options.controls[kIndex].get('ts_end_time').value === '12:00 AM (Next Day)'){
            this.showAddButton = false
            if(question.controls.options.controls.length>kIndex){
              question.controls.options.controls.forEach((ele:any, index:number)=>{
                if(kIndex != index && index>kIndex){
                  this.removeTimesheet(j,index)
                }
              })
            }
          }else{
            this.showAddButton = true
          }
          
          // if(kIndex){
            if(question.controls.options.controls[kIndex+1]?.get('ts_start_time').value != ''){
              let id;
              let startTime = question.controls.options.controls[kIndex+1]?.get('ts_start_time').value
              let endTime = question.controls.options.controls[kIndex]?.get('ts_end_time').value
              const time1 = new Date(`${currentDate.toDateString()} ${startTime}`);
              const time2 = new Date(`${currentDate.toDateString()} ${endTime}`);
  
              if (time1.getTime() < time2.getTime()) {
                id = 1// timeStr1 is earlier than timeStr2
              } else if (time1.getTime() > time2.getTime()) {
                id = 2 // timeStr1 is later than timeStr2
              } else {
                id = 0 // Both time strings are equal
              }
  
              if(id===1){
                question.controls.options.controls[kIndex+1]?.get('ts_start_time').setValue('')
              }
  
            }

          
          // this.setMinTimeCheck()
          if(question.controls.options.controls[kIndex]?.get('ts_start_time').value != ''){
            if(question.controls.options.controls[kIndex]?.get('ts_start_time').value === '12:00 AM'){
              let id;
              let startTime = question.controls.options.controls[kIndex].get('ts_start_time').value
              let endTime;
              if(question.controls.options.controls[kIndex].get('ts_end_time').value === '12:00 AM (Next Day)'){
                endTime = '12:00 AM'
              }else{
                endTime = question.controls.options.controls[kIndex].get('ts_end_time').value
              }
              
              const time1 = new Date(`${currentDate.toDateString()} ${startTime}`);
              const time2 = new Date(`${currentDate.toDateString()} ${endTime}`);
              if (time1.getTime() < time2.getTime()) {
                id = 1// timeStr1 is earlier than timeStr2
              } else if (time1.getTime() > time2.getTime()) {
                id = 2 // timeStr1 is later than timeStr2
              } else {
                id = 0 // Both time strings are equal
              }
    
              if( id===2){
                question.controls.options.controls[kIndex]?.get('ts_start_time').setValue('')
                question.controls.options.controls[kIndex]?.get('meal_start_time').setValue('')

              }
            }else{
              let id;
              let startTime = question.controls.options.controls[kIndex].get('ts_start_time').value
              let endTime;
              if(question.controls.options.controls[kIndex].get('ts_end_time').value === '12:00 AM (Next Day)'){
                endTime = '12:00 AM'
                const time1 = new Date(`${currentDate.toDateString()} ${startTime}`);
                const time2 = new Date(`${currentDate.toDateString()} ${endTime}`);
                if (time1.getTime() < time2.getTime()) {
                  id = 1// timeStr1 is earlier than timeStr2
                } else if (time1.getTime() > time2.getTime()) {
                  id = 2 // timeStr1 is later than timeStr2
                } else {
                  id = 0 // Both time strings are equal
                }
      
                if(id===0){
                  question.controls.options.controls[kIndex]?.get('ts_start_time').setValue('')
                  question.controls.options.controls[kIndex]?.get('meal_start_time').setValue('')

                }
              }else{
                endTime = question.controls.options.controls[kIndex].get('ts_end_time').value
                const time1 = new Date(`${currentDate.toDateString()} ${startTime}`);
                const time2 = new Date(`${currentDate.toDateString()} ${endTime}`);
                if (time1.getTime() < time2.getTime()) {
                  id = 1// timeStr1 is earlier than timeStr2
                } else if (time1.getTime() > time2.getTime()) {
                  id = 2 // timeStr1 is later than timeStr2
                } else {
                  id = 0 // Both time strings are equal
                }
      
                if( id===2 || id===0){
                  question.controls.options.controls[kIndex]?.get('ts_start_time').setValue('')
                  question.controls.options.controls[kIndex]?.get('meal_start_time').setValue('')

                }
              }
              
  
            }
          }
        }
        
        this.updateWorkHours(option, question, j, 'time', '')
      }
       
    // }
    })
    
    
  }
  getMinValue(): string | null {
    if (this.timerType === 'meal_end_time') {
      return this.timer1;
    } else if (this.timerType === 'ts_start_time') {
      return this.nextTime;
    } else {
      return null;
    }
  }

  compareStartAndEndTime(endTime,startTime){
    const startDate = new Date();
    const endDate = new Date();
    
    // Extracting the hours, minutes, and AM/PM using slice()
    const startHours = parseInt(startTime.slice(0, 2), 10);
    const startMinutes = parseInt(startTime.slice(3, 5), 10);
    const ampm = startTime.slice(6, 8);
    
    // Setting the hours and minutes for startDate
    startDate.setHours(startHours);
    startDate.setMinutes(startMinutes);
    // Adjusting the minutes by adding 15 minutes to startDate
    startDate.setMinutes(startDate.getMinutes() + 15);

    // Extracting the hours and minutes for endDate
    const endHours = parseInt(endTime.slice(0, 2), 10);
    const endMinutes = parseInt(endTime.slice(3, 5), 10);

    // Setting the hours and minutes for endDate
    endDate.setHours(endHours);
    endDate.setMinutes(endMinutes);

    // Compare endDate and startDate using the getTime() method
    return endDate.getTime() > startDate.getTime();
  }

  getMealEndDate(kIndex, options, option, startTimeIfExists){
    if(kIndex >= 0){
      this.minEndTime = this.getTime(options[kIndex]?.start_time);
  
     if(startTimeIfExists?.toString()?.split(' ')[4] < this.minEndTime?.toString()?.split(' ')[4]){
            option.get('ts_end_time').setValidators(Validators.min)
              }else{
                option.get('ts_end_time').clearValidators();
                option.get('ts_end_time').updateValueAndValidity();
    
              }
    }

  }


  setMinorMax(startTime, endTime, mealStart, mealEnd) {
    this.minMealstartTime = this.getTime(startTime);
    this.minMealEndTime = this.getTime(mealStart);
    this.minEndTime = this.getTime(mealEnd);
    // this.minMealEndTime = this.getTime(mealStart);
    // if(mealEnd >= '12:00 PM'){
    //   this.minEndTime = null;
    // }else{
    //   this.minEndTime = this.getTime(mealEnd);

    // }

    // this.minEndTime = this.getTime(mealEnd);
    // if(!mealStart){
    //   this.minMealEndTime = this.getTime(startTime);
    // }
    // if(!mealStart && !mealStart ){
    //   this.minEndTime = this.getTime(startTime);
    // }
    // if(startTime){
    //   this.minEndTime = this.getTime(startTime);
    // }
    // if(mealEnd){
    //   this.minEndTime = this.getTime(mealEnd);
    // }

  //   if (mealEnd === '12:00 PM' || endTime === '12:00 PM') {
  //     this.maxMealStartTime = null;
  //     this.maxMealEndTime = null;
  //     this.maxEndTime = null;
  //   } else {
  //     this.maxMealStartTime = this.getTime(mealEnd);
  //     this.maxMealEndTime = this.getTime(endTime);
  //     this.maxEndTime= this.getTime(startTime);
  //  }
  if (mealEnd === '12:00 PM' || endTime === '12:00 PM') {
    this.maxMealStartTime = null;
    this.maxMealEndTime = null;
    this.maxEndTime = null;
  } else {
    this.maxMealStartTime = this.getTime(mealEnd);
    this.maxMealEndTime = this.getTime(endTime);
    this.maxEndTime= this.getTime(startTime);
 }

   
  

  


  }
  dateSelection(selectedDateRange) {
    let dates = selectedDateRange?.split('-');
    this.selectedDateRangeWeek = this.getWeekNumber(moment(dates[1], Constants.dateFormat).toDate());
  }
  getWeekNumber(date) {
    let currentDate: any = new Date(date);
    let startDate: any = new Date(currentDate.getFullYear(), 0, 1);
    var days = Math.floor((currentDate - startDate) /
      (24 * 60 * 60 * 1000));

    return moment(date).isoWeek();
  }
  getCurrentWeekNumber(date) {
    let currentDate: any = new Date();
    let startDate: any = new Date(currentDate.getFullYear(), 0, 1);
    var days = Math.floor((currentDate - startDate) /
      (24 * 60 * 60 * 1000));

    return moment().isoWeek();
  }
  // getDurationBetween2Dates(startTime, endTime) {
    
  //   if(endTime==='12:00 AM (Next Day)'){
  //     this.modifiedStartDate = new Date(this.getTime(startTime)).setSeconds(0);
  //     this.modifiedEndDate = new Date(this.getLastTime(endTime)).setSeconds(0);
  //   }else{
  //     this.modifiedStartDate = new Date(this.getTime(startTime)).setSeconds(0);
  //     this.modifiedEndDate = new Date(this.getTime(endTime)).setSeconds(0);
  //   }

  //   let start: any = moment(new Date(this.modifiedStartDate), 'HH:mm am');
  //   let end: any = moment(new Date(this.modifiedEndDate), 'HH:mm am');
  //   var formateedStartTime = new Date(start).getTime() / 1000;
  //   var formateedEndTime = new Date(end).getTime() / 1000;
  //   return parseFloat(moment.duration(moment.duration(formateedEndTime - formateedStartTime, 'seconds')).asHours().toFixed(2));
    // for removing meal time from total hours 
  //   if(endTime==='12:00 AM (Next Day)'){
  //     this.modifiedStartDate = new Date(this.getTime(startTime)).setSeconds(0);
  //     this.modifiedEndDate = new Date(this.getLastTime(endTime)).setSeconds(0);
  //   }else{
  //     this.modifiedStartDate = new Date(this.getTime(startTime)).setSeconds(0);
  //     this.modifiedEndDate = new Date(this.getTime(endTime)).setSeconds(0);
  //   }
  //   let start: any = moment(new Date(this.modifiedStartDate), 'HH:mm am');
  //   let end: any = moment(new Date(this.modifiedEndDate), 'HH:mm am');
  //   var formateedStartTime = new Date(start).getTime() / 1000;
  //   var formateedEndTime = new Date(end).getTime() / 1000;
  //   let totalDuration = parseFloat(moment.duration(moment.duration(formateedEndTime - formateedStartTime, 'seconds')).asHours().toFixed(2));
  //   if (mealStartTime && mealEndTime) {
  //     let modifiedmealStart = new Date(this.getTime(mealStartTime)).setSeconds(0);
  //     let modifiedmealEnd = new Date(this.getTime(mealEndTime)).setSeconds(0);
  //     let mealStart: any = moment(new Date(modifiedmealStart), 'HH:mm am');
  //     let mealEnd: any = moment(new Date(modifiedmealEnd), 'HH:mm am');
  //     var formateedmealStart = new Date(mealStart).getTime() / 1000;
  //     var formateedmealEnd = new Date(mealEnd).getTime() / 1000;
  //   }
  //   let mealDuration = parseFloat(moment.duration(moment.duration(formateedmealStart - formateedmealEnd, 'seconds')).asHours().toFixed(2));

  //   return parseFloat(moment.duration(moment.duration(totalDuration - mealDuration, 'seconds')).asHours().toFixed(2));

  // }
  getDurationBetween2Dates(startTime, endTime, mealStartTime?, mealEndTime?) {
    let start = moment(this.getTime(startTime));
    let end = (endTime === '12:00 AM (Next Day)') ? moment(this.getLastTime(endTime)) : moment(this.getTime(endTime));
    
    let totalDuration = moment.duration(end.diff(start));
  
    // Subtract meal time if both start and end are present
    if (mealStartTime && mealEndTime) {
      let mealStart = moment(this.getTime(mealStartTime));
      let mealEnd = moment(this.getTime(mealEndTime));
      let mealDuration = moment.duration(mealEnd.diff(mealStart));
      totalDuration.subtract(mealDuration);
    }
    return parseFloat(totalDuration.asHours().toFixed(2));
  }
  updateWorkHours(time, question, questions, index, text) {
    let totalWork = 0;
    let mealHours = 0;
    let workhours = 0;
    
    setTimeout(() => {
      let data = [];
      let allMealHours = [];
      let perDayRecord = [];
      let perDayMeal = [];
      let allDaysValue: any = this.timeForm['controls'].questions;
      let allControls = allDaysValue.controls;
      
      allControls.forEach(element => {
        element.value.options.forEach(element => {
      
          if(element.project_name !== 'Timeoff' && element.project_name !== 'Holiday'){
            
            if (!isBlank(element.ts_start_time) && !isBlank(element.ts_end_time)) {
              totalWork = this.getDurationBetween2Dates(element.ts_start_time, element.ts_end_time);
              data.push(totalWork);
            }
            
            if (!isBlank(element.meal_start_time ? element.meal_start_time : '12:00 PM') && !isBlank(element.meal_end_time)) {
              // Check if meal start and meal end times are the same
              const isSameTime = element.meal_start_time === element.meal_end_time;
            
              // If meal start and meal end times are different, calculate the duration
              if (!isSameTime) {
                allMealHours.push(this.getDurationBetween2Dates(element.meal_start_time ? element.meal_start_time : '12:00 PM', element.meal_end_time));
              }
            }
            // this.timesheetEntryForm.patchValue({
      //   totalWorkingHours: allMealHours.reduce((acc, cur) => Math.round((acc + cur) * 1e12) / 1e12, 0) !== 0 ? data.reduce((acc, cur) => Math.round((acc + cur) * 1e12) / 1e12, 0) - allMealHours.reduce((acc, cur) => Math.round((acc + cur) * 1e12) / 1e12, 0) : data.reduce((acc, cur) => Math.round((acc + cur) * 1e12) / 1e12, 0)
      // });
      const totalWorkingHours = allMealHours.reduce((acc, cur) => Math.round((acc + cur) * 1e12) / 1e12, 0);
      const dataTotalHours = data.reduce((acc, cur) => Math.round((acc + cur) * 1e12) / 1e12, 0);
      const calculatedTotalHours = totalWorkingHours !== 0 ? dataTotalHours - totalWorkingHours : dataTotalHours;
      if (calculatedTotalHours >= 0) {
        this.timesheetEntryForm.patchValue({
          totalWorkingHours: calculatedTotalHours
        });
      }

          }
        });
      });

      
      
      setTimeout(() => {
        let formDate = question.get('options').value;
        
        formDate.forEach(element => {
          
          if(element.project_name != 'Timeoff' && element.project_name !== 'Holiday'){
            
            if (!isBlank(element.ts_start_time) && !isBlank(element.ts_end_time)) {
           

              totalWork = this.getDurationBetween2Dates(element.ts_start_time, element.ts_end_time);
              
              if (!isBlank(element.meal_start_time ? element.meal_start_time : '12:00 PM') && !isBlank(element.meal_end_time)) {
                perDayMeal.push(this.getDurationBetween2Dates(element.meal_start_time ? element.meal_start_time : '12:00 PM', element.meal_end_time));
              }
              
              perDayRecord.push(totalWork);
              
              if (!isNaN(totalWork)) {
                this.workTotalHours.push(parseFloat(moment.duration(moment.duration(totalWork, 'seconds')).asHours().toFixed(2)));
              } else {
                this.workTotalHours = [];
              }
            }
            
            workhours = perDayRecord.reduce((acc, cur) => Math.round((acc + cur) * 1e12) / 1e12, 0);
            mealHours = perDayMeal.reduce((acc, cur) => Math.round((acc + cur) * 1e12) / 1e12, 0);
            
          }
          let calculatedWork = workhours - mealHours;
          
            if (calculatedWork >= 0) {
              question.patchValue({
                work: calculatedWork.toFixed(2)
              });
            } else {
              // If the calculated work is negative, set it to 0
              question.patchValue({
                work: '0'
              });
            }
          
        });
      }, 100); // Add a delay of 100ms or adjust the delay as needed
    }, 100); // Add a delay of 100ms or adjust the delay as needed
  }
  
  getSum(ary) {
    return ary.reduce(function (sum, value) {
      return sum + value;
    });
  }
  getMilstone(projectId, option, superIndex, index, mileStoneList) {
    this.enableSaveButton = true
    // if(!isBlank(projectId)) {
    //   // this.mileStoneList[superIndex] = [];
    //   let data = this.mileStoneList[superIndex];
    //   data[index] = this.projectsList.find(x => x.project_id === projectId).milestones;
    //   // this.mileStoneList[superIndex] = [{'milestones':this.projectsList.find(x => x.project_id === projectId).milestones}]

    // } else {
    //   this.mileStoneList[superIndex] = [];

    // }
  }
  getMileStones(projectId) {
    return this.projectsList?.find(x => x.project_id === projectId)?.milestones;
  }
  setTimeBasedOnProject(project, option, dailyTotal, index) {

    if (project === 'Timeoff') {
      option.get('ts_start_time').setValue('');
      option.get('ts_end_time').setValue('');
      // option.get('meal_start').setValue('');
      // option.get('meal_end').setValue('');
      option.get('comments').setValue('Timeoff');

      // Gray out the input fields

    } else {
      option.get('ts_start_time').setValue('');
      option.get('ts_end_time').setValue('');
      option.get('meal_start').setValue('');
      option.get('meal_end').setValue('');
      option.get('comments').setValue('');

    }
    
  }

  
  isFirstFieldFilled(option:any):boolean {
    if(option.value.project_name==="Timeoff" || option.value.project_name !="Timeoff"){
      const firstField = option.value.ts_start_time;
      return !!firstField; 
    }
   // Check if the first field has a value
  }

  isSecondFieldFilled(option: any): boolean {
   if(option.value.project_name !== 'Timeoff'){
      const secondField = option.value.meal_start_time;
      return !!secondField; // Check if the second field (meal_start_time) has a value
    }
    // If project_name is 'Timeoff', return false by default to disable the meal_start_time field
  return false;
  }

  isMealStartTimeValid(option){
    const isValid = option.value.ts_start_time && option.value.project_name !== 'Timeoff';
    return !!isValid; 
  }

  isEndTimeValid(option){
      const isValid = option.value.ts_start_time && option.value.project_name == 'Timeoff' || option.value.ts_start_time;
      return !!isValid; 
  }
  uploadTimesheets(){
    this.uploadTimesheetsData.show()
  }
  uploadApprovedTimesheets(){
    this.uploadApprovedTimesheetsData.show()
  }
  closeInactiveForm(){
    this.uploadTimesheetsData.hide()
    this.uploaded = false;
    this.selectedFileName = ""
    this.uploadFile.reset();
  }
  closeApprovedTimesheet(){
    this.uploadApprovedTimesheetsData.hide()
    this.uploadApprovedFileDoc = false
    this.apprvedSelectedFileName = ""
    this.uploadApprovedFile.get('fileUpload').reset();
    this.uploadApprovedFile.controls['projectName'].patchValue('');
    this.uploadApprovedFile.controls['projectName'].markAsUntouched();
  }
  onFileChange(event:any){

    const file = event.target.files[0];
    this.selectedFileName = file.name;
    this.uploaded = true;
    this.uploadFile.reset();
    this.readFile(file);
  }
  onApprvoedFileChange(event:any){
    this.aprrovedTimesheets = event.target.files;
    const file = event.target.files[0];
    this.apprvedSelectedFileName = file.name
    // this.uploadApprovedFile.reset()
    this.uploadApprovedFileDoc = true
    
  }
  submitApprovedTimsheetFile(){
    const formData = new FormData();
    let startDate = this.timesheetEntryForm.get('dateRange').value?.split('-');
    let weekDates = {
      start_date: moment(moment(startDate[0].trim(), Constants.dateFormat).toDate()).format('YYYY-MM-DD'),
      end_date: moment(moment(startDate[1].trim(), Constants.dateFormat).toDate()).format('YYYY-MM-DD')
    }
    let payload ={
      'resource_id':localStorage.getItem('userId'),
      'week_start_date':weekDates.start_date,
      'week_end_date': weekDates.end_date,
      'project_id':this.uploadApprovedFile.value.projectName
    }

    formData.append('payload', JSON.stringify(payload));
   
    for (let i = 0; i < this.aprrovedTimesheets.length; i++) {
      formData.append('files', this.aprrovedTimesheets[i]);
    }

    this.httpService.doPost(StaticDataEntity.uploadApprovedTimesheets,formData).subscribe((result:any)=>{
      if(result?.message){
        this.uploadApprovedTimesheetsData.hide()
        this.uploadApprovedFileDoc = false
        this.apprvedSelectedFileName = ""
        this.uploadApprovedFile.reset();
        this.filterTimesheets();
        this.toast.showSuccess("success", "Success", result.message);      }else{
        this.toast.showError("error", "Error", result.errormessage[0].error);
      }
      
    })
  }

  readFile(file: File) {
    let submittedDate = new Date();
    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      /* grab first sheet */
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      /* save data */
      let temp
      let result = []
      this.data = <AOA>(XLSX.utils.sheet_to_json(ws, { raw: false, header: 1, }));
      // Now you can process the excelData array which contains your parsed Excel data.
      

      for(var i=7; i<this.data.length;i++){
        if(this.data[i][1] || this.data[i][2] || this.data[i][4] || this.data[i][7] || this.data[i][8]){
          if(!(this.data[i][1] || this.data[i][2] || this.data[i][4] || this.data[i][7] || this.data[i][8])){
            result = []
            this.notificationService.showErrorNotification('', 'Enter Valid time sheet ')
            break
          }else{
              temp = {
                'ts_date': this.data[i][1],
                'submited_date': moment(submittedDate).format('YYYY-MM-DD'),
                'project_name':  this.data[i][2]==='Time Off' || this.data[i][2]==='Time off' || this.data[i][2]==='Timeoff' || this.data[i][2]==='timeoff' || this.data[i][2]==='time off' ? 'Timeoff':this.data[i][2],
                'milestone_name':!isBlank(this.data[i][3]) ? this.data[i][3]: null,
                'ts_start_time':  !isBlank(this.data[i][4]) ? this.data[i][4] : null,
                'meal_start_time': !isBlank(this.data[i][5]) ? this.data[i][5]:null,
                'meal_end_time': !isBlank(this.data[i][6]) ? this.data[i][6]:null,
                'ts_end_time': !isBlank(this.data[i][7]) ? this.data[i][7] : null,
                'comments':!isBlank(this.data[i][9]) ? this.data[i][9]: null,
                'status':'Submitted'
              }
              result.push(temp)
          }
        }
      }
      let startDate = this.timesheetEntryForm.get('dateRange').value?.split('-');
      let payload = {
        // resource_id: localStorage.getItem('userId'),
        start_date: moment(moment(startDate[0].trim(), Constants.dateFormat).toDate()).format('YYYY-MM-DD'),
        end_date: moment(moment(startDate[1].trim(), Constants.dateFormat).toDate()).format('YYYY-MM-DD')
      }

      this.output = {
        'timesheets': result,
        'employee_id': this.data[0][1],
        'week_start_date':payload.start_date,
        'week_end_date':payload.end_date
      }

    };
    reader.readAsBinaryString(file);
  }

  getDatesBetween(startDate,endDate){
    const dates = [];
    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);
    lastDate.setDate(lastDate.getDate() + 1);
    while (currentDate <= lastDate) {
      
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }  
    return dates;
  }

  hideAcceptanceModal(){
    this.uploadAcceptanceModal.hide()
  }
  
  submitTimsheetFile(){

    if(this.output.timesheets.length>0 && this.output.employee_id !=undefined){
      let count = 0 ;
      let projects = []

      this.httpService.doPost(StaticDataEntity.uploadTimeheetsCheck,this.output).subscribe((result:any)=>{
        if(result?.message){
          this.uploadTimesheetsData.hide()
          this.uploadAcceptanceModal.show();
          this.uploaded = false;
          this.selectedFileName = ""
          this.filterTimesheets()
        }else{
          this.toast.showError("error", "Error", result.errormessage[0].error);
        }
      })
    }else{
      this.toast.showError("error", "Error", 'Please Upload Valid Timesheets');
    }
    
  }

  submitUploadTimesheetAPI(){
    this.httpService.doPost(StaticDataEntity.uploadTimeheets,this.output).subscribe((result:any)=>{
      if(result?.message){
        this.filterTimesheets()
        this.toast.showSuccess("success", "Success", result.message);
        this.uploadAcceptanceModal.hide();
      }
    })
  }
}
