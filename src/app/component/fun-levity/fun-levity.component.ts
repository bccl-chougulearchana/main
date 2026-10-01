import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { UiDirectivesModule } from '../../../../projects/bccl-library/src/public-api';
import { DynamicGridDirective, DynamicColDirective, LibLabelTextDirective , SelectDirective, PopupDirective} from 'toi-libraries';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { SharedApiService } from '../../shared/shared-services/shared-api.service';
import { AppSettings } from '../../core/modals/appsettings';
import { CommonDialogService } from '../../shared/shared-services/common-dialog.service';
import { LoaderService } from '../../shared/shared-services/loader.service';
import { CommonService } from '../../core/services/common.service';
import { DomSanitizer } from '@angular/platform-browser';
import { TextSpecialDirective } from '../../shared/shared-directives/text-special.directive';
import { FileuploadDirective } from "../../shared/shared-directives/fileupload.directive";
import { TabDirective, TabsDirective } from '../../shared/shared-directives/tabs.directive';
import { TextareaDirective } from '../../shared/shared-directives/textarea.directive';
import { RequiredDirective } from 'toi-libraries';
import { PreviewContentComponent } from './preview-content.component';
import { PaginationControlsComponent } from '../../shared/shared-components/pagination-controls/pagination-controls.component';
@Component({
  selector: 'app-fun-levity',
  standalone: true,
    imports: [CommonModule, ReactiveFormsModule, TextSpecialDirective, FileuploadDirective, TabDirective, TabsDirective, DynamicGridDirective, DynamicColDirective, LibLabelTextDirective, SelectDirective, PopupDirective, CarouselModule, TextareaDirective, RequiredDirective, PreviewContentComponent, PaginationControlsComponent],
  templateUrl: './fun-levity.component.html',
  styleUrl: './fun-levity.component.scss'
})
export class FunLevityComponent implements OnInit {
  readonly initialVisibleCards = 4;
  readonly funStoriesBatchSize = 12;
  readonly maxFunStories = 36;
  readonly maxFunTextStories = 18;
  readonly funMediaCardsWithTextRow = 3;
  readonly funTextCardsPerRow = 2;
  readonly funMediaCardsFullRow = 4;
  readonly tabPageSize = 6;
  readonly textStoryPlaceholder = 'asset/images/noimg.svg';
  readonly avatarPalette = [
    { background: '#8c8c8c', color: '#ffffff' },
    { background: '#27ae60', color: '#ffffff' },
    { background: '#f39c12', color: '#ffffff' },
    { background: '#2980b9', color: '#ffffff' },
    { background: '#8e44ad', color: '#ffffff' },
    { background: '#d35400', color: '#ffffff' }
  ];
  preview = false;
  previewStory: any = null;
  previewSourceTab = '';
  private pendingPreviewState: { storyId: any; tab: string } | null = null;
  heroBannerCarouselOptions: any = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    nav: false,
    autoplay: true,
    autoplayTimeout: 5000,
    autoplaySpeed: 1200,
    navSpeed: 1200,
    smartSpeed: 1200,
    autoplayHoverPause: true,
    items: 1
  };
  storyForm: FormGroup;
  category!: string;
  allStories: any[] = [];
  postedStories: any[] = [];
  publishedStories: any[] = [];
  myStories: any[] = [];
  imagesArr: any[] = [];
  mobileImagesArr: any[] = [];
  url: any;
  isAdmin = false;
  private isSuperAdmin = false;
  isConfigResolved = false;
  isvideo = false;
  role = '';
  sliceCount: number = 65;
  activeTab: string = 'Fun & Levity'; // default
  likedUser: any[] = [];
  likeshowPopup = false;
  showAllFunCards = false;
  visibleFunStoriesCount = this.initialVisibleCards;
  postedStoriesPage = 1;
  myStoriesPage = 1;
  publishStoriesPage = 1;
  isMobileView = false;
  isJoyLeaderboardExpanded = true;
  videoThumbnailMap: Record<string, string> = {};
  videoThumbnailErrorMap: Record<string, boolean> = {};
  private funTabRowsCache: any[] = [];
  private visibleFunRowsCache: any[] = [];
  private funTabPublishedStoriesCache: any[] = [];
  private funTabTextStoriesCache: any[] = [];
  private funTabMediaStoriesCache: any[] = [];
  allowedRatios: number[] = [
    16 / 9,  // widescreen
    1 / 1,   // square
    4 / 3    // classic photo
  ];
  tolerance = 0.05;       // 5% margin allowed
  selectedFiles: { [key: string]: File } = {};
  removeFiles: { [key: string]: File } = {};
  mediaOptions = [
    { label: 'Image', id: 'Image' },
    { label: 'Video', id: 'Video' },
    // { label: 'Text', id: 'Text' }
  ];
  imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.ico'];
  // videoExtensions = ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.mkv', '.webm', '.3gp', '.mpeg', '.mpg', '.m4v', '.ts', '.ogv'];
  videoExtensions = ['.mp4', '.webm', '.mov', '.mkv', '.m4v', '.3gp'];
  title = '';
  // Combined (for when user hasn’t selected anything yet)
  allExtensions = [...this.imageExtensions, ...this.videoExtensions];
  AppSettings = AppSettings;
  private static trimmedRequiredValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (typeof value === 'string') {
      return value.trim() ? null : { required: true };
    }

    return value ? null : { required: true };
  }

  constructor(private router: Router, private fb: FormBuilder, private api: SharedApiService, private route: ActivatedRoute, private loader: LoaderService, private dialog: CommonDialogService, private common: CommonService, private sanitizer: DomSanitizer) {
    this.storyForm = this.fb.group({
      mediaType: ['Image', [Validators.required]],
      headline: ['', [FunLevityComponent.trimmedRequiredValidator, Validators.maxLength(250)]],
      
      // link: ['', [Validators.pattern(/^https:\/\/(([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}|localhost)(:\d{1,5})?(\/[^\s]*)?$/)]],
      // externalLink: ['', [Validators.pattern(/^https:\/\/(([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}|localhost)(:\d{1,5})?(\/[^\s]*)?$/)]],
      attachment1: [null, Validators.required],
      storyDescription: ['', [FunLevityComponent.trimmedRequiredValidator, Validators.maxLength(1000)]]
    })

    setTimeout(() => {
      this.applyDefaultMediaType();
    }, 300);
  }
  
  ngOnInit(): void {
    this.isSuperAdmin = this.common.getIsAdmin();
    this.isAdmin = this.isSuperAdmin;
    const state = history.state || {};
    let cat = history.state?.cat;
    cat = 'fun';
    this.role = history.state?.role;
    const restoredTab = typeof state?.activeTab === 'string' ? state.activeTab : '';
    this.setInitialActiveTab(restoredTab);
    if (restoredTab) {
      this.activeTab = restoredTab;
    }
    if(cat == 'fun'){
      this.category = 'funlevityconnect';
      this.title = 'Fun & Levity';
      this.url = AppSettings.FLCONTENTURL
    }
    this.loadconfig();
    this.applyDefaultMediaType();
    // if (cat == 'corp') {
    //   this.category = 'corporateconnect';
    //   this.title = 'Corporate Connect';
    //   this.url = AppSettings.CCCONTENTURL
    // } else if (cat == 'emp') {
    //   this.category = 'employeeconnect';
    //   this.title = 'Employee Connect';
    //   this.url = AppSettings.ECCONTENTURL
    // } else if (cat == 'lead') {
    //   this.category = 'leaderconnect';
    //   this.title = 'Leader Connect';
    //   this.url = AppSettings.LCCONTENTURL
    // } else {
    //   this.category = 'NA';
    // }

    if (state?.previewStoryId != null) {
      this.pendingPreviewState = {
        storyId: state.previewStoryId,
        tab: state.previewSourceTab || this.activeTab
      };
    }
    this.fetchAllStories();
    this.updateResponsiveState();
    this.syncHistoryState(false);
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.updateResponsiveState();
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event: PopStateEvent): void {
    const state = event.state || history.state || {};
    const nextActiveTab = typeof state?.activeTab === 'string' && state.activeTab
      ? state.activeTab
      : this.activeTab;

    this.activeTab = nextActiveTab;

    if (state?.previewStoryId != null) {
      this.restorePreviewState(state.previewStoryId, state.previewSourceTab || nextActiveTab);
      return;
    }

    this.closePreview(false);
  }

  loadconfig(){
   this.common.getFunConfig().subscribe({
      next: (res) => {
        this.imagesArr = Array.isArray(res?.heroBanner) ? res.heroBanner : [];
        this.mobileImagesArr = Array.isArray(res?.heroBannerSM) ? res.heroBannerSM : [];
        const emailId = localStorage.getItem('emailId') || sessionStorage.getItem('emailId') || '';
        const funLevityAdmins = Array.isArray(res?.admin) ? res.admin : [];
        const isFunLevityAdmin = !!emailId && funLevityAdmins.includes(emailId);
        this.isAdmin = this.isSuperAdmin || isFunLevityAdmin;
        this.setInitialActiveTab(typeof history.state?.activeTab === 'string' ? history.state.activeTab : '');
        this.syncHistoryState(false);
        this.isConfigResolved = true;
        setTimeout(() => {
          this.applyDefaultMediaType();
        });
      },
      error: (err) => {
        this.isAdmin = this.isSuperAdmin;
        this.isConfigResolved = true;
        setTimeout(() => {
          this.applyDefaultMediaType();
        }, 200);
        console.error('Failed to load Service Desk config', err);
      }
    });
  }

  private setInitialActiveTab(restoredTab: string = ''): void {
    if (restoredTab) {
      this.activeTab = restoredTab;
      return;
    }

    this.activeTab = this.role === 'admin' && this.isAdmin
      ? 'Publish Content'
      : 'Fun & Levity';
  }

  updateSliceCount() {
    const width = window.innerWidth;
    if (width < 480) {
      this.sliceCount = 18;        // mobile
    } else if (width < 768) {
      this.sliceCount = 12;        // small tablet
    } else if (width < 1024) {
      this.sliceCount = 12;        // tablet
    } else {
      this.sliceCount = 24;        // desktop
    }
  }

  private updateResponsiveState(): void {
    const wasMobileView = this.isMobileView;
    this.isMobileView = window.innerWidth < 768;
    this.updateSliceCount();

    if (this.isMobileView && !wasMobileView) {
      this.isJoyLeaderboardExpanded = false;
    } else if (!this.isMobileView) {
      this.isJoyLeaderboardExpanded = true;
    }

    if (wasMobileView !== this.isMobileView) {
      const shouldShowAll = this.showAllFunCards;
      this.updateFunStoryCaches();
      this.visibleFunStoriesCount = shouldShowAll
        ? this.totalVisibleFunUnits
        : Math.min(Math.max(this.visibleFunStoriesCount, this.initialFunVisibleCount), this.totalVisibleFunUnits);
      this.showAllFunCards = shouldShowAll && this.visibleFunStoriesCount >= this.totalVisibleFunUnits;
      this.updateVisibleFunRows();
    }
  }

  toggleJoyLeaderboard(): void {
    if (!this.isMobileView) {
      return;
    }

    this.isJoyLeaderboardExpanded = !this.isJoyLeaderboardExpanded;
  }

  onTabChange(tab: string) {
    this.activeTab = tab;
    this.closePreview();
    this.syncHistoryState(false);
    if(this.fetchneed){
      this.fetchAllStories();
      this.fetchneed = false;
    }
    if (tab === 'Share A Moment') {
      if (!this.isvideo) {
        setTimeout(() => {
          this.applyDefaultMediaType();
        });
      }
    }
    if (tab === 'Posted Content') { /* … */ }
    if (tab === 'My Submission') { /* … */ }
    if (tab === 'Publish Content') {
      if (!this.isvideo) {
        setTimeout(() => {
          this.applyDefaultMediaType();
        });
      }
    }
  }

  private applyDefaultMediaType(): void {
    const mediaTypeControl = this.storyForm.get('mediaType');
    if (!mediaTypeControl) {
      return;
    }

    mediaTypeControl.setValue('Image');
    this.isvideo = false;
    this.syncAttachmentValidators();
  }

  get isTextMediaType(): boolean {
    return this.storyForm.get('mediaType')?.value === 'Text';
  }

  private get isFileMediaType(): boolean {
    return !this.isTextMediaType;
  }

  get pagedPostedStories(): any[] {
    return this.getPagedStories(this.postedStories, this.postedStoriesPage);
  }

  get pagedMyStories(): any[] {
    return this.getPagedStories(this.myStories, this.myStoriesPage);
  }

  get pagedAllStories(): any[] {
    return this.getPagedStories(this.allStories, this.publishStoriesPage);
  }

  onPostedStoriesPageChange(page: number): void {
    this.postedStoriesPage = page;
    this.scrollActiveContentPanelToTop();
  }

  onMyStoriesPageChange(page: number): void {
    this.myStoriesPage = page;
    this.scrollActiveContentPanelToTop();
  }

  onPublishStoriesPageChange(page: number): void {
    this.publishStoriesPage = page;
    this.scrollActiveContentPanelToTop();
  }

  private getPagedStories(stories: any[], currentPage: number): any[] {
    const safePage = this.getSafePage(stories.length, currentPage);
    const startIndex = (safePage - 1) * this.tabPageSize;

    return stories.slice(startIndex, startIndex + this.tabPageSize);
  }

  private getSafePage(totalItems: number, currentPage: number): number {
    const totalPages = Math.max(1, Math.ceil(totalItems / this.tabPageSize));

    return Math.min(Math.max(1, currentPage), totalPages);
  }

  private resetTabPagination(): void {
    this.postedStoriesPage = 1;
    this.myStoriesPage = 1;
    this.publishStoriesPage = 1;
  }

  private scrollActiveContentPanelToTop(): void {
    setTimeout(() => {
      const activePanel = document.querySelector('.tab-panel-surface.content-panel') as HTMLElement | null;
      activePanel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  get funTabPublishedStories(): any[] {
    return this.funTabPublishedStoriesCache;
  }

  get visibleFunStories(): any[] {
    return this.visibleFunRowsCache.flatMap((row) => [
      ...row.mediaStories,
      ...row.textStories
    ]);
  }

  get visibleFunRows(): any[] {
    return this.visibleFunRowsCache;
  }

  get hasFunTextStories(): boolean {
    return this.funTabTextStoriesCache.length > 0;
  }

  get hasSingleFunTextStory(): boolean {
    return this.funTabTextStoriesCache.length === 1;
  }

  get funTabTextStories(): any[] {
    return this.funTabTextStoriesCache;
  }

  get funTabMediaStories(): any[] {
    return this.funTabMediaStoriesCache;
  }

  get canToggleFunStories(): boolean {
    return this.totalVisibleFunUnits > this.initialFunVisibleCount;
  }

  get funStoriesToggleLabel(): string {
    return this.showAllFunCards ? 'View Less' : 'View More';
  }

  toggleFunStories(): void {
    if (this.showAllFunCards) {
      this.resetFunStoriesVisibility();
      this.showAllFunCards = false;
      this.updateVisibleFunRows();
      return;
    }

    const nextVisibleCount = this.visibleFunStoriesCount + this.currentFunStoriesBatchSize;
    this.visibleFunStoriesCount = Math.min(nextVisibleCount, this.totalVisibleFunUnits);
    this.showAllFunCards = this.visibleFunStoriesCount >= this.totalVisibleFunUnits;
    this.updateVisibleFunRows();
  }

  private get initialFunVisibleCount(): number {
    if (this.isMobileView) {
      return this.initialVisibleCards;
    }

    return 1;
  }

  private get currentFunStoriesBatchSize(): number {
    return this.isMobileView
      ? this.initialVisibleCards
      : Math.max(1, Math.floor(this.funStoriesBatchSize / this.funMediaCardsFullRow));
  }

  private get totalVisibleFunUnits(): number {
    return this.funTabRowsCache.length;
  }

  private get allFunMediaSlotCount(): number {
    if (!this.hasFunTextStories) {
      return this.funTabMediaStories.length;
    }

    const textCardsPerRow = this.isMobileView ? 1 : this.funTextCardsPerRow;
    const mediaCardsWithTextRow = this.isMobileView ? 1 : this.funMediaCardsWithTextRow;
    const textMediaSlotCount = Math.ceil(this.funTabTextStories.length / textCardsPerRow) * mediaCardsWithTextRow;

    return Math.max(this.funTabMediaStories.length, textMediaSlotCount);
  }

  private resetFunStoriesVisibility(): void {
    this.visibleFunStoriesCount = this.initialFunVisibleCount;
    this.updateVisibleFunRows();
  }

  private isFunTextStory(story: any): boolean {
    const storyType = `${story?.type || story?.mediaType || ''}`.toLowerCase();
    const fileName = `${story?.fileName || ''}`.toUpperCase();

    return storyType === 'text' && fileName === 'NA';
  }

  private getFunStoryRows(mediaSlotLimit: number): any[] {
    if (this.isMobileView) {
      return this.getMobileFunStoryRows(mediaSlotLimit);
    }

    return this.getDesktopFunStoryRows(mediaSlotLimit);
  }

  private getDesktopFunStoryRows(mediaSlotLimit: number): any[] {
    const textStories = this.funTabTextStories;
    const mediaStories = this.funTabMediaStories;
    const rows: any[] = [];
    const mediaBudget = Math.min(mediaStories.length, Math.max(0, mediaSlotLimit));
    const textRowCapacity = this.hasFunTextStories
      ? Math.ceil(Math.max(0, mediaSlotLimit) / this.funMediaCardsWithTextRow)
      : 0;
    let mediaIndex = 0;
    let textIndex = 0;
    let textRowsUsed = 0;

    while (mediaIndex < mediaBudget || (textIndex < textStories.length && textRowsUsed < textRowCapacity)) {
      if (textIndex < textStories.length && textRowsUsed < textRowCapacity) {
        const mediaStoriesForRow = mediaStories.slice(mediaIndex, mediaIndex + this.funMediaCardsWithTextRow);
        const textStoriesForRow = textStories.slice(textIndex, textIndex + this.funTextCardsPerRow);

        rows.push({
          mediaStories: mediaStoriesForRow,
          textStories: textStoriesForRow
        });

        mediaIndex += mediaStoriesForRow.length;
        textIndex += textStoriesForRow.length;
        textRowsUsed += 1;
        continue;
      }

      const mediaStoriesForRow = mediaStories.slice(mediaIndex, mediaIndex + this.funMediaCardsFullRow);

      rows.push({
        mediaStories: mediaStoriesForRow,
        textStories: []
      });

      mediaIndex += mediaStoriesForRow.length;
    }

    return rows;
  }

  private getMobileFunStoryRows(mediaSlotLimit: number): any[] {
    const flattenedRows = this.getDesktopFunStoryRows(this.allFunMediaSlotCount).flatMap((row) => {
      const mediaRows = row.mediaStories.map((story: any) => ({
        mediaStories: [story],
        textStories: []
      }));
      const textRows = row.textStories.map((story: any) => ({
        mediaStories: [],
        textStories: [story]
      }));

      return [...mediaRows, ...textRows];
    });

    return flattenedRows.slice(0, mediaSlotLimit);
  }

  trackFunRow(index: number): number {
    return index;
  }

  trackFunStory(_index: number, story: any): any {
    return story?.id || story?.fileName || _index;
  }

  private updateFunStoryCaches(): void {
    this.funTabTextStoriesCache = this.publishedStories
      .filter((story: any) => this.isFunTextStory(story))
      .slice(0, this.maxFunTextStories);

    const textCardsPerRow = this.isMobileView ? 1 : this.funTextCardsPerRow;
    const reservedTextSlots = Math.ceil(this.funTabTextStoriesCache.length / textCardsPerRow);
    const mediaLimit = this.maxFunStories - reservedTextSlots;

    this.funTabMediaStoriesCache = this.publishedStories
      .filter((story: any) => !this.isFunTextStory(story))
      .slice(0, mediaLimit);

    this.funTabRowsCache = this.getFunStoryRows(this.allFunMediaSlotCount);
    this.funTabPublishedStoriesCache = this.funTabRowsCache.flatMap((row) => [
      ...row.mediaStories,
      ...row.textStories
    ]);
    this.updateVisibleFunRows();
  }

  private updateVisibleFunRows(): void {
    this.visibleFunRowsCache = this.funTabRowsCache.slice(0, this.visibleFunStoriesCount);
  }

  get hasMultipleHeroBanners(): boolean {
    return this.activeHeroBanners.length > 1;
  }

  get hasHeroBanner(): boolean {
    return this.activeHeroBanners.length > 0;
  }

  get primaryHeroBanner(): string {
    return this.activeHeroBanners[0];
  }

  get activeHeroBanners(): string[] {
    if (window.innerWidth < 992 && this.mobileImagesArr.length > 0) {
      return this.mobileImagesArr;
    }

    return this.imagesArr;
  }

  get currentFileSizeLimitMb(): number {
    return this.storyForm?.get('mediaType')?.value === 'Video' ? 30 : 5;
  }

  get currentFileSizeLimitLabel(): string {
    return `Not more than ${this.currentFileSizeLimitMb}MB`;
  }

  get topLikedPublishedStories(): any[] {
    return this.publishedStories
      .filter((story: any) => Number(story?.totalLikes) > 0)
      .sort((a: any, b: any) => Number(b?.totalLikes || 0) - Number(a?.totalLikes || 0))
      .slice(0, 3);
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

  getStoryMediaSrc(story: any): string {
    if (!story) {
      return '';
    }

    if (story.fileName?.startsWith('https://')) {
      return story.fileName;
    }

    return `${this.url}${story.folder}/${story.fileName}`;
  }

  isTextStory(story: any): boolean {
    const storyType = `${story?.type || story?.mediaType || ''}`.toLowerCase();

    return storyType === 'text';
  }

  getStoryThumbnailKey(story: any): string {
    return `${story?.id || 'story'}-${story?.folder || ''}-${story?.fileName || ''}`;
  }

  getStoryThumbnail(story: any): string | null {
    return this.videoThumbnailMap[this.getStoryThumbnailKey(story)] || null;
  }

  hasStoryThumbnailError(story: any): boolean {
    return !!this.videoThumbnailErrorMap[this.getStoryThumbnailKey(story)];
  }

  setCardVideoPreviewFrame(event: Event, story?: any): void {
    const video = event.target as HTMLVideoElement | null;
    if (!video) {
      return;
    }

    if (story) {
      const key = this.getStoryThumbnailKey(story);
      if (this.videoThumbnailErrorMap[key]) {
        this.videoThumbnailErrorMap = {
          ...this.videoThumbnailErrorMap,
          [key]: false
        };
      }
    }

    if (story && this.getStoryThumbnail(story)) {
      video.pause();
      return;
    }

    try {
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      const targetTime = duration > 0 ? Math.min(1, Math.max(duration * 0.25, 0.1)) : 0.1;
      video.currentTime = targetTime;
    } catch (error) {
      console.error('Failed to seek card video preview', error);
    }
  }

  freezeCardVideoPreview(event: Event, story?: any): void {
    const video = event.target as HTMLVideoElement | null;
    if (!video) {
      return;
    }

    if (story && !this.getStoryThumbnail(story)) {
      this.captureVideoThumbnail(video, story);
    }

    video.pause();
  }

  onCardVideoPreviewError(story?: any): void {
    if (!story) {
      return;
    }

    this.videoThumbnailErrorMap = {
      ...this.videoThumbnailErrorMap,
      [this.getStoryThumbnailKey(story)]: true
    };
  }

  openPreview(story: any, tabTitle: string): void {
    this.previewStory = story;
    this.preview = true;
    this.previewSourceTab = tabTitle || this.activeTab;
    this.syncHistoryState(true);

    this.api.postVisit(story.id, story.category, story.header, story.createdBy).subscribe({
      next: (res: any) => {
        if (res.status === "success") {
        //  console.log(res)
         story.totalViews = res.totalViews;
        }
      },
      error: (err) => {
        console.error('Failed', err);
      }
    });
  }

  closePreview(updateHistoryState: boolean = true): void {
    this.preview = false;
    this.previewStory = null;
    this.previewSourceTab = '';
    if (updateHistoryState) {
      this.syncHistoryState(false);
    }
  }

  private restorePreviewState(storyId: any, tabTitle: string): void {
    const storyCollections = [
      this.publishedStories,
      this.postedStories,
      this.myStories,
      this.allStories
    ];

    const restoredStory = storyCollections
      .flat()
      .find((story: any) => String(story?.id) === String(storyId));

    if (restoredStory) {
      this.previewStory = restoredStory;
      this.preview = true;
      this.previewSourceTab = tabTitle || this.activeTab;
      this.pendingPreviewState = null;
      return;
    }

    this.pendingPreviewState = {
      storyId,
      tab: tabTitle || this.activeTab
    };
  }

  private syncHistoryState(includePreview: boolean): void {
    const nextState = {
      ...(history.state || {}),
      activeTab: this.activeTab,
      previewStoryId: includePreview ? this.previewStory?.id ?? null : null,
      previewSourceTab: includePreview ? this.previewSourceTab || this.activeTab : '',
      previewOpen: includePreview
    };

    if (includePreview) {
      history.pushState(nextState, '');
      return;
    }

    history.replaceState(nextState, '');
  }

  private captureVideoThumbnail(video: HTMLVideoElement, story: any): void {
    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) {
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      const maxWidth = 480;
      const scale = Math.min(1, maxWidth / width);
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      this.videoThumbnailMap = {
        ...this.videoThumbnailMap,
        [this.getStoryThumbnailKey(story)]: canvas.toDataURL('image/jpeg', 0.72)
      };
    } catch (error) {
      console.error('Failed to capture video thumbnail', error);
    }
  }

  onMediaTypeChange(event: any) {
    // console.log(this.allExtensions);
    const selectedType = event.target.value;
    this.isvideo = selectedType === 'Video';
    this.storyForm.get('mediaType')?.markAsTouched();
    this.selectedFiles = {};
    this.removeFiles = {};
    this.storyForm.get('attachment1')?.reset();
    // this.storyForm.get('externalLink')?.reset();
    // this.storyForm.get('externalLink')?.setValidators([]);
    // if (this.isvideo){
    //   if(this.category !== 'employeeconnect'){
    //     this.storyForm.get('externalLink')?.setValidators([
    //     Validators.maxLength(1000),
    //     Validators.pattern(/^https:\/\/(([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}|localhost)(:\d{1,5})?(\/[^\s]*)?$/)
    //   ]);
    //   this.storyForm.get('externalLink')?.markAsTouched();
    //   }else{
    //     this.storyForm.get('attachment1')?.setValidators([Validators.required]);
    //   }
    // }
    this.syncAttachmentValidators();
    // this.storyForm.get('externalLink')?.updateValueAndValidity();
  }

  private syncAttachmentValidators(): void {
    const attachmentControl = this.storyForm.get('attachment1');
    if (!attachmentControl) {
      return;
    }

    attachmentControl.clearValidators();

    if (this.isFileMediaType) {
      attachmentControl.setValidators([Validators.required]);
    } else {
      attachmentControl.setErrors(null);
    }

    attachmentControl.updateValueAndValidity();
  }



  fetchAllStories() {
    this.loader.show();
    Promise.resolve().then(() => {
      this.api.getMyStories(this.category, 'all').subscribe({
        next: (res: any) => {
          this.loader.hide();

          // 1️⃣ Store all stories
          this.showAllFunCards = false;
          this.resetTabPagination();
          this.allStories = res[this.category] || [];
          
          // 🔥 Reusable priority map
          const priority: any = { L: 1, P: 2, X: 3 };

          // 2️⃣ postedStories → only P 
          this.postedStories = this.allStories
            .filter((story: any) => story?.status === 'P')
            .sort((a: any, b: any) => priority[a.status] - priority[b.status]);


           this.publishedStories = this.allStories
            .filter((story: any) => story?.status === 'P')
            .sort((a: any, b: any) => priority[a.status] - priority[b.status]);
          this.updateFunStoryCaches();
          this.resetFunStoriesVisibility();
            // console.log("published ppost", this.publishedStories);
          // 3️⃣ myStories → match createdBy prefix
          const userEmail = localStorage.getItem('emailId') || '';
          const userPrefix = userEmail.split('@')[0];

          this.myStories = this.allStories
            .filter((story: any) => {
              const createdPrefix = story?.createdBy?.split('@')[0];
              return createdPrefix === userPrefix;
            })
            .sort((a: any, b: any) => priority[a.status] - priority[b.status]);

          // 4️⃣ allStories → sort A → P → X
          this.allStories = [...this.allStories].sort(
            (a: any, b: any) => priority[a.status] - priority[b.status]
          );

          if (this.pendingPreviewState) {
            this.restorePreviewState(this.pendingPreviewState.storyId, this.pendingPreviewState.tab);
          }
        },

        error: (err: any) => {
          this.allStories = [];
          this.postedStories = [];
          this.publishedStories = [];
          this.myStories = [];
          this.updateFunStoryCaches();
          this.resetFunStoriesVisibility();
          this.showAllFunCards = false;
          this.resetTabPagination();
          this.loader.hide();
          console.error('Failed to load data:', err);
        }
      });
    });
  }
  fetchneed = false;

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

       
            this.dialog.alert(res.message, 'CONFIRMATION').then(() => {
              this.fetchneed = true;

              story.status = newStatus;
              story.actionSuccess = actionMessage;

              const index = this.allStories.findIndex((s: any) => s.id === story.id);
              if (index !== -1) {
                this.allStories[index].status = newStatus;
                this.allStories[index].actionSuccess = actionMessage;
              }
              const index2 = this.myStories.findIndex((s: any) => s.id === story.id);
              if (index2 !== -1) {
                this.myStories[index2].status = newStatus;
                this.myStories[index2].actionSuccess = actionMessage;
              }
              const index3 = this.postedStories.findIndex((s: any) => s.id === story.id);
              if (index3 !== -1) {
                this.postedStories[index3].status = newStatus;
                this.postedStories[index3].actionSuccess = actionMessage;
              }
              this.publishedStories = this.allStories
                .filter((s: any) => s?.status === 'P')
                .sort((a: any, b: any) => {
                  const priority: any = { L: 1, P: 2, X: 3 };
                  return priority[a.status] - priority[b.status];
                });
              this.updateFunStoryCaches();
              this.postedStories = [...this.postedStories];
              this.myStories = [...this.myStories];
              this.allStories = [...this.allStories];
              
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

  openLink(obj?: any) {
    // console.log(obj);
    if (obj.link !== 'NA' && obj.type === 'Image') {
      window.open(obj.link, '_blank');
    }
  }

  isVideo(fileName: string): boolean {
    const videoExtensions = ['.mp4', '.webm', '.mov', '.mkv', '.m4v', '.3gp'];
    return videoExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  }

  transform(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  selectedImage: string | null = null;

  openImage(story: any) {
    if (!story.fileName.endsWith('.mp4')) {
      this.selectedImage = this.url + story.folder + '/' + story.fileName;
    }
  }

  closeImage() {
    this.selectedImage = null;
  }



  // onSubmit() {
  //   this.loader.show();
  //   if (this.storyForm.invalid) {
  //     this.storyForm.markAllAsTouched();
  //     const requiredFields = ['mediaType', 'headline'];

  //     if (this.category == 'employeeconnect' || this.category !== 'employeeconnect' && !this.isvideo) requiredFields.push('attachment1');

  //     // // Debug log values
  //     // requiredFields.forEach(f => {
  //     //   console.log(f, '=>', this.storyForm.get(f)?.value);
  //     // });

  //     requiredFields.forEach(key => {
  //       const control = this.storyForm.get(key);
  //       if (control && control.enabled) {
  //         if (!control.value && control.errors?.['uploadFailed'] !== true) {
  //           control.setErrors({ ...(control.errors || {}), uploadFailed: true });
  //           control.markAsTouched();
  //         } else if (control.value && control.hasError('uploadFailed')) {
  //           // remove uploadFailed error if value exists
  //           const { uploadFailed, ...rest } = control.errors || {};
  //           control.setErrors(Object.keys(rest).length ? rest : null);
  //         }
  //       }
  //     });
  //     // For video, require at least one of file or link
  //     if (this.isvideo) {
  //       if (this.category !== 'employeeconnect') {
  //         const hasFile = !!this.selectedFiles['attachment1'];
  //         const hasLink = !!this.storyForm.get('externalLink')?.value?.trim();

  //         if ((!hasFile && !hasLink) && (hasFile && hasLink)) {
  //           this.loader.hide();
  //           this.dialog.alert('Please upload a file or provide an external link.', 'ALERT');
  //           const element = document.querySelector(`[formControlName="externalLink"]`) as HTMLElement;
  //           if (element) {
  //             element.focus();
  //             element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  //           }
  //           return;
  //         }
  //       }

  //     }

  //     const firstInvalidControl = Object.keys(this.storyForm.controls).find(key => {
  //       const control = this.storyForm.get(key);
  //       return control && control.invalid && control.enabled;
  //     });
  //     this.loader.hide();
  //     let msg = '';
  //     if (firstInvalidControl === 'externalLink' || firstInvalidControl === 'link') {
  //       msg = 'Please fill valid link.'
  //     } else {
  //       msg = 'Please fill all required fields.'
  //     }

  //     this.dialog.alert(msg, 'ALERT')
  //       .then(() => {
  //         if (firstInvalidControl) {
  //           const element = document.querySelector(`[formControlName="${firstInvalidControl}"]`) as HTMLElement;
  //           if (element) {
  //             element.focus();
  //             element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  //           }
  //         }
  //       });
  //     return;
  //   }


  //   if (this.storyForm.valid) {
  //     const payload = this.storyForm.getRawValue();
  //     const formData = new FormData();
  //     const hasFile = !!this.selectedFiles['attachment1'];
  //     const hasLink = !!this.storyForm.get('externalLink')?.value?.trim();

  //     if (hasFile && hasLink || !hasFile && !hasLink) {
  //       this.loader.hide();
  //       this.dialog.alert('Please upload either a file or provide an external link.', 'ALERT').then(() => {
  //         const element = document.querySelector(
  //           `[formControlName="externalLink"]`
  //         ) as HTMLElement;

  //         if (element) {
  //           element.focus();
  //           element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  //         }
  //       })
  //       return;
  //     }

  //     formData.append('category', this.category);
  //     formData.append('header', payload.headline);
  //     formData.append('link', payload.link || "NA");
  //     formData.append('description', payload.storyDescription || 'NA');
  //     formData.append('type', payload.mediaType);
  //     formData.append('externalLink', payload.externalLink || "");
  //     formData.append('file', this.selectedFiles['attachment1']);


  //     Promise.resolve().then(() => {
  //       this.api.submitStoryForm(formData).subscribe({
  //         next: (res: any) => {
  //           this.loader.hide()
  //           if (res[0].status === 'success') {
  //             this.dialog.alert(res[0].message, 'CONFIRMATION').then(() => {
  //               this.onReset();
  //               this.fetchAllStories();
  //               this.activeTab = 'My Submission';
  //             });
  //           } else if (res?.status !== 'success') {
  //             if (res[0].message) {
  //               this.dialog.alert(res[0].message);
  //             } else {
  //               this.dialog.alert("Failed to upload the content");
  //             }

  //           }

  //         },
  //         error: (err) => {
  //           this.loader.hide()
  //           this.dialog.alert(err[0].message);
  //           console.error('Submission failed:', err);
  //         }
  //       });
  //     });
  //   }

  // }

  onSubmit() {
    this.loader.show();
    this.syncUploadFormValidationState();

    if (this.storyForm.invalid) {
      this.storyForm.markAllAsTouched();

      const firstInvalidControl = this.getFirstInvalidControl();
      const msg = 'Please fill all required fields.';

      this.loader.hide();
      this.dialog.alert(msg, 'ALERT').then(() => {
        this.focusControl(firstInvalidControl);
      });
      return;
    }


    if (this.storyForm.valid) {
      const payload = this.storyForm.getRawValue();
      const formData = new FormData();
      const hasFile = !!this.selectedFiles['attachment1'];

      if (this.isFileMediaType && !hasFile) {
        this.loader.hide();
        const attachmentControl = this.storyForm.get('attachment1');
        attachmentControl?.markAsTouched();
        attachmentControl?.setErrors({
          ...(attachmentControl?.errors || {}),
          required: true,
          uploadFailed: true
        });

        this.dialog.alert('Please fill all required fields.', 'ALERT').then(() => {
          this.focusControl('attachment1');
        });
        return;
      }


      formData.append('category', this.category);
      formData.append('header', (payload.headline || '').trim());
      formData.append('link', payload.link || "NA");
      formData.append('description', (payload.storyDescription || '').trim() || 'NA');
      formData.append('type', payload.mediaType);
      formData.append('externalLink', payload.externalLink || "NA");
      formData.append('file', this.isTextMediaType ? 'NA' : this.selectedFiles['attachment1']);


      Promise.resolve().then(() => {
        this.api.submitStoryForm(formData).subscribe({
          next: (res: any) => {
            this.loader.hide()
            if (res[0].status === 'success') {
              this.dialog.alert(res[0].message, 'CONFIRMATION').then(() => {
                this.onReset();
                this.fetchAllStories();
                this.activeTab = 'My Submission';
              });
            } else if (res?.status !== 'success') {
              if (res[0].message) {
                this.dialog.alert(res[0].message);
              } else {
                this.dialog.alert("Failed to upload the content");
              }

            }

          },
          error: (err) => {
            this.loader.hide()
            this.dialog.alert(err[0].message);
            console.error('Submission failed:', err);
          }
        });
      });
    }

  }

  private syncUploadFormValidationState(): void {
    const requiredFields = this.isFileMediaType
      ? ['mediaType', 'headline', 'attachment1', 'storyDescription']
      : ['mediaType', 'headline', 'storyDescription'];

    this.syncAttachmentValidators();

    requiredFields.forEach((key) => {
      const control = this.storyForm.get(key);
      if (!control || !control.enabled) {
        return;
      }

      control.markAsTouched();
      control.updateValueAndValidity({ onlySelf: true });

      if (key === 'attachment1') {
        const hasFile = !!this.selectedFiles['attachment1'];
        if (!hasFile) {
          control.setErrors({
            ...(control.errors || {}),
            required: true,
            uploadFailed: true
          });
        } else if (control.hasError('uploadFailed')) {
          const { uploadFailed, ...rest } = control.errors || {};
          control.setErrors(Object.keys(rest).length ? rest : null);
        }
        return;
      }

      if (typeof control.value === 'string') {
        const trimmedValue = control.value.trim();
        if (control.value !== trimmedValue) {
          control.setValue(trimmedValue, { emitEvent: false });
          control.updateValueAndValidity({ onlySelf: true });
        }
      }
    });
  }

  private getFirstInvalidControl(): string | undefined {
    return Object.keys(this.storyForm.controls).find((key) => {
      const control = this.storyForm.get(key);
      return !!(control && control.invalid && control.enabled);
    });
  }

  // private getUploadValidationMessage(controlName?: string): string {
  //   return 'Please fill all required fields.';
  // }

  private focusControl(controlName?: string): void {
    if (!controlName) {
      return;
    }

    const element = document.querySelector(`[formControlName="${controlName}"]`) as HTMLElement | null;
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }


  async onFileChange(event: { file: File | null }, controlName: string) {

    const { file } = event;
    this.selectedFiles = {};
    const control = this.storyForm.get(controlName);
    control?.setErrors(null);
    if (!control) return;

    if (!file) {
      control.setValue(null);
      control.setErrors({ required: true, uploadFailed: true });
      delete this.selectedFiles[controlName];
      return;
    }

    this.selectedFiles = { [controlName]: file };

    // if (file) {
    //   const isValid = await this.checkMediaRatio(file);

    //   if (!isValid) {
    //     this.storyForm.get(controlName)?.reset();
    //     this.removeFiles[controlName] = file.name;

    //     const ratiosText = this.allowedRatios.map(r => {
    //       const [w, h] = [Math.round(r * 100), 100];
    //       return `${w}:${h}`;
    //     }).join(' or ');

    //     alert(`Invalid aspect ratio. Please upload in ${ratiosText} ratio.`);
    //     return;
    //   }

    //   // this.selectedFiles[controlName] = file;
    // }
    if (file) {
      control.setErrors(null);
      control.markAsTouched();
      this.removeFiles[controlName] = file
    } else {
      control.setErrors({ required: true, uploadFailed: true });
      control.setValue(null);
      control.updateValueAndValidity();
      delete this.selectedFiles[controlName];
    }

  }

  checkMediaRatio(file: File): Promise<boolean> {

    return new Promise((resolve) => {
      const validateRatio = (width: number, height: number) => {
        const ratio = width / height;
        // ✅ check against all allowed ratios
        return this.allowedRatios.some(allowed =>
          Math.abs(ratio - allowed) <= this.tolerance
        );
      };

      if (file.type.startsWith('image/')) {
        const img = new Image();
        img.onload = () => {
          resolve(validateRatio(img.width, img.height));
          URL.revokeObjectURL(img.src);
        };
        img.onerror = () => resolve(false);
        img.src = URL.createObjectURL(file);
      }
      else if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          resolve(validateRatio(video.videoWidth, video.videoHeight));
          URL.revokeObjectURL(video.src);
        };
        video.onerror = () => resolve(false);
        video.src = URL.createObjectURL(file);
      }
      else {
        resolve(false);
      }
    });
  }

  onRemove(controlName: any) {

    const file = this.removeFiles[controlName];
    const control = this.storyForm.get(controlName);
    // console.log(file);
    if (!file) {
      console.warn('No file name found for control:', controlName);
      return;
    }
    if (file) {
      control?.setValue(null);
      control?.setErrors({ required: true, uploadFailed: true });
      delete this.selectedFiles[controlName];
      delete this.removeFiles[controlName];
    }
  }

  onFileDownload(event: { fileName: string; controlName: string }) {
    const { fileName, controlName } = event;
    // File stored from onFileChange()
    const file = this.selectedFiles[controlName];

    if (!file) {
      console.warn('File not found to download');
      return;
    }

    // Convert File → Blob URL
    const url = URL.createObjectURL(file);

    // Create temporary download link
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name || fileName;   // use real file name
    a.style.display = 'none';

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Cleanup Blob URL
    URL.revokeObjectURL(url);
  }


  get allowedExtensions(): string[] {

    const mediaType = this.storyForm.get('mediaType')?.value;
    if (mediaType === 'Image') {
      this.isvideo = false;
      return this.imageExtensions;
    } else if (mediaType === 'Video') {
      this.isvideo = true;
      return this.videoExtensions;
    } else if (mediaType === 'Text') {
      this.isvideo = false;
      return [];
    } else {
      this.isvideo = false;
      return this.allExtensions;
    }
  }

  // get allowedExtensions(): string[] {
  //   const mediaType = this.storyForm.get('mediaType')?.value;

  //   if (mediaType === 'Image') {
  //     this.isvideo = false;
  //     return this.imageExtensions; // filter only images
  //   }
  //   else if (mediaType === 'Video') {
  //     this.isvideo = true;
  //     return []; // ← allow ALL files (no filter)
  //   }
  //   else {
  //     this.isvideo = false;
  //     return this.allExtensions;
  //   }
  // }


  empconnect(id: any, stories: any, cat: any, tab: any) {
    const selectedStory = stories?.find((story: any) => story.id === id);
    if (selectedStory) {
      this.openPreview(selectedStory, tab);
      console.log(selectedStory);
      return;
    }

    this.role = this.isAdmin ? 'admin' : 'default'
    // this.router.navigate(['/portal/contentPreview'], {
    //   state: { storyList: stories, id: id, cat: cat, tab: tab, role: this.role }
    // });
  }

  isUrl(str: string): boolean {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  downloadReport() {
    this.loader.show();

    this.api.downloadReport().subscribe({
      next: (res: any) => {
        this.loader.hide();

        if (!res?.success || typeof res.encodedFile !== 'string' || !res.encodedFile) {
          this.dialog.alert('Failed to download report.');
          return;
        }

        try {
          const base64Data = res.encodedFile.includes(',')
            ? res.encodedFile.substring(res.encodedFile.indexOf(',') + 1)
            : res.encodedFile;
          const binaryData = atob(base64Data);
          const bytes = new Uint8Array(binaryData.length);

          for (let index = 0; index < binaryData.length; index++) {
            bytes[index] = binaryData.charCodeAt(index);
          }

          const blob = new Blob([bytes], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          });
          const objectUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');

          a.href = objectUrl;
          a.download = `${'fun & levity'}-report.xlsx`;
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(objectUrl);
        } catch (error) {
          console.error('Invalid report file data', error);
          this.dialog.alert('Failed to download report.');
        }
      },
      error: (err) => {
        this.loader.hide();
        console.error('Download failed', err);
        this.dialog.alert('Failed to download report.');
      }
    });
  }
  

  getLikes(post:any) {
    this.loader.show();
    this.api.getLikeBy(post.id,  "getLikes", post.category, post.header).subscribe({
      next: (res: any) => {
        if (res.status === "success") {
          this.likedUser = res.likedUsers;
          this.likesPopupOpen();
        }
          this.loader.hide();
      },
      error: (err) => {
          this.loader.hide();
        console.error('Failed to load data:', err);
      }
    });
  }
  
  updateLikes(story: any) {
      this.loader.show();
    let action = story.self ? 'unlike' : 'like';
    this.api.getLikeBy(story.id, action, story.category, story.header).subscribe({
      next: (res: any) => {
        if (res.status === "success") {
          story.self = !story.self;
          story.totalLikes = res.totalLikes
        }
          this.loader.hide();
      },
      error: (err) => {
          this.loader.hide();
        console.error('Failed to load data:', err);
      }
    });
  }

  likesPopupOpen() {
    this.likeshowPopup = true;
  }

  likesPopupClose() {
    this.likeshowPopup = false;
  }


  onReset(): void {
    this.storyForm.reset();
    this.applyDefaultMediaType();
    this.selectedFiles = {};
    this.removeFiles = {};
  }

}
