import { Component, ElementRef, EventEmitter, HostListener, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
// import { DynamicGridDirective, SideNavDirective, UiDirectivesModule } from '../../../projects/bccl-library/src/public-api';
import { UiDirectivesModule } from 'toi-libraries'
import { NgIf, NgClass, CommonModule } from '@angular/common';
import { AutheticationService } from '../../../services/auth/authetication.service';
import { Router, RouterLink } from '@angular/router';
import { ForgotPassComponent } from '../../../component/authetication/forgot-pass/forgot-pass.component';
import { UtilityService } from '../../shared-services/utility.service';
import { filter, Subject, Subscription, takeUntil } from 'rxjs';
import { quickLinksModel, NavigationLink } from '../../../core/modals/config-model';
import { CommonService } from '../../../core/services/common.service';
import { FormsModule } from '@angular/forms';
import { ScrollService } from '../../shared-services/scroll.service';
import * as CryptoJS from 'crypto-js';
import { SharedApiService } from '../../shared-services/shared-api.service';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ NgIf, ForgotPassComponent, UiDirectivesModule, FormsModule, CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() toggle = new EventEmitter<void>();
  @Output() urlSelected = new EventEmitter<string>();
  showSearch = false;
  popupOpen = false;
  isHeaderFixed = false; // 🧩 Controls header state (fixed/static)
  isExpanded = false;
  companyCode = '';
  today = new Date();
  @ViewChild('searchOverlay') searchOverlay!: ElementRef;
  @ViewChild('smSearchOverlay') smSearchOverlay!: ElementRef;
  private sub2!: Subscription;
  private sub3!: Subscription;
  menuItems: any[] = [];
  iconLinks: any ;
  utilityIcons: any[] = [];
  appIcons: any[] = [];
  mobileIcons: any[] = [];
  popupIcons: any[] = [];
  appIconsGrid: any = { xs: 1, sm: 1, md: 8, lg: 8, xl: 8, xxl: 8 };
  showPopup = false;
  destroy$ = new Subject<boolean>();
  searchText: string = '';
  filteredItems: any[] = [];
  quicklinkLoadData: any;
  loginId: any = '';
  isDropdownOpen: boolean = false;
  isSmallScreen: boolean = window.innerWidth < 768;
  logoUrl: string = 'asset/images/timescape_logo.png';
  notificationCount = 0;
  empData:any;
  private scrollTicking = false;
  constructor(private auth: AutheticationService, private router: Router, private utility: UtilityService, private commonService: CommonService, private scrollService: ScrollService, private api: SharedApiService) { }

  ngOnInit(): void {
    this.loginId = localStorage.getItem("portalId");
    this.quicklinkLoad();
    this.headerLoad();
    //  this.sub3 = this.utility.empData$
    //       .pipe(
    //         filter(val => !!val && typeof val === 'object') 
    //       )
    //       .subscribe(val => {
    //         this.companyCode = val.companyCode;
    //         console.log('code', this.companyCode)
    //       });
    const data = localStorage.getItem('emp');
    if (data) {
      const decrypted = JSON.parse(CryptoJS.AES.decrypt(data, 'SECRET_KEY').toString(CryptoJS.enc.Utf8));
      // this.empData.next(decrypted);
      this.empData = decrypted
      // console.log(this.empData);
      this.companyCode = this.empData.companyCode;
      this.utility.setempData(this.empData);
    }
      this.sub2 = this.utility.alerts$
        .pipe(filter(val => Array.isArray(val) && val.length > 0))
        .subscribe(val => {
          this.notificationCount = val.length;
        }); 
  }

  onLogoClick() {
    this.toggle.emit();
  }

onNotificationClick() {
  this.utility.setIframeUrl(null);

  const isHome = this.router.url.includes('/portal/home');

  if (!isHome) {
    // Needs a route change + render; scroll on the next frame after navigation resolves.
    this.router.navigate(['/portal/home']).then(() => {
      requestAnimationFrame(() =>
        requestAnimationFrame(() => this.scrollService.scrollTo('alerts-section'))
      );
    });
  } else {
    // Already on Home — the section exists, so scroll on the next frame (no artificial delay).
    requestAnimationFrame(() => this.scrollService.scrollTo('alerts-section'));
  }
}



quicklinkLoad() {
  this.commonService.quicklinkConfig()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: any) => {
        if (!res || !res.data) {
          this.quicklinkLoadData = { navigationLinks: [] };
          this.menuItems = [];
          return;
        }

        const allLinks = res.data.navigationLinks || [];

        // ----------------------------
        //  STRONG NORMALIZATION
        // ----------------------------
        const normalize = (str: string = '') => this.normalizeStrong(str);

        // ----------------------------
        //  PROCESS QUICKLINKS (ORDERED)
        // ----------------------------
        const allowedQuickLinks = (res.data.quickLinks || [])
          .filter((q: string) => !!q)
          .map((q: string) => normalize(q));

        let filteredQuickLinks = allLinks.filter((link: any) => {
          const nameNorm = normalize(link.name);
          return allowedQuickLinks.includes(nameNorm) && link.visible === true;
        });

        // Maintain frontend order exactly as quickLinks[]
        filteredQuickLinks = filteredQuickLinks.sort((a: any, b: any) => {
          const aIndex = allowedQuickLinks.indexOf(normalize(a.name));
          const bIndex = allowedQuickLinks.indexOf(normalize(b.name));
          return aIndex - bIndex;
        });

        this.quicklinkLoadData = {
          ...res.data,
          navigationLinks: allLinks
        };

        
        const menuObj = (res.data.menu || res.data.Menu || {});
        this.menuItems = this.buildMenuItems(menuObj, allLinks);

        this.iconLinks = {};
        allLinks.forEach((link: any) => {
          if (link?.name) {
            this.iconLinks[normalize(link.name)] = link;
          }
        });
      },
      error: (err) => console.error('Failed to load quicklinks config:', err),
    });
}


/** 🔹 Load header design/pattern (icons, order, behavior) from headerconfig.json.
 *  Links for app icons are still resolved from quickLinks.json via iconLinks. */
headerLoad() {
  this.commonService.headerConfig()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: any) => {
        const data = res?.data || {};
        const byOrder = (a: any, b: any) => (a.order || 0) - (b.order || 0);
        this.utilityIcons = (data.utilityIcons || []).slice().sort(byOrder);
        this.appIcons     = (data.appIcons || []).slice().sort(byOrder);
        this.mobileIcons  = (data.mobileIcons || []).slice().sort(byOrder);
        this.popupIcons   = (data.popupIcons || []).slice().sort(byOrder);
        if (data.appIconsGrid) this.appIconsGrid = data.appIconsGrid;
        if (data.logo) this.logoUrl = data.logo;
      },
      error: (err) => console.error('Failed to load header config:', err),
    });
}

/** 🔹 Central dispatcher for a header icon click, based on its config "type". */
onIconAction(item: any) {
  if (!item) return;
  switch (item.type) {
    case 'callback':  this.runIconCallback(item.action); break;
    case 'external':  this.openLink(item.url, false);    break;
    case 'quicklink': this.openLinkTest(this.resolveQuickLink(item)); break;
    // 'route' -> handled by [routerLink]; 'quicklinksToggle'/'search' -> own handlers
  }
}

/** 🔹 Small-screen popup (.headlinks) icon click: close popup first, then run the action. */
onPopupIconAction(item: any) {
  this.closePopup();
  this.onIconAction(item);
}

/** 🔹 Named UI actions that aren't plain external URLs. */
private runIconCallback(action: string) {
  switch (action) {
    case 'home':          this.onLogoClick();             break;
    case 'alerts':        this.onNotificationClick();     break;
    case 'passwordReset': this.forgotPasswordPopupOpen(); break;
    case 'logout':        this.logout();                  break;
  }
}

/** 🔹 Resolve a header app-icon to its link from quickLinks.json (via iconLinks map). */
private resolveQuickLink(item: any) {
  if (!this.iconLinks || !item) return null;
  return this.iconLinks[item.quickKey]
      || (item.fallbackKey ? this.iconLinks[item.fallbackKey] : null);
}


private buildMenuItems(menuObj: any, links: NavigationLink[]): any[] {
  if (!menuObj || !links || !Array.isArray(links)) return [];

  const normalize = (str: string = '') => this.normalizeStrong(str);

  const menuArray: any[] = [];

  Object.keys(menuObj).forEach(menuLabel => {
    const childLabels: string[] = menuObj[menuLabel] || [];

    const children = childLabels
      .map(label => {
        if (!label) return null;

        const normalizedLabel = normalize(label);

        const match = links.find(
          l => normalize(l.name) === normalizedLabel && l.visible === true
        );

        if (match) {
          return {
            label: match.name,
            action: () => this.openLinkTest(match),
          };
        }

        return { label }; // static item
      })
      .filter(Boolean);

    menuArray.push({
      label: menuLabel,
      children,
    });
  });

  return menuArray;
}

onSearch(event: any) {
  const normalize = (str: string = '') => this.normalizeStrong(str);

  const queryRaw = event.target.value || '';
  const query = normalize(queryRaw);
  
  const allLinks = (this.quicklinkLoadData?.navigationLinks || [])
    .filter((item: any) => item.visible && item.name);
  
  if (!query) {
    this.filteredItems = [];
    this.isDropdownOpen = false;
    return;
  }

  // Match against strong-normalized name or quickName
  this.filteredItems = allLinks.filter((item: any) => {
    const name = normalize(item.name);
    const quick = normalize(item.quickName || '');
    return name.includes(query) || quick.includes(query);
  });

  // Limit + dropdown toggle
  this.filteredItems = this.filteredItems.slice(0, 15);
  this.isDropdownOpen = this.filteredItems.length > 0;
}


// quicklinkLoad() {
//   this.commonService.quicklinkConfig()
//     .pipe(takeUntil(this.destroy$))
//     .subscribe({
//       next: (res: any) => {
//         if (!res || !res.data) {
//           this.quicklinkLoadData = { navigationLinks: [] };
//           this.menuItems = [];
//           return;
//         }

//         const allLinks = res.data.navigationLinks || [];

//         // ----------------------------
//         // ✅ STRONG NORMALIZATION
//         // ----------------------------
//         const normalize = (str: string = '') =>
//           str.toLowerCase().replace(/\s+/g, ' ').trim();

//         // ----------------------------
//         // ✅ PROCESS QUICKLINKS (ORDERED)
//         // ----------------------------
//         const allowedQuickLinks = (res.data.quickLinks || [])
//           .filter((q: string) => !!q)
//           .map((q: string) => normalize(q));

//         let filteredQuickLinks = allLinks.filter((link: any) => {
//           const nameNorm = normalize(link.name);
//           return allowedQuickLinks.includes(nameNorm) && link.visible === true;
//         });

//         // 🔹 Keep same order as quickLinks array
//         filteredQuickLinks = filteredQuickLinks.sort((a: any, b: any) => {
//           const aIndex = allowedQuickLinks.indexOf(normalize(a.name));
//           const bIndex = allowedQuickLinks.indexOf(normalize(b.name));
//           return aIndex - bIndex;
//         });

//         // Assign for Home + Header QuickLinks
//         this.quicklinkLoadData = {
//           ...res.data,
//           navigationLinks: filteredQuickLinks
//         };

//         // ----------------------------
//         // ✅ BUILD SIDENAV MENU
//         // ----------------------------
//         const menuObj =
//           (res.data as any).menu || (res.data as any).Menu || {};

//         this.menuItems = this.buildMenuItems(menuObj, allLinks);

//         // ----------------------------
//         // ✅ BUILD HEADER ICON LINKS
//         // ----------------------------
//         this.iconLinks = {};

//         allLinks.forEach((link: any) => {
//           if (link?.name) {
//             const key = normalize(link.name);
//             this.iconLinks[key] = link;
//           }
//         });

//         console.log("🔍 Final QuickLinks:", this.quicklinkLoadData.navigationLinks);
//         console.log("📌 SideNav:", this.menuItems);
//         console.log("⭐ Header Icons:", this.iconLinks);
//       },
//       error: (err) => console.error('Failed to load quicklinks config:', err),
//     });
// }
// private buildMenuItems(menuObj: any, links: NavigationLink[]): any[] {
//   if (!menuObj || !links || !Array.isArray(links)) {
//     return [];
//   }

//   // 🔹 Strong normalization (fixes spaces, multiple spaces, casing)
//   const normalize = (str: string = '') =>
//     str.toLowerCase().replace(/\s+/g, ' ').trim();

//   const menuArray: any[] = [];

//   Object.keys(menuObj).forEach((menuLabel) => {
//     const childLabels: string[] = menuObj[menuLabel] || [];

//     const children = childLabels
//       .map((label) => {
//         if (!label) return null;

//         const normalizedLabel = normalize(label);

//         // 🔹 Match navigationLinks by normalized name
//         const match = links.find(
//           (l) => normalize(l.name) === normalizedLabel && l.visible === true
//         );

//         if (match) {
//           return {
//             label: match.name,
//             action: () => this.openLinkTest(match),
//           };
//         }

//         // 🔸 When link not found → show plain text
//         return { label };
//       })
//       .filter(Boolean);

//     menuArray.push({
//       label: menuLabel,
//       children,
//     });
//   });

//   return menuArray;
// }
  // onSearch(event: any) {
  //   const query = (event.target.value || '').trim().toLowerCase();

  //   // ✅ Get all visible links — ignore URL field now
  //   const allLinks = (this.quicklinkLoadData?.navigationLinks || [])
  //     .filter((item: any) => item.visible && item.name);

  //   if (!query) {
  //     this.filteredItems = [];
  //     this.isDropdownOpen = false;
  //     return;
  //   }

  //   // ✅ Match by name or quickName (no URL check)
  //   this.filteredItems = allLinks.filter((item: any) => {
  //     const name = item.name?.toLowerCase() || '';
  //     const quick = item.quickName?.toLowerCase() || '';
  //     return name.includes(query) || quick.includes(query);
  //   });

  //   // ✅ Sort by best match: name > quickName
  //   this.filteredItems.sort((a: any, b: any) => {
  //     const aNameMatch = a.name?.toLowerCase().includes(query);
  //     const bNameMatch = b.name?.toLowerCase().includes(query);

  //     if (aNameMatch && !bNameMatch) return -1;
  //     if (!aNameMatch && bNameMatch) return 1;

  //     const aQuickMatch = a.quickName?.toLowerCase().includes(query);
  //     const bQuickMatch = b.quickName?.toLowerCase().includes(query);

  //     if (aQuickMatch && !bQuickMatch) return -1;
  //     if (!aQuickMatch && bQuickMatch) return 1;

  //     // Fallback sort alphabetically by name
  //     return a.name.localeCompare(b.name);
  //   });

  //   // ✅ Limit to 15 items
  //   this.filteredItems = this.filteredItems.slice(0, 15);

  //   // ✅ Dropdown toggle
  //   this.isDropdownOpen = this.filteredItems.length > 0;

  // }

  private normalizeStrong(str: string = ''): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, '')           // remove ALL spaces
    .replace(/\(\s*/g, '(')
    .replace(/\s*\)/g, ')')
    .replace(/[^a-z0-9()]/g, '');  // keep only a-z 0-9 and ()
}


  /** 🔹 Search toggle logic */
  toggleSearch() {
    this.showSearch = !this.showSearch;

    // ✅ Reset when closing search
    if (!this.showSearch) {
      this.searchText = '';
      this.filteredItems = [];
      this.isDropdownOpen = false;
    }

    const input = (window.innerWidth <= 768
      ? this.smSearchOverlay?.nativeElement.querySelector('input')
      : this.searchOverlay?.nativeElement.querySelector('input')) as HTMLInputElement;

    if (input && this.showSearch) input.focus();
  }

  /** 🔹 When focus lost → close and clear search */
  closeSearch() {
    this.showSearch = false;
    this.searchText = '';
    this.filteredItems = [];
    this.isDropdownOpen = false;
  }

  /** 🔹 When input gains focus → show dropdown if results exist */
  onFocus() {
    this.isDropdownOpen = this.filteredItems.length > 0;
  }
 toggleExpand(contentRef: HTMLElement) {
    this.isExpanded = !this.isExpanded;
    if (!this.isExpanded && contentRef) {
      contentRef.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }
  /** 🔹 Mobile popup open/close */
  togglePopup() {
    this.popupOpen = !this.popupOpen;
  }

  closePopup() {
    this.popupOpen = false;
  }

  /** 🔹 URL navigation trigger */
  private selectPage(url: string) {
    this.urlSelected.emit(url);
  }

  /** 🧭 Scroll listener — makes header fixed after top */
  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Coalesce the many scroll events per frame into a single update to avoid
    // running change detection on every pixel of scroll.
    if (this.scrollTicking) return;
    this.scrollTicking = true;
    requestAnimationFrame(() => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const fixed = scrollTop > 0;
      if (fixed !== this.isHeaderFixed) {
        this.isHeaderFixed = fixed;
      }
      this.scrollTicking = false;
    });
  }

  logout() {

    this.auth.logout().pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.redirectToLogin(),
        error: () => this.redirectToLogin(),
      });
  }

  private redirectToLogin() {
    this.router.navigate(['/login'], { replaceUrl: true }).then(() => {
      this.router.resetConfig(this.router.config);
    });
  }

 @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }
  checkScreenSize() {
    const width = window.innerWidth;
    // Covers iPad Mini: 744px, 768px, 820px
    this.isSmallScreen = width <= 768;
    
    if(!this.isSmallScreen){
      // this.closePopup()
    }
  }

  forgotPasswordPopupOpen() {
    this.showPopup = true;
  }

  forgotPasswordPopupClose() {
    this.showPopup = false;
  }

  openLink(url: string, openInIframe: boolean) {
    if (openInIframe) {
      // 🔹 Open inside main layout’s iframe
      this.utility.setIframeUrl(url);
    } else {
      // 🔹 Open externally in a new tab
      window.open(url, '_blank');
    }
  }
/** ✅ Handle click on search result */
onSelectSearchItem(item: any, event: MouseEvent) {
  
  event.preventDefault();
  event.stopPropagation();
  if (!item || !item.url) return;
  this.openLinkTest(item, 'Search');
}


openLinkTest(item: any, cat:string = 'header') {
  if (!item) {
    return;
  }

  const route = typeof item.route === 'string' ? item.route.trim() : '';

  if (route) {
    this.utility.setIframeUrl(null);
    this.closePopup();
    this.closeSearch();
    this.router.navigateByUrl(route);
    this.logVisit(cat, item.name);
    return;
  }

  let url = item.url;

  if (item.companyUrls && this.companyCode in item.companyUrls) {
    url = item.companyUrls[this.companyCode];
  }

  if (!url || url.trim() === '') {
    console.warn('Empty URL — skipping navigation.');
    return;
  }

  const openInIframe = item.internalExternalCon;
  const applName = item.quickName;

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

  // Open first (keeps window.open inside the click gesture → no popup-blocker delay),
  // then log the visit in the background.
  if (openInIframe) {
    this.utility.setIframeUrl(finalUrl);
  } else {
    window.open(finalUrl, '_blank');
  }
  this.logVisit(cat, item.name);
}

/** 🔹 Fire-and-forget visit telemetry (auto-unsubscribed on destroy). */
private logVisit(cat: string, name: string) {
  this.api.postVisit(cat, cat, name)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: any) => {
        if (res?.status === 'success') {
          // logged
        }
      },
      error: (err) => console.error('postVisit failed', err),
    });
}

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    // Nothing to close when the dropdown isn't open — avoids a DOM check on every click.
    if (!this.isDropdownOpen) return;
    if (this.searchOverlay && !this.searchOverlay.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
     this.sub2?.unsubscribe();
    this.sub3?.unsubscribe();
  }
}