import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { UiDirectivesModule } from 'toi-libraries';
import { PopupService } from '../../../services/scholarship/shared/popup.service';
import { LoaderService } from '../../../shared/shared-services/loader.service';
import { ScholarshipApiService } from '../../../services/scholarship/scholarship_api.service';
import { FormsModule } from '@angular/forms';
import { CommonDialogService } from '../../../shared/shared-services/common-dialog.service';
import { ScholarshipCommonService } from '../../../services/scholarship/shared/scholarship_common.service';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CustomTableDirective } from "../../../shared/shared-directives/custom-table.directive";


declare var bootstrap: {
  Modal: any;
  // you can add Tooltip, Dropdown etc. if you need later
};
@Component({
  selector: 'app-process',
  standalone: true,
  imports: [UiDirectivesModule,
    RouterOutlet,
    RouterModule,
    CommonModule, FormsModule, CustomTableDirective],
  templateUrl: './process.component.html',
  styleUrl: './process.component.scss'
})
export class ProcessComponent implements OnInit {
  tableData: any[] = [];
  today = new Date();
  flag = ''
  remarks: string | null = '';
  private modalRef?: any;
  private modalResolve: ((value: string | null) => void) | null = null;


  tableColumns = [
    { key: 'srNo', label: 'Sr No.' },
    { key: 'applicationNo', label: 'Application No.', isLink: true },
    { key: 'employeeName', label: 'Name of Employee' },
    { key: 'designation', label: 'Designation' },
    { key: 'function', label: 'Function' },
    { key: 'appliedPlan', label: 'Applied Plan' },
    { key: 'aggregate', label: 'Aggregate' },
    { key: 'applicationStatus', label: 'Application Status' },
    { key: 'appliedOn', label: 'Applied On' },
    { key: 'Action', label: 'Action', isAction: true },
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
  selectedStudentDetails: any = {};
  months = [
    { label: 'Jan', id: 'JAN' },
    { label: 'Feb', id: 'FEB' },
    { label: 'Mar', id: 'MAR' },
    { label: 'Apr', id: 'APR' },
    { label: 'May', id: 'MAY' },
    { label: 'Jun', id: 'JUN' },
    { label: 'Jul', id: 'JUL' },
    { label: 'Aug', id: 'AUG' },
    { label: 'Sep', id: 'SEP' },
    { label: 'Oct', id: 'OCT' },
    { label: 'Nov', id: 'NOV' },
    { label: 'Dec', id: 'DEC' },
  ];
  private loadingTable = false;
  years: number[] = [];
  selectedMonth: string = '';
  currentYear = new Date().getFullYear();
  selectedYear: number = this.currentYear;
  private destroy$ = new Subject<void>();
  private clickHandler!: (e: any) => void;
  private escHandler!: (e: KeyboardEvent) => void;
  constructor(

    private api: ScholarshipApiService,
    public router: Router,
    private loader: LoaderService,
    private dialog: CommonDialogService,

  ) { }

  ngOnInit(): void {

    for (let i = this.currentYear - 1; i <= this.currentYear; i++) {
      this.years.push(i);
    }

    const now = new Date();
    const monthIndex = now.getMonth(); // 0-11
    this.selectedMonth = this.months[monthIndex].id;
    this.selectedYear = this.currentYear;
    //  this.clickHandler = (event: any) => {
    //   const openModal = document.querySelector('.modal.show') as HTMLElement;

    //   if (!openModal) return;

    //   // Close button
    //   if (event.target?.classList.contains('btn-close')) {
    //     this.closeModal(openModal.id);
    //   }

    //   // Backdrop click
    //   if (event.target === openModal) {
    //     this.closeModal(openModal.id);
    //   }
    // };
    this.clickHandler = (event: any) => {
      const openModal = document.querySelector('.modal.show') as HTMLElement;

      if (!openModal) return;

      if (event.target?.classList.contains('btn-close')) {
        this.onRemarkClose(false);
        this.closeModal(openModal.id);
      }

      if (event.target === openModal) {
        this.onRemarkClose(false);
        this.closeModal(openModal.id);
      }
    };


    this.escHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        const openModal = document.querySelector('.modal.show') as HTMLElement;
        if (openModal) {
          this.onRemarkClose(false);
          this.closeModal(openModal.id);
        }
      }
    };
    // 🔹 Call API first time with defaults
    this.loadData();
    // this.fetchStudentData();
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
  // showRemark= false;
  // remarkmodalOpen() {
  //   this.showRemark = true;
  // }

  // remarkmodalClose() {
  //   this.showRemark = false;
  // }

  loadData(): void {

    if (this.loadingTable) return;
    this.loadingTable = true;

    this.loader.show();

    this.api
      .getPendingRequest(this.currentYear, this.selectedYear, this.selectedMonth)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const rawData = res?.[0]?.data || [];
          let counter = 1;

          const newData = rawData.map((item: any[]) => {
            const statusLabel = this.mapApplicationStatus(item[39]);
            const actionStatus = this.mapStatus(item[39]);

            return {
              srNo: counter++,
              applicationNo: this.getStudentLink(item[0], item),
              employeeName: item[34] || '',
              designation: item[35] || '',
              function: item[36] || '',
              appliedPlan: item[11] || '',
              aggregate: item[17] || '',
              applicationStatus: statusLabel,
              appliedOn: item[27] || '',
              Action: this.getActions(actionStatus, item)
            };
          });
          this.tableData = null as any;

          Promise.resolve().then(() => {
            this.tableData = [...newData]; 
            this.loader.hide();
            this.loadingTable = false;
          });
        },

        error: (err) => {
          this.loader.hide();
          this.loadingTable = false;
          console.error('Failed to load data:', err);
          this.dialog.alert('Session expired! Please log in again.');
        },
      });
  }

  mapApplicationStatus(code: string): string {
    if (['L'].includes(code)) return 'New Application';
    if (['LC'].includes(code)) return 'Continued Application';
    if (['A', 'AC'].includes(code)) return 'Shortlisted';
    if (['R', 'RC'].includes(code)) return 'Rejected';
    if (code === 'P') return 'Awarded';
    return 'Unknown';
  }
  mapStatus(code: string): string {
    if (['L', 'LC'].includes(code)) return 'In Process';
    if (['A', 'AC'].includes(code)) return 'Accepted';
    if (['R', 'RC'].includes(code)) return 'Rejected';
    if (code === 'P') return 'Awarded';
    return 'Unknown';
  }

  getActions(status: string, item: any): any[] {
    const actions: any[] = [];
    if (status === 'In Process') {
      actions.push({
        icon: '',
        label: 'Shortlist',
        callback: () => this.acceptApplication(item),
      });
      actions.push({
        icon: '',
        label: 'Reject',
        callback: () => this.rejectApplication(item),
      });
    }
    if (status === 'Accepted') {
      actions.push({
        icon: '✅',
        label: '',
        tooltip: 'Shortlisted',
        className: 'btn flag disable'
      });
    }
    if (status === 'Rejected') {
      actions.push({
        icon: '❌',
        label: '',
        tooltip: 'Rejected',
        className: 'btn flag disable'
      });
    }
    return actions
  }


  // private modalResolve: ((value: string | null) => void) | null = null;

  private openRemarkModal(): Promise<string | null> {
    return new Promise(resolve => {
      const modalId = 'remarkModal';
      const modalElement = document.getElementById(modalId);

      if (!modalElement) {
        resolve(null);
        return;
      }

      // 🔑 Always reset remarks when opening
      this.remarks = '';

      // Store resolver
      this.modalResolve = resolve;

      // Open modal using your logic
      this.openModal(modalId);
      // this.remarkmodalOpen();
    });
  }

  onRemarkClose(submit: boolean) {
    if (this.modalResolve) {
      if (submit) {
        this.modalResolve(this.remarks); // even empty string allowed
      } else {
        this.modalResolve(null); // cancelled
      }
      this.modalResolve = null;
    }

    this.closeModal('remarkModal');
    // this.remarkmodalClose();
    this.remarks = '';
  }


  async acceptApplication(item: any[]) {
    const confirmed = await this.dialog.confirm(
      'Would you like to shortlist the application?',
      'CONFIRMATION'
    );
    if (!confirmed) return;

    const remark = await this.openRemarkModal();
    if (remark === null) {
      // ❌ user cancelled/closed → don't hit API
      // console.log('Modal closed without submitting');
      return;
    }
    const ApplicationNo = item[0];
    const prevStatus = item[39];
    const status = prevStatus === 'L' ? 'A' : (prevStatus === 'LC' ? 'AC' : 'A');

    this.loader.show();
    try {
      const res = await firstValueFrom(
        this.api.updatePending(ApplicationNo, status, remark, prevStatus)
      );
      this.loader.hide();
      this.remarks = "";

      const flag = res?.[0]?.data;
      if (flag) {
        await this.dialog.alert('Application Shortlisted successfully', 'CONFIRMATION');
        this.loadData();
      } else {
        this.dialog.alert('Unable to Shortlist this application. Please try again');
      }
    } catch (err) {

      console.error('Failed to update application:', err);
      this.dialog.alert('Something went wrong while Shortlisting the application. Please try again.');
    }
  }


  async rejectApplication(item: any[]) {
    const confirmed = await this.dialog.confirm(
      'Would you like to reject this application?',
      'CONFIRMATION'
    );
    if (!confirmed) return;

    const remark = await this.openRemarkModal();
    if (remark === null) {
      // ❌ user cancelled/closed → don't hit API
      // console.log('Modal closed without submitting');
      return;
    }

    const ApplicationNo = item[0];
    const prevStatus = item[39];
    let status = '';

    if (prevStatus === 'L') {
      status = 'R';
    } else if (prevStatus === 'LC') {
      status = 'RC';
    } else {
      status = 'R';
    }

    this.loader.show();
    try {
      const res = await firstValueFrom(
        this.api.updatePending(ApplicationNo, status, remark, prevStatus)
      );
      this.loader.hide();
      this.remarks = ""; // clear local remarks

      const flag = res?.[0]?.data;
      if (flag) {
        await this.dialog.alert('Application rejected successfully', 'CONFIRMATION');
        this.loadData();
      } else {
        this.dialog.alert('Unable to reject this application. Please try again');
      }
    } catch (err) {
      this.loader.hide();
      console.error('Failed to reject application:', err);
      this.dialog.alert('Something went wrong while rejecting the application. Please try again.');
    }
  }

  getStudentLink(id: string, student: any): { label: string, tooltip?: string, callback: () => void } {
    return {
      label: id,
      tooltip: 'View application',
      callback: () => this.showStudentDetailsModal(student)
    };
  }

  showStudentDetailsModal(data: any[]): void {
    this.flag = data[33];
    const clean = (val: any) => val && val !== 'NA' && val !== '0' && val.toString().trim() !== '';
    const formatDuration = (val: any) => clean(val) ? `${val} year(s)` : null;

    const formatCurrentYear = (courseApplied: any) => {
      if (!clean(courseApplied) || !courseApplied.includes('-')) return null;

      const yearPart = courseApplied.split('-').pop()?.trim(); // take last part after '-'
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
      parentName: clean(data[34]) ? data[34] : null,
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
      doc4: clean(data[41]) ? data[41] : null
    };

    // const modalElement = document.getElementById('studentDetailsModal');
    // if (modalElement) {
    //   const modal = new bootstrap.Modal(modalElement);
    //   modal.show();
    // }
    this.openModal('studentDetailsModal');
    // console.log(this.selectedStudentDetails);
  }

  downloadDocument(fileName: string, type: string = '', applicationId: string = ''): void {
    if (!fileName) return;

    this.api.downloadFile(fileName, type, applicationId, this.flag).subscribe({
      next: (res: HttpResponse<Blob>) => {
        const blob = res.body;

        if (!blob || blob.size === 0) {
          this.dialog.alert('File not found');
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
