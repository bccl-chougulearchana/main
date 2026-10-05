import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DateDirective, LibLabelTextDirective, MobileDirective, PopupDirective, RequiredDirective, TelDirective, TextDirective, UiUnderlineDirective } from 'toi-libraries';
import { SharedApiService } from '../../shared/shared-services/shared-api.service';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { CommonService } from '../../core/services/common.service';
import { EmployeeDetailsModel, HospitalizationReqModel } from '../../core/modals/employee-details';
import { LoaderService } from '../../shared/shared-services/loader.service';

@Component({
  selector: 'app-hospitalization',
  standalone: true,
  imports: [UiUnderlineDirective, LibLabelTextDirective, LibLabelTextDirective, DateDirective, TelDirective, TextDirective, MobileDirective, RequiredDirective, ReactiveFormsModule, PopupDirective, CommonModule],
  templateUrl: './hospitalization.component.html',
  styleUrl: './hospitalization.component.scss',
  providers: [DatePipe]
})

export class HospitalizationComponent implements OnDestroy {

  destroy$ = new Subject<boolean>();
  hospitalizationForm: FormGroup;

  getEmployeeDetails: EmployeeDetailsModel = {
    birthdate: '',
    companyCode: '',
    firstName: '',
    activityName: '',
    timescapeUserOID: '',
    activityCode: '',
    deptGroupName: '',
    payId: '',
    surname: '',
    locationName: '',
    joiningdate: '',
    locationCode: '',
    signOnStatus: '',
    sapNumber: '',
    gender: '',
    userType: '',
    panNumber: '',
    deptGroup: '',
    portalId: '',
    branchName: '',
    emailId: '',
    branchCode: '',
    pfNumber: '',
    designation: '',
    payrollType: '',
    empFullName: '',
    companyName: '',
    title: '',
    fullName: ''
  }

  responseSuccessStatus: boolean = false;
  responseErrorStatus: boolean = false;

  // responseSuccessMessage: string = ''; for dynamic use only! 
  // responseErrorMessage: string = ''; for dynamic use only!

  showPopup = false; // popup visibility
  isoDate: any;

  constructor(private formBuilder: FormBuilder, private sharedApiService: SharedApiService, private commonService: CommonService, private loaderService: LoaderService, private datePipe: DatePipe) {
    const result = this.commonService.getEmpDetails();
    this.getEmployeeDetails = result;

    const today = new Date();
    this.isoDate = today.toISOString().split('T')[0];

    this.hospitalizationForm = this.formBuilder.group({
      memberId: [this.getEmployeeDetails.sapNumber],
      patientName: [''],
      hospitalname: [''],
      dateofadmission: [this.isoDate],
      reason: [''],
      recipientsMailId: [this.getEmployeeDetails.emailId],
      phoneNumber: [''],
    })
  };

  // ------------------------- popup ---------------------- 
  openPopup() {
    this.showPopup = true;
  }
  closePopup() {
    this.showPopup = false;
  }
  // ------------------------- popup ---------------------- 

  hospitalizationFormSubmit() {
    if (this.hospitalizationForm.valid) {
      this.loaderService.show();
      const hospitalObject: HospitalizationReqModel = {
        memberId: this.getEmployeeDetails.sapNumber,
        hospitalname: this.hospitalizationForm.value['hospitalname'],
        patientName: this.hospitalizationForm.value['patientName'],
        phoneNumber: this.hospitalizationForm.value['phoneNumber'],
        reason: this.hospitalizationForm.value['reason'],
        dateofadmission: this.datePipe.transform(this.isoDate, 'dd-MMM-yyyy')?.toUpperCase() ?? '',
        recipientsMailId: this.getEmployeeDetails.emailId,
      }
      this.sharedApiService.hospitalizationSubmitApi(hospitalObject).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          if (res === true) {
            this.loaderService.hide();
            this.responseSuccessStatus = true;
            this.showPopup = true;
            this.hospitalizationForm.reset();
            console.log('hospitalizationFormResponse', res);
          } else {
            this.loaderService.hide();
            this.showPopup = true;
            this.responseErrorStatus = true;
            console.log('No response Found');
          }
        },
        error: (err) => {
          this.loaderService.hide();
          this.showPopup = true;
          this.responseErrorStatus = true;
          console.log('An unexpected error occured', err);
        }
      })
    } else {
      this.hospitalizationForm.markAllAsTouched();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

}
