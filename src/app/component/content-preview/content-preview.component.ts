import { AfterViewInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CarouselModule } from 'ngx-owl-carousel-o';
// import { DynamicColDirective, DynamicGridDirective, UiDirectivesModule } from '../../../projects/bccl-library/src/public-api';
import { UiDirectivesModule } from 'toi-libraries'
import { CommonModule, NgFor } from '@angular/common';
import { AppSettings } from '../../core/modals/appsettings';
import { SharedApiService } from '../../shared/shared-services/shared-api.service';
import { LoaderService } from '../../shared/shared-services/loader.service';
import { CommonDialogService } from '../../shared/shared-services/common-dialog.service';
import { UniversalVideoComponent } from '../../shared/shared-components/universal-video/universal-video.component';
import { AutoAdaptiveGradientDirective } from '../../shared/shared-directives/auto-adaptive-gradient.directive';

@Component({
  selector: 'app-content-preview',
 standalone: true,
  imports: [CarouselModule, NgFor, CommonModule, UiDirectivesModule, UniversalVideoComponent, AutoAdaptiveGradientDirective],
  templateUrl: './content-preview.component.html',
  styleUrl: './content-preview.component.scss'
})
export class ContentPreviewComponent implements AfterViewInit, OnInit {
  id: any;
  storyList: any[] = [];
  employeeConnection: any = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 700,
    autoWidth: false,
    lazyLoad: true,
    navText: ['<i class="fa fa-arrow-left prev-arrow inside-nav-arrow"></i>', '<i class="fa fa-arrow-right next-arrow inside-nav-arrow"></i>'],
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
    nav: true,
    startPosition: 0
  }
  @ViewChild('owlCarousel', { static: false }) owlCarousel!: any;
  currentUrl!: SafeResourceUrl;
  category: any;
  url: any;
  private activeVideo: HTMLVideoElement | null = null;
  private autoplayStopped = false;
  title: string = '';
  subtitle: string = '';
  isAdmin: boolean = false;
  likedUser: any[] = [];
  likeshowPopup = false;
  constructor(private Sanitizer: DomSanitizer, private api: SharedApiService, private loader: LoaderService, private dialog: CommonDialogService) { }

  ngOnInit() {
    this.id = history.state?.id ?? null;
    this.storyList = history.state?.storyList ?? [];
    const cat = history.state?.cat;
    this.subtitle = history.state?.tab ?? '';
    this.isAdmin = history.state?.role == 'admin';
    if (cat == 'corp' || cat == 'corporateconnect') {
      this.category = 'corporateconnect';
      this.title = 'Corporate Connect';
      this.url = AppSettings.CCCONTENTURL
    } else if (cat == 'emp' || cat == 'employeeconnect') {
      this.category = 'employeeconnect';
      this.title = 'Employee Connect';
      this.url = AppSettings.ECCONTENTURL
    } else if (cat == 'lead' || cat == 'leaderconnect') {
      this.category = 'leaderconnect';
      this.title = 'Leader Connect';
      this.url = AppSettings.LCCONTENTURL
    }  else if (cat == 'fun' || cat == 'funlevityconnect') {
      this.category = 'Fun & Levity';
      this.title = 'Fun & Levity';
      this.url = AppSettings.FLCONTENTURL
    } else {
      this.category = 'NA';
    }

    if (this.id !== null && this.storyList?.length) {
      const index = this.storyList.findIndex(s => s.id === this.id);
      if (index > -1) {
        this.employeeConnection = {
          ...this.employeeConnection,
          startPosition: index
        };
      }
    }
  }


  ngAfterViewInit() {
    setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
  }

  isVideo(fileName: string): boolean {
    const videoExtensions = ['.mp4', '.webm', '.mov', '.mkv', '.m4v', '.3gp'];
    return videoExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  }

  openLink(obj?: any) {
    if (obj.link !== 'NA' && obj.type === 'Image') {
      window.open(obj.link, '_blank');
    }
  }

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

  toggleDiv() {
    if (this.currentUrl) {
      this.currentUrl = !this.currentUrl;
    } else {
      !this.currentUrl;
    }
  }

  onLinkChange(url: string) {
    this.currentUrl = this.Sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  hamburgerNavUrl(url: string) {
    this.currentUrl = this.Sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  likesPopupOpen() {
    this.likeshowPopup = true;
  }

  likesPopupClose() {
    this.likeshowPopup = false;
  }

  // getLikes(postID: any) {
  //   this.api.getLikeBy(postID).subscribe({
  //     next: (res: any) => {
  //       if (res.status === "success") {
  //         this.likedUser = res.likedUsers;
  //         this.likesPopupOpen();
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Failed to load data:', err);
  //     }
  //   });
  // }
  updateLikes(story: any) {
    let action = story.self ? 'unlike' : 'like';
    this.api.getLikeBy(story.id, action, story.category, story.header).subscribe({
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
  handleStoryAction(story: any) {
    this.loader.show();

    let newStatus = '';
    let actionMessage = '';

    if (story.status === 'L') {
      newStatus = 'P';
      actionMessage = 'Content published successfully.';
    } else if (story.status === 'P') {
      newStatus = 'X';
      actionMessage = 'Content archived successfully.';
    } else if (story.status === 'X') {
      newStatus = 'P';
      actionMessage = 'Content republished successfully.';
    }

    this.api.updateContentStatus(story.category, story.fileName, newStatus, story.id)
      .subscribe({
        next: (res: any) => {
          this.loader.hide();

          if (res?.status === 'success') {

            // ✅ Update UI instantly
            story.status = newStatus;
            story.actionSuccess = actionMessage;   // ✅ shows message

            // ✅ Popup confirmation
            this.dialog.alert(res.message, 'CONFIRMATION').then(() => {
              story.status = newStatus;
              story.actionSuccess = actionMessage;
            });

          } else {
            this.dialog.alert(res.message);
          }
        },
        error: (err) => {
          this.loader.hide();
          this.dialog.alert(err.message);
          console.error('Submission failed:', err);
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
}
