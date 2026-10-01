import { Component, EventEmitter, HostListener, Output, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
// import { DynamicDropdownDirective } from '../../../projects/bccl-library/src/public-api';
// import { UiDirectivesModule } from 'toi-libraries'
import { quickLinksModel,  NavigationLink} from '../../../core/modals/config-model'; // adjust import path
import { CommonService } from '../../../core/services/common.service';
import { UtilityService } from '../../shared-services/utility.service';
import { DynamicDropdownDirective } from '../../shared-directives/dropdown-menu.directive';
import { filter, Subscription } from 'rxjs';
import * as CryptoJS from 'crypto-js';
import { SharedApiService } from '../../shared-services/shared-api.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-mini-header',
  standalone: true,
  imports: [CommonModule, DynamicDropdownDirective],
  templateUrl: './mini-header.component.html',
  styleUrl: './mini-header.component.scss'
})
export class MiniHeaderComponent implements OnInit {
loginId: any = '';
  @Output() urlSelected = new EventEmitter<string>();
  isFixed = false;
  companyCode = '';
  private sub3!: Subscription;
  menuList: {
    label: string;
    items: { label: string; action?: () => void }[];
  }[] = [];
empData:any;
  constructor(private http: HttpClient, private commonService: CommonService, private utility: UtilityService, private api: SharedApiService, private router: Router) {}

  ngOnInit(): void {
    this.loginId = localStorage.getItem("portalId");
    this.loadMenuData();
     this.sub3 = this.utility.empData$
      .pipe(
        filter(val => !!val && typeof val === 'object') 
      )
      .subscribe(val => {
        this.companyCode = val.companyCode;
      });
    const data = localStorage.getItem('emp');
        if (data) {
          const decrypted = JSON.parse(CryptoJS.AES.decrypt(data, 'SECRET_KEY').toString(CryptoJS.enc.Utf8));
          // this.empData.next(decrypted);
          this.empData = decrypted
          this.companyCode = this.empData.companyCode;
        }
  }

  private selectPage(url: string): void {
    this.urlSelected.emit(url);
  }

private loadMenuData(): void {
  this.commonService.quicklinkConfig().subscribe({
    next: (res: quickLinksModel) => {
      if (!res || res.status !== 'success' || !res.data) {
        this.menuList = [];
        return;
      }

      const navLinks: NavigationLink[] = res.data.navigationLinks || [];

      const normalizedLinks = navLinks.map(l => ({
        ...l,
        _normalizedName: this.normalizeName(l.name || '')
      }));

      const menuObj: { [k: string]: string[] } =
        (res.data as any).Menu || (res.data as any).menu || {};

      this.menuList = Object.keys(menuObj)
        .map(menuLabel => {
          const menuValues = menuObj[menuLabel] || [];

          const items = this.mapMenuItems(menuValues, normalizedLinks);
          return { label: menuLabel, items };
        })
        .filter(menu => !!menu.label);
    }
  });
}

private mapMenuItems(
  menuLabels: string[] = [],
  links: any[] = []
): { label: string; action?: () => void }[] {
  if (!Array.isArray(menuLabels) || !Array.isArray(links)) return [];

  return menuLabels
    .map(label => {
      if (!label) return null;

      const normalizedLabel = this.normalizeName(label);

      const match = links.find(
        l => l._normalizedName === normalizedLabel && l.visible === true
      );

      if (match) {
        return {
          label: match.name,
          action: () => this.openLinkTest(match)
        };
      }

      return { label };
    })
    .filter(Boolean) as { label: string; action?: () => void }[];
}


private normalizeName(name: string): string {
  return name
    ?.toLowerCase()
    .trim()
    .replace(/\s+/g, '')           // REMOVE ALL SPACES
    .replace(/\(\s*/g, '(')        // clean "( "
    .replace(/\s*\)/g, ')')        // clean " )"
    .replace(/[^a-z0-9()]/g, '');  // remove unwanted chars except () and letters
}


// openLinkTest(item: any) {
//  if(item.name === 'MY-HR'){
//     if(this.companyCode === '1009'){
//     return;
//   }
//   }
//   let url = item.url;
//   let openInIframe = item.internalExternalCon;
//   let applName = item.quickName;
//   // console.log('Url', url);

//   if (!url || url.trim() === '') {
//     console.warn('Empty URL — skipping navigation.');
//     return;
//   }

//   let finalUrl = url;

//   // ✅ Only add tdata if quickName (applName) is present
//   if (applName && applName.trim() !== '') {

//     // 👇 Shape matches your earlier decoding:
//     // usr_reference, usr_application, usr_email
//     const tdataObj = {
//       applName: applName || '',
//       loginId: this.loginId || ''
//     };

//     // Base64 encode
//     const encoded = btoa(JSON.stringify(tdataObj));

//     // Extra safety: URL-encode the base64 (because of + / =)
//     const safeEncoded = encodeURIComponent(encoded);

//     finalUrl = `${url}${url.includes('?') ? '&' : '?'}tdata=${safeEncoded}`;
//   }
// // console.log(finalUrl);
//   if (openInIframe) {
//     // 🔹 Open inside main layout’s iframe
//     this.utility.setIframeUrl(finalUrl);
//   } else {
//     // 🔹 Open externally in a new tab
//     window.open(finalUrl, '_blank');
//   }
// }


openLinkTest(item: any) {
  if (!item) {
    return;
  }

  const route = typeof item.route === 'string' ? item.route.trim() : '';

  if (route) {
    this.api.postVisit('Menu', 'Menu', item.name).subscribe({
      next: (res: any) => {
        if (res.status === "success") {
        //  console.log(res)
        }
      },
      error: (err) => {
        console.error('Failed', err);
      }
    });

    this.utility.setIframeUrl(null);
    this.router.navigateByUrl(route);
    return;
  }

  let url = item.url;

  if (item.companyUrls && this.companyCode in item.companyUrls) {
    url = item.companyUrls[this.companyCode];
  }

  // ❌ If empty → do nothing
  if (!url || url.trim() === '') {
    console.warn('Empty URL — skipping navigation.');
    return;
  }

       this.api.postVisit('Menu', 'Menu', item.name).subscribe({
      next: (res: any) => {
        if (res.status === "success") {
        //  console.log(res)
        }
      },
      error: (err) => {
        console.error('Failed', err);
      }
    });

  let openInIframe = item.internalExternalCon;
  let applName = item.quickName;

  let finalUrl = url;

  if (applName && applName.trim() !== '') {

    const tdataObj = {
      applName: applName || '',
      loginId: this.loginId || ''
    };

    const encoded = btoa(JSON.stringify(tdataObj));
    const safeEncoded = encodeURIComponent(encoded);

    finalUrl = `${url}${url.includes('?') ? '&' : '?'}tdata=${safeEncoded}`;
  }

  if (openInIframe) {
    this.utility.setIframeUrl(finalUrl);
  } else {
    window.open(finalUrl, '_blank');
  }
}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    this.isFixed = scrollTop > 0;
  }
}
