import { CommonModule, NgFor } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { AppSettings } from '../../../core/modals/appsettings';
// import { SafeUrlPipe } from '../../shared-pipes/safe-url.pipe';
import { UniversalVideoComponent } from '../universal-video/universal-video.component';
import { AutoAdaptiveGradientDirective } from '../../shared-directives/auto-adaptive-gradient.directive';
import { SharedApiService } from '../../shared-services/shared-api.service';

@Component({
  selector: 'app-corp-connect-carousel',
  standalone: true,
  imports: [CarouselModule, NgFor, CommonModule, UniversalVideoComponent, AutoAdaptiveGradientDirective],
  templateUrl: './corp-connect-carousel.component.html',
  styleUrl: './corp-connect-carousel.component.scss'
})
export class CorpConnectCarouselComponent {
  @Input() stories: any[] = [];
  @ViewChild('owlCarousel', { static: false }) owlCarousel!: any;
  @Input() isAdmin: boolean = false;
  @Input() isSmallScreen: boolean = false;
  Appsettings = AppSettings;
touchMoved = false;
  // employeeConnection: any = {
  //   loop: true,
  //   mouseDrag: true,
  //   touchDrag: true,
  //   pullDrag: true,
  //   dots: true,
  //   lazyLoad: true,
  //   // navText: ['', ''],
  //   autoplay: true,
  //   autoplaySpeed: 1200,
  //   navSpeed: 1200,
  //   smartSpeed: 1200,
  //   autoplayTimeout: 5000,
  //   autoplayHoverPause: true,
  //   responsive: {
  //     0: {
  //       items: 1
  //     },
  //     400: {
  //       items: 1
  //     },
  //     740: {
  //       items: 1
  //     },
  //     940: {
  //       items: 1
  //     }
  //   },
  //   nav: false
  // }
  isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  employeeConnection: any = {
    loop: true,
    dots: true,
    lazyLoad: true,
    autoplay: true,
   
    autoplayTimeout: 5000,
    autoplaySpeed: 1200,
    navSpeed: 1200,
    smartSpeed: 1200,
    autoplayHoverPause: this.isDesktop,
    mouseDrag: this.isDesktop,    
    touchDrag: !this.isDesktop,    
    pullDrag: !this.isDesktop,
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
  };

  @Output() likeAction = new EventEmitter<any>();
  @Output() likeClicked = new EventEmitter<number>(); 
  private activeVideo: HTMLVideoElement | null = null;
  private autoplayStopped = false;
  constructor(private router: Router, private api: SharedApiService) { }
onBannerTap(slide: any) {
  if (!this.touchMoved) {
    this.openLink(slide);
  }
}
  openLink(obj?: any) {
    if (obj.link !== 'NA' && obj.type === 'Image') {
      window.open(obj.link, '_blank');
    }
        this.api.postVisit(obj.id, obj.category, obj.header).subscribe({
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

  isVideo(fileName: string): boolean {
    const videoExtensions = ['.mp4', '.webm', '.mov', '.mkv', '.m4v', '.3gp'];
    return videoExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  }

  videoUrl(str: string): boolean {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  onLikeClick(storyId: number) {
    this.likeClicked.emit(storyId);
  }
  toggleLike(story: any) {
    this.likeAction.emit(story);  
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
  storyCat(role: string = "default") {
    this.router.navigate(['/portal/story'], {
      state: { cat: 'corp', role: role }
    });
  }

  empconnect(id: any, stories: any, cat: any) {


    this.router.navigate(['/portal/contentPreview'], {
      state: { storyList: stories, id: id, cat: cat }
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
