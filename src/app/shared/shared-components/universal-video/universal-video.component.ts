import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-universal-video',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './universal-video.component.html',
  styleUrl: './universal-video.component.scss'
})
export class UniversalVideoComponent {
  @Input() url: string = '';

  safeEmbedUrl: SafeResourceUrl | null = null;
  safeVideoUrl: SafeResourceUrl | null = null;
  isDirectVideoSource = false;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges() {
    if (!this.url) {
      this.safeEmbedUrl = null;
      this.safeVideoUrl = null;
      this.isDirectVideoSource = false;
      return;
    }

    this.isDirectVideoSource = this.isDirectVideoUrl(this.url);

    if (this.isDirectVideoSource) {
      this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
      this.safeEmbedUrl = null;
      return;
    }

    const embedUrl = this.getEmbedUrl(this.url);
    this.safeEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    this.safeVideoUrl = null;
  }

  isDirectVideoUrl(url: string): boolean {
    return /\.(mp4|webm|mov|mkv|m4v|3gp)(\?.*)?$/i.test(url);
  }

  getEmbedUrl(url: string): string {
    if (!url) return '';
    if (/youtu\.?be/.test(url)) {
      const match = url.match(/(?:youtu\.be\/|v=|\/embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
      return match ? `https://www.youtube.com/embed/${match[1]}` : url;
    }
    if (/vimeo\.com/.test(url)) {
      const match = url.match(/vimeo\.com\/(\d+)/);
      return match ? `https://player.vimeo.com/video/${match[1]}` : url;
    }
    if (/instagram\.com/.test(url)) {
      return url.split('?')[0] + 'embed';
    }
    if (/twitter\.com|x\.com/.test(url)) {
      return `https://twitframe.com/show?url=${encodeURIComponent(url)}`;
    }
    if (/facebook\.com/.test(url)) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`;
    }
    return url;
  }
}
