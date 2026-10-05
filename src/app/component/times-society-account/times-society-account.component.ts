import { CommonModule, CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DateDirective, DynamicColDirective, DynamicGridDirective, LibLabelTextDirective, RequiredDirective, SelectDirective, TabDirective, TabsDirective, UiUnderlineDirective } from 'toi-libraries';
import { CommonService } from '../../core/services/common.service';
import { DelhiAssoStateMAccReqModel, EmployeeDetailsModel, MumbaiAssoSavingAccReqModel } from '../../core/modals/employee-details';
import { SharedApiService } from '../../shared/shared-services/shared-api.service';
import { Subject, takeUntil } from 'rxjs';
import { LoaderService } from '../../shared/shared-services/loader.service';
import { UtilityService } from '../../shared/shared-services/utility.service';

@Component({
  selector: 'app-times-society-account',
  standalone: true,
  imports: [UiUnderlineDirective, DateDirective, LibLabelTextDirective, ReactiveFormsModule, DynamicGridDirective, SelectDirective, RequiredDirective, CommonModule, TabsDirective, TabDirective, DynamicColDirective, CurrencyPipe, NgClass],
  templateUrl: './times-society-account.component.html',
  styleUrl: './times-society-account.component.scss',
  providers: [DatePipe]
})
export class TimesSocietyAccountComponent implements OnDestroy {

  getEmployeeDetails: EmployeeDetailsModel;
  // activeTab: string = 'SAVING ACCOUNT'; // default
  // activeTab: string = 'VIEW A/C BALANCE'; // default
  switchTabBySociety: boolean = false;
  switchTabBySocietyWrapper: boolean = false;

  detailsOfLedgerAccountShow: boolean = false;

  // societyCtrl = new FormControl('');
  activeTab!: string;
  @ViewChild('societySelect') societySelect!: ElementRef<HTMLSelectElement>;

  accountList: any[] = [
    { label: 'Mumbai Society', id: 'MSA' },
    { label: 'Delhi Society', id: 'DSA' }
  ];

  transactionsList: any[] = [];
  lasttransactionsList: any[] = [];
  delhiSAccStatList: [] = [];
  transitionMonthList: any[] = [];
  fileList: string[] = [];
  fileData: string[] = [];

  memberbalancelist: any[] = [];

  mumbaiSocietySavingAccForm!: FormGroup;
  delhiSocietyAccStatementForm!: FormGroup;
  societyForm!: FormGroup;

  destroy$ = new Subject<boolean>();

  maxDate = new Date().toISOString().split('T')[0];

  ledgerAccountType: string = '';
  transactionsListByLedger: any[] = [];

  // get getMembrBalListTotalAmt() {
  //   return this.memberbalancelist.reduce((sum, item) => sum + (Number(item?.[2]) || 0), 0);
  // }

  get getMembrBalListTotalCreditAmt() {
    return this.memberbalancelist.reduce((sum, item) => {
      const value = Number(item?.[2]) || 0;
      return value > 0 ? sum + value : sum;
    }, 0);
  }

  get getMembrBalListTotalDebitAmt() {
    return this.memberbalancelist
      .filter(item => Number(item?.[2]) < 0)
      .reduce((sum, item) => sum + Math.abs(Number(item?.[2]) || 0), 0);
  }

  constructor(private formBuilder: FormBuilder, private commonService: CommonService, private sharedApiservice: SharedApiService, private loader: LoaderService, private datePipe: DatePipe, private societyState: UtilityService) {
    const result = this.commonService.getEmpDetails();
    this.getEmployeeDetails = result;

    const today = new Date();
    const oneMonthBefore = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    this.mumbaiSocietySavingAccForm = this.formBuilder.group({
      fromDate: ['', [Validators.required]],
      toDate: ['', [Validators.required]],
      tempSapNo: [this.getEmployeeDetails?.sapNumber, [Validators.required]],
    })

    this.delhiSocietyAccStatementForm = this.formBuilder.group({
      fromDate: [this.datePipe.transform(oneMonthBefore, 'yyyy-MM-dd'), [Validators.required]],
      toDate: [this.datePipe.transform(today, 'yyyy-MM-dd'), [Validators.required]],
    })

    this.societyForm = this.formBuilder.group({
      socityType: [''],
    })
  };

  ngAfterViewInit(): void {
    if (this.societyState.selectedSociety) {
      // 🔥 THIS IS THE KEY LINE
      this.societySelect.nativeElement.value =
        this.societyState.selectedSociety;
      this.applySocietyLogic(this.societyState.selectedSociety);
    }
  }

  delhiBackBtn() {
    this.detailsOfLedgerAccountShow = false
    this.delhiSocietyAccStatementForm.reset();
  }

  onTabChange(tab: string) {
    if (tab === 'SAVING ACCOUNT') {
      console.log('SAVING ACCOUNT');
    }
    if (tab === 'VIEW A/C BALANCE') {
      console.log('VIEW A/C BALANCE');

      this.delhiSocietyAccStatementForm.reset();
      this.delhiSAccStatList = [];
      this.transactionsListByLedger = [];
    }
    if (tab === 'VIEW A/C STATEMENT') {
      console.log('VIEW A/C STATEMENT');

      this.delhiSocietyAccStatementForm.reset();
      this.delhiSAccStatList = [];
      this.transactionsListByLedger = [];

      this.getmembertrans();
    }
    if (tab === 'DOWNLOAD') {
      console.log('DOWNLOAD');
      this.allforms();
    }
  }

  selectSocity(event: any) {
    const value = event.target.value;
    this.societyState.selectedSociety = value;
    this.applySocietyLogic(value);
  }

  private applySocietyLogic(value: string) {
    if (value === 'MSA') {
      this.switchTabBySociety = true;
      this.switchTabBySocietyWrapper = true;
      this.activeTab = 'SAVING ACCOUNT';
      this.alltransactions();
    }
    if (value === 'DSA') {
      this.switchTabBySociety = false;
      this.switchTabBySocietyWrapper = true;
      this.activeTab = 'VIEW A/C BALANCE';
      this.gettransmonth();
      this.getmembertrans();
      this.getmemberbalance();
    }
  }

  ledgerAccountInfo(ledgerAccName: string) {
    this.transactionsListByLedger = [];
    this.ledgerAccountType = ledgerAccName;
    this.detailsOfLedgerAccountShow = true;
  }

  getNet(item: any): number {
    return (
      (Number(item[7]) || 0) +
      (Number(item[5]) || 0) -
      (Number(item[4]) || 0)
    );
  }

  alltransactions() {
    this.sharedApiservice.alltransactions().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        if (res[0].status === 'success') {
          this.transactionsList = res[0].transactions;
          this.lasttransactionsList = res[0].lasttransactions;
          console.log(res[0]);
        } else {
          console.log('Data not found');
        }
      },
      error: (err) => {
        console.log('An unexpected error occurred', err);
      }
    })
  }

  gettransmonth() {
    this.sharedApiservice.gettransmonth().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        if (res[0].status === 'success') {
          this.transitionMonthList = res[0].data;
          console.log(res);
        } else {
          console.log('Data not found');
        }
      },
      error: (err) => {
        console.log('An unexpected error occurred', err);
      }
    })
  }

  getmemberbalance() {
    this.sharedApiservice.getmemberbalance().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        if (res[0].status === 'success') {
          console.log(res);
          this.memberbalancelist = res[0].data;
        } else {
          console.log('Data not found')
        }
      },
      error: (err) => {
        console.log('An unexpected error occurred', err);
      }
    })
  }

  mumbaiSocietySavingAccFormSubmit() {
    if (this.mumbaiSocietySavingAccForm.valid) {
      const mumSocSavAccForm: MumbaiAssoSavingAccReqModel = {
        fromDate: this.datePipe.transform(this.mumbaiSocietySavingAccForm.value['fromDate'], 'dd-MMM-yyyy')?.toUpperCase() ?? '',
        toDate: this.datePipe.transform(this.mumbaiSocietySavingAccForm.value['toDate'], 'dd-MMM-yyyy')?.toUpperCase() ?? '',
        tempSapNo: this.getEmployeeDetails?.sapNumber,
      }
      this.loader.show();
      this.sharedApiservice.getransact(mumSocSavAccForm).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res) => {
          if (res[0].status === 'success') {
            this.loader.hide();
            this.transactionsList = res[0].data;
            // this.mumbaiSocietySavingAccForm.reset();
          } else {
            this.loader.hide();
            console.log('Data not Found');
          }
        },
        error: (err) => {
          this.loader.hide();
          console.log('An unexpected error occurred', err);
        }
      })
    } else {
      this.mumbaiSocietySavingAccForm.markAllAsTouched();
    }
  }

  getmembertrans() {
    if (this.delhiSocietyAccStatementForm.valid) {
      const delSocStateAccForm: DelhiAssoStateMAccReqModel = {
        fromDate: this.datePipe.transform(this.delhiSocietyAccStatementForm.value['fromDate'], 'dd-MMM-yyyy')?.toUpperCase() ?? '',
        toDate: this.datePipe.transform(this.delhiSocietyAccStatementForm.value['toDate'], 'dd-MMM-yyyy')?.toUpperCase() ?? '',
      }
      this.loader.show();
      this.sharedApiservice.getmembertrans(delSocStateAccForm).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res) => {
          if (res[0].status === 'success') {
            this.loader.hide();
            console.log(res);
            this.delhiSAccStatList = res[0].data;
            this.transactionsListByLedger = this.delhiSAccStatList.filter(item => item[2] === this.ledgerAccountType);
            console.log('transactionsListByLedger', this.transactionsListByLedger);
            // this.delhiSocietyAccStatementForm.reset();
          } else {
            this.loader.hide();
            console.log('Data not Found');
          }
        },
        error: (err) => {
          this.loader.hide();
          console.log('An unexpected error occurred', err);
        }
      })
    } else {
      this.delhiSocietyAccStatementForm.markAllAsTouched();
    }
  }

  allforms() {
    this.sharedApiservice.allforms().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        if (res[0].status === 'success') {
          this.fileList = res[0].data;
          console.log('allforms', res);
        } else {
          console.log('Data not found');
        }
      },
      error: (err) => {
        console.log('An unexpected error occurred', err);
      }
    })
  }

  file(fileName: string) {
    this.loader.show();
    this.sharedApiservice.file(fileName).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        if (res[0].status === 'success') {
          this.loader.hide();
          console.log(res[0]);
          this.fileData = res[0].data;
          const fileName = this.fileData[0][0];
          const base64 = this.fileData[0][1];
          this.downloadPdf(base64, fileName);
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

  downloadPdf(base64: string, fileName: string) {
    // Remove base64 prefix if backend sends it
    const cleanBase64 = base64.includes(',')
      ? base64.split(',')[1]
      : base64;

    const byteCharacters = atob(cleanBase64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();

    window.URL.revokeObjectURL(url);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

}
