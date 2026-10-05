import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from '../../core/services/common.service';
import { LoaderService } from '../../shared/shared-services/loader.service';
import { CommonDialogService } from '../../shared/shared-services/common-dialog.service';
import { SharedApiService } from '../../shared/shared-services/shared-api.service';
import { UiDirectivesModule } from 'toi-libraries';

@Component({
  selector: 'app-partner-locator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UiDirectivesModule],
  templateUrl: './partner-locator.component.html',
  styleUrl: './partner-locator.component.scss'
})

export class PartnerLocatorComponent implements OnInit {

  locatorForm!: FormGroup;

  searchColleagues: any[] = [];
  colleaguesDataList: colleaguesList[] = [];
  colleaguesList: colleaguesList[] = [];
  emailListcount: EmailData[] = [];
  uniqueVendorCode: number[] = [];
  currentIndex: number | null = null;
  show = false;
  showErr = false;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private loaderService: LoaderService,
    private commonService: CommonService,
    private fb: FormBuilder,
    private router: Router,
    private dialogService: CommonDialogService,
    private service: SharedApiService

  ) {
    
  }

  ngOnInit(): void {
    this.commonService.setTitle('Partner Locator');

    this.locatorForm = this.fb.group({
      queryString: ['']
    });
  }


  callDynamicData(): void {
  const value: string = this.locatorForm.value.queryString;

  if (!value) return;

  // 🔹 value is numeric string (enforced by directive)
  this.getColleaguesData(value);
}
//  getColleaguesData(searchString: string): void {
//     // ✅ HARD RESET (VERY IMPORTANT)
//   this.searchColleagues = [];
//   this.colleaguesDataList = [];
//   this.colleaguesList = [];
//   this.uniqueVendorCode = [];
//   this.emailListcount = [];
//   this.show = false;
//   this.showErr = false;

//   this.loaderService.show();
//           let res = [
//                       {
//                           "data": [
//                               [
//                                   "0020076925",
//                                   "DELL INTERNATIONAL SERVICES",
//                                   "AAACH1925Q",
//                                   "india_remits@dell.com",
//                                   "PRIMARY EMAIL ID",
//                                   "03-OCT-2025"
//                               ],
//                               [
//                                   "0020076928",
//                                   "DELL INTERNATIONAL SERVICES",
//                                   "AAACH1925Q",
//                                   "NA",
//                                   "ADDITIONAL EMAIL ID",
//                                   "03-OCT-2025"
//                               ],
//                               [
//                                   "0020076926",
//                                   "DELL INTERNATIONAL SERVICES",
//                                   "AAACH1925Q",
//                                   "india_remits@dell.com",
//                                   "ADDITIONAL EMAIL ID",
//                                   "03-OCT-2025"
//                               ]
//                           ],
//                           "message": "",
//                           "status": "success"
//                       }
//                   ]
//           if(res?.[0]?.status === "success"){
//                   const data = res?.[0]?.data;

//         if (!data || data.length === 0) {
//           this.showErr = true;
//           return;
//         }
//         this.show = true;
//         this.searchColleagues = data;

//         data.forEach((row: any) => {
//           const vendorCode = row[0];

//           if (!this.uniqueVendorCode.includes(vendorCode)) {
//             this.uniqueVendorCode.push(vendorCode);

//             this.colleaguesDataList.push({
//               vendorCode: vendorCode,
//               name: row[1],
//             });
//           }

//           this.emailListcount.push({
//             email: row[4],
//             additionalEmail: row[3]
//           });
//         });

//         this.colleaguesList = [...this.colleaguesDataList];
//         }

//        this.loaderService.hide();
//  }

  getColleaguesData(searchString: string): void {
  this.searchColleagues = [];
  this.colleaguesDataList = [];
  this.colleaguesList = [];
  this.uniqueVendorCode = [];
  this.emailListcount = [];
  this.show = false;
  this.showErr = false;

  this.loaderService.show();

    this.service.getVendorData(searchString.toString()).subscribe({
      next: (res:any) => {
        this.loaderService.hide();
        if(res?.[0]?.status === "success"){
                  const data = res?.[0]?.data;

        if (!data || data.length === 0) {
          this.showErr = true;
          return;
        }
        this.show = true;
        this.searchColleagues = data;

        data.forEach((row: any) => {
          const vendorCode = row[0];

          if (!this.uniqueVendorCode.includes(vendorCode)) {
            this.uniqueVendorCode.push(vendorCode);

            this.colleaguesDataList.push({
              vendorCode: vendorCode,
              name: row[1],
            });
          }

          this.emailListcount.push({
            email: row[4],
            additionalEmail: row[3]
          });
        });

        this.colleaguesList = [...this.colleaguesDataList];
        }
      },
      error: () => {
        this.loaderService.hide();
        this.showErr = true;
      }
    });
  }

  clearSearchData(): void {
  this.locatorForm.reset();

  this.show = false;
  this.showErr = false;
  this.currentIndex = null;

  this.searchColleagues = [];
  this.colleaguesDataList = [];
  this.emailListcount = [];
  this.colleaguesList = [];
  this.uniqueVendorCode = [];
}

  onSearchKeyUp(isInput = false): void {
    const query = this.locatorForm.value.queryString;
    if (!query) {
      this.colleaguesList = [];
      this.show = false;
      return;
    }

    if (!isInput) {
      this.colleaguesList = [...this.colleaguesDataList];
    }
  }


  openMail(email: string): void {
    this.document.location.href = `mailto:${email}`;
  }

  trackByVendor(_: number, item: colleaguesList): number | undefined{
    return item.vendorCode;
  }
    toggleDetails(index: number): void {
    this.currentIndex = this.currentIndex === index ? null : index;
  }

}

export interface Colleague {
  vendorCode: number;
  name: string;
}

export interface EmailData {
  email: string;
  additionalEmail: string;
}
export interface colleaguesList {
  email?: string;
  additionalEmail?: string;
  name?: string;
  Branch?: string;
  Location?:string;
   Department?:string;
   Designation?:string;
   Phone?:number;
   Mobile?:number;
   Extension?:number;
   individualImage?:any;
   imagecheck?:any;
   vendorCode?:number;
  checked?: boolean;

  }
