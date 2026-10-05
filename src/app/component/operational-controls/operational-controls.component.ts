import { Component, OnDestroy, OnInit } from '@angular/core';
import { DynamicColDirective, DynamicGridDirective, LibLabelTextDirective , PopupDirective, RequiredDirective, SelectDirective, TabDirective, TabsDirective, TextareaDirective } from 'toi-libraries';
import { SharedApiService } from '../../shared/shared-services/shared-api.service';
import { count, forkJoin, map, Subject, takeUntil, tap } from 'rxjs';
import { LoaderService } from '../../shared/shared-services/loader.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FrequencyIconState, FrequencyItem, ViewPoliciesReqModel } from '../../core/modals/employee-details';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { OCAService } from '../../services/oca/oca.service';
import { CommonService } from '../../core/services/common.service';

interface DashboardBar {
  freq: string;
  code: string;
  value: number;
  date1: string;
  date2: string;
}

interface EnsureUserSummary {
  name: string;
  rows: any[];
  icons: FrequencyIconState;
  selected: boolean;
  canBulkReview: boolean;
}

interface EnsureFrequencyState extends FrequencyItem {
  selected: boolean;
  canBulkReview: boolean;
  rows: any[];
}

@Component({
  selector: 'app-operational-controls',
  standalone: true,
  imports: [DynamicGridDirective, TabDirective, TabsDirective, DynamicColDirective, CommonModule, TextareaDirective, PopupDirective, ReactiveFormsModule, FormsModule, LibLabelTextDirective, SelectDirective],
  templateUrl: './operational-controls.component.html',
  styleUrl: './operational-controls.component.scss',
  providers: [DatePipe],
})
export class OperationalControlsComponent implements OnInit, OnDestroy {

  destroy$ = new Subject<void>();
  complianceForm!: FormGroup;
  ensureComplianceForm!: FormGroup;
  activeTab = 'DASHBOARD';
  activeFreq!: ViewPoliciesReqModel['frequency'];
  ensureActiveFreq!: ViewPoliciesReqModel['frequency'];
  detailsByDate = false;
  ensureView: 'frequency' | 'users' | 'detail' = 'frequency';

  mycompfreqList: any[] = [];
  mycompfreqListWithIcons: FrequencyItem[] = [];
  ensureFreqList: any[] = [];
  ensureFreqListWithIcons: EnsureFrequencyState[] = [];
  viewpoliciesList: any[] = [];
  allowedExtensions: string[] = ['.png', '.pdf', '.jpg', '.jpeg'];
  showPopup = false;
  showInfo = false;
  eurekafileSuccessMsg = false;
  eurekafileErrorMsg = false;
  groupedQuestions: any[] = [];
  ensureGroupedQuestions: any[] = [];
  queryDateStr = '';
  ocaHeadTextDate = '';
  ensureHeadTextDate = '';
  showDashboardTab = false;
  ensureComplTab = false;
  apiLoaded = false;

  dashboardBars: any[] = [];

  dailyqueryDate!: string | undefined;
  weeklyqueryDate!: string | undefined;
  fortqueryDate!: string | undefined;
  monthlyqueryDate!: string | undefined;
  quarterlyqueryDate!: string | undefined;
  halfyearlyqueryDate!: string | undefined;
  annuallyqueryDate!: string | undefined;

  dailyDisplay: string | undefined = '';
  weekDisplay: string = '';
  fortDisplay: string = '';
  monthDisplay: string = '';
  quarterDisplay: string = '';
  halfyearDisplay: string = '';
  annualDisplay: string = '';

  submitdataarray: any[] = [];
  submitteddataarray: any[] = [];
  selectedCompany: any;
  selectedDepartment: any;
  selectedFunction: any;
  isShowDept = false;
  isShowFunc = false;
  showALLoption = false;
  dailyValue = 0;
  weeklyValue = 0;
  fortnightlyValue = 0;
  monthlyValue = 0;
  quarterlyValue = 0;
  halfyearlyValue = 0;
  annuallyValue = 0;
  dailyDateText = '';
  dailyDateText2 = '';
  WeekDateText = '';
  WeekDateText2 = '';
  FortNightDateText = '';
  FortNightDateText2 = '';
  MonthDateText = '';
  MonthDateText2 = '';
  QuarterDateText = '';
  QuarterDateText2 = '';
  HalfYearlyDateText = '';
  HalfYearlyDateText2 = '';
  AnnuallyDateText = '';
  AnnuallyDateText2 = '';
  functionOptions = [
    { label: 'IT', id: 'IT' },
    { label: 'Response', id: 'Response' }
  ];
  departmentOptions = [
    { label: 'IT', id: 'IT' },
    { label: 'Response', id: 'Response' }
  ];
  companyOptions = [
    { label: 'BCCL', id: 'BCCL' },
    { label: 'TEEL', id: 'TEEL' }
  ];
  ensureUsers: EnsureUserSummary[] = [];
  selectedEnsureUserName = '';

  private readonly pendingAnswers = new Set(['', '-', 'Not Acted', 'NA']);

constructor( private sharedApiService: SharedApiService, private loader: LoaderService, private ocaService : OCAService,
  private fb: FormBuilder, private datePipe: DatePipe, private commonService: CommonService) { }

ngOnInit(): void {
  this.complianceForm = this.fb.group({
    questions: this.fb.array([])
  });
  this.ensureComplianceForm = this.fb.group({
    questions: this.fb.array([])
  });
  this.getlistRoles();
  this.getCompanyList();
  
  if( this.ensureComplTab == true){
    this.activeTab = 'ENSURE COMPLIANCE';
  } else {
    this.activeTab = 'MY COMPLIANCE';
  }
  if(this.activeTab   === 'MY COMPLIANCE'){this.loadFrequencies();} 
  
  setTimeout(() => {
     this.apiLoaded = true;
  }, 800);
  
}

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}

onTabChange(event: Event | string) {
  if (event === 'MY COMPLIANCE') {
    this.detailsByDate = false;
    this.loadFrequencies();
    return;
  }

  if (event === 'ENSURE COMPLIANCE') {
    this.ensureView = 'frequency';
    this.loadEnsureFrequencies();
  }
}

get questionsFA(): FormArray {
  return this.complianceForm.get('questions') as FormArray;
}

get ensureQuestionsFA(): FormArray {
  return this.ensureComplianceForm.get('questions') as FormArray;
}

openPopup() {this.showPopup = true;}
closePopup() {this.showPopup = false;}
openInfo() { this.showInfo = true;}
closeInfo() { this.showInfo = false;}

getlistRoles() {
  this.ocaService.getlistRolesDetails().pipe(takeUntil(this.destroy$)).subscribe({
    next: (result : any) => {
      console.log(result[0].data[0][0]);
      if(result[0].data[0][0] == "2"){
        this.ensureComplTab = true;
        
      }
      else{
        this.ensureComplTab = false;
      }
    },
    error: () => {
      console.log("error");
      }
  });
}

// getCompanyList() {
// this.ocaService.getCompanyListDetails().pipe(takeUntil(this.destroy$)).subscribe({
//     next: (result : any) => {
//       if(result[0].data.length>0){
//         this.showDashboardTab = true;
//           var dataarray: Array<any> = [];
//         dataarray = result[0].data;
        
//       }
//       else{
//         this.showDashboardTab = false;
//       }
//       this.apiLoaded = true;
//     },
//     error: () => {
//         this.loader.hide();
//         this.showDashboardTab = false;
//       }
//   });
// }
getCompanyList() {
  this.ocaService.getCompanyListDetails()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (result: any) => {
        const data = result?.[0]?.data || [];

        if (data.length > 0) {
          this.showDashboardTab = true;
          this.companyOptions = data.map((item: any) => ({
            label: item[0],
            id: item[1]
          }));
          const preferredCompany = this.companyOptions.find((item: any) => item.id == 1000);
          this.selectedCompany = preferredCompany?.id ?? this.companyOptions[0]?.id;
          this.setDepartment(this.selectedCompany);
        } else {
          this.showDashboardTab = false;
        }
        
      },
      error: () => {
        this.showDashboardTab = false;
      }
    });
}
setDepartment(companyCode: any) {
  this.selectedCompany = companyCode;

  if (companyCode == 1000) {
    this.isShowDept = true;
    this.isShowFunc = true;

    this.ocaService.setDepartmentList(companyCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: any) => {
        const data = result?.[0]?.data || [];

        this.departmentOptions = data.map((item: any) => ({
          label: item[1],
          id: item[0]
        }));

        if (this.departmentOptions.length > 0) {
          this.selectedDepartment = this.departmentOptions[0].id;
          this.setFunctions(this.selectedDepartment);
        } else {
          this.selectedDepartment = '-';
          this.functionOptions = [];
          this.selectedFunction = '-';
        }
      });
  } else {
    this.isShowDept = false;
    this.isShowFunc = false;
    this.departmentOptions = [];
    this.functionOptions = [];
    this.selectedDepartment = '-';
    this.selectedFunction = '-';
    this.getFrequencywiseDate();
  }
}
setFunctions(deptCode: any) {
  this.selectedDepartment = deptCode;
  this.functionOptions = [];
  this.showALLoption = false;

  this.ocaService.setFunctionList(this.selectedCompany, deptCode)
    .pipe(takeUntil(this.destroy$))
    .subscribe((result: any) => {
      const data = result?.[0]?.data || [];

      this.functionOptions = data.map((item: any) => ({
        label: item,
        id: item
      }));

      if (this.functionOptions.length > 1) {
        this.showALLoption = true;
        this.functionOptions.unshift({
          label: 'ALL',
          id: 'ALL'
        });
        this.selectedFunction = 'ALL';
      } else if (this.functionOptions.length === 1) {
        this.selectedFunction = this.functionOptions[0]?.id;
      } else {
        this.selectedFunction = '-';
      }
      this.getFrequencywiseDate();
    });
}

changeFunction(functionCode: any) {
  this.selectedFunction = functionCode;
  this.setsubmitteddata();
}

getFrequencywiseDate() {

  const currentDate = new Date();
  const day = currentDate.getDate();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

  /* ---------------- DAILY ---------------- */

  const yesterday = new Date(currentDate);
  yesterday.setDate(yesterday.getDate() - 1);

  this.dailyqueryDate =
    this.datePipe.transform(yesterday,'dd-MMM-yyyy')?.toUpperCase();
  this.dailyDateText = this.dailyqueryDate ?? '';
  this.dailyDateText2 = '';


  /* ---------------- WEEKLY ---------------- */

  const currentDay = currentDate.getDay();
  let lastFriday: Date;

  if (currentDay < 5) {

    const t2 = currentDate.getDate() + (-currentDay) - 7;
    lastFriday = new Date(currentDate);
    lastFriday.setDate(t2 - 2);

  } else {

    const z = currentDate.getDate() + (6 - currentDay - 1) - 7;
    lastFriday = new Date(currentDate);
    lastFriday.setDate(z);

  }

  this.weeklyqueryDate = this.datePipe.transform(lastFriday,'dd-MMM-yyyy')?.toUpperCase();

  const monday = new Date(lastFriday);
  monday.setDate(monday.getDate() - 4);

  const sunday = new Date(lastFriday);
  sunday.setDate(sunday.getDate() + 2);

  const weekStart = this.datePipe.transform(monday,'dd-MMM-yyyy')?.toUpperCase() ?? '';
  const weekEnd = this.datePipe.transform(sunday,'dd-MMM-yyyy')?.toUpperCase() ?? '';
  this.WeekDateText = `${weekStart} - `;
  this.WeekDateText2 = weekEnd;


  /* ---------------- FORTNIGHT ---------------- */

  const prevMonthIndex =
    currentDate.getMonth() - 1 < 0 ? 11 : currentDate.getMonth() - 1;

  const prevYear =
    currentDate.getMonth() - 1 < 0 ? year - 1 : year;

  const prevMonth = months[prevMonthIndex];
  const currMonth = months[currentDate.getMonth()];

  if (day >= 1 && day <= 11) {
    this.fortqueryDate = `13-${prevMonth}-${prevYear}`;
    this.FortNightDateText = `01-${prevMonth}-${prevYear} - `;
    this.FortNightDateText2 = `15-${prevMonth}-${prevYear}`;
  } else if (day > 11 && day <= 18) {

    const lastDay =
      new Date(prevYear, prevMonthIndex + 1, 0).getDate();

    this.fortqueryDate = `26-${prevMonth}-${prevYear}`;
    this.FortNightDateText = `16-${prevMonth}-${prevYear} - `;
    this.FortNightDateText2 = `${lastDay}-${prevMonth}-${prevYear}`;
  } else {
    this.fortqueryDate = `13-${currMonth}-${year}`;
    this.FortNightDateText = `01-${currMonth}-${year} - `;
    this.FortNightDateText2 = `15-${currMonth}-${year}`;
  }


  /* ---------------- MONTHLY ---------------- */

  let monthIndex = currentDate.getMonth() - 1;
  let yearVal = year;

  if (day <= 11) {

    monthIndex = currentDate.getMonth() - 2;

    if (monthIndex < 0) {
      monthIndex += 12;
      yearVal = year - 1;
    }

  }

  this.monthlyqueryDate = `26-${months[monthIndex]}-${yearVal}`;
  this.MonthDateText = `${months[monthIndex]}-${yearVal}`;
  this.MonthDateText2 = '';


  /* ---------------- QUARTER ---------------- */

  if ((month === 4 && day > 11) || month === 5 || month === 6 || (month === 7 && day <= 11)) {
    this.quarterlyqueryDate = `26-MAR-${year}`;
    this.QuarterDateText = `JAN-${year} - `;
    this.QuarterDateText2 = `MAR-${year}`;
  } else if ((month === 7 && day > 11) || month === 8 || month === 9 || (month === 10 && day <= 11)) {
    this.quarterlyqueryDate = `26-JUN-${year}`;
    this.QuarterDateText = `APR-${year} - `;
    this.QuarterDateText2 = `JUN-${year}`;
  } else if ((month === 10 && day > 11) || month === 11 || month === 12) {
    this.quarterlyqueryDate = `26-SEP-${year}`;
    this.QuarterDateText = `JUL-${year} - `;
    this.QuarterDateText2 = `SEP-${year}`;
  } else if (month === 1 && day >= 1 && day <= 11) {
    this.quarterlyqueryDate = `26-SEP-${year - 1}`;
    this.QuarterDateText = `JUL-${year - 1} - `;
    this.QuarterDateText2 = `SEP-${year - 1}`;
  } else {
    this.quarterlyqueryDate = `26-DEC-${year - 1}`;
    this.QuarterDateText = `OCT-${year - 1} - `;
    this.QuarterDateText2 = `DEC-${year - 1}`;
  }


  /* ---------------- HALF YEAR ---------------- */

  if (
    (month === 4 && day > 11) ||
    month === 5 ||
    month === 6 ||
    month === 7 ||
    month === 8 ||
    month === 9 ||
    (month === 10 && day <= 11)
  ) {
    this.halfyearlyqueryDate = `26-MAR-${year}`;
    this.HalfYearlyDateText = `OCT-${year - 1} - `;
    this.HalfYearlyDateText2 = `MAR-${year}`;
  } else if ((month === 10 && day > 11) || month === 11 || month === 12) {
    this.halfyearlyqueryDate = `26-SEP-${year}`;
    this.HalfYearlyDateText = `APR-${year} - `;
    this.HalfYearlyDateText2 = `SEP-${year}`;
  } else {
    this.halfyearlyqueryDate = `26-SEP-${year - 1}`;
    this.HalfYearlyDateText = `APR-${year - 1} - `;
    this.HalfYearlyDateText2 = `SEP-${year - 1}`;
  }


  /* ---------------- ANNUAL ---------------- */

  if ((month === 4 && day > 11) || (month >= 5 && month <= 12)) {
    this.annuallyqueryDate = `26-MAR-${year}`;
    this.AnnuallyDateText = `APR-${year - 1} - `;
    this.AnnuallyDateText2 = `MAR-${year}`;
  } else {
    this.annuallyqueryDate = `26-MAR-${year - 1}`;
    this.AnnuallyDateText = `APR-${year - 2} - `;
    this.AnnuallyDateText2 = `MAR-${year - 1}`;
  }

  this.setsubmitteddata();
}

setsubmitteddata() {
  this.loader.show();
  this.dailyValue = 0;
  this.weeklyValue = 0;
  this.fortnightlyValue = 0;
  this.monthlyValue = 0;
  this.quarterlyValue = 0;
  this.halfyearlyValue = 0;
  this.annuallyValue = 0;
  this.submitdataarray = [
    this.dailyqueryDate,
    this.weeklyqueryDate,
    this.fortqueryDate,
    this.monthlyqueryDate,
    this.quarterlyqueryDate,
    this.halfyearlyqueryDate,
    this.annuallyqueryDate
  ];

  this.ocaService.submitdashdata(
    this.selectedCompany,
    this.selectedDepartment,
    this.selectedFunction,
    this.submitdataarray
  )
  .pipe(takeUntil(this.destroy$))
  .subscribe({
    next: (result: any) => {
    
    this.submitteddataarray = result?.[0]?.data || [];
    const dashboardBarMap = new Map<string, DashboardBar>();
    this.submitteddataarray.forEach((row: any) => {
      const freq = row[0];
      const value = Number(row[3]);

      switch (freq) {
        case '1':
          this.dailyValue = value;
          break;
        case '2':
          this.weeklyValue = value;
          break;
        case '3':
          this.fortnightlyValue = value;
          break;
        case '4':
          this.monthlyValue = value;
          break;
        case '5':
          this.quarterlyValue = value;
          break;
        case '6':
          this.halfyearlyValue = value;
          break;
        case '7':
          this.annuallyValue = value;
          break;
      }

      const bar = this.buildDashboardBar(freq, value);
      if (bar) {
        dashboardBarMap.set(freq, bar);
      }
    });

    this.dashboardBars = ['1', '2', '3', '4', '5', '6', '7']
      .map((freq) => dashboardBarMap.get(freq))
      .filter((bar): bar is DashboardBar => !!bar);
      console.log("Dashboard Data", this.submitteddataarray);
      this.loader.hide();
    }
    , error: () => {
      this.loader.hide();
      console.log("Dashboard API error");
    }

  });

}

private buildDashboardBar(freq: string, value: number): DashboardBar | null {
  switch (freq) {
    case '1':
      return { freq, code: 'D', value, date1: this.dailyDateText, date2: this.dailyDateText2 };
    case '2':
      return { freq, code: 'W', value, date1: this.WeekDateText, date2: this.WeekDateText2 };
    case '3':
      return { freq, code: 'F', value, date1: this.FortNightDateText, date2: this.FortNightDateText2 };
    case '4':
      return { freq, code: 'M', value, date1: this.MonthDateText, date2: this.MonthDateText2 };
    case '5':
      return { freq, code: 'Q', value, date1: this.QuarterDateText, date2: this.QuarterDateText2 };
    case '6':
      return { freq, code: 'H', value, date1: this.HalfYearlyDateText, date2: this.HalfYearlyDateText2 };
    case '7':
      return { freq, code: 'A', value, date1: this.AnnuallyDateText, date2: this.AnnuallyDateText2 };
    default:
      return null;
  }
}



loadFrequencies() {
  this.loader.show();
  this.sharedApiService.mycompfreq()
    .pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.loader.hide();
        if (res?.[0]?.status !== 'success') return;
        this.mycompfreqList = res[0].data;
        this.mycompfreqListWithIcons = this.mycompfreqList.map(f => ({
          value: f,
          icons: {
            compliant: false,
            nonCompliant: false,
            takeAction: true,
            notActed: false,
            reviewed: false
          }
        }));
        this.loadFrequencyIcons();
      },
      error: () => this.loader.hide()
    });
}

loadEnsureFrequencies() {
  this.loader.show();
  this.ensureView = 'frequency';
  this.ensureUsers = [];
  this.selectedEnsureUserName = '';
  this.ocaService.getEnsureCompfreq()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: any) => {
        this.ensureFreqList = res?.[0]?.data ?? [];
        this.ensureFreqListWithIcons = this.ensureFreqList.map((f: any) => ({
          value: f,
          selected: false,
          canBulkReview: false,
          rows: [],
          icons: {
            compliant: false,
            nonCompliant: false,
            takeAction: false,
            notActed: true,
            reviewed: false
          }
        }));

        if (!this.ensureFreqList.length) {
          this.loader.hide();
          return;
        }

        const requests = this.ensureFreqList.map((item: any) => {
          const freq = item[0];
          const dateRange = this.buildEnsureDateRange(freq);
          return this.ocaService.getViewUserPolicies(freq, 2, dateRange.fromDate, dateRange.toDate).pipe(
            map((response: any) => ({
              freq,
              rows: response?.[0]?.data ?? []
            }))
          );
        });

        forkJoin(requests)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (responses) => {
              responses.forEach(({ freq, rows }) => this.updateEnsureFrequencyIcon(freq, rows));
              this.loader.hide();
            },
            error: () => this.loader.hide()
          });
      },
      error: () => this.loader.hide()
    });
}

resolveFrequencyIcons(rows: any[]): FrequencyIconState {
  let hasPending = false;
  let hasNo = false;
  let hasYes = false;
  let hasReviewed = false;
  let hasPendingReview = false;
  for (const row of rows) {
    const userAnswer = this.normalizeAnswer(row[5]);
    const feedbackStatus = (row[16] ?? '').trim();
    if (feedbackStatus === 'A') {
      hasReviewed = true;
    }
    if (feedbackStatus === 'L') {
      hasPendingReview = true;
    }
    if (!userAnswer) {
      hasPending = true;
      continue;
    }
    if (userAnswer === 'No') {
      hasNo = true;
      continue;
    }
    if ( userAnswer === 'Yes' || userAnswer === 'Not Applicable') {
      hasYes = true;
    }
  }
  return {
    compliant: !hasPending && !hasNo && hasYes,
    nonCompliant: hasNo,
    takeAction: hasPending && !hasNo,
    notActed: !hasPending && !hasNo && !hasYes,
    reviewed: hasReviewed && !hasPendingReview
  };
}

private buildViewPoliciesPayload(frequency: ViewPoliciesReqModel['frequency'], baseDate: Date = new Date()): ViewPoliciesReqModel {
  const day = baseDate.getDate();
  const month = baseDate.getMonth();
  const year = baseDate.getFullYear();
  let date: Date = new Date(baseDate);

  switch (frequency) {
    case '1':
      date = new Date(baseDate);
      break;
    case '2':
      date = new Date(baseDate);
      // Legacy weekly query-date alignment from old app.
      if (day === 6) {
        date.setDate(date.getDate() - 1);
      } else if (day === 0) {
        date.setDate(date.getDate() - 3);
      } else if (day === 1 || day === 2) {
        date.setDate(date.getDate() - 4);
      }
      break;
    case '3':
      if (day >= 13 && day <= 25) date = new Date(year, month, 13);
      else if (day >= 26) date = new Date(year, month, 26);
      else date = new Date(year, month - 1, 26);
      break;
    case '4':
      date = day <= 25
        ? new Date(year, month - 1, 26)
        : new Date(year, month, 26);
      break;
    case '5': {
      // Legacy quarterly query-date rules from old app.
      let qMonth = 2; // MAR
      let qYear = year;
      if (month >= 3 && month < 5) {
        qMonth = 2;
      } else if (month === 5) {
        qMonth = day <= 25 ? 2 : 5;
      } else if (month >= 6 && month < 8) {
        qMonth = 5;
      } else if (month === 8) {
        qMonth = day <= 25 ? 5 : 8;
      } else if (month >= 9 && month < 11) {
        qMonth = 8;
      } else if (month === 11) {
        qMonth = day <= 25 ? 8 : 11;
      } else if (month >= 0 && month < 2) {
        qMonth = 11;
        qYear = year - 1;
      } else if (month === 2) {
        if (day <= 25) {
          qMonth = 11;
          qYear = year - 1;
        } else {
          qMonth = 2;
        }
      }
      date = new Date(qYear, qMonth, 26);
      break;
    }
    case '6': {
      // Legacy half-yearly query-date rules from old app.
      let hMonth = 2; // MAR
      let hYear = year;
      if (month >= 3 && month < 8) {
        hMonth = 2;
      } else if (month === 8) {
        if (day <= 25) {
          hMonth = 2;
          hYear = year - 1;
        } else {
          hMonth = 8;
        }
      } else if (month > 8) {
        hMonth = 8;
      } else if (month < 2) {
        hMonth = 8;
        hYear = year - 1;
      } else if (month === 2) {
        if (day <= 25) {
          hMonth = 8;
          hYear = year - 1;
        } else {
          hMonth = 2;
        }
      }
      date = new Date(hYear, hMonth, 26);
      break;
    }
    case '7':
      if (month < 2 || (month === 2 && day <= 25)) {
        date = new Date(year - 1, 2, 26);
      } else {
        date = new Date(year, 2, 26);
      }
      break;
    }
  return {
    frequency,
    role: '1',
    status: "'L','C','A','P'",
    date: this.format(date)
  };
}

loadFrequencyIcons() {
  const frequencies: ViewPoliciesReqModel['frequency'][] =
    ['1','2','3','4','5','6','7'];
  const apiCalls = frequencies.map(freq =>
    this.sharedApiService.viewpolicies(
      this.buildViewPoliciesPayload(freq)
    )
  );
  forkJoin(apiCalls).pipe(takeUntil(this.destroy$)).subscribe(responses => {
      responses.forEach((res, index) => {
        const rows = res?.[0]?.data ?? [];
        const freq = frequencies[index];
        if (!rows.length) return;
        this.updateFrequencyIcon(freq, rows);
      });
    });
}

updateFrequencyIcon(freq: string, rows: any[]) {
  const freqItem = this.mycompfreqListWithIcons
    .find(f => f.value[0] === freq);
  if (!freqItem) return;
  const resolvedIcons = this.resolveFrequencyIcons(rows);
  const isActive = this.isFrequencyActive(freq as any);

  if (!isActive && resolvedIcons.takeAction) {
    freqItem.icons = {
      compliant: false,
      nonCompliant: false,
      takeAction: false,
      notActed: true,
      reviewed: resolvedIcons.reviewed
    };
    return;
  }

  freqItem.icons = resolvedIcons;
}

updateEnsureFrequencyIcon(freq: string, rows: any[]) {
  const freqItem = this.ensureFreqListWithIcons.find(item => item.value[0] === freq);
  if (!freqItem) {
    return;
  }

  freqItem.rows = rows;
  freqItem.icons = this.resolveEnsureIcons(freq, rows);
  freqItem.canBulkReview = this.canBulkReviewEnsureFrequency(freq as ViewPoliciesReqModel['frequency'], rows);
}

 isFrequencyActive(frequency: ViewPoliciesReqModel['frequency'],
  baseDate: Date = new Date()): boolean {

  const day = baseDate.getDate();
  const month = baseDate.getMonth() + 1;
  const dow = baseDate.getDay();

  switch (frequency) {
    case '1': return true;

    case '2': return [5, 6, 0, 1, 2].includes(dow);

    case '3': return (day >= 13 && day <= 16) || day >= 26 || day <= 11;

    case '4': return day >= 26 || day <= 11;

    case '5':
      return ((day >= 26 && day <= 31) && [3, 6, 9, 12].includes(month))
        || ((day >= 1 && day <= 11) && [4, 7, 10, 1].includes(month));

    case '6':
      return ((day >= 26 && day <= 31) && [9, 3].includes(month))
        || ((day >= 1 && day <= 11) && [10, 4].includes(month));

    case '7':
      return ((day >= 26 && day <= 31) && month === 3)
        || ((day >= 1 && day <= 11) && month === 4);

    default: return false;
  }
}

viewpolicies(freq: ViewPoliciesReqModel['frequency']) {
  this.activeFreq = freq;
  const payload = this.buildViewPoliciesPayload(freq);
  this.queryDateStr = payload.date;
  this.ocaHeadTextDate = '';
  this.loader.show();
  this.sharedApiService.viewpolicies(payload)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res) => {
        this.loader.hide();
        if (res?.[0]?.status !== 'success') return;
        this.viewpoliciesList = res[0].data;
        this.ocaHeadTextDate = this.buildFrequencyDateText(freq, this.viewpoliciesList);
        this.buildForm(this.viewpoliciesList);
        this.detailsByDate = true;
      },
      error: () => this.loader.hide()
    });
}

  
buildForm(rows: any[]) {
  const readOnlyFrequency = this.isFrequencyReadOnly(this.activeFreq);
  const groups: Record<string, any[]> = {};
  rows.forEach((row, index) => {
    const title = row[18] || 'Policy Question';
    if (!groups[title]) groups[title] = [];
    groups[title].push({ row, index });
  });

  this.groupedQuestions = Object.entries(groups).map(([title, rows]) => ({
    title,
    rows
  }));

  const formArray = rows.map(row => {
    const fg = this.createQuestionGroup(row);
    if (readOnlyFrequency || (row[16] ?? '').trim() === 'A') {
      fg.disable({ emitEvent: false });
    }
    return fg;
  });
  this.complianceForm.setControl('questions', this.fb.array(formArray));
}

createQuestionGroup(row: any) {
  return this.fb.group({
    questionMappingId: [row[0]],
    policyId: [row[2]],
    questionId: [row[1]],
    questionText: [row[3]],
    answer: [this.normalizeAnswer(row[5])],
    remark: [this.normalizeRemark(row[6])],
    file: [row[17] ? { name: row[17] } : null],
    localFile: [null],
    userAttachment: [row[27]],
    userAttachmentName: [row[17]],
    approverAttachment: [row[21]],
    approverOID: [row[7]],
    approverFeedback: [row[8]],
    approverRemarks: [row[9]],
    createdBy: [row[10]],
    modifyBy: [row[12]],
    feedbackStatus: [row[16]],
    attachmentRequired: [row[23]]
  });
}

canSubmit(): boolean {
  if (this.isFrequencyReadOnly(this.activeFreq))
    return false;

  let atLeastOne = false;

  for (const q of this.questionsFA.controls) {
    if (q.disabled) {
      continue;
    }

    const ans = this.normalizeAnswer(q.get('answer')?.value);
    const remark = (q.get('remark')?.value ?? '').toString().trim();
    const attachment = q.get('file')?.value;
    const attachmentRequired = (q.get('attachmentRequired')?.value ?? '').toString().toLowerCase();

    if (!ans) continue;

    atLeastOne = true;

    if ((ans === 'No' || ans === 'Not Applicable') && !remark)
      return false;

    if (ans === 'No' && attachmentRequired === 'yes' && !attachment)
      return false;
  }
  return atLeastOne;
}

buildFeedbackPayload(): string {
  const result = this.commonService.getEmpDetails();
  let getEmployeeDetails = result;
  const userOID  = getEmployeeDetails.timescapeUserOID;

  return this.questionsFA.controls
    .filter(q => !q.disabled)
    .map(q => {
      const answer = this.normalizeAnswer(q.get('answer')?.value);
      if (!answer) {
        return '';
      }
      let remark = (q.get('remark')?.value ?? '').toString().trim() || '-';
      let encodedRemark = encodeURIComponent(remark);
      let apprFeedback = q.get('approverFeedback')?.value || 'Not Acted';
      let apprRemarks = q.get('approverRemarks')?.value || '-';
      let encodedApprRemarks = encodeURIComponent(apprRemarks);
      const userAttachment =
        q.get('file')?.value?.name || q.get('userAttachmentName')?.value || 'NA';
      const approverAttachment =
        q.get('approverAttachment')?.value || 'NA';
      const data = [
        q.get('questionMappingId')?.value,
        q.get('policyId')?.value,
        answer,
        encodedRemark,
        q.get('approverOID')?.value,
        apprFeedback,
        encodedApprRemarks,
        userOID,
        userOID,
        'L',
        userAttachment,
        approverAttachment
      ].join(',');
      return `feedback=${data}`;
    })
    .filter(Boolean)
    .join('&');
}

insertfeedback() {
  if (!this.canSubmit()) {
    this.complianceForm.markAllAsTouched();
    return;
  }
  const payload = this.buildFeedbackPayload();
  this.loader.show();
  this.sharedApiService.insertfeedback(payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.loader.hide();
        this.showPopup = true;
        this.eurekafileSuccessMsg = true;
        this.loadFrequencyIcons();
      },
      error: () => {
        this.loader.hide();
        this.eurekafileErrorMsg = true;
      }
    });
}

  eurekafile(event: { file: File | null }, index: number) {
    const { file } = event;
    if (!file) return;

    this.loader.show();
    const formData = new FormData();
    formData.append('file', file);

    this.sharedApiService.eurekafile(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.loader.hide();

          if (res[0]?.status === 'success') {
            const uploadedFileName = res[0].filePath || file.name;
            // Update form control
            this.questionsFA.at(index).patchValue({
              file: { name: uploadedFileName },
              localFile: file,
              userAttachmentName: uploadedFileName
            });
          }
        },
        error: (err) => {
          this.loader.hide();
        }
      });
  }

  downloadFile(index: number) {
    const row = this.questionsFA.at(index);
    const base64 = (row.get('userAttachment')?.value ?? '').toString().trim();
    const fileName =
      row.get('file')?.value?.name || row.get('userAttachmentName')?.value || 'file.pdf';
    const localFile = row.get('localFile')?.value as File | null;

    if (base64) {
      const padded = base64.padEnd(
        base64.length + (4 - base64.length % 4) % 4,
        '='
      );
      const byteChars = atob(padded);
      const byteNumbers = new Array(byteChars.length);

      for (let i = 0; i < byteChars.length; i++) {
        byteNumbers[i] = byteChars.charCodeAt(i);
      }

      const blob = new Blob([new Uint8Array(byteNumbers)], {
        type: 'application/pdf'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    // Newly uploaded file is available locally before backend returns base64.
    if (localFile) {
      const url = URL.createObjectURL(localFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    }
  }


  deleteFile(index: number) {
    this.questionsFA.at(index).patchValue({
      file: null,
      localFile: null,
      userAttachmentName: null,
      userAttachment: null
    });
  }

  onNativeFileSelected(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) {
      return;
    }
    this.eurekafile({ file }, index);
  }

  resetNativeFileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = '';
  }

  isQuestionReadonly(index: number): boolean {
    return this.isFrequencyReadOnly(this.activeFreq) || this.questionsFA.at(index).disabled;
  }

  isReviewedQuestion(index: number): boolean {
    return (this.questionsFA.at(index).get('feedbackStatus')?.value ?? '').toString().trim() === 'A';
  }

  getAnswerTheme(value: unknown): 'yes' | 'no' | 'na' {
    const normalized = (value ?? '').toString().trim();
    if (normalized === 'No') {
      return 'no';
    }
    if (normalized === 'Not Applicable') {
      return 'na';
    }
    return 'yes';
  }

  showUploadControl(index: number): boolean {
    return !this.isQuestionReadonly(index) && !this.hasAnyUserAttachment(index);
  }

  showDeleteControl(index: number): boolean {
    return !this.isQuestionReadonly(index) && this.hasAnyUserAttachment(index);
  }

  showDownloadControl(index: number): boolean {
    return this.hasAnyUserAttachment(index);
  }

  private hasAnyUserAttachment(index: number): boolean {
    const q = this.questionsFA.at(index);
    const fileName = (q.get('file')?.value?.name ?? q.get('userAttachmentName')?.value ?? '').toString().trim();
    return !!fileName && fileName.toLowerCase() !== 'na';
  }

  private isFrequencyReadOnly(frequency: ViewPoliciesReqModel['frequency'] | undefined): boolean {
    if (!frequency) {
      return true;
    }

    if (!this.isFrequencyActive(frequency)) {
      return true;
    }

    const freqItem = this.mycompfreqListWithIcons.find(item => item.value[0] === frequency);
    if (!freqItem) {
      return false;
    }

    // "No action required" frequency should be review-only.
    return !!freqItem.icons.notActed && !freqItem.icons.takeAction;
  }

    private getQuarterStartMonth(d: Date): number {

    const m = d.getMonth();

    if (m <= 2) return 11;
    if (m <= 5) return 2;
    if (m <= 8) return 5;

    return 8;

  }

  private getHalfYearStartMonth(d: Date): number {
    return d.getMonth() < 8 ? 2 : 8;
  }

  private format(d: Date): string {
    return this.datePipe.transform(d, 'dd-MMM-yyyy')!.toUpperCase();
  }

  private normalizeAnswer(value: unknown): 'Yes' | 'No' | 'Not Applicable' | '' {
    const normalized = (value ?? '').toString().trim();
    if (!normalized || this.pendingAnswers.has(normalized)) {
      return '';
    }
    if (normalized.toLowerCase() === 'not applicable') {
      return 'Not Applicable';
    }
    if (normalized === 'Yes' || normalized === 'No') {
      return normalized;
    }
    return '';
  }

  private normalizeRemark(value: unknown): string {
    const normalized = (value ?? '').toString().trim();
    return normalized === '-' ? '' : normalized;
  }

  private buildFrequencyDateText(freq: ViewPoliciesReqModel['frequency'], rows: any[]): string {
    const rowWithDate = rows.find(r => (r?.[11] ?? '').toString().trim() !== '');
    if (!rowWithDate) {
      return '';
    }

    const createdDate = new Date(rowWithDate[11].toString());
    if (Number.isNaN(createdDate.getTime())) {
      return '';
    }

    const year = createdDate.getFullYear();
    const month = createdDate.getMonth() + 1;
    const monthLabel = this.datePipe.transform(createdDate, 'MMM')?.toUpperCase() ?? '';
    const day = createdDate.getDate();

    if (freq === '1') {
      return this.format(createdDate);
    }

    if (freq === '2') {
      // Legacy behavior: weekly display only when created date falls on Friday.
      if (createdDate.getDay() !== 5) {
        return '';
      }
      const monday = new Date(createdDate);
      monday.setDate(monday.getDate() - 4);
      const sunday = new Date(createdDate);
      sunday.setDate(sunday.getDate() + 2);
      return `${this.format(monday)} - ${this.format(sunday)}`;
    }

    if (freq === '3') {
      const lastDay = new Date(year, createdDate.getMonth() + 1, 0).getDate();
      if (day === 13) {
        return `01-${monthLabel}-${year} - 15-${monthLabel}-${year}`;
      }
      if (day === 26) {
        return `16-${monthLabel}-${year} - ${lastDay}-${monthLabel}-${year}`;
      }
      return '';
    }

    if (freq === '4') {
      return this.datePipe.transform(createdDate, 'MMM-YYYY')?.toUpperCase() ?? '';
    }

    if (freq === '5') {
      if (month === 3) return `JAN-${year} - MAR-${year}`;
      if (month === 6) return `APR-${year} - JUN-${year}`;
      if (month === 9) return `JUL-${year} - SEP-${year}`;
      if (month === 12) return `OCT-${year} - DEC-${year}`;
      return '';
    }

    if (freq === '6') {
      if (month === 3) return `OCT-${year - 1} - MAR-${year}`;
      if (month === 9) return `APR-${year} - SEP-${year}`;
      return '';
    }

    if (freq === '7') {
      if (month === 3) return `APR-${year - 1} - MAR-${year}`;
      return '';
    }

    return '';
  }

backBtn() {
  this.detailsByDate = false;
}

viewEnsurePolicies(freq: ViewPoliciesReqModel['frequency']) {
  this.ensureActiveFreq = freq;
  this.ensureView = 'users';
  this.ensureUsers = [];
  this.selectedEnsureUserName = '';
  this.ensureHeadTextDate = '';

  const dateRange = this.buildEnsureDateRange(freq);
  this.loader.show();
  this.ocaService.getViewUserPolicies(freq, 2, dateRange.fromDate, dateRange.toDate)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: any) => {
        const rows = res?.[0]?.data ?? [];
        this.ensureHeadTextDate = this.buildEnsureFrequencyDateText(freq, rows);
        this.buildEnsureUsers(rows);
        this.loader.hide();
      },
      error: () => this.loader.hide()
    });
}

private buildEnsureUsers(rows: any[]) {
  const grouped = new Map<string, any[]>();

  rows.forEach((row: any) => {
    const name = (row?.[17] ?? 'Unknown').toString().trim() || 'Unknown';
    if (!grouped.has(name)) {
      grouped.set(name, []);
    }
    grouped.get(name)?.push(row);
  });

  this.ensureUsers = Array.from(grouped.entries())
    .map(([name, userRows]) => ({
      name,
      rows: userRows,
      icons: this.resolveEnsureIcons(this.ensureActiveFreq, userRows),
      selected: false,
      canBulkReview: this.canBulkReviewEnsureRows(userRows)
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

openEnsureUser(user: EnsureUserSummary) {
  this.selectedEnsureUserName = user.name;
  this.ensureView = 'detail';
  this.buildEnsureForm(user.rows);
}

private buildEnsureForm(rows: any[]) {
  const groups: Record<string, any[]> = {};

  rows.forEach((row, index) => {
    const title = row[18] || 'Policy Question';
    if (!groups[title]) {
      groups[title] = [];
    }
    groups[title].push({ row, index });
  });

  this.ensureGroupedQuestions = Object.entries(groups).map(([title, groupedRows]) => ({
    title,
    rows: groupedRows
  }));

  const formArray = rows.map((row) => {
    const fg = this.createEnsureQuestionGroup(row);
    if (!this.isEnsureFrequencyActive(this.ensureActiveFreq)) {
      fg.disable({ emitEvent: false });
    }
    return fg;
  });

  this.ensureComplianceForm.setControl('questions', this.fb.array(formArray));
}

private createEnsureQuestionGroup(row: any) {
  const answer = (row[16] ?? '').toString().trim() === 'A'
    ? this.normalizeAnswer(row[8])
    : this.normalizeAnswer(row[4]);
  const remark = (row[16] ?? '').toString().trim() === 'A'
    ? this.normalizeRemark(row[9])
    : this.normalizeRemark(row[6]);

  return this.fb.group({
    questionMappingId: [row[0]],
    policyId: [row[1]],
    questionText: [row[2]],
    userAnswer: [this.normalizeAnswer(row[4])],
    userRemark: [this.normalizeRemark(row[6])],
    userAttachmentName: [row[5]],
    userAttachment: [row[26]],
    answer: [answer],
    remark: [remark],
    file: [row[21] ? { name: row[21] } : null],
    localFile: [null],
    approverAttachmentName: [row[21]],
    approverAttachment: [row[27]],
    createdBy: [row[10]],
    feedbackStatus: [row[16]],
    attachmentRequired: [row[23]]
  });
}

private resolveEnsureIcons(freq: string, rows: any[]): FrequencyIconState {
  const active = this.isEnsureFrequencyActive(freq as ViewPoliciesReqModel['frequency']);
  const statusValues = rows.map(row => (row?.[16] ?? '').toString().trim());
  const userAnswers = rows.map(row => this.normalizeAnswer(row?.[4]));
  const approverAnswers = rows.map(row => this.normalizeAnswer(row?.[8]));
  const hasL = statusValues.includes('L');
  const hasA = statusValues.includes('A');

  const resolveStatusAnswerSet = () => {
    if (hasL && hasA) {
      return rows.map(row => {
        const status = (row?.[16] ?? '').toString().trim();
        return this.normalizeAnswer(status === 'A' ? row?.[8] : row?.[4]);
      });
    }
    if (hasL) {
      return userAnswers;
    }
    return approverAnswers;
  };

  const answers = resolveStatusAnswerSet();
  const hasPending = answers.some(answer => !answer);
  const hasNo = answers.includes('No');
  const hasPositive = answers.some(answer => answer === 'Yes' || answer === 'Not Applicable');
  const reviewed = rows.length > 0 && !hasL && hasA;
  const canBulkReview = active
    && rows.length > 0
    && hasL
    && rows.every(row => !!this.normalizeAnswer(row?.[4]));

  return {
    compliant: !hasPending && !hasNo && hasPositive,
    nonCompliant: hasNo,
    takeAction: canBulkReview,
    notActed: rows.length === 0 || (!active && hasPending),
    reviewed
  };
}

private buildEnsureDateRange(freq: ViewPoliciesReqModel['frequency'], baseDate: Date = new Date()) {
  const currentDay = baseDate.getDay();
  const currentDate = baseDate.getDate();
  const month = baseDate.getMonth();
  const year = baseDate.getFullYear();
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const prevMonthIndex = month - 1 < 0 ? 11 : month - 1;
  const prevMonthYear = month - 1 < 0 ? year - 1 : year;
  let fromDate = this.format(baseDate);

  if (freq === '2') {
    const weeklyDate = new Date(baseDate);
    if (currentDay === 6) {
      weeklyDate.setDate(weeklyDate.getDate() - 1);
    } else if (currentDay === 0) {
      weeklyDate.setDate(weeklyDate.getDate() - 2);
    } else if (currentDay === 1) {
      weeklyDate.setDate(weeklyDate.getDate() - 3);
    } else if (currentDay === 2) {
      weeklyDate.setDate(weeklyDate.getDate() - 4);
    }
    fromDate = this.format(weeklyDate);
  } else if (freq === '3') {
    if (currentDate >= 13 && currentDate <= 25) {
      fromDate = `13-${months[month]}-${year}`;
    } else if (currentDate >= 26) {
      fromDate = `26-${months[month]}-${year}`;
    } else {
      fromDate = `26-${months[prevMonthIndex]}-${prevMonthYear}`;
    }
  } else if (freq === '4') {
    fromDate = currentDate <= 25
      ? `26-${months[prevMonthIndex]}-${prevMonthYear}`
      : `26-${months[month]}-${year}`;
  } else if (freq === '5') {
    let quarterMonth = 'MAR';
    let quarterYear = year;

    if (month >= 3 && month < 5) {
      quarterMonth = 'MAR';
    } else if (month === 5) {
      quarterMonth = currentDate <= 25 ? 'MAR' : 'JUN';
    } else if (month >= 6 && month < 8) {
      quarterMonth = 'JUN';
    } else if (month === 8) {
      quarterMonth = currentDate <= 25 ? 'JUN' : 'SEP';
    } else if (month >= 9 && month < 11) {
      quarterMonth = 'SEP';
    } else if (month === 11) {
      quarterMonth = currentDate <= 25 ? 'SEP' : 'DEC';
    } else if (month >= 0 && month < 2) {
      quarterMonth = 'DEC';
      quarterYear = year - 1;
    } else if (month === 2) {
      quarterMonth = currentDate <= 25 ? 'DEC' : 'MAR';
      quarterYear = currentDate <= 25 ? year - 1 : year;
    }

    fromDate = `26-${quarterMonth}-${quarterYear}`;
  } else if (freq === '6') {
    let halfMonth = 'MAR';
    let halfYear = year;

    if (month >= 3 && month < 8) {
      halfMonth = 'MAR';
    } else if (month === 8) {
      halfMonth = currentDate <= 25 ? 'MAR' : 'SEP';
      halfYear = currentDate <= 25 ? year - 1 : year;
    } else if (month > 8) {
      halfMonth = 'SEP';
    } else if (month < 2) {
      halfMonth = 'SEP';
      halfYear = year - 1;
    } else if (month === 2) {
      halfMonth = currentDate <= 25 ? 'SEP' : 'MAR';
      halfYear = currentDate <= 25 ? year - 1 : year;
    }

    fromDate = `26-${halfMonth}-${halfYear}`;
  } else if (freq === '7') {
    if (month < 2) {
      fromDate = `26-MAR-${year - 1}`;
    } else if (month === 2) {
      fromDate = currentDate <= 25 ? `26-MAR-${year - 1}` : `26-MAR-${year}`;
    } else {
      fromDate = `26-MAR-${year}`;
    }
  }

  return {
    fromDate,
    toDate: this.format(baseDate)
  };
}

isEnsureFrequencyActive(frequency: ViewPoliciesReqModel['frequency'], baseDate: Date = new Date()): boolean {
  const currentDate = baseDate.getDate();
  const month = baseDate.getMonth() + 1;
  const day = baseDate.getDay();

  switch (frequency) {
    case '1':
      return true;
    case '2':
      return day !== 4;
    case '3':
      return (currentDate >= 13 && currentDate <= 17) || currentDate >= 26 || currentDate <= 12;
    case '4':
      return currentDate >= 26 || currentDate <= 12;
    case '5':
      return ((currentDate >= 26 && currentDate <= 31) && [3, 6, 9, 12].includes(month))
        || ((currentDate >= 1 && currentDate <= 12) && [4, 7, 10, 1].includes(month));
    case '6':
      return ((currentDate >= 26 && currentDate <= 31) && [9, 3].includes(month))
        || ((currentDate >= 1 && currentDate <= 12) && [10, 4].includes(month));
    case '7':
      return ((currentDate >= 26 && currentDate <= 31) && month === 3)
        || ((currentDate >= 1 && currentDate <= 12) && month === 4);
    default:
      return false;
  }
}

private canBulkReviewEnsureRows(rows: any[]): boolean {
  return this.isEnsureFrequencyActive(this.ensureActiveFreq)
    && rows.some(row => (row?.[16] ?? '').toString().trim() === 'L')
    && rows.every(row => !!this.normalizeAnswer(row?.[4]));
}

private canBulkReviewEnsureFrequency(freq: ViewPoliciesReqModel['frequency'], rows: any[]): boolean {
  return this.isEnsureFrequencyActive(freq)
    && rows.length > 0
    && rows.some(row => (row?.[16] ?? '').toString().trim() === 'L')
    && rows.every(row => !!this.normalizeAnswer(row?.[4]));
}

toggleEnsureFrequencySelection(item: EnsureFrequencyState) {
  if (!item.canBulkReview) {
    return;
  }
  item.selected = !item.selected;
}

canSubmitEnsureFrequencySelection(): boolean {
  return this.ensureFreqListWithIcons.some(item => item.selected && item.canBulkReview);
}

submitEnsureFrequencySelection() {
  const feedback = this.ensureFreqListWithIcons
    .filter(item => item.selected && item.canBulkReview)
    .flatMap(item => item.rows.map((row: any) => {
      const existingApproverAnswer = this.normalizeAnswer(row?.[8]);
      const approverAnswer = existingApproverAnswer || this.normalizeAnswer(row?.[4]) || 'Not Acted';
      const approverRemark = existingApproverAnswer
        ? (this.normalizeRemark(row?.[9]) || '-')
        : (this.normalizeRemark(row?.[6]) || '-');
      return [
        row[0],
        row[1],
        row[4],
        encodeURIComponent(this.normalizeRemark(row?.[6]) || '-'),
        this.commonService.getEmpDetails().timescapeUserOID,
        approverAnswer,
        encodeURIComponent(approverRemark),
        row[10],
        this.commonService.getEmpDetails().timescapeUserOID,
        'A',
        row[5],
        row[21] || 'NA'
      ].join(',');
    }));

  if (!feedback.length) {
    return;
  }

  this.loader.show();
  this.ocaService.setFeedback({ feedback })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.loader.hide();
        this.showPopup = true;
        this.eurekafileSuccessMsg = true;
        this.eurekafileErrorMsg = false;
        this.loadEnsureFrequencies();
      },
      error: () => {
        this.loader.hide();
        this.eurekafileErrorMsg = true;
        this.eurekafileSuccessMsg = false;
      }
    });
}

toggleEnsureUserSelection(user: EnsureUserSummary) {
  if (!user.canBulkReview) {
    return;
  }
  user.selected = !user.selected;
}

canSubmitEnsureUserSelection(): boolean {
  return this.ensureUsers.some(user => user.selected && user.canBulkReview);
}

submitEnsureUserSelection() {
  const feedback = this.ensureUsers
    .filter(user => user.selected && user.canBulkReview)
    .flatMap(user => user.rows.map((row: any) => {
      const hasApproverFeedback = !!this.normalizeAnswer(row?.[8]);
      const approverFeedback = hasApproverFeedback ? row[8] : row[4];
      const approverRemarks = hasApproverFeedback ? this.normalizeRemark(row[9]) || '-' : this.normalizeRemark(row[6]) || '-';
      return [
        row[0],
        row[1],
        row[4],
        encodeURIComponent(this.normalizeRemark(row[6]) || '-'),
        this.commonService.getEmpDetails().timescapeUserOID,
        approverFeedback,
        encodeURIComponent(approverRemarks),
        row[10],
        this.commonService.getEmpDetails().timescapeUserOID,
        'A',
        row[5],
        row[21] || 'NA'
      ].join(',');
    }));

  if (!feedback.length) {
    return;
  }

  this.loader.show();
  this.ocaService.setFeedback({ feedback })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.loader.hide();
        this.showPopup = true;
        this.eurekafileSuccessMsg = true;
        this.eurekafileErrorMsg = false;
        this.viewEnsurePolicies(this.ensureActiveFreq);
        this.loadEnsureFrequencies();
      },
      error: () => {
        this.loader.hide();
        this.eurekafileErrorMsg = true;
        this.eurekafileSuccessMsg = false;
      }
    });
}

private buildEnsureFrequencyDateText(freq: ViewPoliciesReqModel['frequency'], rows: any[]): string {
  const rowWithDate = rows.find(row => (row?.[11] ?? '').toString().trim() !== '');
  if (!rowWithDate) {
    return '';
  }

  const createdDate = this.parseOcaDate(rowWithDate[11]);
  if (!createdDate) {
    return '';
  }

  const year = createdDate.getFullYear();
  const month = createdDate.getMonth() + 1;
  const monthLabel = this.datePipe.transform(createdDate, 'MMM')?.toUpperCase() ?? '';
  const day = createdDate.getDate();

  if (freq === '1') {
    return this.format(createdDate);
  }

  if (freq === '2') {
    if (createdDate.getDay() !== 5) {
      return '';
    }
    const monday = new Date(createdDate);
    monday.setDate(monday.getDate() - 4);
    const sunday = new Date(createdDate);
    sunday.setDate(sunday.getDate() + 2);
    return `${this.format(monday)} - ${this.format(sunday)}`;
  }

  if (freq === '3') {
    const lastDay = new Date(year, createdDate.getMonth() + 1, 0).getDate();
    if (day === 13) {
      return `01-${monthLabel}-${year} - 15-${monthLabel}-${year}`;
    }
    if (day === 26) {
      return `16-${monthLabel}-${year} - ${lastDay}-${monthLabel}-${year}`;
    }
    return '';
  }

  if (freq === '4') {
    return this.datePipe.transform(createdDate, 'MMM-YYYY')?.toUpperCase() ?? '';
  }

  if (freq === '5') {
    if (month === 3) return `JAN-${year} - MAR-${year}`;
    if (month === 6) return `APR-${year} - JUN-${year}`;
    if (month === 9) return `JUL-${year} - SEP-${year}`;
    if (month === 12) return `OCT-${year} - DEC-${year}`;
    return '';
  }

  if (freq === '6') {
    if (month === 3) return `OCT-${year - 1} - MAR-${year}`;
    if (month === 9) return `APR-${year} - SEP-${year}`;
    return '';
  }

  if (freq === '7') {
    if (month === 3) return `APR-${year - 1} - MAR-${year}`;
    return '';
  }

  return '';
}

private parseOcaDate(value: unknown): Date | null {
  const normalized = (value ?? '').toString().trim();
  if (!normalized) {
    return null;
  }

  const nativeDate = new Date(normalized);
  if (!Number.isNaN(nativeDate.getTime())) {
    return nativeDate;
  }

  const parts = normalized.split('-');
  if (parts.length !== 3) {
    return null;
  }

  const day = Number(parts[0]);
  const monthMap: Record<string, number> = {
    JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
    JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11
  };
  const month = monthMap[parts[1].toUpperCase()];
  const year = Number(parts[2]);

  if (Number.isNaN(day) || month === undefined || Number.isNaN(year)) {
    return null;
  }

  return new Date(year, month, day);
}

backEnsureUsers() {
  this.ensureView = 'users';
  this.selectedEnsureUserName = '';
}

backEnsureFrequencies() {
  this.ensureView = 'frequency';
  this.ensureUsers = [];
  this.selectedEnsureUserName = '';
}

showEnsureUploadControl(index: number): boolean {
  return this.isEnsureFrequencyActive(this.ensureActiveFreq) && !this.hasAnyEnsureAttachment(index);
}

showEnsureDeleteControl(index: number): boolean {
  return this.isEnsureFrequencyActive(this.ensureActiveFreq) && this.hasAnyEnsureAttachment(index);
}

showEnsureDownloadControl(index: number): boolean {
  return this.hasAnyEnsureAttachment(index);
}

private hasAnyEnsureAttachment(index: number): boolean {
  const question = this.ensureQuestionsFA.at(index);
  const fileName = (question.get('file')?.value?.name ?? question.get('approverAttachmentName')?.value ?? '').toString().trim();
  return !!fileName && fileName.toLowerCase() !== 'na';
}

onEnsureNativeFileSelected(event: Event, index: number) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0] ?? null;
  if (!file) {
    return;
  }

  const formData = new FormData();
  formData.append('file', file);
  this.loader.show();
  this.ocaService.eurekaSubmitFile(formData)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: any) => {
        this.loader.hide();
        if (res?.[0]?.status === 'success') {
          const uploadedFileName = res[0].filePath || file.name;
          this.ensureQuestionsFA.at(index).patchValue({
            file: { name: uploadedFileName },
            localFile: file,
            approverAttachmentName: uploadedFileName
          });
        }
      },
      error: () => this.loader.hide()
    });
}

resetEnsureNativeFileInput(event: Event) {
  const input = event.target as HTMLInputElement;
  input.value = '';
}

downloadEnsureFile(index: number) {
  const row = this.ensureQuestionsFA.at(index);
  const base64 = (row.get('approverAttachment')?.value ?? '').toString().trim();
  const fileName = row.get('file')?.value?.name || row.get('approverAttachmentName')?.value || 'file.pdf';
  const localFile = row.get('localFile')?.value as File | null;

  if (base64) {
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    const byteChars = atob(padded);
    const byteNumbers = new Array(byteChars.length);

    for (let i = 0; i < byteChars.length; i++) {
      byteNumbers[i] = byteChars.charCodeAt(i);
    }

    const blob = new Blob([new Uint8Array(byteNumbers)], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  if (localFile) {
    const url = URL.createObjectURL(localFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }
}

downloadEnsureUserAttachment(index: number) {
  const row = this.ensureQuestionsFA.at(index);
  const base64 = (row.get('userAttachment')?.value ?? '').toString().trim();
  const fileName = row.get('userAttachmentName')?.value || 'file.pdf';

  if (!base64) {
    return;
  }

  const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
  const byteChars = atob(padded);
  const byteNumbers = new Array(byteChars.length);

  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }

  const blob = new Blob([new Uint8Array(byteNumbers)], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

deleteEnsureFile(index: number) {
  this.ensureQuestionsFA.at(index).patchValue({
    file: null,
    localFile: null,
    approverAttachmentName: null,
    approverAttachment: null
  });
}

canSubmitEnsureDetail(): boolean {
  if (!this.isEnsureFrequencyActive(this.ensureActiveFreq)) {
    return false;
  }

  let hasSelection = false;

  for (const control of this.ensureQuestionsFA.controls) {
    const answer = this.normalizeAnswer(control.get('answer')?.value);
    const remark = (control.get('remark')?.value ?? '').toString().trim();
    const userAnswer = this.normalizeAnswer(control.get('userAnswer')?.value);
    const attachmentRequired = (control.get('attachmentRequired')?.value ?? '').toString().trim().toLowerCase();
    const fileName = (control.get('file')?.value?.name ?? control.get('approverAttachmentName')?.value ?? '').toString().trim();

    if (!answer) {
      continue;
    }

    hasSelection = true;

    if ((answer === 'No' || answer === 'Not Applicable') && !remark) {
      return false;
    }

    if (answer !== userAnswer && !remark) {
      return false;
    }

    if (attachmentRequired === 'yes' && (!fileName || fileName.toLowerCase() === 'na')) {
      return false;
    }
  }

  return hasSelection;
}

submitEnsureDetail() {
  if (!this.canSubmitEnsureDetail()) {
    this.ensureComplianceForm.markAllAsTouched();
    return;
  }

  const empOid = this.commonService.getEmpDetails().timescapeUserOID;
  const feedback = this.ensureQuestionsFA.controls
    .filter(control => !!this.normalizeAnswer(control.get('answer')?.value))
    .map((control) => {
    const answer = this.normalizeAnswer(control.get('answer')?.value);
    const remark = (control.get('remark')?.value ?? '').toString().trim() || '-';
    const userRemark = (control.get('userRemark')?.value ?? '').toString().trim() || '-';
    const approverAttachmentName = control.get('file')?.value?.name || control.get('approverAttachmentName')?.value || 'NA';
    const userAttachmentName = control.get('userAttachmentName')?.value || 'NA';

    return [
      control.get('questionMappingId')?.value,
      control.get('policyId')?.value,
      control.get('userAnswer')?.value || 'Not Acted',
      encodeURIComponent(userRemark),
      empOid,
      answer,
      encodeURIComponent(remark),
      control.get('createdBy')?.value,
      empOid,
      'A',
      userAttachmentName,
      approverAttachmentName
    ].join(',');
  });

  this.loader.show();
  this.ocaService.setFeedback({ feedback })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.loader.hide();
        this.showPopup = true;
        this.eurekafileSuccessMsg = true;
        this.eurekafileErrorMsg = false;
        this.ensureView = 'users';
        this.viewEnsurePolicies(this.ensureActiveFreq);
        this.loadEnsureFrequencies();
      },
      error: () => {
        this.loader.hide();
        this.eurekafileSuccessMsg = false;
        this.eurekafileErrorMsg = true;
      }
    });
}
}
