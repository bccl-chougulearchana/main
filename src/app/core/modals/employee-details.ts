export interface EmployeeDetailsModel {
    birthdate: string
    companyCode: string
    firstName: string
    activityName: string
    timescapeUserOID: string
    activityCode: string
    deptGroupName: string
    payId: string
    surname: string
    locationName: string
    joiningdate: string
    locationCode: string
    signOnStatus: string
    sapNumber: string
    gender: string
    userType: string
    panNumber: string
    deptGroup: string
    portalId: string
    branchName: string
    emailId: string
    branchCode: string
    pfNumber: string
    designation: string
    payrollType: string
    empFullName: string
    companyName: string
    title: string
    fullName: string
}

// ------------------------------------------------------------------------

// ------------------------ HOSPITALIZATION ------------------------

export interface HospitalizationReqModel {
    memberId: string;
    hospitalname: string;
    patientName: string;
    phoneNumber: string;
    reason: string;
    dateofadmission: string;
    recipientsMailId: string;
}

// ------------------------ HOSPITALIZATION ------------------------

// ------------------------------------------------------------------------

// ------------------------ TIMES SOCIETY ACCOUNT ------------------------

export interface MumbaiAssoSavingAccReqModel {
    fromDate: string;
    toDate: string;
    tempSapNo: string;
}
export interface DelhiAssoStateMAccReqModel {
    fromDate: string;
    toDate: string;
}

// ------------------------ TIMES SOCIETY ACCOUNT ------------------------

// ------------------------------------------------------------------------

// ------------------------ OCA ------------------------

export interface ViewPoliciesReqModel {
    frequency: string;
    role: string;
    status: string;
    date: string;
}

export interface OcaQuestionItem {
    id: number;
    fileBase64: string;   // uploaded file
    showUpload: boolean;
    showDownload: boolean;
    showDelete: boolean;
}


export interface FrequencyIconState {
  compliant: boolean;
  nonCompliant: boolean;
  takeAction: boolean;
  notActed: boolean;
  reviewed: boolean;
}

export interface FrequencyItem {
  value: any;
  icons: FrequencyIconState;
}

// ------------------------ OCA ------------------------

// ------------------------------------------------------------------------
