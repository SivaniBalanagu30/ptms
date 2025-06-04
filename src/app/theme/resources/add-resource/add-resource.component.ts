import { Component, HostListener, OnInit } from '@angular/core';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpService } from 'src/app/services/http-service/http.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { RegExpPatterns, StaticDataEntity } from 'src/app/shared/static-data';
import { isBlank, validateAllFormFields } from 'src/app/shared/utils/utils';
import { StringResourceErrors } from 'src/app/shared/static-data';
import { ToastService } from 'src/app/services/toast.service';
import { PageReloadService } from 'src/app/services/auto-reload/page-reload.service';
export interface Project{
  item_text:String,
  item_id:String
}
export interface ProjectsPayload{
  project_id:String,
  work_hour_limit:Number
}
@Component({
  selector: 'app-add-resource',
  templateUrl: './add-resource.component.html',
  styleUrls: ['./add-resource.component.css'],
})
export class AddResourceComponent implements OnInit {
  projects: Project[] = [];
  selectedProjects: any[] = [];
  dropdownSettings: IDropdownSettings = {};
  allTimezones:any[] = [];
  // selectedEmploymentType:string = "Contract";
  availableProjects: any[] = [];
  employmentTypes: {}[] = [];
  allRoles: any[] = [];
  allProjects: any[] = [];
  allClients: any[] = [];
  allManagers: any[] = [];
  allContractors: any[] = [];
  selectedProjectsPayload: ProjectsPayload[] = [];
  // mergedArray: any[];
  public addResourceForm: FormGroup = new FormGroup({
    // Initialize form controls here
  });
  selectedEmploymentId: any;
  employmentType: number = 0;
  public _stringResourceErrors: StringResourceErrors =
    new StringResourceErrors();
  constructor(
    private inactivityService: PageReloadService,
    private fb: FormBuilder,
    private http: HttpService,
    private notification: NotificationService,
    private router: Router,
    private piper: DatePipe,
    private toast: ToastService
  ) {
    this.createResourceForm();
  }
  createResourceForm() {
    this.addResourceForm = this.fb.group(
      {
        firstName: new FormControl('', Validators.required),
        middleName: new FormControl(''),
        lastName: new FormControl('', Validators.required),
        email: new FormControl('', [
          Validators.required,
          Validators.pattern(RegExpPatterns.emailPattern),
        ]),
        phoneNumber: new FormControl('', [Validators.required]),
        addressLine1: new FormControl('', Validators.required),
        addressLine2: new FormControl(''),
        city: new FormControl('', Validators.required),
        state: new FormControl('', Validators.required),
        country: new FormControl('', Validators.required),
        zipCode: new FormControl('', Validators.required),
        employmentType: new FormControl('', Validators.required),
        contractingFirmName: new FormControl(''),
        resourceId: new FormControl('', Validators.required),
        startDate: new FormControl(''),
        signedNDA: new FormControl(''),
        signedSecurityPolicy: new FormControl(''),
        subcontractAgreementExecuted: new FormControl(''),
        reportingManager: new FormControl('', Validators.required),
        role: new FormControl('', Validators.required),
        timeZone: new FormControl('', Validators.required),
        endDate: new FormControl(''),
        sickDays: new FormControl(null),
        hourlyPayRate: new FormControl(null, Validators.required),
        vacationDays: new FormControl(null),
        location: new FormControl(''),
        clients: new FormControl(''),
        project: new FormControl([], Validators.required),
        weeklyWorkHoursLimit: this.fb.array([
          // this.fb.control('')
        ]),
        projectAssignedDate: this.fb.array([
          // this.fb.control('')
        ]),
        uploadTimesheet: new FormControl('no', Validators.required)
      },
      {
        validators: [
          Validators.required,
          this.validateContractingFirmName(
            'employmentType',
            'contractingFirmName'
          ),
        ],
      }
    );
  }
  validateContractingFirmName(employmentType, contractingFirmName) {
    return (group: FormGroup) => {
      const employType = group.controls[employmentType];
      const firm = group.controls[contractingFirmName];
      if (employType.value == 3) {
        if (!firm.value) {
          return firm.setErrors({ required: true });
        } else {
          return firm.setErrors(null);
        }
      }
      if (employType.value == 2 || employType.value === 1) {
        return firm.setErrors(null);
      }
    };
  }
  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:keydown', ['$event'])

  onUserActivity(event: Event) {
    this.inactivityService.resetInactivityTimer();
  }
  ngOnInit(): void {
    this.inactivityService.startInactivityTimer();
    this.getEmploymentTypes();
    this.getAllRoles();
    this.getAllProjects();
    this.getAllClients();
    this.getAllManagers();
    this.getAllContractors();
    this.getAllTimezones();
    // this.addResourceForm.get('employmentType')?.setValue('Contract');
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      itemsShowLimit: 6,
      allowSearchFilter: true,
      enableCheckAll: false,
    };
    // this.mergedArray = this.weeklyWorkHoursLimit.controls.map((control, index) => {
    //   return {
    //     ...control.value,
    //     ...this.selectedProjects[index]
    //   };
    // });
    this.addResourceForm.controls['vacationDays']?.setValue(null);
  }
  stopManualEntry(event: KeyboardEvent) {
    const key = event.key;
    if (key === 'Backspace' || key === 'Delete') {
    } else {
      event.preventDefault();
    }
  }
  minEndDate(date) {
    return new Date(date);
  }
  getEmploymentTypes() {
    this.http.doGet('AllEmploymentTypes').subscribe((data: any) => {
      this.employmentTypes = data;
    });
  }
  getAllTimezones(){
    this.http.doGet(StaticDataEntity.timeZones).subscribe((zones)=>{
      this.allTimezones = zones;
    })
  }
  getAllRoles() {
    this.http.doGet('allRoles').subscribe((data) => {
      this.allRoles = data;
    });
  }
  getAllProjects() {
    return new Promise<void>((resolve, reject) => {
      this.http.doGet('allProjectsDropDown').subscribe(
        (data: any) => {
          this.availableProjects = data;
          this.projects = this.availableProjects.map((project: any) => ({
            item_id: project.id,
            item_text: project.project_name,
          }));
          resolve(); // Resolve the Promise when data is populated
        },
        (error) => {
          reject(error); // Reject the Promise if an error occurs
        }
      );
    });
  }
  getAllClients() {
    this.http.doGet('allClientsDropDown').subscribe((data) => {
      this.allClients = data;
    });
  }
  getAllManagers() {
    this.http.doGet('allManagers').subscribe((data) => {
      this.allManagers = data;
    });
  }
  getAllClientProjects(clientId) {
    this.http.doGet(`ClientProjectsDropDown/${clientId}`).subscribe((data) => {
      this.availableProjects = data;
      this.projects = this.availableProjects.map((project: any) => ({
        item_id: project.id,
        item_text: project.project_name,
      }));
    });
  }
  getAllContractors() {
    this.http.doGet('allContactorsDropDown').subscribe((data) => {
      this.allContractors = data;
    });
  }
  resetEmploymentTypeForm() {
    this.addResourceForm.controls['reportingManager'].markAsUntouched();
    this.addResourceForm.controls['contractingFirmName'].markAsUntouched();
    this.addResourceForm.controls['startDate'].markAsUntouched();
    this.addResourceForm.controls['signedNDA'].markAsUntouched();
    this.addResourceForm.controls['signedSecurityPolicy'].markAsUntouched();
    this.addResourceForm.controls[
      'subcontractAgreementExecuted'
    ].markAsUntouched();
    this.addResourceForm.controls['location'].markAsUntouched();
    this.addResourceForm.controls['endDate'].markAsUntouched();
    this.addResourceForm.controls['vacationDays'].markAsUntouched();
    this.addResourceForm.controls['sickDays'].markAsUntouched();
    this.addResourceForm.controls['hourlyPayRate'].markAsUntouched();
    this.addResourceForm.patchValue({
      reportingManager: '',
      contractingFirmName: '',
      startDate: '',
      signedNDA: '',
      signedSecurityPolicy: '',
      subcontractAgreementExecuted: '',
      location: '',
      endDate: '',
      vacationDays: '',
      sickDays: '',
      hourlyPayRate: '',
    });
  }
  onChangeEmploymentType(employmentTypeId) {
    this.employmentType = employmentTypeId;
    this.resetEmploymentTypeForm();
    this.http.doGet(`resourceId/${employmentTypeId}`).subscribe((data) => {
      this.addResourceForm.get('resourceId').setValue(data.resource_id);
    });
  }
  projectAssignStartandEndDate(date){
    if (!isBlank(date)) {
      return new Date(date);
    } else {
      return null;
    }
  }
  onSelectClient(clientName) {
    let clientId = '';
    this.allClients.forEach((client) => {
      if (clientName == client.client_name) {
        clientId = client.id;
      }
    });
    this.getAllClientProjects(clientId);
  }
  onItemSelect(item: any) {
    const selectedProject = this.availableProjects.find((element) => {
      return item.item_text == element.project_name;
    });
    this.selectedProjects.push(selectedProject);
    this.weeklyWorkHoursLimit.push(this.fb.control('', Validators.required));
    this.projectAssignedDate.push(this.fb.control('', Validators.required));
  }
  onItemDeSelect(unselectItem: any) {
    const index = this.selectedProjects.findIndex((item) => {
      return item.project_name == unselectItem.item_text;
    });
    const remainigProjects = this.selectedProjects.splice(index, 1);
    const control = <FormArray>(
      this.addResourceForm.controls['weeklyWorkHoursLimit']
    );
    control.removeAt(index);
    const projectAssignedDateControl = <FormArray>(
      this.addResourceForm.controls['projectAssignedDate']
    );
    projectAssignedDateControl.removeAt(index);
  }
  newEndDate(date) {
    return new Date(date);
  }
  onSubmit() {
    if (this.addResourceForm.valid) {
      const hoursLimit =
        this.addResourceForm.controls.weeklyWorkHoursLimit.value;
      const projectAssignedDate =
        this.addResourceForm.controls.projectAssignedDate.value;
      this.selectedProjectsPayload = [];
      for (let i = 0; i < this.selectedProjects.length; i++) {
        const project = this.selectedProjects[i];
        const hour = hoursLimit[i];
        const assignedDate = projectAssignedDate[i];
        const sample = {
          project_id: project.id,
          work_hour_limit: Number(hour),
          project_name: project.project_name,
          project_assigned_date: this.piper.transform(
            assignedDate,
            'yyyy-MM-dd'
          ),
        };
        this.selectedProjectsPayload.push(sample);
      }
      let contractorPayload = {
        first_name: this.addResourceForm.get('firstName')?.value,
        middle_name: this.addResourceForm.get('middleName')?.value,
        last_name: this.addResourceForm.get('lastName')?.value,
        email: this.addResourceForm.get('email')?.value,
        resource_number: this.addResourceForm.get('resourceId')?.value,
        phone_number: this.addResourceForm.get('phoneNumber')?.value,
        addressline1: this.addResourceForm.get('addressLine1')?.value,
        addressline2: this.addResourceForm.get('addressLine12')?.value,
        city: this.addResourceForm.get('city')?.value,
        state: this.addResourceForm.get('state')?.value,
        zipcode: this.addResourceForm.get('zipCode')?.value,
        country: this.addResourceForm.get('country')?.value,
        upload_signed_timesheet:this.addResourceForm.get('uploadTimesheet')?.value == 'yes' ? true : false,
        employement_type: Number(
          this.addResourceForm.get('employmentType')?.value
        ),
        reporting_manager_id:
          this.addResourceForm.get('reportingManager')?.value,
        signed_nda:
          this.addResourceForm.get('signedNDA')?.value == 'Yes' ? true : false,
        signed_security_policy:
          this.addResourceForm.get('signedSecurityPolicy')?.value == 'Yes'
            ? true
            : false,
        start_date: this.piper.transform(
          this.addResourceForm.get('startDate')?.value,
          'yyyy-MM-dd'
        ),
        contracting_firm_id: Number(
          this.addResourceForm.get('contractingFirmName')?.value
        ),
        subcontracting_agreement_executed:
          this.addResourceForm.get('subcontractAgreementExecuted')?.value ==
          'Yes'
            ? true
            : false,
        role_id: Number(this.addResourceForm.get('role')?.value),
        "timezone":Number(this.addResourceForm.get('timeZone')?.value),
        projects: this.selectedProjectsPayload,
        hourly_pay_rate: this.addResourceForm.get('hourlyPayRate')?.value,
      };
      let salaryORw2payload = {
        first_name: this.addResourceForm.get('firstName')?.value,
        middle_name: this.addResourceForm.get('middleName')?.value,
        last_name: this.addResourceForm.get('lastName')?.value,
        email: this.addResourceForm.get('email')?.value,
        resource_number: this.addResourceForm.get('resourceId')?.value,
        phone_number: this.addResourceForm.get('phoneNumber')?.value,
        addressline1: this.addResourceForm.get('addressLine1')?.value,
        addressline2: this.addResourceForm.get('addressLine12')?.value,
        city: this.addResourceForm.get('city')?.value,
        state: this.addResourceForm.get('state')?.value,
        zipcode: this.addResourceForm.get('zipCode')?.value,
        country: this.addResourceForm.get('country')?.value,
        upload_signed_timesheet:this.addResourceForm.get('uploadTimesheet')?.value == 'yes' ? true : false,
        employement_type: Number(
          this.addResourceForm.get('employmentType')?.value
        ),
        reporting_manager_id:
          this.addResourceForm.get('reportingManager')?.value,
        location: this.addResourceForm.get('location')?.value,
        signed_nda:
          this.addResourceForm.get('signedNDA')?.value == 'Yes' ? true : false,
        signed_security_policy:
          this.addResourceForm.get('signedSecurityPolicy')?.value == 'Yes'
            ? true
            : false,
        start_date: this.piper.transform(
          this.addResourceForm.get('startDate')?.value,
          'yyyy-MM-dd'
        ),
        end_date: this.piper.transform(
          this.addResourceForm.get('endDate')?.value,
          'yyyy-MM-dd'
        ),
        sick_days:
          this.addResourceForm.get('sickDays')?.value == ''
            ? null
            : this.addResourceForm.get('sickDays')?.value,
        vacation_days:
          this.addResourceForm.get('vacationDays')?.value == ''
            ? null
            : this.addResourceForm.get('vacationDays')?.value,
        role_id: Number(this.addResourceForm.get('role')?.value),
        "timezone":Number(this.addResourceForm.get('timeZone')?.value),
        projects: this.selectedProjectsPayload,
        hourly_pay_rate: this.addResourceForm.get('hourlyPayRate')?.value,
      };
      let addResourcePayload =
        this.addResourceForm.get('employmentType')?.value == 3
          ? contractorPayload
          : salaryORw2payload;
      this.http.doPost('addEmployee', addResourcePayload).subscribe(
        (data) => {
          if (data.message) {
            // this.notification.showSucessNotification('Success', data.message);
            this.toast.showSuccess("success","Success",data.message);
            this.router.navigate(['/resources-list']);
          } else if (data.errorMessage) {
            // this.notification.showErrorNotification('Error', data.errorMessage);
            this.toast.showError("error", "Error", data.errorMessage);
          }
        },
        (error) => {
          if (error.status === 400) {
            // this.notification.showWarningNotification(
            //   'Error',
            //   error.error.detail
            // );
            this.toast.showWarning("warn", "Warning", error.error.detail);
          }
        }
      );
    } else {
      validateAllFormFields(this.addResourceForm);
    }
  }
  get weeklyWorkHoursLimit() {
    return this.addResourceForm.get('weeklyWorkHoursLimit') as FormArray;
  }
  get projectAssignedDate() {
    return this.addResourceForm.get('projectAssignedDate') as FormArray;
  }

  getProjectAssignedDateControl(index: number) {
    return this.projectAssignedDate.at(index) as FormControl;
  }
  getWeeklyWorkHoursLimitControl(index: number) {
    return this.weeklyWorkHoursLimit.at(index) as FormControl;
  }

  onCancel(){
    this.addResourceForm.reset();
    this.addResourceForm.get('role').patchValue("");
    this.addResourceForm.get('timeZone').patchValue("");
    this.addResourceForm.get('employmentType').patchValue("");
    this.addResourceForm.get('clients').patchValue("");
    this.selectedProjects = [];
    this.getAllProjects();
  }

}
