import { Component, OnDestroy, OnInit } from '@angular/core';
import { DynamicColDirective, DynamicGridDirective, LibLabelTextDirective, PopupDirective, RequiredDirective, SelectDirective, TabDirective, TabsDirective, TextareaDirective } from 'toi-libraries';
import { SharedApiService } from '../../shared/shared-services/shared-api.service';
import { count, forkJoin, map, Subject, takeUntil, tap } from 'rxjs';
import { LoaderService } from '../../shared/shared-services/loader.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FrequencyIconState, ViewPoliciesReqModel } from '../../core/modals/employee-details';
import { FileuploadDirective } from '../../shared/shared-directives/fileupload.directive';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { OCAService } from '../../services/oca/oca.service';

@Component({
  selector: 'app-oca',
  standalone: true,
  imports: [DynamicGridDirective, TabDirective, TabsDirective, DynamicColDirective, CommonModule, TextareaDirective, LibLabelTextDirective, FileuploadDirective, PopupDirective, ReactiveFormsModule, SelectDirective, FormsModule],
  templateUrl: './oca.component.html',
  styleUrl: './oca.component.scss',
  providers: [DatePipe],
})
export class OcaComponent implements OnInit, OnDestroy {

  mycompfreqList: any[] = [];
  viewpoliciesList: any[] = [];

  dailyList: any[] = [];
  weeklyList: any[] = [];
  fortnightlyList: any[] = [];
  monthlyList: any[] = [];
  quarterlyList: any[] = [];
  halfYearlyList: any[] = [];
  yearlyList: any[] = [];

  activeFreq: any;
  ocaHeadText = 'DAILY';
  ocasumbitButton = true;
  WTypeapproveAll = true;
  ReadRemarks = false;

  isOutDatedWeek = false;
  isOutDatedFort = false;
  isOutDatedMonth = false;
  isOutDatedQuat = false;
  isOutDateHalf = false;
  isOutDatedAnn = false;

  queryDate: Date = new Date();
  queryDateStr: string = '';

  activeTab: string = 'DASHBOARD';
  detailsByDate: boolean = false;

  frequency: string = '';

  allowedExtensions: string[] = [];

  showPopup = false; // popup visibility
  showInfo = false;
  eurekafileSuccessMsg: boolean = false;
  eurekafileErrorMsg: boolean = false;

  destroy$ = new Subject<boolean>();
  complianceForm!: FormGroup;
  selectedCompany: any;
  selectedDepartment: any;
  selectedFunction: any;
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

  constructor(private sharedApiService: SharedApiService, private loader: LoaderService, private datePipe: DatePipe, private fb: FormBuilder, private ocaService: OCAService) { };

  ngOnInit(): void {
    this.complianceForm = this.fb.group({
      questions: this.fb.array([])
    });

    this.mycompfreq();
    // if(this.activeTab == 'DASHBOARD') this.getCompanyListData();
  }

  get questionsFA(): FormArray {
    return this.complianceForm.get('questions') as FormArray;
  }

  createQuestionForm(item: any[]): FormGroup {
    const fg = this.fb.group({
      questionId: [item[1]],
      questionText: [item[3]],
      answer: ['', Validators.required],
      remark: [''],
      file: [null],
      frequencyActive: [true],
      userRemark: [item[6]],
      approverOID: [item[7]],
      approverFeedback: [item[8]],
      approverRemarks: [item[9]],
      createdBy: [item[10]],
      modifyBy: [item[12]],
      feedbackStatus: [item[16]],
      userAttachment: [item[27]],
      approverAttachment: [item[21]],
    });

    // Conditional validation: NO / NA → remark required
    fg.get('answer')?.valueChanges.subscribe(value => {
      const remarkCtrl = fg.get('remark');

      if (value === 'No' || value === 'NA') {
        remarkCtrl?.setValidators([Validators.required]);
      } else {
        remarkCtrl?.clearValidators();
      }
      remarkCtrl?.updateValueAndValidity();
    });

    return fg;
  }

  canSubmit(): boolean {
    if (!this.isFrequencyActive(this.activeFreq)) {
      return false;
    }

    let atLeastOneAnswered = false;

    for (const q of this.questionsFA.controls) {
      const ans = q.get('answer')?.value;
      const rem = q.get('remark')?.value;

      // skip unanswered questions
      if (!ans) {
        continue;
      }

      atLeastOneAnswered = true;

      // validate only answered ones
      if ((ans === 'No' || ans === 'NA') && !rem) {
        return false;
      }
    }

    return atLeastOneAnswered;
  }




  // get questionsArray(): FormArray {
  //   return this.complianceForm.get('questions') as FormArray;
  // }

  // get isAnyAnswerSelected(): boolean {
  //   return this.questionsArray.controls.some(
  //     ctrl => !!ctrl.get('answer')?.value
  //   );
  // }

  onTabChange(event: Event | string) {
    if (event === 'MY COMPLIANCE') {
      this.detailsByDate = false;
      this.mycompfreq();
      this.callAllFrequenciesInParallel();
    }
  };

  detailsByDateShowHide() {
    this.detailsByDate = true;
  }

  backBtn() {
    this.detailsByDate = false;
  }

  // ------------------------- popup ---------------------- 
  openPopup() {
    this.showPopup = true;
  }
  closePopup() {
    this.showPopup = false;
  }
  openInfo() {
    this.showInfo = true;
  }
  closeInfo() {
    this.showInfo = false;
  }
  // ------------------------- popup ---------------------- 

  // Final list with icons
  mycompfreqListWithIcons: {
    value: any; icons: any[];
  }[] = [];

  mycompfreq() {
    this.loader.show();
    this.sharedApiService.mycompfreq().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        if (res[0].status === 'success') {
          this.loader.hide();
          this.mycompfreqList = res[0].data;
          console.log('mycompfreq', this.mycompfreqList);

          this.prepareListWithIcons();

        } else {
          this.loader.hide();
          console.log('Data not found');
        }
      },
      error: (err) => {
        this.loader.hide();
        console.log('An unexpected error occurred', err);
      }
    })
  }

  prepareListWithIcons(): void {
    this.mycompfreqListWithIcons = this.mycompfreqList.map(item => ({
      value: item,
      icons: [
        true,
        false,
        false,
        false,
        false
      ]
    }));

    console.log('mycompfreqListWithIcons', this.mycompfreqListWithIcons)
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  viewpolicies(frequency: ViewPoliciesReqModel['frequency']): void {

    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth();
    const year = today.getFullYear();

    this.activeFreq = frequency;

    // reset flags
    this.isOutDatedWeek = false;
    this.isOutDatedFort = false;
    this.isOutDatedMonth = false;
    this.isOutDatedQuat = false;
    this.isOutDateHalf = false;
    this.isOutDatedAnn = false;

    switch (frequency) {

      case '1': // DAILY
        this.ocaHeadText = 'DAILY';
        this.queryDateStr = this.format(today);
        this.enable();
        break;

      case '2': { // WEEKLY
        this.ocaHeadText = 'WEEKLY';
        const allowed = [0, 1, 2, 5, 6].includes(today.getDay());
        this.queryDateStr = this.format(today);
        this.setValidity(allowed, 'week');
        break;
      }

      case '3': { // FORTNIGHTLY
        this.ocaHeadText = 'FORTNIGHTLY';
        const payload = this.buildViewPoliciesPayload('3');
        this.queryDateStr = payload.date;
        const valid = day >= 1;
        this.setValidity(valid, 'fort');
        break;
      }

      case '4': { // MONTHLY
        this.ocaHeadText = 'MONTHLY';
        const payload = this.buildViewPoliciesPayload('4');
        this.queryDateStr = payload.date;
        const valid = (day >= 26 || day <= 11);
        this.setValidity(valid, 'month');
        break;
      }

      case '5': { // QUARTERLY
        this.ocaHeadText = 'QUARTERLY';
        const payload = this.buildViewPoliciesPayload('5');
        this.queryDateStr = payload.date;
        const valid = true;
        this.setValidity(valid, 'quarter');
        break;
      }

      case '6': { // HALF YEARLY
        this.ocaHeadText = 'HALF YEARLY';
        const payload = this.buildViewPoliciesPayload('6');
        this.queryDateStr = payload.date;
        const valid = true;
        this.setValidity(valid, 'half');
        break;
      }

      case '7': { // ANNUALLY
        this.ocaHeadText = 'ANNUALLY';
        const payload = this.buildViewPoliciesPayload('7');
        this.queryDateStr = payload.date;
        const valid = true;
        this.setValidity(valid, 'ann');
        break;
      }
    }

    const req: ViewPoliciesReqModel = {
      frequency,
      role: '1',
      status: "'L','C','A','P'",
      date: this.queryDateStr
    };

    this.loader.show();
    this.sharedApiService.viewpolicies(req).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res:any) => {
        if (res[0].status === 'success') {
          this.loader.hide();
          this.detailsByDate = true;
          this.viewpoliciesList = res[0].data;

          // console.log('viewpoliciesList', this.viewpoliciesList);

          // this.patchForm(this.viewpoliciesList);

          // for submit Button Color change disabled
          // this.complianceForm.markAsPristine();
          // this.complianceForm.markAsUntouched();

          this.questionsFA.clear();
          this.viewpoliciesList.forEach((item: any[]) => {
            const qForm = this.createQuestionForm(item);

            // Disable form if frequency not allowed
            if (!this.isFrequencyActive(this.activeFreq)) {
              qForm.disable({ emitEvent: false });
            }
            this.questionsFA.push(qForm);
          });

          this.patchQuestionsData(this.viewpoliciesList);

        } else {
          this.loader.hide();
          console.log('Data not found');
        }
      },
      error: (err) => {
        this.loader.hide();
        console.log('An unexpected error occurred', err);
      }
    });
  }

  // patchForm(data: any[]) {
  //   this.questionsFA.clear();

  //   data.forEach(item => {
  //     const fg = this.fb.group({
  //       questionTitle: [item[18]],
  //       questionText: [item[3]],
  //       // answer: [item[5] || '', Validators.required],
  //       answer: [{ value: item[5] || '', disabled: this.isFrequencyActive(this.activeFreq) && (item[8] === 'Yes' || item[8] === 'No' || item[8] === 'NA') }],
  //       remark: [item[6] || ' '],

  //       file: [null],
  //       backendFile: [item[27] || '']
  //     });

  //     // this.applyConditionalValidation(fg);
  //     this.questionsFA.push(fg);
  //   });
  // }

  patchQuestionsData(apiData: any[]) {
    apiData.forEach((item, index) => {
      const fg = this.questionsFA.at(index) as FormGroup;
      if (!fg) return;
      fg.patchValue({
        answer: item[5],
        remark: item[6] ?? '',
        // userRemark: item[6],
        approverFeedback: item[8],
        approverRemarks: item[9],
        feedbackStatus: item[16],
        userAttachment: item[27],
        approverAttachment: item[21],
        file: item[27] ? { name: item[27] } : null
      });

      // 🔥 Force validation update
      fg.updateValueAndValidity({ emitEvent: false });
    });
  }

  private buildViewPoliciesPayload(frequency: ViewPoliciesReqModel['frequency'], baseDate: Date = new Date()): ViewPoliciesReqModel {
    const day = baseDate.getDate();
    const month = baseDate.getMonth();
    const year = baseDate.getFullYear();
    let date: Date;

    switch (frequency) {

      case '1':
      case '2':
        date = baseDate;
        break;

      case '3': // FORTNIGHTLY
        if (day >= 13 && day <= 25) date = new Date(year, month, 13);
        else if (day >= 26) date = new Date(year, month, 26);
        else date = new Date(year, month - 1, 26);
        break;

      case '4': // MONTHLY
        date = day <= 25
          ? new Date(year, month - 1, 26)
          : new Date(year, month, 26);
        break;

      case '5': { // QUARTERLY
        let qMonth: number;
        let qYear = year;

        if (month < 2 || (month === 2 && day <= 25)) {
          // Jan–Mar(≤25) → DEC previous year
          qMonth = 11;
          qYear = year - 1;
        } else if (month < 5) {
          qMonth = 2;  // MAR
        } else if (month < 8) {
          qMonth = 5;  // JUN
        } else if (month < 11) {
          qMonth = 8;  // SEP
        } else {
          qMonth = 11; // DEC
        }

        date = new Date(qYear, qMonth, 26);
        break;
      }

      case '6': { // HALF YEARLY
        let hMonth: number;
        let hYear = year;

        if (month < 2 || (month === 2 && day <= 25)) {
          // Jan–Feb / Mar(≤25) → SEP previous year
          hMonth = 8;
          hYear = year - 1;
        } else if (month < 8) {
          hMonth = 2; // MAR
        } else {
          hMonth = 8; // SEP
        }

        date = new Date(hYear, hMonth, 26);
        break;
      }

      case '7': // ANNUALLY
        date = new Date(month < 2 ? year - 1 : year, 2, 26);
        break;
    }

    return {
      frequency,
      role: '1',
      status: "'L','C','A','P'",
      date: this.format(date!)
    };
  }

  // =====================================================
  // PARALLEL API CALLS (7 TIMES)
  // =====================================================

  // ---------------------------- show icons by conditions -----------------------------------

  frequencyIcons: Record<ViewPoliciesReqModel['frequency'], FrequencyIconState> = {} as any;
  // Initialize/reset icons for a frequency
  private initFrequencyIcons(freq: ViewPoliciesReqModel['frequency']): void {
    // this.frequencyIcons[freq] = {
    //   showActionIcons: false,
    //   showNoActionIcons: false,
    //   showReviewByManager: false,
    //   showGreenIcons: false,
    //   showRedIcons: false
    // };
  }

  // ---------------------------- show icons by conditions ----------------------------------- 

  private frequencyMap: Record<ViewPoliciesReqModel['frequency'], any[]> = {
    '1': this.dailyList,
    '2': this.weeklyList,
    '3': this.fortnightlyList,
    '4': this.monthlyList,
    '5': this.quarterlyList,
    '6': this.halfYearlyList,
    '7': this.yearlyList
  };

  callAllFrequenciesInParallel(): void {

    const freqs: ViewPoliciesReqModel['frequency'][] =
      ['1', '2', '3', '4', '5', '6', '7'];

    const calls = freqs.map(f =>
      this.sharedApiService.viewpolicies(
        this.buildViewPoliciesPayload(f)
      )
    );

    this.loader.show();
    forkJoin(calls)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: responses => {
          this.loader.hide();
          responses.forEach((res, index) => {
            const freq = freqs[index];
            this.frequencyMap[freq].length = 0;        // clear old data
            this.frequencyMap[freq].push(...res);      // assign new data
          });

          // console.log('frequencyMap', this.frequencyMap);
          // this.myComplienceIcons(this.frequencyMap);

          this.getAllArrays(responses);

        },
        error: () => this.loader.hide()
      });
  }


  // --------------------------------------------------------------------- 

  showActionIcons = false;
  showNoActionIcons = false;
  showReviewByManager = true;
  showGreenIcons = true;
  showRedIcons = false;

  getAllArrays(getAllArrayResponse: any[]) {

    const lists = [
      getAllArrayResponse[0]?.[0]?.data ?? [], // daily
      getAllArrayResponse[1]?.[0]?.data ?? [], // weekly
      getAllArrayResponse[2]?.[0]?.data ?? [], // fortnightly
      getAllArrayResponse[3]?.[0]?.data ?? [], // monthly
      getAllArrayResponse[4]?.[0]?.data ?? [], // quarterly
      getAllArrayResponse[5]?.[0]?.data ?? [], // half-yearly
      getAllArrayResponse[6]?.[0]?.data ?? []  // yearly
    ];

    // Reset flags before processing
    this.showActionIcons = false;
    this.showNoActionIcons = false;
    this.showReviewByManager = true;
    this.showGreenIcons = true;
    this.showRedIcons = false;

   lists.forEach((list, index) => {
    if (!list.length) return;
    this.processFrequencyList(list, index);
  });

    // console.log('ReviewByManager:', this.showReviewByManager);
  }


  private processFrequencyList(list: any[], count: number): void {
    console.log('7list', list)
    this.mycompfreqListWithIcons[count].icons = [
      true,   // green
      false,  // red
      false,  // action
      false,  // not acted
      false   // reviewed
    ];

    list.forEach((row: any) => {
      const col5 = (row[5] ?? '').toString().trim();
      const col8 = (row[8] ?? '').toString().trim();
      const col16 = (row[16] ?? '').toString().trim();
      if (col5 !== 'Yes') {
        this.mycompfreqListWithIcons[count].icons[0] = false;
      }

      // NON COMPLIENCE 
      if (col5 === 'No') {
        this.mycompfreqListWithIcons[count].icons[1] = true;
      }

      // ACTION ICON
      if (col5 === '' && (col8 === '' || col8 === 'Not Acted')) {
        this.mycompfreqListWithIcons[count].icons[2] = true;
      }

      // REVIEW BY MANAGER
    if (col16 === 'A') {
      this.mycompfreqListWithIcons[count].icons[4] = true;
    }



    })
  }

  // --------------------------------------------------------------------- 

  // =====================================================
  // HELPERS
  // =====================================================
  private format(d: Date): string {
    return this.datePipe.transform(d, 'dd-MMM-yyyy')!.toUpperCase();
  }

  private enable() {
    this.ocasumbitButton = true;
    this.WTypeapproveAll = true;
    this.ReadRemarks = false;
  }

  private setValidity(valid: boolean, type: string) {
    this.ocasumbitButton = valid;
    this.WTypeapproveAll = valid;
    this.ReadRemarks = !valid;

    if (!valid) {
      if (type === 'week') this.isOutDatedWeek = true;
      if (type === 'fort') this.isOutDatedFort = true;
      if (type === 'month') this.isOutDatedMonth = true;
      if (type === 'quarter') this.isOutDatedQuat = true;
      if (type === 'half') this.isOutDateHalf = true;
      if (type === 'ann') this.isOutDatedAnn = true;
    }
  }

  // ------------------------------- for button colors ------------------------------ 

  isFrequencyActive(
    frequency: ViewPoliciesReqModel['frequency'],
    baseDate: Date = new Date()
  ): boolean {

    const day = baseDate.getDate();
    const month = baseDate.getMonth();
    const year = baseDate.getFullYear();

    // reusable 26 → 11 window check
    const is26to11 = () => day >= 26 || day <= 11;

    switch (frequency) {

      case '1': // DAILY
        return true;

      case '2': { // WEEKLY → Fri to Tue
        const dow = baseDate.getDay(); // 0=Sun ... 6=Sat
        return dow === 5 || dow === 6 || dow === 0 || dow === 1 || dow === 2;
      }

      case '3': // FORTNIGHTLY
        return (day >= 13 && day <= 25) || is26to11();

      case '4': // MONTHLY
        return is26to11();

      case '5': { // QUARTERLY
        const qStartMonth = this.getQuarterStartMonth(baseDate);
        return month === qStartMonth && is26to11();
      }

      case '6': { // HALF YEARLY
        const hStartMonth = this.getHalfYearStartMonth(baseDate);
        return month === hStartMonth && is26to11();
      }

      case '7': { // YEARLY
        return month === 2 && is26to11(); // March
      }
    }

    return false;
  }

  private getQuarterStartMonth(d: Date): number {
    const m = d.getMonth();
    if (m <= 2) return 11; // DEC
    if (m <= 5) return 2;  // MAR
    if (m <= 8) return 5;  // JUN
    return 8;              // SEP
  }

  private getHalfYearStartMonth(d: Date): number {
    return d.getMonth() < 8 ? 2 : 8; // MAR or SEP
  }

  // ------------------------------- for button colors ------------------------------ 

  // -------------------------- My Complience PDF File Upload -------------------------

  // ------------------------- Inner Form Code -------------------------

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
            // Update form control
            this.questionsFA.at(index).patchValue({
              file: file,
              backendFile: res[0].filePath || '' // save backend returned path
            });
            console.log('Upload success:', res);
          } else {
            console.log('Data not found');
          }
        },
        error: (err) => {
          this.loader.hide();
          console.log('An unexpected error occurred', err);
        }
      });
  }

  downloadFile(base64: string, filename = 'file.pdf') {
    console.log(base64)
    // FIX padding
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
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }


  deleteFile(index: number) {
    this.questionsFA.at(index).get('file')?.reset();
  }

  preparePayload() {

    const payloadValuesShouldGo = {
      // inArrays: item[2],
      // inArrays: item[5],
      // inArrays: item[6],
      // inArrays: item[7],
      // inArrays: item[8],
      // inArrays: item[9],
      // inArrays: item[10],
      // inArrays: item[12],
      // inArrays: item[16],
      // inArrays: item[17],
      // inArrays: item[21],
    }

    // return {
    //   responses: this.questionsArray.value.map((q: any) => ({
    //     question: q.questionText,
    //     answer: q.answer,
    //     remark: q.remark,
    //     file: q.file || q.backendFile
    //   }))
    // };
  }

  buildFeedbackPayload(): string {
    // const policyId = '202602741598';
    // const deptId = '17306';
    // const status = 'Not Acted';
    // const dash = '-';
    // const createdBy = '28821';
    // const updatedBy = '28821';
    // const level = 'L';
    // const lastFlag = 'NA';

    const feedbackArr = this.questionsFA.controls
      .filter(q => q.get('answer')?.value) // only answered
      .map(q => {

        console.log('mypayload', this.questionsFA.controls);

        const questionId = q.get('questionId')?.value;
        const answer = q.get('answer')?.value;
        const status = q.get('answer')?.value;
        const remark = q.get('remark')?.value || '';
        // const fileName = q.get('file')?.value?.name || 'NA';

        const approverOID = q.get('approverOID')?.value
        const approverFeedback = q.get('approverFeedback')?.value
        const approverRemarks = q.get('approverRemarks')?.value
        const createdBy = q.get('createdBy')?.value;
        const modifyBy = q.get('modifyBy')?.value;
        const feedbackStatus = q.get('feedbackStatus')?.value;
        // const userAttachment = q.get('userAttachment')?.value;
        const userAttachment = q.get('file')?.value?.name || 'NA';
        const approverAttachment = q.get('approverAttachment')?.value;

        return `feedback=${[
          remark,
          approverOID,
          approverFeedback,
          encodeURIComponent(remark),
          questionId,
          encodeURIComponent(status),
          approverRemarks,
          createdBy,
          modifyBy,
          feedbackStatus,
          userAttachment,
          approverAttachment
        ].join(',')}`;
      });

    return feedbackArr.join('&');
  }


  insertfeedback() {
    if (!this.canSubmit()) {
      this.complianceForm.markAllAsTouched();
      return;
    }

    const payload = this.buildFeedbackPayload();
    this.loader.show();

    this.sharedApiService.insertfeedback(payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        if (res) {
          this.loader.hide();
          this.showPopup = true;
          this.eurekafileSuccessMsg = true;
          this.eurekafileErrorMsg = false;
          console.log(res);
        } else {
          this.loader.hide();
          this.showPopup = false;
          this.eurekafileErrorMsg = true;
          this.eurekafileSuccessMsg = false;
          console.log('Data not found');
        }
      },
      error: (err) => {
        this.loader.hide();
        this.showPopup = false;
        this.eurekafileErrorMsg = true;
        this.eurekafileSuccessMsg = false;
        console.log('An unexpected error occurred', err);
      }
    })
  }
  // ------------------------- Inner Form Code -------------------------

  // -------------------------- My Complience PDF File Upload -------------------------


  companyData: Array<any> = [];
  compCode: any;
  deptCode: any;
  functionCode: any;
  isShowDept: boolean = true;
  isShowFunc: boolean = true;
  dashBoard: any = {};

  getCompanyListData(): void {
    this.ocaService.getCompanyListDetails().pipe(
      map((res: any) => res?.[0]?.data ?? []),
      tap((companies: any[]) => {
        if (!companies.length) return;
        this.companyData = companies;
        const company1000 = companies.find(c => c[1] === 1000);
        if (company1000) {
          this.compCode = company1000[1];
          // this.setDepartment(this.compCode);
          this.isShowDept = true;
          this.isShowFunc = true;
        } else {
          this.compCode = companies[0][1];
          this.deptCode = '-';
          this.functionCode = '-';
          // this.getFrequencywiseDate();
        }
        this.dashBoard.company = companies[0][1];
      })
    ).subscribe({
      error: () => {
        console.error('Error fetching company list');
      }
    });
  }
}
