import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DynamicColDirective, DynamicGridDirective } from 'toi-libraries';
import { AutoAdaptiveGradientDirective } from '../../shared/shared-directives/auto-adaptive-gradient.directive';
import { UniversalVideoComponent } from '../../shared/shared-components/universal-video/universal-video.component';

@Component({
  selector: 'app-preview-content',
  standalone: true,
  imports: [CommonModule, DynamicGridDirective, DynamicColDirective, UniversalVideoComponent, AutoAdaptiveGradientDirective],
  templateUrl: './preview-content.component.html',
  styleUrl: './preview-content.component.scss'
})
export class PreviewContentComponent {
  @Input() story: any = null;
  @Input() isAdmin = false;
  @Input() previewSourceTab = '';
  @Input() url = '';

  @Output() likeToggle = new EventEmitter<any>();
  @Output() likesOpen = new EventEmitter<any>();
  @Output() storyAction = new EventEmitter<any>();
  @Output() imageOpen = new EventEmitter<any>();

  readonly avatarPalette = [
    { background: '#8c8c8c', color: '#ffffff' },
    { background: '#27ae60', color: '#ffffff' },
    { background: '#f39c12', color: '#ffffff' },
    { background: '#2980b9', color: '#ffffff' },
    { background: '#8e44ad', color: '#ffffff' },
    { background: '#d35400', color: '#ffffff' }
  ];
  readonly textStoryPlaceholder = 'asset/images/noimg.svg';

  isVideo(fileName?: string): boolean {
    const value = (fileName || '').toLowerCase();
    const videoExtensions = ['.mp4', '.webm', '.mov', '.mkv', '.m4v', '.3gp'];
    return videoExtensions.some((ext) => value.endsWith(ext));
  }

  isTextStory(story: any): boolean {
    const storyType = `${story?.type || story?.mediaType || ''}`.toLowerCase();

    return storyType === 'text';
  }

  getStoryMediaSrc(story: any): string {
    if (!story) {
      return '';
    }

    if (story.fileName?.startsWith('https://')) {
      return story.fileName;
    }

    return `${this.url}${story.folder}/${story.fileName}`;
  }

  getStoryAvatarText(name?: string): string {
    const trimmedName = (name || '').trim();
    if (!trimmedName) {
      return 'NA';
    }

    const words = trimmedName.split(/\s+/).filter(Boolean);
    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }

    const first = words[0][0] || '';
    const last = words[words.length - 1][0] || '';
    return `${first}${last}`.toUpperCase();
  }

  getStoryAvatarStyle(name?: string): { [key: string]: string } {
    const source = (name || '').trim();
    const index = source
      ? Array.from(source).reduce((total, char) => total + char.charCodeAt(0), 0) % this.avatarPalette.length
      : 0;
    const palette = this.avatarPalette[index];

    return {
      'background-color': palette.background,
      color: palette.color
    };
  }

  formatLikeCount(value: any): string {
    const count = Number(value) || 0;

    if (count < 1000) {
      return `${count}`;
    }

    if (count < 1000000) {
      const formatted = (count / 1000).toFixed(1).replace(/\.0$/, '');
      return `${formatted}k`;
    }

    const formatted = (count / 1000000).toFixed(1).replace(/\.0$/, '');
    return `${formatted}M`;
  }

  getStoryHeaderText(header: any, maxLength = 48): string {
    const value = `${header || ''}`.trim();

    if (value.length <= maxLength) {
      return value;
    }

    return `${value.slice(0, maxLength)}...`;
  }

  onLikeToggle(): void {
    this.likeToggle.emit(this.story);
  }

  onLikesOpen(): void {
    this.likesOpen.emit(this.story);
  }

  onStoryAction(): void {
    this.storyAction.emit(this.story);
  }

  onImageOpen(): void {
    this.imageOpen.emit(this.story);
  }

}
