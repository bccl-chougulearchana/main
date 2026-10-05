import { ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UiDirectivesModule } from 'toi-libraries'; 
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { ScholarshipApiService } from '../../../services/scholarship/scholarship_api.service';
import { HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Location } from '@angular/common';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { LoaderService } from '../../../shared/shared-services/loader.service'; 
import { CommonDialogService } from '../../../shared/shared-services/common-dialog.service';  
import { CommonService } from '../../../core/services/common.service';
import { FileuploadDirective } from '../../../shared/shared-directives/fileupload.directive';

export function maxZeroValidator(control: AbstractControl): ValidationErrors | null {
  const value = parseFloat(control.value);
  if (!isNaN(value) && value === 0) {
    return { maxZero: true };
  }
  return null;
}

export function crossFieldRequiredValidator(
  field1: string,
  field2: string
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const control1 = group.get(field1);
    const control2 = group.get(field2);

    if (!control1 || !control2) return null;

    const val1 = control1.value;
    const val2 = control2.value;

    // Only mark the group invalid; don't set errors on individual fields
    if ((val1 && !val2) || (!val1 && val2)) {
      return { requiredPair: true };
    }

    return null;
  };
}

export function totalGreaterOrEqualValidator(obtainedField: string, totalField: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const obtained = parseFloat(group.get(obtainedField)?.value);
    const total = parseFloat(group.get(totalField)?.value);

    if (!isNaN(obtained) && !isNaN(total) && total < obtained) {
      return { totalLessThanObtained: true };
    }
    return null;
  };
}

export function strictEmailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value?.trim();
    if (!value) return null; // empty handled by required validator

    // ❌ Forbid anything not in allowed set
    // ✅ Allowed → a-z, A-Z, 0-9, @ . _ -
    const forbiddenChars = /[^a-zA-Z0-9@._-]/;
    if (forbiddenChars.test(value)) {
      return { invalidChars: true };
    }

    // ✅ General email format
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(value)) {
      return { invalidEmailFormat: true };
    }

    return null;
  };
}


@Component({
  selector: 'app-new-scholarship',
  standalone: true,
  imports: [ReactiveFormsModule, FileuploadDirective, UiDirectivesModule, RouterOutlet, RouterModule, CommonModule],
  templateUrl: './new-scholarship.component.html',
  styleUrl: './new-scholarship.component.scss'
})

export class NewScholarshipComponent implements OnInit {

  body = new HttpParams();
  invalidChars = '| ~ !  ? + ` < >  / ; : \ " { } [ ] # $ ^ & * = ';
  studentForm: FormGroup;
  applicationID = '';
  tooYoung = false;
  flag = '';
  status = '';
  isResultDateOutOfRange = false;
  dobTooRecent: boolean = false; // Flag to track if DOB is less than 14 years
  achiver: boolean = false;
  special: boolean = false;
  selectedFiles: { [key: string]: File } = {};
  removeFiles: { [key: string]: string } = {};
  onupdateRemovedfile: { [key: string]: string[] } = {};
  genderOptions = [
    { label: 'Male', id: 'Male' },
    { label: 'Female', id: 'Female' },
    { label: 'Other', id: 'Other' }
  ];

  maritalStatuses = [
    { label: 'Unmarried', id: 'Unmarried' },
    { label: 'Married', id: 'Married' }
  ];

  attempts = [
    { label: 'Yes', id: 'Yes' },
    { label: 'No', id: 'No' }
  ];

  schemes = [
    { label: 'Under Graduate', id: 'Under Graduate' },
    { label: 'Graduate', id: 'Graduate' },
    { label: 'Post Graduate', id: 'Post Graduate' },
    { label: 'Students with special needs', id: 'Students with special needs' },
    { label: 'National/State Level Achievers', id: 'National/State Level Achievers' }
  ];
courseOptions: { [key: string]: { label: string; id: string; duration?: string }[] } = {
  graduate: [
    // 3 years duration
    { label: 'B.Com', id: 'B.Com', duration: '3' },
    { label: 'B.Sc.', id: 'B.Sc.', duration: '3' },
    { label: 'B.A.', id: 'B.A.', duration: '3' },
    { label: 'BBA', id: 'BBA', duration: '3' },
    { label: 'BMS', id: 'BMS', duration: '3' },
    { label: 'Bachelor in Mass Media', id: 'Bachelor in Mass Media', duration: '3' },
    { label: 'Bachelor in Home Science', id: 'Bachelor in Home Science', duration: '3' },

    // 4 years duration
    { label: 'B. Tech.', id: 'B. Tech.', duration: '4' },
    { label: 'B.E.', id: 'B.E.', duration: '4' },
    // { label: 'B.TECH IN MECHANICAL', id: 'B.TECH IN MECHANICAL', duration: '4' },
    // { label: 'B.TECH IN BIOTECHNOLOGY & ENGINEERING PHYSICS', id: 'B.TECH IN BIOTECHNOLOGY & ENGINEERING PHYSICS', duration: '4' },
    { label: 'B.D.S.', id: 'B.D.S.', duration: '4' },
    { label: 'B. Pharm.', id: 'B. Pharm.', duration: '4' },
    { label: 'B. Textile.', id: 'B. Textile.', duration: '4' },
    { label: 'B. Chem. Eng.', id: 'B. Chem. Eng.', duration: '4' },

    // 5 years duration
    { label: 'B.Arch.', id: 'B.Arch.', duration: '5' },
    { label: 'B.A. LLB', id: 'B.A. LLB', duration: '5' },
    { label: 'M.B.B.S.', id: 'M.B.B.S.', duration: '5' },
    { label: 'B.A.M.S.', id: 'B.A.M.S.', duration: '5' },
    { label: 'B.H.M.S.', id: 'B.H.M.S.', duration: '5' },
  ],

  postGraduate: [
    { label: 'MBA', id: 'MBA', duration: '2' },
  ],

  default: [
    { label: 'Others', id: 'Others', duration: '' }
  ]
};

currentCourseOptions: { label: string; id: string; duration?: string }[] = this.courseOptions['default'];
showOtherCourseInput: boolean = false;

  durationYears = [
    { label: '1 Year', id: '1' },
    { label: '2 Years', id: '2' },
    { label: '3 Years', id: '3' },
    { label: '4 Years', id: '4' },
    { label: '5 Years', id: '5' }
  ];

  years = [
    { label: '1st Year', id: '1' },
    { label: '2nd Year', id: '2' },
    { label: '3rd Year', id: '3' },
    { label: '4th Year', id: '4' },
    { label: '5th Year', id: '5' }
  ];
enableScholarUI!: boolean ;
Msg="";
 empData:any;
  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef, private commonService: CommonService , private loader: LoaderService, private api: ScholarshipApiService, private location: Location, private dialog: CommonDialogService, private router: Router) {
    this.studentForm = this.fb.group({
      childName: ['', [Validators.maxLength(100)]],
      childDob: [''],
      childGender: [''],
      childEmailId: ['', [Validators.email, strictEmailValidator(), Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/), Validators.maxLength(99)]],
      childMarritalStatus: [''],
      childMobile: ['', Validators.pattern(/^[6-9]\d{9}$/)],
      parentName: [{ value: '', disabled: true }],
      childContactNo: ['', Validators.pattern(/^[6-9]\d{9}$/)],
      examPassed: ['', [Validators.maxLength(49)]],
      firstAttempt: [''],
      passedYear: [''],
      nameOfCollege: ['', [Validators.maxLength(100)]],
      schemeApplied: [''],
      courseApplied: [''],
      otherCourse: ['', [Validators.maxLength(95)]],
      durationOfCourse: [''],
      schemeYears: [''],
      marksObtained: [''],
      marksTotal: ['', [maxZeroValidator]],
      cgpaA: [''],
      cgpaB: ['', [maxZeroValidator]],
      aggregate: [{ value: '', disabled: true }],
      marksType: [''],
      attachment1: [null, Validators.required],
      attachment2: [null, Validators.required],
      attachment3: [null],
      attachment4: [null]
    }, {
      validators: [
        crossFieldRequiredValidator('marksObtained', 'marksTotal'),
        crossFieldRequiredValidator('cgpaA', 'cgpaB'),
        totalGreaterOrEqualValidator('marksObtained', 'marksTotal'),
        totalGreaterOrEqualValidator('cgpaA', 'cgpaB')
      ]
    });
  }

  ngOnInit(): void {
    this.setparent();
    this.handleResultDateLimit();
    this.handleCgpaAndMarksLogic();
    this.handleAggregateCalculation();
    const state = history.state;
    const data = history.state?.studentData;
    this.flag = history.state?.flag;
    this.commonService.loadConfig().subscribe(config => {
      setTimeout(() => {
        this.enableScholarUI = config.enableScholarUI === false? config.enableScholarUI : true;
        this.Msg = config.message;
        this.cdr.detectChanges();
      // console.log(this.enableScholarUI, this.Msg);
      });
      
    });
    if (data && Array.isArray(data)) {
      // console.log(data)
      this.populateFormFromStudentData(data, this.flag);
    } else {
       this.newscholarship();}
    this.handleDOB();
  }

  newscholarship(){
    const cyear = this.getOptionIdFromLabel(this.years, '1');
    setTimeout(() => {
      this.studentForm.patchValue({
      schemeYears: cyear
    },);
    }, 200);
       this.studentForm.get('schemeYears')?.disable();
      this.studentForm.get('schemeYears')?.updateValueAndValidity();
  }

  setparent() {
      const result = this.commonService.getEmpDetails();
    this.empData = result;
    this.studentForm.get('parentName')?.setValue(this.empData.empFullName);
  }

  handleCgpaAndMarksLogic(): void {
    const cgpaA = this.studentForm.get('cgpaA');
    const cgpaB = this.studentForm.get('cgpaB');
    const marksA = this.studentForm.get('marksObtained');
    const marksB = this.studentForm.get('marksTotal');

    const disableMarks = () => {
      if (marksA?.enabled) marksA.setValue(null, { emitEvent: false });
      if (marksB?.enabled) marksB.setValue(null, { emitEvent: false });
      marksA?.disable({ emitEvent: false });
      marksB?.disable({ emitEvent: false });
    };

    const disableCgpa = () => {
      if (cgpaA?.enabled) cgpaA.setValue(null, { emitEvent: false });
      if (cgpaB?.enabled) cgpaB.setValue(null, { emitEvent: false });
      cgpaA?.disable({ emitEvent: false });
      cgpaB?.disable({ emitEvent: false });
    };

    const enableAll = () => {
      marksA?.enable({ emitEvent: false });
      marksB?.enable({ emitEvent: false });
      cgpaA?.enable({ emitEvent: false });
      cgpaB?.enable({ emitEvent: false });
    };

    const updateFields = () => {
      const isCgpaFilled = cgpaA?.value || cgpaB?.value;
      const isMarksFilled = marksA?.value || marksB?.value;

      if (isCgpaFilled) {
        disableMarks();
      } else if (isMarksFilled) {
        disableCgpa();
      } else {
        enableAll();
      }
    };

    cgpaA?.valueChanges.subscribe(updateFields);
    cgpaB?.valueChanges.subscribe(updateFields);
    marksA?.valueChanges.subscribe(updateFields);
    marksB?.valueChanges.subscribe(updateFields);
  }

  handleAggregateCalculation(): void {
    const marksA = this.studentForm.get('marksObtained');
    const marksB = this.studentForm.get('marksTotal');
    const cgpaA = this.studentForm.get('cgpaA');
    const cgpaB = this.studentForm.get('cgpaB');
    const aggregate = this.studentForm.get('aggregate');

    const updateAggregateFromMarks = () => {
      const valA = parseFloat(marksA?.value);
      const valB = parseFloat(marksB?.value);
      if (!isNaN(valA) && !isNaN(valB) && valB > 0 && valA <= valB) {
        const result = (valA / valB) * 100;
        aggregate?.setValue(result.toFixed(2));
      } else {
        aggregate?.setValue('');
      }
    };

    const updateAggregateFromCGPA = () => {
      const valA = parseFloat(cgpaA?.value);
      const valB = parseFloat(cgpaB?.value);
      if (!isNaN(valA) && !isNaN(valB) && valB > 0 && valA <= valB) {
        const result = (valA / valB) * 95;
        aggregate?.setValue(result.toFixed(2));
      } else {
        aggregate?.setValue('');
      }

    };

    marksA?.valueChanges.subscribe(() => updateAggregateFromMarks());
    marksB?.valueChanges.subscribe(() => updateAggregateFromMarks());
    cgpaA?.valueChanges.subscribe(() => updateAggregateFromCGPA());
    cgpaB?.valueChanges.subscribe(() => updateAggregateFromCGPA());
  }

  onSubmit(): void {
  if (this.studentForm.invalid) {
  this.studentForm.markAllAsTouched();
  let arr =  ['childName', 'childDob', 'childGender', 'childEmailId', 'childMarritalStatus', 'childMobile',  'childContactNo', 'examPassed', 'firstAttempt', 'passedYear', 'nameOfCollege', 'schemeApplied', 'courseApplied', 'durationOfCourse', 'schemeYears', 'attachment1', 'attachment2']
  if (this.special) {
    arr.push('attachment3');
  } else if (this.achiver) {
    arr.push('attachment4');
  }
   arr.forEach(f => {
    // console.log(f, "=>", this.studentForm.get(f)?.value);
  });
  arr.forEach((key) => {
    const control = this.studentForm.get(key);
    if (
      control &&
      control.enabled &&
      !control.value &&
      control.errors?.['uploadFailed'] !== true
    ) {
      control.setErrors({ ...(control.errors || {}), uploadFailed: true });
      control.markAsTouched();
    }
  });

  // Find the first invalid control
  const firstInvalidControl = Object.keys(this.studentForm.controls).find((key) => {
    const control = this.studentForm.get(key);
    return control && control.invalid && control.enabled;
  });

  // Show alert first
 this.dialog.alert('Please fill all required fields.', 'ALERT')
    .then(() => {
      if (firstInvalidControl) {
        const element = document.querySelector(
          `[formControlName="${firstInvalidControl}"]`
        ) as HTMLElement;

        if (element) {
          element.focus();
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });

  return;
}

    const raw = this.studentForm.getRawValue();
 
    // ✅ Determine CGPA or Marks block used
    const usingCGPA = !!this.studentForm.get('cgpaA')?.value || !!this.studentForm.get('cgpaB')?.value;
    const usingMarks = !!this.studentForm.get('marksObtained')?.value || !!this.studentForm.get('marksTotal')?.value;

    // ✅ Format DOB
    if (raw.childDob) {
      const [dd, mm, yyyy] = raw.childDob.split('-');
      raw.childDob = `${yyyy}-${mm}-${dd}`;
    }

    const createdBy = sessionStorage.getItem('TOIID');
    if (!createdBy) {
      this.dialog.alert('User session expired. Please login again.', 'ALERT');
      return;
    }

    // ✅ Patch marksType and values
    let marksObtained = raw.marksObtained;
    let marksTotal = raw.marksTotal;

    if (usingCGPA) {
      marksObtained = raw.cgpaA;
      marksTotal = raw.cgpaB;
      this.studentForm.patchValue({ marksType: 'CGPA', marksObtained, marksTotal });
    } else if (usingMarks) {
      this.studentForm.patchValue({ marksType: 'normal', marksObtained, marksTotal });
    }

    // ✅ Calculate aggregate
    let aggregate = '';
    const mo = parseFloat(marksObtained);
    const mt = parseFloat(marksTotal);

    if (!isNaN(mo) && !isNaN(mt) && mt > 0 && mo <= mt) {
      aggregate = usingCGPA
        ? ((mo / mt) * 95).toFixed(2)
        : ((mo / mt) * 100).toFixed(2);
    }

    if (!aggregate) {
      this.dialog.alert('Fill either "Total Marks Obtained" or "Cumulative Grade Point Average (CGPA)"', 'ALERT');
      return;
    }

    this.studentForm.patchValue({ aggregate });
      ['attachment1', 'attachment2', 'attachment3', 'attachment4'].forEach(key => {
        const val = this.studentForm.get(key)?.value;

        if (val instanceof File) {
          // ✅ New upload → patch filename
          this.studentForm.patchValue({ [key]: val.name });
        } else if (typeof val === 'string') {
          // ✅ Already a filename → keep as is
          this.studentForm.patchValue({ [key]: val });
        } else {
          // ✅ Nothing set
          this.studentForm.patchValue({ [key]: null });
        }
      });

    const payload = this.studentForm.getRawValue();
    delete payload.cgpaA;
    delete payload.cgpaB;

    if (payload.courseApplied === 'Others' && payload.otherCourse?.trim()) {
      payload.courseApplied = payload.otherCourse;
    }

    // Application status logic
    if (this.flag === 'contiune') {
      this.status = 'C';
      this.applicationID = '';
    } else if (this.flag === 'edit') {
      if (this.status === 'L') this.status = 'EL';
      else if (this.status === 'LC') this.status = 'ELC';
    } else {
      this.status = 'N';
      this.applicationID = '';
    }

    const finalArray = [
      payload.childName,
      payload.childDob,
      payload.childGender,
      payload.childMarritalStatus,
      payload.childEmailId,
      payload.childMobile,
      payload.childContactNo,
      payload.examPassed,
      payload.passedYear,
      payload.firstAttempt,
      payload.schemeApplied,
      payload.schemeApplied,
      payload.marksType,
      marksObtained,
      marksTotal,
      marksObtained,
      payload.aggregate,
      payload.nameOfCollege,
      payload.durationOfCourse,
      payload.courseApplied,
      payload.docOption2 || 'No',
      payload.docOption3 || 'No',
      payload.attachment1,
      payload.attachment2,
      payload.attachment3 || 'NA',
      payload.attachment4 || 'NA',
      payload.attachment5 || 'NA',
      createdBy,
      createdBy,
      this.status,
      this.applicationID,
      0,
      payload.schemeYears
    ];
    this.loader.show();
    // console.log(finalArray , 'final..............');
    Promise.resolve().then(() => {
    this.api.submitScholarshipForm(finalArray).subscribe({
      next: (res) => {
        // console.log('Response.....' , res);
        if (res?.status === 'success') {
      if (this.onupdateRemovedfile && Object.keys(this.onupdateRemovedfile).length > 0) {
            this.oneditRemove(this.onupdateRemovedfile).then(() => {
              this.applicationID = res?.data?.applicationId;
              this.loader.hide();
              let msg = '';
              if(this.flag === 'edit'){
                msg = 'Application ID: ' + res?.data?.applicationId + ' has been updated successfully'
              } else {
                msg = 'Application ID: ' + res?.data?.applicationId + ' has been submitted successfully'
              }
              this.dialog.alert(
                msg,
                'CONFIRMATION'
              ).then(() => {
                this.onReset();
                this.router.navigate(['/portal/scholarship/check-status']);
              });
            });
          } else {
            this.applicationID = res?.data?.applicationId;
            this.loader.hide();
             let msg = '';
              if(this.flag === 'edit'){
                msg = 'Application ID: ' + res?.data?.applicationId + ' has been updated successfully'
              } else {
                msg = 'Application ID: ' + res?.data?.applicationId + ' has been submitted successfully'
              }
              this.dialog.alert(
                msg,
              'CONFIRMATION'
            ).then(() => {
              this.onReset();
              this.router.navigate(['/portal/scholarship/check-status']);
            });
          }
        } else if (res?.status === 'error') {  
          this.loader.hide(); 
          if(res?.message) {
            this.dialog.alert(res.message);  
          } else{
            this.dialog.alert('Duplicate entry found for the same user.');
          }       
        }
      },
      error: (err) => {
        console.error('Submission failed:', err);
          this.loader.hide();
          this.dialog.alert('Unexpected error while submitting the application. Please try again.');
      }
    });
    });
  }
 
oneditRemove(onupdateRemovedfile: { [key: string]: string[] }): Promise<void> {
  const deletePromises: Promise<void>[] = [];

  Object.entries(onupdateRemovedfile).forEach(([controlName, fileNames]) => {
    const files = Array.isArray(fileNames) ? fileNames : [fileNames]; // normalize

    files.forEach((fileName) => {
      const encodedFileName = btoa(fileName);
      const body = new URLSearchParams();
      body.set('fileName', encodedFileName);
      body.set('type', '');
      body.set('applicationID', this.applicationID);
      body.set('flag', controlName.toUpperCase());

      const deletePromise = new Promise<void>((resolve) => {
        this.api.deleteFile(body).subscribe({
          next: () => {
            // console.log(`✅ Previous File '${fileName}' deleted from server`);
            resolve();
          },
          error: (err) => {
            // console.error(`❌ Failed to remove file '${fileName}'`, err);
            resolve(); // ⚠️ resolve so Promise.allSettled always continues
          }
        });
      });

      deletePromises.push(deletePromise);
    });
  });

  return Promise.allSettled(deletePromises).then(() => {
    // console.log("All delete requests finished (success or fail).");
    this.onupdateRemovedfile = {}; // reset after done
  });
}

  // populateFormFromStudentData(data: any[], flag: any): void {
  //   if (!Array.isArray(data)) return;
  //   console.log('flag :', flag);

  //   if (flag === 'contiune'){
  //   const genderValue = this.getOptionIdFromLabel(this.genderOptions, data[3]);
  //   const maritalStatusValue = this.getOptionIdFromLabel(this.maritalStatuses, data[4]);

  //   // 🔹 Scheme, Course & Duration mapping (copied from edit logic)
  //   const schemeAppliedValue = this.getOptionIdFromLabel(this.schemes, data[11]);
  //   const durationOfCourseValue = this.getOptionIdFromLabel(this.durationYears, data[19]);
    
  //   const lastNumber = parseInt(data[20]?.slice(-1), 10) || 1;
  //   const incremented = String(lastNumber + 1);

  //   const schemeYearsValue = this.getOptionIdFromLabel(this.years, incremented);
  //   console.log('id:', schemeYearsValue);
  //   const rawCourseId = data[20]?.split(' - ')[0]?.trim();
  //   let matchedCourseId = '';
  //   let isOtherCourse = false;

  //   const allCourses = Object.values(this.courseOptions).flat();
  //   const matched = allCourses.find(opt => opt.id === rawCourseId);

  //   if (matched) {
  //     matchedCourseId = matched.id;
  //     isOtherCourse = matched.id === 'Others';
  //   } else {
  //     matchedCourseId = 'Others';
  //     isOtherCourse = true;
  //   }
  //   this.showOtherCourseInput = isOtherCourse;

  //   const schemeLower = data[11]?.toLowerCase();
  //   if (schemeLower === 'graduate') {
  //     this.durationYears = [
  //   { label: '3 Years', id: '3' },
  //   { label: '4 Years', id: '4' },
  //   { label: '5 Years', id: '5' }
  // ];
  
  //   } else {
  //     this.durationYears = [
  //   { label: '1 Year', id: '1' },
  //   { label: '2 Years', id: '2' },
  //   { label: '3 Years', id: '3' },
  //   { label: '4 Years', id: '4' },
  //   { label: '5 Years', id: '5' }
  // ];
  //   }
  //   if (schemeLower === 'graduate') {
  //     this.currentCourseOptions = this.courseOptions['graduate'];
  //      this.currentCourseOptions = [
  //     ...this.courseOptions['graduate'], ...this.courseOptions['default']];
  //      this.studentForm.get('schemeYears')?.enable();
  //   } else if (schemeLower === 'under graduate') {
  //     this.currentCourseOptions = [...this.courseOptions['default']];
  //     this.studentForm.get('schemeYears')?.disable();
  //   } else if (schemeLower === 'post graduate') {
  //     this.currentCourseOptions = [
  //     ...this.courseOptions['postGraduate'], ...this.courseOptions['default']];
  //     this.studentForm.get('schemeYears')?.disable();
  //   }else if(schemeLower === 'students with special needs' || schemeLower ===  'national/state level achievers'){
  //        this.currentCourseOptions = [
  //     ...this.courseOptions['graduate'],
  //   ...this.courseOptions['postGraduate'], ...this.courseOptions['default']
  //   ];
  //     this.studentForm.get('schemeYears')?.enable();
  //   } else {
  //     this.currentCourseOptions = this.courseOptions['default'];
  //     this.studentForm.get('schemeYears')?.enable();
  //   }

  //   setTimeout(() => {
  //     this.studentForm.patchValue({
  //       childName: data[1] || '',
  //       childDob: this.formatDateToDDMMYYYY(data[2]),
  //       childGender: genderValue,
  //       childMarritalStatus: maritalStatusValue,
  //       childEmailId: data[5] || '',
  //       childMobile: data[6],
  //       childContactNo: data[7],
  //       nameOfCollege: data[18] || '',
  //       schemeApplied: schemeAppliedValue,
  //       courseApplied: matchedCourseId,
  //       otherCourse: isOtherCourse ? rawCourseId : '',
  //       durationOfCourse: durationOfCourseValue,
  //       schemeYears : schemeYearsValue
  //     });

  //     this.applicationID = data[0] || '';
  //     this.status = data[30];

  //     // disable unchanged personal fields
  //     this.studentForm.get('childName')?.disable();
  //     this.studentForm.get('childDob')?.disable();
  //     this.studentForm.get('childGender')?.disable();
  //     this.studentForm.get('schemeApplied')?.disable();
  //     this.studentForm.get('courseApplied')?.disable();
  //     if (isOtherCourse) {
  //       this.studentForm.get('otherCourse')?.disable();
  //     }
  //     this.studentForm.get('durationOfCourse')?.disable();
      
  //   });
  //   }
  //   else if (flag === 'edit') {
  //     const genderValue = this.getOptionIdFromLabel(this.genderOptions, data[3]);
  //     const maritalStatusValue = this.getOptionIdFromLabel(this.maritalStatuses, data[4]);
  //     const firstAttemptValue = this.getOptionIdFromLabel(this.attempts, data[10]);
  //     const schemeAppliedValue = this.getOptionIdFromLabel(this.schemes, data[11]);
  //     const schemeYearsValue = this.getOptionIdFromLabel(this.years, data[20]?.slice(-1));
  //     const durationOfCourseValue = this.getOptionIdFromLabel(this.durationYears, data[19]);

  //     if(data[20]?.slice(-1) == "1"){
  //       this.newscholarship();
  //     }
  //     const rawCourseId = data[20]?.split(' - ')[0]?.trim();
  //     let matchedCourseId = '';
  //     let isOtherCourse = false;

  //     const allCourses = Object.values(this.courseOptions).flat();
  //     const matched = allCourses.find(opt => opt.id === rawCourseId);

  //     if (matched) {
  //       matchedCourseId = matched.id;
  //       isOtherCourse = matched.id === 'Others';
  //     } else {
  //       matchedCourseId = 'Others';
  //       isOtherCourse = true;
  //     }

  //     this.showOtherCourseInput = isOtherCourse;

  //     const schemeLower = data[11]?.toLowerCase();
      
  //     if (schemeLower === 'graduate') {
  //       this.durationYears = [
  //     { label: '3 Years', id: '3' },
  //     { label: '4 Years', id: '4' },
  //     { label: '5 Years', id: '5' }
  //     ]; 
  //     this.studentForm.get('schemeYears')?.enable();
  //     } else {
  //       this.durationYears = [
  //     { label: '1 Year', id: '1' },
  //     { label: '2 Years', id: '2' },
  //     { label: '3 Years', id: '3' },
  //     { label: '4 Years', id: '4' },
  //     { label: '5 Years', id: '5' }
  //   ];
  //   this.studentForm.get('schemeYears')?.enable();
  //   }
  //   if (schemeLower === 'graduate') {
  //     this.currentCourseOptions = this.courseOptions['graduate'];
  //      this.currentCourseOptions = [
  //     ...this.courseOptions['graduate'], ...this.courseOptions['default']];
      
  //   }  else if (schemeLower === 'under graduate') {
  //     this.currentCourseOptions = [...this.courseOptions['default']];
  //     this.studentForm.get('schemeYears')?.disable();
  //   }else if (schemeLower === 'post graduate') {
  //     this.currentCourseOptions = [
  //     ...this.courseOptions['postGraduate'], ...this.courseOptions['default']];
  //     this.studentForm.get('schemeYears')?.disable();
  //   }else if(schemeLower === 'students with special needs' || schemeLower ===  'national/state level achievers'){
  //        this.currentCourseOptions = [
  //     ...this.courseOptions['graduate'],
  //   ...this.courseOptions['postGraduate'], ...this.courseOptions['default']
  //   ];
  //     this.studentForm.get('schemeYears')?.enable();
  //   } else {
  //     this.currentCourseOptions = this.courseOptions['default'];
  //     this.studentForm.get('schemeYears')?.enable();
  //   }

  //     const scheme = data[11];
  //     this.special = scheme === 'Students with special needs';
  //     this.achiver = scheme === 'National/State Level Achievers';

  //     setTimeout(() => {
  //       this.studentForm.patchValue({
  //         childName: data[1] || '',
  //         childDob: this.formatDateToDDMMYYYY(data[2]),
  //         childGender: genderValue,
  //         childMarritalStatus: maritalStatusValue,
  //         childEmailId: data[5] || '',
  //         childMobile: data[6],
  //         childContactNo: data[7],
  //         examPassed: data[8] || '',
  //         passedYear: this.formatDateToDDMMYYYY(data[9]),
  //         firstAttempt: firstAttemptValue,
  //         nameOfCollege: data[18] || '',
  //         aggregate: data[17] || '',
  //         marksType: data[13] || '',
  //         schemeApplied: schemeAppliedValue,
  //         courseApplied: matchedCourseId,
  //         otherCourse: isOtherCourse ? rawCourseId : '',
  //         durationOfCourse: durationOfCourseValue,
  //         schemeYears: schemeYearsValue
  //       });

  //       if(isOtherCourse){
  //         this.studentForm.get('otherCourse')?.setValidators([Validators.required]);
  //       }
        
  //       this.studentForm.get('childName')?.enable();
  //       this.studentForm.get('childDob')?.enable();
  //       this.studentForm.get('childGender')?.enable();

  //       const attachment3 = this.studentForm.get('attachment3');
  //       const attachment4 = this.studentForm.get('attachment4');

  //       if (this.special) {
  //         attachment3?.setValidators([Validators.required]);
  //       } else {
  //         attachment3?.clearValidators();
  //       }
  //       attachment3?.updateValueAndValidity();

  //       if (this.achiver) {
  //         attachment4?.setValidators([Validators.required]);
  //       } else {
  //         attachment4?.clearValidators();
  //       }
  //       attachment4?.updateValueAndValidity();
  //     });

  //     if (data[13] === 'normal') {
  //       setTimeout(() => {
  //         this.studentForm.patchValue({
  //           marksObtained: data[14] || '',
  //           marksTotal: data[15] || '',
  //         });
  //       });
  //     } else {
  //       setTimeout(() => {
  //         this.studentForm.patchValue({
  //           cgpaA: data[14] || '',
  //           cgpaB: data[15] || '',
  //         });
  //       });
  //     }

  //     this.applicationID = data[0];
  //     this.status = data[30];
  //      const filePromises: Promise<void>[] = [];
    
  //     const attachmentPrefills: {
  //       key: 'attachment1' | 'attachment2' | 'attachment3' | 'attachment4';
  //       fileName: string | null;
        
  //       condition?: boolean;
  //     }[] = [
  //         { key: 'attachment1', fileName: data[23] },
  //         { key: 'attachment2', fileName: data[24] },
  //         { key: 'attachment3', fileName: data[25], condition: this.special },
  //         { key: 'attachment4', fileName: data[38], condition: this.achiver },
  //       ];

  //     attachmentPrefills.forEach(({ key, fileName, condition }) => {
        
  //       if (fileName && (condition === undefined || condition)) {
  //         this.studentForm.get(key)?.setValue(fileName);
  //         this.studentForm.get(key)?.setErrors(null);
  //         this.removeFiles[key] = fileName;
  //         console.log(this.studentForm.get(key)?.getRawValue());
  //       }
        
  //     });


  //     Promise.all(filePromises).then(() => {
  //       console.log('✅ All attachments populated.');
  //     });
  //     // this.prefillAttachments(data);
  //   }
  // }
populateFormFromStudentData(data: any[], flag: any): void {
  if (!Array.isArray(data)) return;
  // console.log('flag :', flag);

  if (flag === 'contiune') {
    const genderValue = this.getOptionIdFromLabel(this.genderOptions, data[3]);
    const maritalStatusValue = this.getOptionIdFromLabel(this.maritalStatuses, data[4]);

    // 🔹 Scheme, Course & Duration mapping (copied from edit logic)
    const schemeAppliedValue = this.getOptionIdFromLabel(this.schemes, data[11]);
    const durationOfCourseValue = this.getOptionIdFromLabel(this.durationYears, data[19]);

    // ✅ schemeYearsValue logic updated
    let schemeYearsValue = '';
    if (data[20]?.includes('-')) {
      const lastNumber = parseInt(data[20].split('-').pop()?.trim() || '', 10);
      if (!isNaN(lastNumber)) {
        const incremented = String(lastNumber + 1);
        schemeYearsValue = this.getOptionIdFromLabel(this.years, incremented);
      }
    }

    // console.log('id:', schemeYearsValue);
    const rawCourseId = data[20]?.split(' - ')[0]?.trim();
    let matchedCourseId = '';
    let isOtherCourse = false;

    const allCourses = Object.values(this.courseOptions).flat();
    const matched = allCourses.find(opt => opt.id === rawCourseId);

    if (matched) {
      matchedCourseId = matched.id;
      isOtherCourse = matched.id === 'Others';
    } else {
      matchedCourseId = 'Others';
      isOtherCourse = true;
    }
    this.showOtherCourseInput = isOtherCourse;

    const schemeLower = data[11]?.toLowerCase();
    if (schemeLower === 'graduate') {
      this.durationYears = [
        { label: '3 Years', id: '3' },
        { label: '4 Years', id: '4' },
        { label: '5 Years', id: '5' }
      ];
    } else {
      this.durationYears = [
        { label: '1 Year', id: '1' },
        { label: '2 Years', id: '2' },
        { label: '3 Years', id: '3' },
        { label: '4 Years', id: '4' },
        { label: '5 Years', id: '5' }
      ];
    }
    if (schemeLower === 'graduate') {
      this.currentCourseOptions = this.courseOptions['graduate'];
      this.currentCourseOptions = [
        ...this.courseOptions['graduate'], ...this.courseOptions['default']];
      this.studentForm.get('schemeYears')?.enable();
    } else if (schemeLower === 'under graduate') {
      this.currentCourseOptions = [...this.courseOptions['default']];
      this.studentForm.get('schemeYears')?.disable();
    } else if (schemeLower === 'post graduate') {
      this.currentCourseOptions = [
        ...this.courseOptions['postGraduate'], ...this.courseOptions['default']];
      this.studentForm.get('schemeYears')?.disable();
    } else if (schemeLower === 'students with special needs' || schemeLower === 'national/state level achievers') {
      this.currentCourseOptions = [
        ...this.courseOptions['graduate'],
        ...this.courseOptions['postGraduate'], ...this.courseOptions['default']
      ];
      this.studentForm.get('schemeYears')?.enable();
    } else {
      this.currentCourseOptions = this.courseOptions['default'];
      this.studentForm.get('schemeYears')?.enable();
    }

    setTimeout(() => {
      this.studentForm.patchValue({
        childName: data[1] || '',
        childDob: this.formatDateToDDMMYYYY(data[2]),
        childGender: genderValue,
        childMarritalStatus: maritalStatusValue,
        childEmailId: data[5] || '',
        childMobile: data[6],
        childContactNo: data[7],
        nameOfCollege: data[18] || '',
        schemeApplied: schemeAppliedValue,
        courseApplied: matchedCourseId,
        otherCourse: isOtherCourse ? rawCourseId : '',
        durationOfCourse: durationOfCourseValue,
        schemeYears: schemeYearsValue
      },);

      this.applicationID = data[0] || '';
      this.status = data[30];

      // disable unchanged personal fields
      this.studentForm.get('childName')?.disable();
      this.studentForm.get('childDob')?.disable();
      this.studentForm.get('childGender')?.disable();
      this.studentForm.get('schemeApplied')?.disable();
      this.studentForm.get('courseApplied')?.disable();
      if (isOtherCourse) {
        this.studentForm.get('otherCourse')?.disable();
      }
      this.studentForm.get('durationOfCourse')?.disable();

    }, 200);
  }
  else if (flag === 'edit') {
    const genderValue = this.getOptionIdFromLabel(this.genderOptions, data[3]);
    const maritalStatusValue = this.getOptionIdFromLabel(this.maritalStatuses, data[4]);
    const firstAttemptValue = this.getOptionIdFromLabel(this.attempts, data[10]);
    const schemeAppliedValue = this.getOptionIdFromLabel(this.schemes, data[11]);

    // ✅ schemeYearsValue logic updated
    let schemeYearsValue = '';
    if (data[20]?.includes('-')) {
      const lastNumber = parseInt(data[20].split('-').pop()?.trim() || '', 10);
      if (!isNaN(lastNumber)) {
        schemeYearsValue = this.getOptionIdFromLabel(this.years, String(lastNumber));
      }
    }

    const durationOfCourseValue = this.getOptionIdFromLabel(this.durationYears, data[19]);

    if (data[20]?.slice(-1) == "1") {
      this.newscholarship();
    }
    const rawCourseId = data[20]?.split(' - ')[0]?.trim();
    let matchedCourseId = '';
    let isOtherCourse = false;

    const allCourses = Object.values(this.courseOptions).flat();
    const matched = allCourses.find(opt => opt.id === rawCourseId);

    if (matched) {
      matchedCourseId = matched.id;
      isOtherCourse = matched.id === 'Others';
    } else {
      matchedCourseId = 'Others';
      isOtherCourse = true;
    }

    this.showOtherCourseInput = isOtherCourse;

    const schemeLower = data[11]?.toLowerCase();

    if (schemeLower === 'graduate') {
      this.durationYears = [
        { label: '3 Years', id: '3' },
        { label: '4 Years', id: '4' },
        { label: '5 Years', id: '5' }
      ];
      this.studentForm.get('schemeYears')?.enable();
    } else {
      this.durationYears = [
        { label: '1 Year', id: '1' },
        { label: '2 Years', id: '2' },
        { label: '3 Years', id: '3' },
        { label: '4 Years', id: '4' },
        { label: '5 Years', id: '5' }
      ];
      this.studentForm.get('schemeYears')?.enable();
    }
    if (schemeLower === 'graduate') {
      this.currentCourseOptions = this.courseOptions['graduate'];
      this.currentCourseOptions = [
        ...this.courseOptions['graduate'], ...this.courseOptions['default']];
    } else if (schemeLower === 'under graduate') {
      this.currentCourseOptions = [...this.courseOptions['default']];
      this.studentForm.get('schemeYears')?.disable();
    } else if (schemeLower === 'post graduate') {
      this.currentCourseOptions = [
        ...this.courseOptions['postGraduate'], ...this.courseOptions['default']];
      this.studentForm.get('schemeYears')?.disable();
    } else if (schemeLower === 'students with special needs' || schemeLower === 'national/state level achievers') {
      this.currentCourseOptions = [
        ...this.courseOptions['graduate'],
        ...this.courseOptions['postGraduate'], ...this.courseOptions['default']
      ];
      this.studentForm.get('schemeYears')?.enable();
    } else {
      this.currentCourseOptions = this.courseOptions['default'];
      this.studentForm.get('schemeYears')?.enable();
    }

    const scheme = data[11];
    this.special = scheme === 'Students with special needs';
    this.achiver = scheme === 'National/State Level Achievers';

    setTimeout(() => {
      this.studentForm.patchValue({
        childName: data[1] || '',
        childDob: this.formatDateToDDMMYYYY(data[2]),
        childGender: genderValue,
        childMarritalStatus: maritalStatusValue,
        childEmailId: data[5] || '',
        childMobile: data[6],
        childContactNo: data[7],
        examPassed: data[8] || '',
        passedYear: this.formatDateToDDMMYYYY(data[9]),
        firstAttempt: firstAttemptValue,
        nameOfCollege: data[18] || '',
        aggregate: data[17] || '',
        marksType: data[13] || '',
        schemeApplied: schemeAppliedValue,
        courseApplied: matchedCourseId,
        otherCourse: isOtherCourse ? rawCourseId : '',
        durationOfCourse: durationOfCourseValue,
        schemeYears: schemeYearsValue
      });

      if (isOtherCourse) {
        this.studentForm.get('otherCourse')?.setValidators([Validators.required]);
      }

      this.studentForm.get('childName')?.enable();
      this.studentForm.get('childDob')?.enable();
      this.studentForm.get('childGender')?.enable();

      const attachment3 = this.studentForm.get('attachment3');
      const attachment4 = this.studentForm.get('attachment4');

      if (this.special) {
        attachment3?.setValidators([Validators.required]);
      } else {
        attachment3?.clearValidators();
      }
      attachment3?.updateValueAndValidity();

      if (this.achiver) {
        attachment4?.setValidators([Validators.required]);
      } else {
        attachment4?.clearValidators();
      }
      attachment4?.updateValueAndValidity();
    }, 200);

    if (data[13] === 'normal') {
      setTimeout(() => {
        this.studentForm.patchValue({
          marksObtained: data[14] || '',
          marksTotal: data[15] || '',
        });
      }, 200);
    } else {
      setTimeout(() => {
        this.studentForm.patchValue({
          cgpaA: data[14] || '',
          cgpaB: data[15] || '',
        });
      }, 200);
    }

    this.applicationID = data[0];
    this.status = data[30];
    const filePromises: Promise<void>[] = [];

    const attachmentPrefills: {
      key: 'attachment1' | 'attachment2' | 'attachment3' | 'attachment4';
      fileName: string | null;

      condition?: boolean;
    }[] = [
        { key: 'attachment1', fileName: data[23] },
        { key: 'attachment2', fileName: data[24] },
        { key: 'attachment3', fileName: data[25], condition: this.special },
        { key: 'attachment4', fileName: data[38], condition: this.achiver },
      ];

    attachmentPrefills.forEach(({ key, fileName, condition }) => {

      if (fileName && (condition === undefined || condition)) {
        this.studentForm.get(key)?.setValue(fileName);
        this.studentForm.get(key)?.setErrors(null);
        this.removeFiles[key] = fileName;
        // console.log(this.studentForm.get(key)?.getRawValue());
      }

    });


    Promise.all(filePromises).then(() => {
      // console.log('✅ All attachments populated.');
    });
    // this.prefillAttachments(data);
  }
}

//   prefillAttachments = async (data: any[]): Promise<void> => {
//   const attachmentPrefills: {
//     key: 'attachment1' | 'attachment2' | 'attachment3' | 'attachment4';
//     fileName: string | null;
//     condition?: boolean;
//   }[] = [
//     { key: 'attachment1', fileName: data[23] },
//     { key: 'attachment2', fileName: data[24] },
//     { key: 'attachment3', fileName: data[25], condition: this.special },
//     { key: 'attachment4', fileName: data[38], condition: this.achiver },
//   ];
//     this.studentForm.get(key)?.setValue(fileName);
//   const filePromises = attachmentPrefills.map(async ({ key, fileName, condition }) => {
//     if (fileName && (condition === undefined || condition)) {
      
//       const blob = await firstValueFrom(this.api.downloadFile(fileName));
//       console.log(blob);
//       if (blob) {
//         // Create a File object from the Blob
//         const file = new File([blob], fileName, {
//           type: blob.type || 'application/octet-stream'
//         });

//         // Set into form control
//         this.studentForm.get(key)?.setValue(fileName);
//         this.studentForm.get(key)?.setErrors(null);

//         // Track for removal
//         this.removeFiles[key] = fileName;
//       }
//     }
//   });

//   await Promise.all(filePromises);

//   console.log('✅ All attachments populated and ready as File objects.');
// }

  graduate3YearCourses = ['B.Com', 'B.Sc.', 'B.A.', 'BBA', 'BMS', 'Bachelor in Mass Media', 'Bachelor in Home Science'];
  graduate4YearCourses = ['B.D.S.', 'B. Pharm.', 'B.E.', 'B. Tech.', 'B. Textile.', 'B. Chem. Eng.'];
  graduate5YearCourses = ['B.Arch.', 'B.A. LLB', 'M.B.B.S.', 'B.A.M.S.', 'B.H.M.S.'];
  availableDurations: { label: string; id: string }[] = [];
  availableYears: { label: string; id: string }[] = [];


  onSchemeChange(event: any): void {
    const scheme = event?.target?.value || event;

    const attachment3 = this.studentForm.get('attachment3');
    const attachment4 = this.studentForm.get('attachment4');

    this.achiver = false;
    this.special = false;
    if (scheme === 'Graduate') {
    this.durationYears = [
      { label: '3 Years', id: '3' },
      { label: '4 Years', id: '4' },
      { label: '5 Years', id: '5' }
    ];
    }else {
    this.durationYears = [
          { label: '1 Year', id: '1' },
          { label: '2 Years', id: '2' },
          { label: '3 Years', id: '3' },
          { label: '4 Years', id: '4' },
          { label: '5 Years', id: '5' }
        ];
        this.studentForm.get('schemeYears')?.enable();
    }
    if (scheme === 'Graduate') {
      this.currentCourseOptions = [
      ...this.courseOptions['graduate'], ...this.courseOptions['default']];
      this.studentForm.get('durationOfCourse')?.enable();   
        if(!this.flag){this.newscholarship()}
    } else if (scheme === 'Post Graduate') {
      this.currentCourseOptions = [
      ...this.courseOptions['postGraduate'], ...this.courseOptions['default']];
          const cyear = this.getOptionIdFromLabel(this.durationYears, '2');
          setTimeout(() => {
              this.studentForm.patchValue({
          durationOfCourse: cyear
        });
          }, 200)
        if(!this.flag){this.newscholarship()}
        this.studentForm.get('durationOfCourse')?.disable();
    } else if (scheme === 'Under Graduate') {
      this.currentCourseOptions = this.courseOptions['default'];
          const cyear= this.getOptionIdFromLabel(this.durationYears, '2');
           setTimeout(() => {
              this.studentForm.patchValue({
          durationOfCourse: cyear
        });
          }, 200)
        
        this.studentForm.get('durationOfCourse')?.disable();
        if(!this.flag){this.newscholarship()}
        
    }else if (scheme === 'National/State Level Achievers' || scheme === 'Students with special needs') {
    this.currentCourseOptions = [
      ...this.courseOptions['graduate'],
    ...this.courseOptions['postGraduate'], ...this.courseOptions['default']
    ];
    this.achiver = scheme === 'National/State Level Achievers';
    this.special = scheme === 'Students with special needs';
    this.studentForm.get('durationOfCourse')?.enable();
    this.studentForm.get('schemeYears')?.enable();
  } 
  else {
    this.currentCourseOptions = this.courseOptions['default'];
    this.studentForm.get('durationOfCourse')?.enable();
  }

    if (this.special) {
      attachment3?.setValidators([Validators.required]);
    } else {
      attachment3?.clearValidators();
      attachment3?.setValue(null);
    }
    attachment3?.updateValueAndValidity();

    if (this.achiver) {
      attachment4?.setValidators([Validators.required]);
    } else {
      attachment4?.clearValidators();
      attachment4?.setValue(null);
    }
    attachment4?.updateValueAndValidity();

    this.studentForm.patchValue({
      courseApplied: '',
      otherCourse: ''
    });

    this.showOtherCourseInput = false;
  }

  onCourseChange(event: any): void {
  const selectedCourseId = event?.target?.value || event;
  const selectedCourse = this.getOptionIdFromLabel(this.currentCourseOptions ,selectedCourseId )
  const durationControl = this.studentForm.get('durationOfCourse');
  const otherCourseControl = this.studentForm.get('otherCourse');
  this.showOtherCourseInput = selectedCourseId === 'Others';

  // Graduate scheme → auto-set duration based on course name
  if (this.studentForm.get('schemeApplied')?.value === 'Graduate') {
    const courseName = selectedCourse;
    this.durationYears = [
    { label: '3 Years', id: '3' },
    { label: '4 Years', id: '4' },
    { label: '5 Years', id: '5' }
  ];

    if (this.graduate3YearCourses.includes(courseName)) {

      const cyear= this.getOptionIdFromLabel(this.durationYears, '3');
         setTimeout(() => {
              this.studentForm.patchValue({
          durationOfCourse: cyear
        });
          }, 200)
    } 
    else if (this.graduate4YearCourses.includes(courseName)) {

       const cyear= this.getOptionIdFromLabel(this.durationYears, '4');
        setTimeout(() => {
              this.studentForm.patchValue({
          durationOfCourse: cyear
        });
          }, 200)
        
      
    } 
    else if (this.graduate5YearCourses.includes(courseName)) {
      
       const cyear= this.getOptionIdFromLabel(this.durationYears, '5');
        setTimeout(() => {
              this.studentForm.patchValue({
          durationOfCourse: cyear
        });
          }, 200)
        
      
    } 
    
  } else if (this.studentForm.get('schemeApplied')?.value === 'Under Graduate' || this.studentForm.get('schemeApplied')?.value === 'Post Graduate' && selectedCourse === "Other")  {
    this.durationYears = [
    { label: '1 Year', id: '1' },
    { label: '2 Years', id: '2' },
    { label: '3 Years', id: '3' },
    { label: '4 Years', id: '4' },
    { label: '5 Years', id: '5' }
  ];
   const cyear = this.getOptionIdFromLabel(this.durationYears, '2');
          setTimeout(() => {
              this.studentForm.patchValue({
          durationOfCourse: cyear
        });
          }, 200)

  
  }

  if (this.showOtherCourseInput) {
    otherCourseControl?.setValidators([Validators.required]);
  } else {
    otherCourseControl?.clearValidators();
    otherCourseControl?.setValue('');
  }

  otherCourseControl?.updateValueAndValidity();
}

  getOptionIdFromLabel(
    options: { label: string; id: string }[],
    label: string | number
  ): string {
    const normalizedLabel = String(label).toLowerCase().trim();

    // 1. Exact match
    let found = options.find(opt =>
      opt.label?.toLowerCase()?.trim() === normalizedLabel
    );

    // 2. Partial match (e.g., '3' in '3 Years')
    if (!found) {
      found = options.find(opt =>
        opt.label?.toLowerCase()?.includes(normalizedLabel)
      );
    }
    return found?.id || '';
  }

onFileChange(event: { file: File | null }, controlName: string) {
  const { file } = event;
  this.selectedFiles = {};
  const control = this.studentForm.get(controlName);
  control?.setErrors(null);
  if (!control) return;

  if (!file) {
    control.setValue(null);
    control.setErrors({ required: true, uploadFailed: true });
    delete this.selectedFiles[controlName];
    return;
  }

  this.selectedFiles = { [controlName]: file };
  // control.setValue(file);

  this.loader.show();
  //local dev
// if(file){
//     control.setValue(file);
//           control.setErrors(null);
//           control.markAsTouched();
//   } else {
//      control.setErrors({ required: true, uploadFailed: true });
//           control.setValue(null);
//           control.updateValueAndValidity();
//           delete this.selectedFiles[controlName];
//   }
//for prod build
  Promise.resolve().then(() => {
    this.api.uploadAttachments(this.selectedFiles, this.applicationID).subscribe({
      next: (res) => {
        this.loader.hide();
        if (res.success === true) {
          this.dialog.alert(res.message, 'CONFIRMATION').then(() => {
            if (this.removeFiles[controlName] && this.flag !== 'edit') {
              const fileName = this.removeFiles[controlName];
              const encodedFileName = btoa(fileName);
              const body = new URLSearchParams();
              body.set('fileName', encodedFileName);
              body.set('type', '');
              body.set('applicationID', this.applicationID);
              body.set('flag', controlName.toUpperCase());
              this.api.deleteFile(body).subscribe({
                next: (res) => {
                  // console.log(`✅ Previous File '${fileName}' deleted from server`);
                  delete this.removeFiles[controlName];
                  this.dialog.alert(res.message);
                },
                error: () => {
                  this.dialog.alert('Failed to remove Previous file from server.');
                }
              });
            }
            if (this.flag === 'edit' && this.removeFiles[controlName]) {
              if (!this.onupdateRemovedfile[controlName]) {
                this.onupdateRemovedfile[controlName] = [];
              }
              this.onupdateRemovedfile[controlName].push(this.removeFiles[controlName]);
              delete this.removeFiles[controlName];
            }
          }).then(() => {
            this.removeFiles[controlName] = file.name;
            control.setErrors(null);
            control.markAsTouched();
            control.updateValueAndValidity();
          });
        } else {
          if (this.removeFiles[controlName]) {
            this.dialog.alert(res.message).then(() => {
              // ✅ Restore File object if upload fails
              control?.setValue(this.removeFiles[controlName]);
              control?.setErrors(null);
              control.markAsTouched();
              control.updateValueAndValidity();
            });
          } else {
            this.dialog.alert(res.message);
            control.setErrors({ required: true, uploadFailed: true });
            control.setValue(null);
            delete this.selectedFiles[controlName];
          }
        }
      },
      error: (err) => {
        console.error('File upload failed:', err.message);
        this.loader.hide();
        this.dialog.alert('File upload failed. Please try again.');
        control.setErrors({ required: true, uploadFailed: true });
        control.setValue(null);
        delete this.selectedFiles[controlName];
      }
    });
  });
}
onRemove(controlName: any) {

if (this.flag === 'edit') {
// Ensure array exists
if (!this.onupdateRemovedfile[controlName]) {
  this.onupdateRemovedfile[controlName] = [];
}

// Push into array (if removeFiles[controlName] is a string → wrap in array)
const filesToRemove = Array.isArray(this.removeFiles[controlName])
  ? this.removeFiles[controlName]
  : [this.removeFiles[controlName]];

this.onupdateRemovedfile[controlName] = [
...new Set([...(this.onupdateRemovedfile[controlName] || []), ...filesToRemove])
];


// Cleanup removeFiles entry
delete this.removeFiles[controlName];

// Reset form control
const control = this.studentForm.get(controlName);
control?.setValue(null);
control?.setErrors({ required: true, uploadFailed: true });
return;
}

  const fileName = this.removeFiles[controlName];
  // console.log(fileName);
  if (!fileName) {
    console.warn('No file name found for control:', controlName);
    return;
  }

  const encodedFileName = btoa(fileName);
  const body = new URLSearchParams();
  body.set('fileName', encodedFileName);
  body.set('type', '');
  body.set('applicationID', this.applicationID);
  body.set('flag', controlName.toUpperCase());
  Promise.resolve().then(() => {
  this.api.deleteFile(body).subscribe({
    next: (res) => {
      // console.log(`✅ File '${fileName}' deleted from server`);
      this.studentForm.get(controlName)?.setValue(null);
      this.studentForm.get(controlName)?.setErrors({ required: true, uploadFailed: true });
      delete this.removeFiles[controlName];
      this.dialog.alert(res.message);
    },
    error: (err) => {
      this.studentForm.get(controlName)?.setValue(this.removeFiles[controlName]);
      this.studentForm.get(controlName)?.setErrors(null);
      console.error('❌ Error deleting file:', err);
      this.dialog.alert('Failed to delete file from server. ');
    }
  });
  });
}

onFileDownload(event: { fileName: string; controlName: string }) {
  console.log('Download triggered:', event);
  
  this.api.downloadFile(event.fileName, '', this.applicationID).subscribe({
    next: (res: HttpResponse<Blob>) => {
      const blob = res.body;
      if (!blob || blob.size === 0) {
        this.dialog.alert('File not found.');
        return;
      }

      // ✅ Detect JSON error (server returned error instead of file)
      if (blob.type === 'application/json' || blob.type.startsWith('text/')) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorJson = JSON.parse(reader.result as string);
            console.error('API Error:', errorJson);
            this.dialog.alert(errorJson.message || 'Failed to download the file.');
          } catch {
            this.dialog.alert('Unexpected error while downloading the file.');
          }
        };
        reader.readAsText(blob);
        return; // ⛔ stop here, DO NOT download
      }

      // ✅ If it’s a real file, download it
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // use provided name or fallback
      a.download = event.fileName || `file_${Date.now()}`;
      a.click();

      window.URL.revokeObjectURL(url);
      // console.log('File downloaded:', event.fileName);
    },
    error: (err) => {
      console.error('Download failed:', err);
      this.dialog.alert('Failed to download the file. Please try again.');
    }
  });
}

  // async downloadAndConvertFile(fileName: string): Promise<File | null> {
  //   try {
  //     const blob = await this.api.downloadFile(fileName).toPromise();
  //     if (!blob) return null;
  //     return new File([blob], fileName, { type: blob.type || 'application/octet-stream' });
  //   } catch (err) {
  //     console.error(`Failed to download ${fileName}`, err);
  //     return null;
  //   }
  // }

  formatDateToDDMMYYYY(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`; // DD-MM-YYYY
    }
    return dateStr;
  }

  handleDOB(): void {
    const today = new Date();
    const YearsAgo = new Date();
    YearsAgo.setFullYear(today.getFullYear() - 12); // Minimum valid DOB

    const dobControl = this.studentForm.get('childDob');

    dobControl?.valueChanges.subscribe(date => {
      const selected = new Date(date);

      if (selected > YearsAgo) {
        this.dobTooRecent = true;
        dobControl.setErrors({ tooYoung: true });
      } else {
        this.dobTooRecent = false;
        if (dobControl.hasError('tooYoung')) {
          const errors = { ...dobControl.errors };
          delete errors['tooYoung'];
          dobControl.setErrors(Object.keys(errors).length ? errors : null);
        }
      }
    });
  }

  handleResultDateLimit(): void {
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    // Normalize time
    oneYearAgo.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const resultControl = this.studentForm.get('passedYear');

    resultControl?.valueChanges.subscribe((date: any) => {
      const selected = new Date(date);
      selected.setHours(0, 0, 0, 0);

      const isOutOfRange = selected < oneYearAgo || selected >= today;

      this.isResultDateOutOfRange = isOutOfRange;

      if (isOutOfRange) {
        resultControl.setErrors({ ...resultControl.errors, outOfRange: true });
      } else {
        if (resultControl.hasError('outOfRange')) {
          const errors = { ...resultControl.errors };
          delete errors['outOfRange'];
          resultControl.setErrors(Object.keys(errors).length ? errors : null);
        }
      }
    });
  }

  onReset(): void {

    if (this.flag === 'contiune') {
      this.status = 'C';
      const resultControl = this.studentForm.get('passedYear');
      if (resultControl?.hasError('outOfRange')) {
        resultControl.setErrors(null);
      }
      // Store disabled field values first (so we can preserve them)
      const childName = this.studentForm.get('childName')?.value;
      const childDob = this.studentForm.get('childDob')?.value;
      const childGender = this.studentForm.get('childGender')?.value;

      // Reset the entire form
      this.studentForm.reset();

      // Restore disabled field values after reset
      this.studentForm.get('childName')?.setValue(childName);
      this.studentForm.get('childDob')?.setValue(childDob);
      this.studentForm.get('childGender')?.setValue(childGender);

      this.currentCourseOptions = this.courseOptions['default'];
      this.showOtherCourseInput = false;
      this.isResultDateOutOfRange = false;
      this.applicationID = '';
      this.setparent();
      this.studentForm.get('schemeYears')?.enable();
      this.handleCgpaAndMarksLogic();
      return
    }
    this.studentForm.reset();
    this.newscholarship();
    // Clear custom validation error manually for resultDate
    const resultControl = this.studentForm.get('passedYear');
    if (resultControl?.hasError('outOfRange')) {
      resultControl.setErrors(null);
    }
    this.removeFiles = {};
    this.studentForm.get('childName')?.enable();
    this.studentForm.get('childDob')?.enable();
    this.studentForm.get('childGender')?.enable();
    this.currentCourseOptions = this.courseOptions['default'];
    this.showOtherCourseInput = false;
    this.isResultDateOutOfRange = false;
    this.applicationID = '';
    this.setparent();
    this.flag = '';
    this.status = '';
    this.newscholarship();
    this.handleCgpaAndMarksLogic();
    this.special = false;
    this.achiver = false;
  }

onBack(): void {
  this.dialog.confirm('Any unsaved changes will be lost. Do you want to go back?', 'CONFIRMATION')
    .then(result => {
      if (result) {
        this.onReset();
        this.router.navigate(['portal/scholarship/check-status']);
      }
    });
}

}

