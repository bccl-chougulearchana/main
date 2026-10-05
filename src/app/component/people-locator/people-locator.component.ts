
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
  selector: 'app-people-locator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UiDirectivesModule],
  templateUrl: './people-locator.component.html',
  styleUrls: ['./people-locator.component.scss']
})
export class PeopleLocatorComponent implements OnInit {

  locatorForm!: FormGroup;
  destroy$ = new Subject<void>();

  colleaguesDataList: Colleague[] = [];
  colleaguesList: Colleague[] | null = null;

  show = false;
  currentIndex: number | null = null;
private readonly MOCK_COLLEAGUES_RESPONSE = [
  {
    data: [
      [
        "15514",                               // 0
        "sachin.jadhav@timesgroup.com",        // 1 email
        "Mr. Sachin Jadhav",                   // 2 name
        "Bennett, Coleman & Co. Ltd.",         // 3 company
        "Bccl - Kandivili",                    // 4 Branch
        "Bccl - Airoli",                       // 5 Location
        "Bccl - Engineering",                  // 6 Department
        "Assistant Manager",                   // 7 Designation
        "91-22-27609642",                      // 8
        "-",                                   // 9
        "91-22-27609645",                      // 10 Phone
        "9642",                                // 11 Extension
        "-",                                   // 12
        "91-9619659844",                       // 13 Mobile
        "91-22-27695544",                      // 14
        "91-253-2412151",                      // 15
        "EXE",                                 // 16
        ""                                     // 17 image (empty)
      ]
    ]
  }
];

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
    this.colleaguesList = null;

    this.fetchColleagues(query);
  }

  fetchColleagues(search: string): void {
    this.loader.show();

    this.sharedApi.informColleagues(search).subscribe({
      
      next: (res: any[]) => {
        this.loader.hide();
        this.show = true;

        const data = res?.[0]?.data;
        if (!data) {
          this.colleaguesList = [];
          return;
        }

        this.colleaguesDataList = data.map((el: any) => ({
          email: el[1],
          name: el[2],
          Branch: el[4],
          Location: el[5],
          Department: el[6],
          Designation: el[7],
          Phone: el[10],
          Extension: el[11],
          Mobile: el[13],
          imagecheck: el[17],
          individualImage: this.sanitizer.bypassSecurityTrustResourceUrl(
            `data:image/jpg;base64,${el[17]}`
          )
        }));
         
        this.colleaguesList = [...this.colleaguesDataList];
      },
      error: () => {
         this.show = true;
        this.loader.hide()}
    });
  }
//   fetchColleagues(search: string): void {
//   this.loader.show();

//   // ⛔ API temporarily disabled (401)
//   // this.sharedApi.informColleagues(search).subscribe(...);

//   setTimeout(() => {
//     this.loader.hide();
//     this.show = true;

//     // ✅ DIRECT UI DATA (no mapping, no res handling)
//     this.colleaguesList = [
//       {
//         email: 'sachin.jadhav@timesgroup.com',
//         name: 'Mr. Sachin Jadhav',
//         Branch: 'Bccl - Kandivili',
//         Location: 'Bccl - Airoli',
//         Department: 'Bccl - Engineering',
//         Designation: 'Assistant Manager',
//         Phone: 91-22-27609645,
//         Extension: 9642,
//         Mobile: 91-9619659844,
//         individualImage: 'assets/images/profile4.png',
//         imagecheck: false
//       },
//        {
//         email: 'sachin.jadhav@timesgroup.com',
//         name: 'Mr. Sachin Jadhav',
//         Branch: 'Bccl - Kandivili',
//         Location: 'Bccl - Airoli',
//         Department: 'Bccl - Engineering',
//         Designation: 'Assistant Manager',
//         Phone: 91-22-27609645,
//         Extension: 9642,
//         Mobile: 91-9619659844,
//         individualImage: 'assets/images/profile4.png',
//         imagecheck: false
//       },
//        {
//         email: 'sachin.jadhav@timesgroup.com',
//         name: 'Mr. Sachin Jadhav',
//         Branch: 'Bccl - Kandivili',
//         Location: 'Bccl - Airoli',
//         Department: 'Bccl - Engineering',
//         Designation: 'Assistant Manager',
//         Phone: 91-22-27609645,
//         Extension: 9642,
//         Mobile: 91-9619659844,
//         individualImage: 'assets/images/profile4.png',
//         imagecheck: false
//       }
//     ];

//   }, 500); // simulate API delay
// }


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

  toggleDetails(index: number): void {
    this.currentIndex = this.currentIndex === index ? null : index;
  }

  openMail(email: string): void {
    this.document.location.href = `mailto:${email}`;
  }

  detailFields(item: Colleague) {
    return [
      // { icon: 'assets/images/people/user.png', value: item.name },
      { icon: 'asset/images/people/Company.png', value: item.Branch },
      { icon: 'asset/images/people/Location.png', value: item.Location },
      { icon: 'asset/images/people/Mobile.png', value: item.Mobile },
      { icon: 'asset/images/people/Phone.png', value: item.Phone },
      { icon: 'asset/images/people/Extn.png', value: item.Extension },
      { icon: 'asset/images/people/Department.png', value: item.Department },
      { icon: 'asset/images/people/Work.png', value: item.Designation }
    ];
  }
}

export interface Colleague {
  email: string;
  name: string;
  Branch: string;
  Location: string;
  Department: string;
  Designation: string;
  Phone: number;
  Mobile: number;
  Extension: number;
  individualImage: any;
  imagecheck: any;
}

