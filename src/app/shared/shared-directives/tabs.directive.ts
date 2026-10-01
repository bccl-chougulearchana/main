
import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  AfterContentInit,
  ContentChildren,
  QueryList,
  ElementRef,
  Renderer2,
  EmbeddedViewRef,
  EventEmitter,
  Output,
  OnChanges,
  SimpleChanges
} from '@angular/core';

@Directive({
  selector: '[libTab]',
  standalone: true
})
export class TabDirective implements OnChanges {
  @Input() libTab!: string;
  @Input() libTabActive = false;
  @Input() libTabIcon?: string;

  _parentTabs: any;

  constructor(public templateRef: TemplateRef<any>) { }

  get title(): string {
    return this.libTab;
  }

  get active(): boolean {
    return this.libTabActive;
  }

  get icon(): string {
    return this.libTabIcon || '';
  }

  set active(val: boolean) {
    this.libTabActive = val;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['libTabActive'] && this.libTabActive && this._parentTabs) {
      this._parentTabs.activateTab(this);
    }
  }
}

// ---------------------------------------------------------
// TABS CONTAINER DIRECTIVE
// ---------------------------------------------------------
@Directive({
  selector: '[libTabs]',
  standalone: true
})
export class TabsDirective implements AfterContentInit {
  @ContentChildren(TabDirective, { descendants: true }) tabs!: QueryList<TabDirective>;

  @Output() tabChanged = new EventEmitter<string>();

  private activeTab!: TabDirective | null;
  private headerEl!: HTMLElement;
  private bodyEl!: HTMLElement;

  // Cache views so tab content is not recreated
  private tabViews = new Map<TabDirective, EmbeddedViewRef<any>>();

  constructor(
    private vcr: ViewContainerRef,
    private el: ElementRef,
    private renderer: Renderer2
  ) { }

  ngAfterContentInit(): void {
    if (!this.tabs || this.tabs.length === 0) return;

    this.tabs.forEach(t => (t._parentTabs = this));

    const activeTabs = this.tabs.filter(t => t.active);
    this.activeTab = activeTabs.length ? activeTabs[0] : this.tabs.first || null;

    this.headerEl = this.renderer.createElement('ul');
    this.renderer.addClass(this.headerEl, 'tabs-header');
    this.renderer.appendChild(this.el.nativeElement, this.headerEl);

    this.bodyEl = this.renderer.createElement('div');
    this.renderer.addClass(this.bodyEl, 'tabs-body');
    this.renderer.appendChild(this.el.nativeElement, this.bodyEl);

    this.render();
  }

  // ---------------------------------------------------------
  // MAIN RENDERING
  // ---------------------------------------------------------
  private render() {
    this.renderHeaders();
    this.renderContent();
  }

  private renderHeaders() {
    this.headerEl.innerHTML = '';

    this.tabs.forEach(tab => {
      const li = this.renderer.createElement('li');
      this.renderer.addClass(li, 'tab-item');
      if (tab.active) this.renderer.addClass(li, 'active');

      const content = this.renderer.createElement('span');
      this.renderer.addClass(content, 'tab-item-content');

      if (tab.icon) {
        const iconEl = this.createIconElement(tab.icon);
        if (iconEl) {
          this.renderer.appendChild(content, iconEl);
        }
      }

      const text = this.renderer.createElement('span');
      this.renderer.addClass(text, 'tab-item-label');
      this.renderer.appendChild(text, this.renderer.createText(tab.title));
      this.renderer.appendChild(content, text);
      this.renderer.appendChild(li, content);

      this.renderer.listen(li, 'click', () => this.selectTab(tab));
      this.renderer.appendChild(this.headerEl, li);
    });
  }

  private createIconElement(icon: string): HTMLElement | null {
    if (!icon.trim()) {
      return null;
    }

    const isImageIcon =
      icon.includes('/') ||
      icon.startsWith('asset') ||
      icon.startsWith('assets') ||
      /\.(svg|png|jpe?g|gif|webp)$/i.test(icon);

    if (isImageIcon) {
      const img = this.renderer.createElement('img');
      this.renderer.addClass(img, 'tab-item-icon');
      this.renderer.setAttribute(img, 'src', icon);
      this.renderer.setAttribute(img, 'alt', '');
      this.renderer.setAttribute(img, 'aria-hidden', 'true');
      return img;
    }

    const iconWrap = this.renderer.createElement('i');
    this.renderer.addClass(iconWrap, 'tab-item-icon');
    icon
      .split(' ')
      .filter(Boolean)
      .forEach(className => this.renderer.addClass(iconWrap, className));
    this.renderer.setAttribute(iconWrap, 'aria-hidden', 'true');
    return iconWrap;
  }

  private renderContent() {
    this.bodyEl.innerHTML = '';

    if (!this.activeTab) return;

    let view = this.tabViews.get(this.activeTab);

    // Create only once
    if (!view) {
      view = this.vcr.createEmbeddedView(this.activeTab.templateRef);
      this.tabViews.set(this.activeTab, view);
    }

    // Reattach nodes
    view.rootNodes.forEach(node => {
      this.renderer.appendChild(this.bodyEl, node);
    });
  }

  // ---------------------------------------------------------
  // TAB ACTIVATION
  // ---------------------------------------------------------
  private selectTab(tab: TabDirective) {
    this.tabs.forEach(t => (t.active = false));
    tab.active = true;
    this.activeTab = tab;

    this.renderHeaders();
    this.renderContent();

    // Emit to parent component
    this.tabChanged.emit(tab.title);
  }

  activateTab(tab: TabDirective) {
    this.selectTab(tab);
  }
}
