import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { CommonService } from '../../core/services/common.service';
import { LoaderService } from '../../shared/shared-services/loader.service';
import { CommonDialogService } from '../../shared/shared-services/common-dialog.service';
import { SharedApiService } from '../../shared/shared-services/shared-api.service';
import { UiDirectivesModule } from 'toi-libraries';

@Component({
  selector: 'app-requisitioner-locator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UiDirectivesModule],
  templateUrl: './requisitioner-locator.component.html',
  styleUrl: './requisitioner-locator.component.scss'
})
export class RequisitionerLocatorComponent {

   locatorForm!: FormGroup;
   destroy$ = new Subject<void>();
 
   colleaguesDataList: colleaguesList[] = [];
   colleaguesList: colleaguesList[] | null = null;
 
   show = false;
   currentIndex: number | null = null;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private loader: LoaderService,
    private commonService: CommonService,
    private router: Router,
    private dialogService: CommonDialogService,
    private sharedApi: SharedApiService
  ) {}

  ngOnInit(): void {
    this.commonService.setTitle('People Locator');

    this.locatorForm = this.fb.group({
      queryString: ['']
    });
  }

  
  callDynamicData(): void {
    const query = this.locatorForm.value.queryString;
    if (!query) return;
    this.currentIndex = null;
    this.show = false;
    this.fetchColleagues(query);
  }


  res= [
    {
        "data": [
            [
                "2500101606",
                "2017-04-26 00:00:00.0",
                "26-APR-2017",
                null,
                null,
                null,
                null,
                null,
                "2086",
                null,
                "0020012296",
                null,
                "2017-04-01 00:00:00.0",
                "2017-12-31 00:00:00.0",
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                "mahesh.mishra1@timesgroup.com",
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                "prakash.ubhad@timesgroup.com",
                "sap.admin@timesgroup.com",
                "2022-03-12 13:01:43.0",
                "sap.admin@timesgroup.com",
                "2022-03-16 21:10:01.0",
                "C",
                "1003",
                "157",
                "1000",
                " ",
                null,
                null,
                "S",
                "3160"
            ]
        ],
        "message": "",
        "status": "success"
    }
]
  fetchColleagues(search: string): void {
    this.loader.show();
        //  this.loader.hide();
        // this.show = true;
        // let res = this.res
        // const data = res?.[0]?.data;
     
      //   if (!data || data.length === 0) {
      //   this.show = false;
      //   return;
      // }

        // this.colleaguesDataList = data.map((el: any) => ({
        //   ponumber: el[0],
        //   vendorCode: el[10],
        //   requisitioneremailid: el[31],
          
        // }));

        // this.colleaguesList = [...this.colleaguesDataList];
      

    this.sharedApi.getPOData(search).subscribe({
      next: (res: any[]) => {
        this.loader.hide();
        this.show = true;

        const data = res?.[0]?.data;
     
        if (!data || data.length === 0) {
        this.show = false;
        return;
      }

        this.colleaguesDataList = data.map((el: any) => ({
          ponumber: el[0],
          vendorCode: el[10],
          requisitioneremailid: el[31],
          
        }));

        this.colleaguesList = [...this.colleaguesDataList];
      },
      error: () => this.loader.hide()
    });
  }

  onSearchKeyUp(isInput = false): void {
    const query = this.locatorForm.value.queryString;
    if (!query) {
      this.colleaguesList = null;
      this.show = false;
      return;
    }

    if (!isInput) {
      this.colleaguesList = [...this.colleaguesDataList];
    }
  }

  clearSearchData(): void {
    this.locatorForm.reset();
    this.colleaguesList = null;
    this.show = false;
    this.currentIndex = null;
  }
  openMail(email: string): void {
  window.location.href = `mailto:${email}`;
}


}

export interface colleaguesList {
  email?: string;
  additionalEmail?: string;
  name?: string;
  Branch?: string;
  Location?: string;
  Department?: string;
  Designation?: string;
  Phone?: number;
  Mobile?: number;
  Extension?: number;
  individualImage?: any;
  imagecheck?: any;
  vendorCode?: number;
  checked?: boolean;
  ponumber?: string;
  requisitioneremailid?: string;
}
