import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { UiDirectivesModule, FileuploadDirective } from 'toi-libraries'; 
import { ScholarshipApiService } from '../../../services/scholarship/scholarship_api.service'; 
import { HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { LoaderService } from '../../../shared/shared-services/loader.service'; 
import { CommonDialogService } from '../../../shared/shared-services/common-dialog.service'; 
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CustomTableDirective } from "../../../shared/shared-directives/custom-table.directive";
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-check-status',
  standalone: true,
  imports: [
    UiDirectivesModule,
    RouterOutlet,
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    CustomTableDirective
],
  templateUrl: './check-status.component.html',
  styleUrl: './check-status.component.scss'
})
export class CheckStatusComponent implements OnInit {
  tableData: any[] = [];
  today = new Date();
  studentForm: FormGroup;
  applicationID:any;
  selectedStudentDetails: any = {};
  @ViewChild(FileuploadDirective) fileuploadDirective!: FileuploadDirective;
  tableColumns = [
    {key: 'studentId', label: 'Student ID',  isLink: true},
    { key: 'childName', label: 'Name' },
    { key: 'schemeApplied', label: 'Scheme' },
    { key: 'schemeYears', label: 'Year' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions', isAction: true }
  ];
fieldList = [
  { key: 'childName', label: 'Name of the Student' },
  { key: 'childDob', label: 'Date of Birth' },
  { key: 'childGender', label: 'Gender' },
  { key: 'childEmailId', label: 'Email ID' },
  { key: 'childMaritalStatus', label: 'Marital Status' },
  { key: 'childContactNo', label: 'Student Contact No.' },
  { key: 'parentName', label: 'Name of the Employee (Parent)' },
  { key: 'parentContact', label: 'Employee Contact No.' },
  { key: 'examPassed', label: 'Exam Passed' },
  { key: 'firstAttempt', label: 'Passed in First Attempt' },
  { key: 'resultDate', label: 'Result Date' },
  { key: 'marksObtained', label: 'Marks Obtained' },
  { key: 'marksTotal', label: 'Marks Out Of' },
  { key: 'aggregate', label: 'Aggregate (%)' },
  { key: 'schemeApplied', label: 'Scheme Applied' },
  { key: 'courseApplied', label: 'Course Applied' },
  { key: 'courseDuration', label: 'Duration of the Course' },
  { key: 'currentYear', label: 'Current Year' },
  { key: 'collegeName', label: 'Name of College' },
  { key: 'doc1', label: 'Student Marksheet' },
  { key: 'doc2', label: 'Admission Letter' },
  { key: 'doc3', label: 'Special Student supporting document' },
  { key: 'doc4', label: 'National / State Level Achievement Certificate' }
];
private loadingTable = false;
  private destroy$ = new Subject<void>();
  private clickHandler!: (e: any) => void;
  private escHandler!: (e: KeyboardEvent) => void;
   constructor(private fb: FormBuilder, private dialog: CommonDialogService, private api: ScholarshipApiService, public router: Router, private loader: LoaderService) {
        this.studentForm = this.fb.group({
          cheque: [null, Validators.required],
        });
    }

  ngOnInit(): void {
        this.clickHandler = (event: any) => {
      const openModal = document.querySelector('.modal.show') as HTMLElement;

      if (!openModal) return;

      // Close button
      if (event.target?.classList.contains('btn-close')) {
        this.closeModal(openModal.id);
      }

      // Backdrop click
      if (event.target === openModal) {
        this.closeModal(openModal.id);
      }
    };
    
      this.escHandler = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      const openModal = document.querySelector('.modal.show') as HTMLElement;
      if (openModal) {
        this.closeModal(openModal.id);
      }
    }
  };
    this.onReset();

    this.fetchStudentData();
    document.addEventListener('click', this.clickHandler);
    document.addEventListener('keydown', this.escHandler);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    this.loader.hide();
    document.removeEventListener('click', this.clickHandler);
    document.removeEventListener('keydown', this.escHandler);
  }

  openModal(modalId: string): void {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('show');
      document.body.classList.add('modal-open');
    }
  }

  closeModal(modalId: string): void {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('show');
      document.body.classList.remove('modal-open');
    }
  }
fetchStudentData(): void {
  if (this.loadingTable) return;
  this.loadingTable = true;

  this.loader.show();

  this.api.getDetailsByTOID()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res) => {
        const rawData = res?.[0]?.data || [];

        const newData = rawData.map((item: any[]) => {
          const statusLabel = this.mapStatus(item[30]);
          return {
            studentId: this.getStudentLink(item[0], item),
            childName: item[1],
            schemeApplied: item[11],
            schemeYears: item[31],
            status: statusLabel,
            actions: this.getActions(statusLabel, item),
            rawData: item
          };
        });

        // ✅ defer assignment to avoid directive re-entry
        Promise.resolve().then(() => {
          this.tableData = newData;
          this.loader.hide();
          this.loadingTable = false;
        });
      },
      error: (err) => {
        this.loader.hide();
        this.loadingTable = false;
        console.error('Failed to load data:', err);
        this.dialog.alert('Session expired! Please log in again.');
      }
    });
}


  mapStatus(code: string): string {
    if (['L', 'LC'].includes(code)) return 'In Process';
    if (['A', 'AC'].includes(code)) return 'Accepted';
    if (['R', 'RC'].includes(code)) return 'Rejected';
    if (code === 'P') return 'Awarded';
    return 'Unknown';
  }
  showCheque = false;
  chequemodalOpen() {
    this.showCheque = true;
  }

  chequemodalClose() {
    this.showCheque = false;
  }


 getActions(status: string, student: any): any[] {
  const actions: any[] = [];

  if (status === 'In Process') {
    actions.push({
      icon: '✏️',
      label: 'Edit Application',
      tooltip: 'Edit this application',
      callback: () => this.editStudent(student)
    });
  }

  if (status === 'Awarded') {
     const today = new Date();
  const currentYearNow = today.getFullYear();
  const createdYear = Number(student[31]); // Ensure number

  // Condition for Continue Scholarship: createdYear is exactly one year before current year
  const isContinue = createdYear === currentYearNow - 1;
    
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    const createdyear = student[31];

 
  if (createdyear == currentYearNow) {
    actions.push({
      icon: '📤',
      label: 'Upload Cheque',
      tooltip: 'Upload Cheque',
      callback: () => {
        this.showChequeModal(student);
        // const input = document.createElement('input');
        // input.type = 'file';
        // input.accept = '.pdf,.jpg,.jpeg,.png';
        // input.style.display = 'none';

        // input.addEventListener('change', (event: any) => {
        //   const file: File = event.target.files[0];
        //   const maxSize = 10 * 1024 * 1024; // 10MB

        //   if (file) {
        //     if (file.size > maxSize) {
        //       this.dialog.alert('File size must not exceed 10MB. Please upload a smaller file.');
        //       return;
        //     }

        //     this.uploadCheque(student, file);
        //   }
        // });

        // document.body.appendChild(input);
        // input.click();

        // input.addEventListener('click', () => {
        //   setTimeout(() => document.body.removeChild(input), 1000);
        // });
      }
    });
  }


    // Always add upload and certificate actions
    actions.push(
      {
        icon: '📄',
        label: 'Download Certificate',
        tooltip: 'Download Certificate',
        callback: () => this.downloadCertificate(student)
      }
    );

    if(isContinue){
      actions.push(
        {
         icon: '🔁',
        label: 'Continue Scholarship',
        tooltip: 'Continue to Next Year',
        callback: () => this.continueScholarship(student)
      }
      )
    }
  }

  return actions;
}


  getStudentLink(id: string, student: any): { label: string, tooltip?: string, callback: () => void } {
    return {
      label: id,
      tooltip: 'View application',
      callback: () => this.showStudentDetailsModal(student)
    };
  }

  editStudent(student: any) {
    this.router.navigate(['/portal/scholarship/new-scholarship'], {
      state: { studentData: student, flag : 'edit' }
    });
  }

  uploadCheque(student: any, file: File): void {
    const selectedFiles: { [key: string]: File } = {};
    if (file) {
      selectedFiles['cheque'] = file;
      const applicationID = student[0];
      this.api.uploadAttachments(selectedFiles, applicationID).subscribe({
        next: (res) => {
          // console.log('Files uploaded:', res);
          this.dialog.alert('File uploaded successfully', 'CONFIRMATION');
        },
        error: (err) => {
          console.error('File upload failed:', err);
          this.dialog.alert('File upload failed. Please try again.');
        }
      });
    }
  }

  downloadCertificate(student: any): void {
    const body = new URLSearchParams();
    body.set('passedYear', student[9]);
    body.set('name', student[1]);
    body.set('category', student[37]);
    body.set('exam', student[8]);

    this.dialog.alert(`Downloading Certificate for: ${student[1]}`).then(()=>{
          this.api.downloadCertificate(body).subscribe({
      next: (blob: Blob) => {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = `${student[1]}-certificate.pdf`;
        a.click();
        URL.revokeObjectURL(objectUrl);
      },
      error: (err) => {
        console.error('Download failed', err);
        this.dialog.alert('Failed to download certificate.');
      }
    });
    })


  }

  continueScholarship(student: any) {
    this.router.navigate(['/portal/scholarship/new-scholarship'], {
      state: { studentData: student, flag : 'contiune' }
    });
  }

private triggerDownload(blob: Blob, fileName: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => window.URL.revokeObjectURL(url), 100);
}
downloadDocument(fileName: string, type: string = '', applicationId: string = ''): void {
  if (!fileName) return;

  this.api.downloadFile(fileName, type, applicationId).subscribe({
    next: (res: HttpResponse<Blob>) => {
      const blob = res.body;

      if (!blob || blob.size === 0) {
        this.dialog.alert('File not found or empty.');
        return;
      }

      // 🔹 Try parsing blob as JSON (covers cases where server sends application/octet-stream with error object)
      const tryParseAsJson = (blob: Blob) => {
        return new Promise<any>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              resolve(JSON.parse(reader.result as string));
            } catch {
              reject();
            }
          };
          reader.onerror = () => reject();
          reader.readAsText(blob);
        });
      };

      tryParseAsJson(blob)
        .then((json) => {
          // ✅ It's JSON → handle success/failure
          if (json && json.success === false) {
            this.dialog.alert(json.message || 'File not found.');
            return;
          }

          // If JSON but valid success = true with file info → fallback to file download
          this.triggerDownload(blob, fileName);
        })
        .catch(() => {
          // ❌ Not JSON → treat as real file
          this.triggerDownload(blob, fileName);
        });
    },
    error: (err) => {
      console.error('Download failed:', err);
      this.dialog.alert('Failed to download the file. Please try again.');
    }
  });
}
downloadCheque(applicationID: any): void {
  const type = "attach";

  this.api.downloadFile("", type, applicationID).subscribe({
    next: (response) => {
      const blob = response.body!;
      if (!blob || blob.size === 0) {
        this.studentForm.get('cheque')?.setValue(null);
        this.dialog.alert('File not found or empty.');
        return;
      }
      // console.log(this.studentForm.get('cheque')?.value)
       const tryParseAsJson = (blob: Blob) => {
        return new Promise<any>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              resolve(JSON.parse(reader.result as string));
            } catch {
              reject();
            }
          };
          reader.onerror = () => reject();
          reader.readAsText(blob);
        });
      };
            tryParseAsJson(blob)
        .then((json) => {
          // ✅ It's JSON → handle success/failure
          if (json && json.success === false) {
            this.studentForm.get('cheque')?.setValue(null);
            return;
          }

          // If JSON but valid success = true with file info → fallback to file download
           this.patchFileFromBlob(blob, response);
        })
        .catch(() => {
          // ❌ Not JSON → treat as real file
           this.patchFileFromBlob(blob, response);
        });
    },
    error: (err) => {
      this.studentForm.get('cheque')?.setValue(null);
      this.studentForm.get('cheque')?.updateValueAndValidity();
   
    }
  });
}

/**
 * Helper method to extract filename and patch file into form
 */
private patchFileFromBlob(blob: Blob, response: any) {
  // 🔹 Extract filename
  let filename = "";
 
  const headerFilename = response.headers.get("X-Filename");
  const contentDisposition = response.headers.get("Content-Disposition");
  if (headerFilename) {
    filename = headerFilename.trim();
  } else if (contentDisposition) {
    const match = /filename="?([^"]+)"?/.exec(contentDisposition);
    if (match && match[1]) filename = match[1];
  }

  // 🔹 Create file object
  const file = new File([blob], filename, { type: blob.type || "application/pdf" });

  // 🔹 Patch actual file into form control
  this.studentForm.patchValue({ cheque: filename });
  this.studentForm.get('cheque')?.updateValueAndValidity();
  this.removeFiles['cheque'] = filename;
  // console.log("Cheque file patched into form:", file);
}



showChequeModal(student: any): void {
  this.studentForm.get('cheque')?.setValue(null);
  this.applicationID = student[0];
  // this.openModal('ChequeModal');
  this.chequemodalOpen() 
  this.downloadCheque(this.applicationID);
}


selectedFiles: { [key: string]: File } = {};
removeFiles: { [key: string]: string } = {};

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

  // ✅ Store the actual File object, not just file.name
  this.selectedFiles = { [controlName]: file };
  control.setValue(file.name);

  this.loader.show();
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
  Promise.resolve().then(() => {
    this.api.uploadAttachments(this.selectedFiles, this.applicationID).subscribe({
      next: (res) => {
        this.loader.hide();
        if (res.success === true) {
          this.dialog.alert(res.message, 'CONFIRMATION').then(() => {
            if (this.removeFiles[controlName]) {
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
  const fileName = this.removeFiles[controlName];
  const control = this.studentForm.get(controlName);
  // console.log(fileName);
  if (!fileName) {
    console.warn('No file name found for control:', controlName);
    return;
  }
  this.dialog.confirm(`Do you want to delete the uploaded cheque?`, 'CONFIRMATION')
    .then(result => {
      if (result) {

   control?.setValue(null);
        delete this.removeFiles[controlName];

        // ✅ Trigger real hidden input inside directive
        // this.fileuploadDirective.openFileChooser();
      }
      else{
        control?.setValue(this.removeFiles[controlName])
      }
    });
  
}

onFileDownload(event: { fileName: string; controlName: string }) {
  let type = "attach";
  // console.log('Download triggered:', event);

  this.api.downloadFile(event.fileName, type, this.applicationID).subscribe({
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
            this.dialog.alert(errorJson.message.trim() || 'Failed to download the file.');
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

  // showStudentDetailsModal(data: any[]): void {
  //   const clean = (val: any) => val && val !== 'NA' && val !== '0' && val.toString().trim() !== '';
  //     const formatDuration = (val: any) => clean(val) ? `${val} year(s)` : null;

  //   const formatCurrentYear = (courseApplied: any) => {
  //     if (!clean(courseApplied) || !courseApplied.includes('-')) return null;

  //     const yearPart = courseApplied.split('-').pop()?.trim(); // take last part after '-'
  //     const yearMap: { [key: string]: string } = {
  //       '1': '1st Year',
  //       '2': '2nd Year',
  //       '3': '3rd Year',
  //       '4': '4th Year',
  //       '5': '5th Year'
  //     };

  //     return yearMap[yearPart] || null;
  //   };

  //   this.selectedStudentDetails = {
  //     applicationId: clean(data[0]) ? data[0] : null,
  //     childName: clean(data[1]) ? data[1] : null,
  //     childDob: clean(data[2]) ? data[2] : null,
  //     childGender: clean(data[3]) ? data[3] : null,
  //     childEmailId: clean(data[5]) ? data[5] : null,
  //     childMaritalStatus: clean(data[4]) ? data[4] : null,
  //     childContactNo: clean(data[6]) ? data[6] : null,
  //     parentName: clean(data[37]) ? data[37] : null,
  //     parentContact: clean(data[7]) ? data[7] : null,
  //     examPassed: clean(data[8]) ? data[8] : null,
  //     firstAttempt: clean(data[10]) ? data[10] : null,
  //     resultDate: clean(data[9]) ? data[9] : null,
  //     collegeName: clean(data[18]) ? data[18] : null,
  //     marksObtained: clean(data[14]) ? data[14] : null,
  //     marksTotal: clean(data[15]) ? data[15] : null,
  //     aggregate: clean(data[17]) ? data[17] : null,
  //     schemeApplied: clean(data[11]) ? data[11] : null,
  //     courseApplied: clean(data[20]) ? data[20] : null,
  //     courseDuration: formatDuration(data[19]),
  //     currentYear: formatCurrentYear(data[20]),
  //     doc1: clean(data[23]) ? data[23] : null,
  //     doc2: clean(data[24]) ? data[24] : null,
  //     doc3: clean(data[25]) ? data[25] : null,
  //     doc4: clean(data[38]) ? data[38] : null
  //   };

  //   const modalElement = document.getElementById('studentDetailsModal');
  //   if (modalElement) {
  //     const modal = new bootstrap.Modal(modalElement);
  //     modal.show();
  //   }
  // }
  showStudentDetailsModal(data: any[]): void {
  const clean = (val: any) => val && val !== 'NA' && val !== '0' && val.toString().trim() !== '';
  const formatDuration = (val: any) => clean(val) ? `${val} year(s)` : null;

  const formatCurrentYear = (courseApplied: any) => {
    if (!clean(courseApplied) || !courseApplied.includes('-')) return null;

    const yearPart = courseApplied.split('-').pop()?.trim();
    const yearMap: { [key: string]: string } = {
      '1': '1st Year',
      '2': '2nd Year',
      '3': '3rd Year',
      '4': '4th Year',
      '5': '5th Year'
    };

    return yearMap[yearPart] || null;
  };

  this.selectedStudentDetails = {
    applicationId: clean(data[0]) ? data[0] : null,
    childName: clean(data[1]) ? data[1] : null,
    childDob: clean(data[2]) ? data[2] : null,
    childGender: clean(data[3]) ? data[3] : null,
    childEmailId: clean(data[5]) ? data[5] : null,
    childMaritalStatus: clean(data[4]) ? data[4] : null,
    childContactNo: clean(data[6]) ? data[6] : null,
    parentName: clean(data[37]) ? data[37] : null,
    parentContact: clean(data[7]) ? data[7] : null,
    examPassed: clean(data[8]) ? data[8] : null,
    firstAttempt: clean(data[10]) ? data[10] : null,
    resultDate: clean(data[9]) ? data[9] : null,
    collegeName: clean(data[18]) ? data[18] : null,
    marksObtained: clean(data[14]) ? data[14] : null,
    marksTotal: clean(data[15]) ? data[15] : null,
    aggregate: clean(data[17]) ? data[17] : null,
    schemeApplied: clean(data[11]) ? data[11] : null,
    courseApplied: clean(data[20]) ? data[20] : null,
    courseDuration: formatDuration(data[19]),
    currentYear: formatCurrentYear(data[20]),
    doc1: clean(data[23]) ? data[23] : null,
    doc2: clean(data[24]) ? data[24] : null,
    doc3: clean(data[25]) ? data[25] : null,
    doc4: clean(data[38]) ? data[38] : null
  };

  this.openModal('studentDetailsModal');
}


  onReset(): void {
  this.studentForm.reset();
  this.applicationID = '';
  this.selectedFiles ={};
  this.removeFiles= {};
  }

printStudentDetails(): void {
  const printArea = document.getElementById('printArea');
  if (!printArea) return;

  printArea.style.display = 'block';

  this.loader.show();

  html2canvas(printArea, { scale: 2, useCORS: true }).then(canvas => {
    const imgData = canvas.toDataURL('image/png');

    if (!imgData.startsWith('data:image/png')) {
      console.error('❌ Invalid PNG data');
      printArea.style.display = 'none';
      this.loader.hide();
      this.dialog.alert('Unexpected error while processing the data, Please try again!', 'ALERT');
      return;
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const logo = 'logo/new_logo.jpeg';
    const logoImg = new Image();
    logoImg.src = logo;

    logoImg.onload = () => {
      const logoWidth = 45;
      const logoHeight = 23;
      const xPos = (pageWidth - logoWidth) / 2;
      const yPos = 10;

      pdf.addImage(logoImg, 'JPEG', xPos, yPos, logoWidth, logoHeight);

      const contentY = yPos + logoHeight + 10;
      pdf.addImage(imgData, 'PNG', 0, contentY, pageWidth, pageHeight - contentY);

      pdf.save(`Application_${this.selectedStudentDetails.childName}_${this.selectedStudentDetails.applicationId}.pdf`);

      this.loader.hide();
      this.dialog.alert(
        'File has been downloaded successfully.',
        'CONFIRMATION'
      );

      printArea.style.display = 'none';
    };
  }).catch(err => {
    console.error('❌ html2canvas failed:', err);
    this.loader.hide();
    this.dialog.alert('Failed to generate Pdf file. Please try again.', 'ALERT');
    printArea.style.display = 'none';
  });
}

  
}
