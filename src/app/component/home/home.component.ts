import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
// import { DynamicGridDirective, UiDirectivesModule } from '../../../projects/bccl-library/src/public-api';
import { UiDirectivesModule } from 'toi-libraries'
import { CarouselModule } from 'ngx-owl-carousel-o';
import { CommonModule, NgFor } from '@angular/common';
import { catchError, EMPTY, filter, map, of, Subject, Subscription, takeUntil, tap, Observable} from 'rxjs';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { SharedApiService } from '../../shared/shared-services/shared-api.service';
import { CorpConnectCarouselComponent } from '../../shared/shared-components/corp-connect-carousel/corp-connect-carousel.component';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { UtilityService } from '../../shared/shared-services/utility.service';
import { AppSettings } from '../../core/modals/appsettings';
import { FormsModule, NgModel } from '@angular/forms';
import { CommonService } from '../../core/services/common.service';
import { quickLinksModel } from '../../core/modals/config-model';
import { LoaderService } from '../../shared/shared-services/loader.service';
import { CommonDialogService } from '../../shared/shared-services/common-dialog.service';
// import { SafeUrlPipe } from '../shared/shared-pipes/safe-url.pipe';
import { UniversalVideoComponent } from '../../shared/shared-components/universal-video/universal-video.component';
import { ScrollService } from '../../shared/shared-services/scroll.service';
import { AutoAdaptiveGradientDirective } from '../../shared/shared-directives/auto-adaptive-gradient.directive';
import * as CryptoJS from 'crypto-js';
import { AutheticationService } from '../../services/auth/authetication.service';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgFor, CommonModule, CarouselModule, CorpConnectCarouselComponent, FormsModule, UiDirectivesModule, UniversalVideoComponent, AutoAdaptiveGradientDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  allStories: any[] = [];
  corpStories: any[] = [];
  empStories: any[] = [];
  leadStories: any[] = [];
  AppSettings = AppSettings;
  touchMoved = false;
 employeeConnection: any = {
  loop: true,
  mouseDrag: true,
  touchDrag: true,
  pullDrag: true,

  lazyLoad: true,
  autoplay: true,
  autoplaySpeed: 1200,
  navSpeed: 1200,
  smartSpeed: 1200,
  autoplayTimeout: 5000,
  autoplayHoverPause: true,

  dots: true,
  nav: false,

  responsive: {
    0: { items: 1 },
    400: { items: 1 },
    740: { items: 1 },
    940: { items: 1 }
  }
};


  leaderConnect: any = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    lazyLoad: true,
    
    autoplay: true,
    autoplaySpeed: 2000,
    navSpeed: 1500,
    smartSpeed: 2000,
    autoplayTimeout: 5000,
    autoplayHoverPause: true,
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 1
      },
      740: {
        items: 1
      },
      940: {
        items: 1
      }
    },
    nav: false
  }

  humourCarousel: any = {
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: true,
    // navSpeed: 700,
    margin: 20,
    lazyLoad: true,
    items: 3,     // show 3 items
    slideBy: 3,   // scroll 3 items at once
    // navText: ['', ''],
    autoplay: false,
    autoplaySpeed: 800,
    navSpeed: 400,
    smartSpeed: 400,
    responsive: {
      0: {
        items: 1,
        slideBy: 1
      },
      400: {
        items: 2,
        slideBy: 2
      },
      740: {
        items: 4,
        slideBy: 1
      },
      940: {
        items: 4,
        slideBy: 1
      }
    },
    nav: false
  }

  destroy$ = new Subject<boolean>();
  activeTab = 'corporate';
  alertNoticeBoard = 'myalerts';
  isSmallScreen: boolean = window.innerWidth < 768;

  currentUrl!: SafeResourceUrl;
  likeshowPopup: boolean = false;
  one: boolean = false;
  two: boolean = false;
  three: boolean = false;
  four: boolean = false;

  vcoquote = '';
  vcoauthor = '';
  vcolink = '';
  vcolinkText = '';

  videoUrl: SafeResourceUrl;

  isExpanded = false;

  humourImages: any[] = [
    { id: 1, img: 'asset/images/9a.jpg' },
    { id: 2, img: 'asset/images/9b.jpg' },
    { id: 3, img: 'asset/images/9c.jpg' },
    { id: 4, img: 'asset/images/9d.jpg' },
    { id: 5, img: 'asset/images/9c.jpg' },
    { id: 6, img: 'asset/images/9a.jpg' },
    { id: 7, img: 'asset/images/9b.jpg' },
    { id: 8, img: 'asset/images/9c.jpg' },
    { id: 9, img: 'asset/images/9d.jpg' },
    { id: 10, img: 'asset/images/9c.jpg' },
    { id: 11, img: 'asset/images/9d.jpg' },
    { id: 12, img: 'asset/images/9c.jpg' },
  ];
  @ViewChild('notificationSection') notificationSection!: any;
  @ViewChild('alertsSection') alertsSection!: any;
  @ViewChild('owlCarousel', { static: false }) owlCarousel!: any;
  private activeVideo: HTMLVideoElement | null = null;
  private autoplayStopped = false;
  likedUser: any[] = [];
  likedUsers = ['q', 'w', 'a', 'b', 'c', 'd', 'e', 'w', 'a', 'b', 'c', 'd', 'e']
  quickLinks: quickLinksModel[] = [];
  quicklinkLoadData: any;
  alertsList: any[] = [];
  noticesList: any[] = [];
  pollQuestion: string = '';
  // pollOptions: string[] = [];
  pollOptions: { id: number; name: string }[] = [];
  selectedOption: string = '';
  pollId: string = '';
  pollSummaries: any[] = [];
  // colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']; // palette
  colors = ['#00ccff', '#ff6666', '#ffcc66', '#33cccc', '#99cc99', '#0099cc']; // palette
  pollStatusCheck: boolean = false;
  setFirstTime: string = '';
  loginId: any = '';
  allLinks: any;
  isAdmin = false;
  private sub!: Subscription;
  private sub2!: Subscription;
  private sub3!: Subscription;
  private sub4!: Subscription;
  companyCode = '';
  empData: any;
  safeDescription!: SafeHtml;
  constructor(private Sanitizer: DomSanitizer, private sharedApiService: SharedApiService, private utility: UtilityService, private commonService: CommonService, private router: Router, private loader: LoaderService, private dialog: CommonDialogService, private scrollService: ScrollService, private auth: AutheticationService) {
    const youtubeId = 'a3ICNMQW7Ok';
    const embedUrl = `https://www.instagram.com/reel/DQwRmpOCEkC/?igsh=cm5zNXJmMHFzeTlp`;
    this.videoUrl = this.Sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  };

  // ngOnInit(): void {
  //   const nav = this.router.getCurrentNavigation();
  //   const state = history.state as { fromLogin?: boolean };
  //   const fromLogin = nav?.extras?.state?.['fromLogin'] || state.fromLogin;

  //   if (fromLogin) {
  //     // console.log("User came from LOGIN");
  //     history.replaceState({}, '');
  //   } else {
  //     // console.log("User REFRESHED or opened directly");
  //     this.checkAlreadyLogin();

  //   }
  //   this.checkScreenSize();
  //   this.quicklinkLoad();
  //   this.isAdmin = this.commonService.getIsAdmin();
  //   this.utility.setIframeUrl(null);
  //   this.vcoFetch();
  //   // this.fetchStories();
  //   this.loadCarouselImages();
  //   this.getPostedStories();
  //   this.getAlerts();
  //   this.getNotices();
  //   this.pollStatus();
  //   this.loginId = localStorage.getItem("portalId");
  //   this.sub = this.scrollService.scrollToSection$
  //     .pipe(filter(sectionId => !!sectionId))
  //     .subscribe(sectionId => { this.handleScroll(sectionId); this.scrollService.scrollTo(null) });

  //   this.sub2 = this.utility.alert$
  //     .pipe(filter(alert => alert !== null && alert !== undefined))
  //     .subscribe(alert => {
  //        setTimeout(() => { this.openAlert(alert); }, 300);
  //       setTimeout(() => { this.utility.setAlert(null); }) });

  //   this.sub3 = this.utility.notification$
  //     .pipe(filter(n => !!n))
  //     .subscribe(n => { this.openPopup(n); setTimeout(() => { this.utility.setNotification(null); }) });

  //   this.sub4 = this.utility.empData$
  //     .pipe(
  //       filter(val => !!val && typeof val === 'object')
  //     )
  //     .subscribe(val => {
  //       this.companyCode = val.companyCode;
  //     });

  //   const data = localStorage.getItem('emp');
  //   if (data) {
  //     const decrypted = JSON.parse(CryptoJS.AES.decrypt(data, 'SECRET_KEY').toString(CryptoJS.enc.Utf8));
  //     // this.empData.next(decrypted);
  //     this.empData = decrypted
  //     this.companyCode = this.empData.companyCode;
  //   }
  // }


  // 🔹 FIRST TIME ONLY


// async ngOnInit(): Promise<void> {
//   try {
//     await this.handleNavigationState();
//     this.auth.resetReloadLock();
//     this.initStaticSetup();
//     this.loadHomeSequence();
//   } catch {
//   }
// }
ngOnInit(): void {

  this.handleNavigationState$()
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      // ✅ Runs ONLY when session is valid or from login
      this.auth.resetReloadLock();
      this.initStaticSetup();
      this.loadHomeSequence();
    });
}


  private loadHomeSequence(): void {
    this.quicklinkLoad();
    this.vcoFetch();
    this.loadCarouselImages();
    this.getPostedStories();
    this.getAlerts();
    this.getNotices();
    this.pollStatus();
  }

private handleNavigationState$(): Observable<boolean> {
  const nav = this.router.getCurrentNavigation();
  const state = history.state as { fromLogin?: boolean };
  const fromLogin = nav?.extras?.state?.['fromLogin'] || state.fromLogin;

  if (fromLogin) {
    history.replaceState({}, '');
    return of(true); 
  }
 
  return of(true); 
  return this.auth.chkAlreadyLogin().pipe(
    tap(isValid => {
      if (!isValid) {
        this.router.navigate(['/login'], { replaceUrl: true });
      }
    }),
    filter((isValid): isValid is true => isValid), 
    catchError(() => {
      this.router.navigate(['/login'], { replaceUrl: true });
      return EMPTY;
    })
  );
}

  private initStaticSetup(): void {
    this.checkScreenSize();
    this.isAdmin = this.commonService.getIsAdmin();
    this.utility.setIframeUrl(null);
    this.loginId = localStorage.getItem('portalId');


    this.sub = this.scrollService.scrollToSection$
      .pipe(filter(sectionId => !!sectionId))
      .subscribe(sectionId => {
        this.handleScroll(sectionId);
        this.scrollService.scrollTo(null);
      });

    this.sub2 = this.utility.alert$
      .pipe(filter(alert => alert !== null && alert !== undefined))
      .subscribe(alert => {
        setTimeout(() => this.openAlert(alert), 300);
        setTimeout(() => this.utility.setAlert(null));
      });

    this.sub3 = this.utility.notification$
      .pipe(filter(n => !!n))
      .subscribe(n => {
        this.openPopup(n);
        setTimeout(() => this.utility.setNotification(null));
      });

    this.sub4 = this.utility.empData$
      .pipe(filter(val => !!val && typeof val === 'object'))
      .subscribe(val => {
        this.companyCode = val.companyCode;
      });

    const data = localStorage.getItem('emp');
    if (data) {
      const decrypted = JSON.parse(
        CryptoJS.AES.decrypt(data, 'SECRET_KEY').toString(CryptoJS.enc.Utf8)
      );
      this.empData = decrypted;
      this.companyCode = this.empData.companyCode;
    }
  }

    funCat(role: string = "default", cat: string = 'fun') {
    this.router.navigate(['/portal/funAndLevity'], {
      state: { cat: cat, role: role }
    });
  }

  openEmpLink(obj?: any) {
    if (obj.link == AppSettings.apitime + "/timescapenu/#/portal/funAndLevity"){
      this.funCat();
      return
    }
    else if (obj.link !== 'NA' && obj.type === 'Image') {
      window.open(obj.link, '_blank');
    }

     this.sharedApiService.postVisit(obj.id, obj.category, obj.header).subscribe({
      next: (res: any) => {
        if (res.status === "success") {
        //  console.log(res)
        }
      },
      error: (err) => {
        console.error('Failed', err);
      }
    });
  }
  openLinkFor(obj?: any) {

    if (obj.link !== 'NA' && obj.image !== 'NA') {
      window.open(obj.link, '_blank');
    }
  }
  onBannerTap(slide: any) {
    if (!this.touchMoved) {
      this.openEmpLink(slide);
    }
  }
 
  handleScroll(sectionId: string) {
    const sectionMap: any = {
      'notification-section': this.notificationSection,
      'alerts-section': this.alertsSection,
      // 'offers-section': this.offersSection
    };

    const sectionRef = sectionMap[sectionId];

    if (sectionRef?.nativeElement) {
      const yOffset = -160; // your header height
      const element = sectionRef.nativeElement;
      const yPosition = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({
        top: yPosition,
        behavior: 'smooth'
      });
    }
  }

  safeUrl(str: string): boolean {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  isVideo(fileName: string): boolean {
    const videoExtensions = ['.mp4', '.webm', '.mov', '.mkv', '.m4v', '.3gp'];
    return videoExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  }

  private findMatchingNavLink(feature: string): any | null {

    if (!feature || !this.quicklinkLoadData?.navigationLinks) return null;

    const normalizedFeature = this.normalizeName(feature);

    return (
      this.allLinks.find((link: any) => {

        // QuickName is already normalized by backend
        const normalizedLink = this.normalizeName(link.name);

        return (
          normalizedFeature === normalizedLink 
          // ||
          // normalizedFeature.includes(normalizedLink) ||
          // normalizedLink.includes(normalizedFeature)
        );
      }) || null
    );
  }
  
  
  openAlert(alert: any) {
    if (!alert?.feature) return;
    this.sharedApiService.postVisit(alert.feature, 'My Alerts', alert.text).subscribe({
      next: (res: any) => {
        if (res.status === "success") {
        //  console.log(res)
        }
      },
      error: (err) => {
        console.error('Failed', err);
      }
    });

    const matchedLink = this.findMatchingNavLink(alert.feature);

    if (matchedLink && matchedLink.url && matchedLink.url !== 'NA') {
      this.openLinkTest(matchedLink, 'My Alerts');
      // console.log(matchedLink, "link for alert");
      return;
    }


    console.warn("No application found for:", alert.feature);
    // Optionally show popup: this.dialogService.alert("Application not found");
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

  quicklinkLoad() {
    this.commonService.quicklinkConfig()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          if (!res || !res.data) {
            this.quicklinkLoadData = { navigationLinks: [] };
            return;
          }

          this.allLinks = res.data.navigationLinks || [];

          // Normalize quickLinks using strong normalization
          const allowedQuickLinks = (res.data.quickLinks || [])
            .filter((q: string) => !!q)
            .map((q: string) => this.normalizeName(q));

          // Filter navigation links
          let filteredQuickLinks = this.allLinks.filter((link: any) => {
            const normalizedName = this.normalizeName(link?.name || "");
            return allowedQuickLinks.includes(normalizedName) && link.visible === true;
          });

          // Sort final list by quickLinks order
          filteredQuickLinks = filteredQuickLinks.sort((a: any, b: any) => {
            const aIndex = allowedQuickLinks.indexOf(this.normalizeName(a.name));
            const bIndex = allowedQuickLinks.indexOf(this.normalizeName(b.name));
            return aIndex - bIndex;
          });

          this.quicklinkLoadData = {
            ...res.data,
            navigationLinks: filteredQuickLinks
          };
        }
      });
  }



  getPostedStories() {
    this.loader.show();
    Promise.resolve().then(() => {
      this.utility.data$.pipe(takeUntil(this.destroy$)).subscribe(data => {
        if (data) {
          // console.log('🐶 Data received:', data);
          this.corpStories = data.corporateconnect;
          this.empStories = data.employeeconnect;
          this.leadStories = data.leaderconnect;
        } else {
          // console.log('data not found');
        }
        this.loader.hide();
      });
    });
    // Trigger fetch (uses cache if valid)
    this.utility.getPostedStories();
  }

  alertCategories = {
    compliance: [
      "Governance Code - Declaration",
      "Operational Controls (OCA)",
      "Governance Code - Quiz"
    ],
    service: [
      "Gatepass Approval"
    ],
    finance: [
      "Purchase Approval",
      "Surplus Assets"
    ],
    DXTO: [
      "BCCL PartnerDX",
      "Invoice Approval"
    ],
    hr: [
      "Leave Approval",
      "Profile Update",
      "Refer a Friend"
    ]
  };

  getAlertImage(feature: string): string {
    const f = feature.toLowerCase();



    if (this.alertCategories.compliance.some(item =>
      feature === item || f.includes(item.toLowerCase().split(" ")[0])
    )) {
      return "asset/images/img4.png";
    }
    if (this.alertCategories.service.some(item =>
      feature === item || f.includes(item.toLowerCase().split(" ")[0])
    )) {
      return "asset/images/gatepass_small_icon.png";
    }

    if (this.alertCategories.DXTO.some(item =>
      feature === item || f.includes(item.toLowerCase().split(" ")[0])
    )) {
      return "asset/images/img14.png";
    }

    if (this.alertCategories.finance.some(item =>
      feature === item || f.includes(item.toLowerCase().split(" ")[0])
    )) {
      return "asset/images/img14.png";
    }

    if (this.alertCategories.hr.some(item =>
      feature === item || f.includes(item.toLowerCase().split(" ")[0])
    )) {
      return "asset/images/hr.png";
    }

    // if (f.includes("governance")) return "asset/images/img4.png";
    // if (f.includes("policy")) return "asset/images/img4.png";
    // if (f.includes("operational control")) return "asset/images/img4.png";


    // switch (feature) {
    //   case "Governance Code":
    //     return "asset/images/img4.png";
    //   case "Policy Compliance":
    //     return "asset/images/img4.png";
    //   case "Governance Quiz":
    //     return "asset/images/img4.png";
    // }

    // fallback image
    return "asset/images/alert_sm.png";
  }

  getAlerts() {
    this.loader.show();
    this.sharedApiService.getalerts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {

          // console.log("My Alerts", res);

          if (res.status === "success" && Array.isArray(res.alerts)) {
            this.alertsList = res.alerts.map((item: any[]) => ({
              feature: item[0],
              title: item[1],
              text: item[2],
              notifyTo: item[3],
              isRead: item[4],
              image: this.getAlertImage(item[0])
            }));
            this.utility.setAlerts(this.alertsList);

            // console.log("Formatted Alerts:", this.alertsList);
          } else {
            this.alertsList = [];
            this.utility.setAlerts(this.alertsList);
          }
          this.loader.hide();
        },

        error: (err) => {
          console.error('Failed to load data:', err);
          this.loader.hide();
        }
      });
  }

  getNotices() {
    this.loader.show();
    this.sharedApiService.getnotices()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          if (res.status === "success" && Array.isArray(res.notices)) {
            this.noticesList = res.notices.map((item: any[]) => ({
              header: item[0],
              description: item[1],
              image: item[2],
              publishedInfo: item[3],
              archivalDate: item[4],
              company: item[5],
              department: item[6],
              branch: item[7],
              location: item[8],
              status: item[9],
              link: item[10]
            }));
            this.utility.setNotifications(this.noticesList);
            // console.log("Formatted Notices:", this.noticesList);
          } else {
            this.noticesList = [];
            this.utility.setNotifications(this.noticesList);
          }
          this.loader.hide();
        },

        error: (err) => {
          this.loader.hide();
          console.error('Failed to load notices:', err);
        }
      });
  }

  // ------------------------- popup ---------------------- 
  showPopup = false; // popup visibility
  data: any;
  openPopup(n: any) {
    // console.log(n, "n");
    this.showPopup = true;
    this.data = n;
    this.data.description = this.getSafeDescription(this.data.description);

    this.sharedApiService.postVisit( 'Notice Board', 'Notice Board', n.header).subscribe({
      next: (res: any) => {
        if (res.status === "success") {
        //  console.log(res)
        }
      },
      error: (err) => {
        console.error('Failed', err);
      }
    });
  }
  closePopup() {
    this.showPopup = false;
  }


    getSafeDescription(html: string): SafeHtml {
  return this.Sanitizer.bypassSecurityTrustHtml(html);
}

  // ------------------------- popup ---------------------- 
  onVideoPlay(video: HTMLVideoElement) {
    this.activeVideo = video;
    if (!this.autoplayStopped) {

      this.owlCarousel.stopAutoplay();
      this.autoplayStopped = true;
    }
  }

  onVideoPause() {
    if (this.autoplayStopped) {
      this.owlCarousel.startAutoplay();
      this.autoplayStopped = false;
      this.activeVideo = null;
    }
  }
  // ------------------------------ Humour Carousel ------------------------------- 

  images = ['a.jpg', 'b.jpg', 'c.jpg', 'd.jpg']; // fixed 4 items
  carouselImages: string[] = [];

  loadCarouselImages() {
    const today = new Date();
    // const totalImages = this.images.length;
    this.carouselImages = [];

    // today.setDate(today.getDate() - 2);

    // Find last Sunday
    const todayDayOfWeek = today.getDay(); // Sunday = 0
    const lastSundayDate = new Date(today);
    lastSundayDate.setDate(today.getDate() - todayDayOfWeek);


    // Variable to store today's pics separately
    const todayImages: string[] = [];
    const allDays: string[][] = []; // store each day's set of images

    // Loop day by day from last Sunday → today

    // let d = new Date(lastSundayDate); d <= today; d.setDate(d.getDate() + 1)
    for (let d = new Date(today); d >= lastSundayDate; d.setDate(d.getDate() - 1)) {
      const month = d.toLocaleString('default', { month: 'short' }).toLowerCase();
      const day = d.getDate();
      const dayFolder = day.toString().padStart(2, '0');

      const dayImages: string[] = [];

      this.images.forEach((img) => {
        const imageUrl = `${AppSettings.humourCarousel}${month}/${dayFolder}/${day}${img}`;
        dayImages.push(imageUrl);

        // 👉 Save today's images separately
        if (d.toDateString() === today.toDateString()) {
          todayImages.push(imageUrl);
        }
      });

      allDays.push(dayImages);
    }

    // ✅ Reverse days only (latest first), keep images a→d
    // this.carouselImages = allDays.reverse().flat();
    this.carouselImages = allDays.flat();

    // 👉 Optional: reverse today's images if you still want latest within today first
    // (remove if not needed)
    // todayImages.reverse();

    // 👉 If small screen, show only today's images
    if (window.innerWidth < 768) {
      this.carouselImages = todayImages;
    }
  }


  // ------------------------------ Humour Carousel ------------------------------- 

  toggleExpand(contentRef: HTMLElement) {
    this.isExpanded = !this.isExpanded;
    if (!this.isExpanded && contentRef) {
      contentRef.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }

  vcoFetch() {
    this.sharedApiService.vcoTextFetch().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        const lines = res.split('\n');
        lines.forEach(line => {

          if (line.startsWith('Quote')) {
            this.vcoquote = line.split('=')[1].trim().replace(/(^"|"$)/g, '');
          } else if (line.startsWith('Author')) {
            this.vcoauthor = line.split('=')[1].trim();
          } else if (line.startsWith('Link')) {
            const match = line.match(/<a[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/);
            if (match) {
              this.vcolink = match[1];       // URL
              this.vcolinkText = match[2];   // Text inside <a>
            }
          }
          //  else if (line.startsWith('Link')) {
          //   this.vcolink = line.split('=')[1].trim();
          // }
        });
      },
      error: (err) => {
        console.log('An unexpected error occurred', err);
      }
    })
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


openLinkTest(item: any, cat:string = 'Quick Links') {
  if (!item) {
    return;
  }

  const route = typeof item.route === 'string' ? item.route.trim() : '';

  if (route) {
    if (cat == 'Quick Links'){
      this.sharedApiService.postVisit('Quick Links', 'Quick Links', item.name).subscribe({
        next: (res: any) => {
          if (res.status === "success") {
          //  console.log(res)
          }
        },
        error: (err) => {
          console.error('Failed', err);
        }
      });
    }

    this.utility.setIframeUrl(null);
    this.router.navigateByUrl(route);
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
  if (cat == 'Quick Links'){
      this.sharedApiService.postVisit('Quick Links', 'Quick Links', item.name).subscribe({
      next: (res: any) => {
        if (res.status === "success") {
        //  console.log(res)
        }
      },
      error: (err) => {
        console.error('Failed', err);
      }
    });
  }


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

  // openLinkTest(item: any) {
  //   if (item.name === 'MY-HR') {
  //     if (this.companyCode === '1009') {
  //       return;
  //     }
  //   }
  //   let url = item.url;
  //   let openInIframe = item.internalExternalCon;
  //   let applName = item.quickName;

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
  //   // console.log(finalUrl);
  //   if (openInIframe) {
  //     // 🔹 Open inside main layout’s iframe
  //     this.utility.setIframeUrl(finalUrl);
  //   } else {
  //     // 🔹 Open externally in a new tab
  //     window.open(finalUrl, '_blank');
  //   }
  // }


  setTab(tab: string) {
    this.activeTab = tab;
  }

  myAlertNoticeTab(tab: string) {
    this.alertNoticeBoard = tab;
  }

  // @HostListener('window:resize', ['$event'])
  // onResize(event: any) {
  //   this.isSmallScreen = event.target.innerWidth < 769;
  // }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }
  checkScreenSize() {
    const width = window.innerWidth;
    // Covers iPad Mini: 744px, 768px, 820px
    this.isSmallScreen = width <= 768;
  }

  //  --------------------- link api call ---------------------

  // quickLinksLoad(aplName: string) {
  //   const params = new HttpParams()
  //     .set('loginId', this.loginId)
  //     .set('applName', aplName)
  //   this.sharedApiService.quickLinksLoad(params).pipe(takeUntil(this.destroy$)).subscribe({
  //     next: (res) => {
  //       // console.log(res);
  //     }
  //   })
  // }

  //  --------------------- link api call ---------------------

  //  --------------------- poll question ans ---------------------
  isPollActive = false;
  pollStatus() {
    this.sharedApiService.pollStatus().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        if (res.message === "No active polls found" || res.status === 'error') {
          this.isPollActive = false;
          return
        }
        if (res.status === 'success') {
          if (res.message === 'User already responded') {
            this.pollSummary();
            this.pollStatusCheck = true;
            this.isPollActive = true;
            // console.log('pollStatus', res.pollSummaries.length);
          } else {
            this.pollQuestionAnsFetch();
            this.pollStatusCheck = false;
            this.isPollActive = true;
          }
        } else {
          this.isPollActive = false;
          return
        }

      }
    })
  }

  pollQuestionAnsFetch() {
    this.sharedApiService.pollQuestionAnsFetch()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          if (res?.polls?.length > 0) {
            const poll = res.polls[0];
            this.pollId = poll[0];
            this.pollQuestion = poll[1]; // question
            const options = poll[3].split('|').map((opt: string) => opt.trim());

            // Assign numeric IDs automatically
            this.pollOptions = options.map((name: string, index: number) => ({
              id: index + 1,
              name
            }));
          }
        },
        error: (err) => {
          console.log('An unexpected error occurred', err);
        }
      });
  }

  pollQuestionAnsSubmit() {
    if (!this.selectedOption) {
      alert('Please select a poll option!');
      return;
    }
    this.sharedApiService.pollQuestionAnsSubmit(this.pollId, this.selectedOption).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.pollStatus();
        } else {
          console.log('Data not found');
        }
      },
      error: (err) => {
        console.log('An unexpected error occurred', err);
      }
    })
  }

  pollSummary() {
    this.sharedApiService.pollSummary().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        if (res?.pollSummaries?.length > 0) {
          this.pollSummaries = res.pollSummaries.map((s: any[], index: number) => ({
            id: s[0],
            question: s[1],
            optionId: s[2],
            optionName: s[3],
            percentage: s[4],
            totalVotes: s[5],
            color: this.colors[index % this.colors.length]  // rotate colors
          }));
        } else {
          console.log('Data not found');
        }
      },
      error: (err) => {
        console.log('An unexpected error occurred', err);
      }
    })
  }

  //  --------------------- poll question ans ---------------------

  storyCat(role: string = "default", cat: string = 'emp') {
    this.router.navigate(['/portal/story'], {
      state: { cat: cat, role: role }
    });
  }


  empconnect(id: any, stories: any, cat: any) {

     const story = stories?.find((story: any) => story.id === id);
    this.router.navigate(['/portal/contentPreview'], {
      state: { storyList: stories, id: id, cat: cat }
    });

        this.sharedApiService.postVisit(story.id, story.category, story.header).subscribe({
      next: (res: any) => {
        if (res.status === "success") {
        //  console.log(res)
        }
      },
      error: (err) => {
        console.error('Failed:', err);
      }
    });
  }

  fetchStories() {
    this.loader.show();
    Promise.resolve().then(() => {
      this.sharedApiService.getPostedStories().pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          if (res) {
            const rawData = res;
            this.corpStories = rawData.corporateconnect;
            this.empStories = rawData.employeeconnect;
            this.leadStories = rawData.leaderconnect;
          } else {
            // console.log('Data not fetch successfully');
          }
          this.loader.hide();
        },
        error: (err) => {
          console.error('Failed to load data:', err);
          this.loader.hide();
        }
      });
    });
  }

  likesPopupOpen() {
    this.likeshowPopup = true;
  }

  likesPopupClose() {
    this.likeshowPopup = false;
  }

  getLikes(post: any) {
    this.sharedApiService.getLikeBy(post.id, 'getLikes', post.category, post.header).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        if (res.status === "success") {
          this.likedUser = res.likedUsers;
          this.likesPopupOpen();
        }
      },
      error: (err) => {
        console.error('Failed to load data:', err);
      }
    });
  }

  updateLikes(story: any) {
    let action = story.self ? 'unlike' : 'like';
    this.sharedApiService.getLikeBy(story.id, action, story.category, story.header).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {

        if (res.status === "success") {
          story.self = !story.self;
          story.totalLikes = res.totalLikes
        }
      },
      error: (err) => {
        console.error('Failed to load data:', err);
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (this.activeVideo && !this.activeVideo.contains(target)) {
      // console.log('🖱 Clicked outside video → resume autoplay');
      this.activeVideo.pause();
      this.onVideoPause();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
    this.sub?.unsubscribe();
    this.sub2?.unsubscribe();
    this.sub3?.unsubscribe();
    this.sub4?.unsubscribe();
  }

}


