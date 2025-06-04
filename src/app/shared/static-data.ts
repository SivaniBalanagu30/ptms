export class StaticDataEntity {

    static readonly login = 'login';
    static readonly allResources = 'allResourcesByStatus'; 
    static readonly allProjects = 'allProjects'; 
    static readonly myActiveProjects = 'myActiveProjects';
    static readonly clientsList = 'allClientsDropDown'; 
    static readonly allContractors = 'allContactors';
    static readonly getResourceByID = 'resourceById/{id}';
    static readonly getClientByID = 'clientById/{id}';
    static readonly getContractorByID = 'contactorById/{id}';
    static readonly getProjectsByID = 'projectById/{id}';
    static readonly addContractor = 'addContractor';
    static readonly addClient = 'addClient';
    static readonly addProject = 'addProject';
    static readonly getallResources = 'allResourceForDropdowns';
    static readonly updateContractor = 'updateContractorDetails';
    static readonly updateClient = 'updateClientDetails';
    static readonly updateProject = 'updateProject';
    static readonly updateMilestone = 'updateMilestone';
    static readonly updateProjectResource = 'UpdateProjectResource';
    static readonly getResourcesForProject = 'projectresourceDropDown/{id}';
    static readonly assignResource = 'assignProject';
    static readonly addMilestone = 'addMilestone';
    static readonly myProjectsList = 'allMyProjects';
    static readonly myTimesheets = 'myTimesheets';
    static readonly viewMytimesheet = 'timesheetsByDateRange';
    static readonly viewResourceTimesheet = 'timesheetsByProject';
    static readonly saveTimesheets = 'saveTimesheets';
    static readonly deleteTimesheets = 'delete_ts/{id}';
    static readonly searchResource = 'searchResource';
    static readonly approverList = 'approverTimesheets';
    static readonly projectList = 'allApproverProjectsDropDown';
    static readonly adminApprovalTimesheets = 'adminApproveTimesheets';
    static readonly resourceList = 'allApproverResourcesDropDown';
    static readonly projectByResource = 'approverProjectResourcesDropDown/{id}';
    static readonly  approveOrReject = 'approveRejectTimesheets ';
    static readonly timesheetsEntryFilter = 'timesheetsEntryFilter';
    static readonly projectWorkHours = 'projectWorkHours/{id}';
    static readonly uploadTimeheets = 'uploadTimesheets';
    static readonly uploadTimeheetsCheck = 'uploadTimesheetsCheck';
    static readonly uploadApprovedTimesheets = 'uploadSignedDocument';
    static readonly clientApprovedTimesheet = "getApprovedDocument";

    static readonly AdminProjectList = 'allAdminProjectsDropDown';
    static readonly AdminResourceList = 'allAdminResourcesDropDown';
    static readonly getRole = 'adminTimeApproverCheck';
    static readonly myTimesheetView = 'myTimeSheetsView';
    static readonly timeZones = 'timezonesDropdown';

    
    
}






export class RegExpPatterns {
    static emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    static numberPattern = '^[0-9]*$';
    static passwordPattern = /(?=.{8,})(?=.*?[^\w\s])(?=.*?[0-9])(?=.*?[A-Z]).*?[a-z].*/;
    static ssnPattern = /^[0-9]{9}$/;
    static mobilePattern = '^\\(?([0-9]{3})\\)?-?([0-9]{3})-?([0-9]{4})$';
    static employeeNumberPattern = /^[a-zA-Z0-9]{9}$/;
    // static usphonenumber = /^(\+?1[-.\s]?)?(\()?\d{3}(\))?[-.\s]?\d{3}[-.\s]?\d{4}$/;
    // static usphonenumber =   /^\(\d{3}\)\s\d{3}-\d{4}(\sx\w{1,5})?$/;
    static usphonenumber = /^(?:\d{10}|\(\d{3}\)-?\s?\d{3}-\d{4})$/;
}
export class Constants {
    static dateFormat = 'dddd MMMM Do, YYYY';
    static dateShortFormat = 'ddd MMM Do, YYYY';

}
export class StringResourceErrors {
    public FIELD_REQUIRED = "Field Required";
    public EMAIL_VALIDATION = "Enter Proper Email Pattern";
    //REGISTRATION FORM 
    // public ORGANIZATION_MIN_LENGTH = "Organization Name Atleast 2 Characters";
    public FIRST_NAME_VALIDATIONS1="First name allows alphabets only";
    public MIDDLE_NAME="Company Code Allows Alphabet and Numeric";
    public LAST_NAME="Company Code Allows Alphabet and Numeric";
    public PHONE_NUMBER_VALLIDATIONS1="Phone number should be digits only";
    public PHONE_NUMBER_VALIDATIONS2="Phone number should be  between 10 to 15 digits";
    public ZIPCODE_VALIDATIONS1="Zip code should be digits only";
    public ZIPCODE_VALIDATIONS2="Zip code should be between 5 to 6 digits";
    public ORGANIZATION_MAX_LENGTH ="Organization Name MAX length 150 Characters";
    public COMPANY_CODE_VALIDATION_PATTERN2="Enter Atleast 2 Characters";
    public COMPANY_CODE_VALIDATION_PATTERN3="Company Code Should Not Greater Than 20 Characters";
    public URL_VALIDATION_PATTERN1="URL Should be Alphabets Only";
    public URL_VALIDATION_PATTERN2="URL Should Not Greater Than 25 Characters";
    public PASSWORD_VALIDATION_PATTERN1="Use 8 or more characters with a mix of uppercase and lowercase letters, numbers & symbols";
    //public PASSWORD_VALIDATION_PATTERN2="Password Contain Atleast 8 Characters";
    public PASSWORD_VALIDATION_PATTERN3="Password Should be Maximum 15 Characters long";
    public PASSWORD_MISMATCH="New Password and Confirm Password must match";
    public GST_VALIDATION="Invalid GST Number";
    public COUNTY_REQUIRED="Field Required";
    public STATE_REQUIRED="Field Required";
    public CITY_NAME_VALIDATIONS="Give a Proper City Name";
    public ZIPCODE_VALIDATIONS3="Zip Code Should be Exactly 6 Digits";
    public MAXLENGTH="Line1 Should Not be Greater than 250 Characters long"
    public NAME= "Maximum Length is 75 Characters";
    //task creation form
    public TASK_PATTERN1 ="Name Must be Alphabetic Only";
   
  }