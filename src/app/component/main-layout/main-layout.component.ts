import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HeaderComponent } from "../../shared/shared-components/header/header.component";
import { MiniHeaderComponent } from "../../shared/shared-components/mini-header/mini-header.component";
import { NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { CommonModule } from '@angular/common';
import { FooterComponent } from "../../shared/shared-components/footer/footer.component";
import { Subscription } from 'rxjs/internal/Subscription';
import { UtilityService } from '../../shared/shared-services/utility.service';
import { filter, Subject, takeUntil } from 'rxjs';
import { SharedApiService } from '../../shared/shared-services/shared-api.service';
import { ScrollService } from '../../shared/shared-services/scroll.service';
import { LoaderService } from '../../shared/shared-services/loader.service';

interface AlertItem {
  feature: string;
  title: string;
  text: string;
  notifyTo: string;
  isRead: boolean;
  image?: string;
}
interface NoticeItem {
  header: string;
  description: string;
  image: string;
  publishedInfo: string;
  archivalDate: string;
  company: string;
  department: string;
  branch: string;
  location: string;
  status: string;
  link: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [HeaderComponent, MiniHeaderComponent, RouterOutlet, CommonModule, FooterComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  currentUrl: SafeResourceUrl | null = null;
  private sub!: Subscription;
  private sub2!: Subscription;
  private sub3!: Subscription;
  pauseMarquee = false;
  isHeaderFixed = false;
  vcoquote = '';
  vcoauthor = '';
  vcolink = '';
  vcolinkText = '';
  destroy$ = new Subject<boolean>();
  alertsList: AlertItem[] = [];
  notificationsList: NoticeItem[] = [];
  topTwoAlerts: AlertItem[] = [];
  topTwoNotifications: NoticeItem[] = [];
  isLoading = true;
  isIframeLoading = true;
  private iframeTimeoutId!: number;
   private routerSub!: Subscription;
  constructor(private sanitizer: DomSanitizer, private loader: LoaderService, private router: Router, private utility: UtilityService, private sharedApiService: SharedApiService, private scrollService: ScrollService) { }

  ngOnInit(): void {
    // this.toggleDiv();
    // 🔹 Listen for iframe URL changes from anywhere (e.g., HomeComponent)
    this.sub = this.utility.iframeUrl$
      .subscribe(url => {
        if (!url) {
          this.currentUrl = null;
          return;
        }
        setTimeout(() => {
          this.currentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        })

      });


    this.sub2 = this.utility.alerts$
      .pipe(filter(val => Array.isArray(val) && val.length > 0)) // ignore initial []
      .subscribe(val => {
        this.alertsList = val;
        this.topTwoAlerts = this.alertsList.slice(0, 2);
      });

    this.sub3 = this.utility.notifications$
      .pipe(filter(val => Array.isArray(val) && val.length > 0)) // ignore initial []
      .subscribe(val => {
        this.notificationsList = val;
        this.topTwoNotifications = this.notificationsList.slice(0, 2);
      });


    this.vcoFetch();

    this.iframeTimeoutId = window.setTimeout(() => {
      this.isIframeLoading = false;
    }, 15000);
  this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {

      if (event.urlAfterRedirects.includes('/portal')) {
        this.utility.setIframeUrl(null);
      }

    });
  }



  setnotification(notification: any) {
    // this.currentUrl = null;
    // this.utility.setNotification(notification);
    this.router.navigate(['/portal/home']);
    Promise.resolve().then(() => {
      this.utility.setNotification(notification);
    })
  }

  setalert(alert: any) {
    this.loader.show();
    this.router.navigate(['/portal/home']);
    // this.currentUrl = null;
    // this.utility.setIframeUrl(null);
    Promise.resolve().then(() => {
      setTimeout(() => {
        this.utility.setAlert(alert);
        this.loader.hide();
      }, 200)
    })
  }

  // onIframeLoad() {
  //   console.log("Iframe loaded");
  //   this.isLoading = false;
  // }

  onIframeLoad() {
    this.isIframeLoading = false;

    // Clear timeout if iframe loads earlier
    if (this.iframeTimeoutId) {
      clearTimeout(this.iframeTimeoutId);
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    this.isHeaderFixed = scrollTop > 0;
  }
  toggleDiv() {
    // this.currentUrl = null;
    // this.utility.setIframeUrl(null);
    this.router.navigate(['/portal/home']);
  }
  hamburgerNavUrl(url: string) {
    this.currentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  onLinkChange(url: string) {
    this.currentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

onClick(sectionId: string) {
  const homeRoute = '/portal/home';

  if (this.currentUrl) {
    this.utility.setIframeUrl(null);
  }

  if (this.router.url !== homeRoute) {
    this.router.navigate([homeRoute]).then(() => {
      setTimeout(() => {
        this.scrollService.scrollTo(sectionId);
      }, 200);
    });
  } else {
    setTimeout(() => {
      this.scrollService.scrollTo(sectionId);
    }, 200);
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
            // this.vcolink = line.split('=')[1].trim();
            // console.log('vcoquote', this.vcoquote)
            const match = line.match(/<a[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/);
            if (match) {
              this.vcolink = match[1];       // URL
              this.vcolinkText = match[2];   // Text inside <a>
            }
          }
        });
      },
      error: (err) => {
        console.log('An unexpected error occurred', err);
      }
    })
  }

  ngOnDestroy(): void {
    if (this.iframeTimeoutId) {
      clearTimeout(this.iframeTimeoutId);
    }
    this.sub?.unsubscribe();
    this.sub2?.unsubscribe();
    this.sub3?.unsubscribe();
    this.routerSub?.unsubscribe();
  }
}
