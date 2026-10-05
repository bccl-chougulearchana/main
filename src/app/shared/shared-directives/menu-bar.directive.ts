
// import {
//   Directive,
//   ElementRef,
//   Input,
//   Renderer2,
//   OnChanges,
//   SimpleChanges,
//   OnDestroy
// } from '@angular/core';
// import { NavigationEnd, Router } from '@angular/router';

// export interface MenuItem {
//   label: string;
//   route?: string;
//   icon?: string;
//   tooltip?: string;
//   onClick?: () => void;
//   children?: MenuItem[];
// }

// @Directive({
//   selector: '[libMenuBar]',
//   standalone: true
// })
// export class MenuBarDirective implements OnChanges, OnDestroy {

//   @Input('libMenuBar') config: ['left' | 'right', MenuItem[]] = ['left', []];

//   private nav!: HTMLElement;
//   private toggle!: HTMLElement;
//   private menuContainer!: HTMLElement;
//   private listeners: (() => void)[] = [];
//   private initialized = false;

// constructor(
//   private el: ElementRef<HTMLElement>,
//   private renderer: Renderer2,
//   private router: Router
// ) {
//   this.router.events.subscribe(event => {
//     if (event instanceof NavigationEnd) {
//       this.updateActiveStates();
//     }
//   });
// }

//   /* ---------------- ONLY TRIGGER ---------------- */

//   ngOnChanges(changes: SimpleChanges): void {
//     if (!changes['config']) return;

//     const [, menu] = this.config;
//     if (!menu || !menu.length) return;

//     if (!this.initialized) {
//       this.createShell();
//       this.initialized = true;
//     }

//     this.renderMenu();

//   }

//   ngOnDestroy(): void {
//     this.cleanupListeners();
//   }

//   /* ---------------- STATIC STRUCTURE ---------------- */

//   private createShell(): void {
//     const host = this.el.nativeElement;
//     const [position] = this.config;

//     this.nav = this.renderer.createElement('nav');
//     this.renderer.addClass(this.nav, 'menu-nav');
//     this.renderer.setStyle(
//       this.nav,
//       'justify-content',
//       position === 'right' ? 'flex-end' : 'flex-start'
//     );

//     this.toggle = this.renderer.createElement('div');
//     this.renderer.addClass(this.toggle, 'menu-toggle');

//     for (let i = 0; i < 3; i++) {
//       this.renderer.appendChild(this.toggle, this.renderer.createElement('span'));
//     }

//     this.menuContainer = this.renderer.createElement('div');
//     this.renderer.addClass(this.menuContainer, 'menu-container');
//     this.renderer.addClass(this.menuContainer, position);

//     this.listeners.push(
//       this.renderer.listen(this.toggle, 'click', () => {
//         this.menuContainer.classList.toggle('show');
//       })
//     );

//     this.renderer.appendChild(this.nav, this.toggle);
//     this.renderer.appendChild(this.nav, this.menuContainer);
//     this.renderer.appendChild(host, this.nav);
//   }

//   /* ---------------- MENU RENDER ---------------- */

//   private renderMenu(): void {
//     this.clearMenu();

//     const [, menu] = this.config;
//     const currentUrl = this.router.url;

//     menu.forEach(item => {
//       const wrapper = this.renderer.createElement('div');
//       this.renderer.addClass(wrapper, 'menu-item');

//       if (item.tooltip) {
//         this.renderer.setAttribute(wrapper, 'title', item.tooltip);
//       }
//       if (item.route) {
//         this.renderer.setAttribute(wrapper, 'data-route', item.route);
//       }
//      if (item.route && currentUrl === item.route) {
//         this.renderer.addClass(wrapper, 'active');
//       }
//       const label = this.renderer.createElement('span');
//       this.renderer.addClass(label, 'menu-label');

//       if (item.icon) {
//         this.renderer.appendChild(label, this.renderer.createText(item.icon));
//       }

//       if (item.label) {
//         this.renderer.appendChild(label, this.renderer.createText(item.label));
//       }

//       const underline = this.renderer.createElement('div');
//       this.renderer.addClass(underline, 'menu-underline');

//       this.renderer.appendChild(wrapper, label);
//       this.renderer.appendChild(wrapper, underline);

//       this.listeners.push(
//         this.renderer.listen(wrapper, 'click', () => {
//           this.menuContainer.classList.remove('show');

//           if (item.onClick) {
//             item.onClick();
//             return;
//           }

//           if (item.route) {
//             this.router.navigateByUrl(item.route);
//           }
//         })
//       );


//       this.renderer.appendChild(this.menuContainer, wrapper);
//     });
//   }

//   /* ---------------- HELPERS ---------------- */
//   private normalizeUrl(url: string): string {
//     return url
//       .replace(/^\/#/, '')
//       .replace(/^#/, '')
//       .split('?')[0]
//       .split('#')[0];
//   }
  
// private updateActiveStates(): void {
//   if (!this.menuContainer) return;

//   const current = this.normalizeUrl(this.router.url);

//   let bestEl: HTMLElement | null = null;
//   let bestLen = -1;

//   const items = this.menuContainer.querySelectorAll<HTMLElement>('.menu-item');

//   items.forEach(el => {
//     el.classList.remove('active');

//     const route = el.getAttribute('data-route');
//     if (!route) return;

//     const normalizedRoute = this.normalizeUrl(route);

//     if (
//       current === normalizedRoute ||
//       current.startsWith(normalizedRoute + '/')
//     ) {
//       const len = normalizedRoute.length;
//       if (len > bestLen) {
//         bestLen = len;
//         bestEl = el;
//       }
//     }
//   });

//  if (bestEl !== null) {
//   (bestEl as HTMLElement).classList.add('active');
// }
// }

//   private clearMenu(): void {
//     while (this.menuContainer.firstChild) {
//       this.renderer.removeChild(
//         this.menuContainer,
//         this.menuContainer.firstChild
//       );
//     }
//   }

//   private cleanupListeners(): void {
//     this.listeners.forEach(off => off());
//     this.listeners = [];
//   }
// }
import {
  Directive,
  ElementRef,
  Input,
  Renderer2,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  OnInit
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';

export interface MenuItem {
  label: string;
  route?: string;
  icon?: string;
  tooltip?: string;
  onClick?: () => void;
  children?: MenuItem[];
}

@Directive({
  selector: '[libMenuBar]',
  standalone: true
})
export class MenuBarDirective implements  OnInit,  OnChanges, OnDestroy {

  @Input('libMenuBar') config: ['left' | 'right', MenuItem[]] = ['left', []];

  private nav!: HTMLElement;
  private toggle!: HTMLElement;
  private menuContainer!: HTMLElement;
  private listeners: (() => void)[] = [];
  private initialized = false;

  private routerSub!: Subscription; 

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private router: Router
  ) {}

ngOnInit(): void {
  this.routerSub = this.router.events.subscribe(event => {
    if (event instanceof NavigationEnd) {
      Promise.resolve().then(() =>
        this.updateActiveStates(event.urlAfterRedirects)
      );
    }
  });
}

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['config']) return;

    const [, menu] = this.config;
    if (!menu || !menu.length) return;

    if (!this.initialized) {
      this.createShell();
      this.initialized = true;
    }

    this.renderMenu();

    Promise.resolve().then(() =>
      this.updateActiveStates(this.router.url)
    );
  }

  ngOnDestroy(): void {
    this.cleanupListeners();
    this.routerSub?.unsubscribe(); 
  }

  private createShell(): void {
    const host = this.el.nativeElement;
    const [position] = this.config;

    this.nav = this.renderer.createElement('nav');
    this.renderer.addClass(this.nav, 'menu-nav');
    this.renderer.setStyle(
      this.nav,
      'justify-content',
      position === 'right' ? 'flex-end' : 'flex-start'
    );

    this.toggle = this.renderer.createElement('div');
    this.renderer.addClass(this.toggle, 'menu-toggle');

    for (let i = 0; i < 3; i++) {
      this.renderer.appendChild(this.toggle, this.renderer.createElement('span'));
    }

    this.menuContainer = this.renderer.createElement('div');
    this.renderer.addClass(this.menuContainer, 'menu-container');
    this.renderer.addClass(this.menuContainer, position);

    this.listeners.push(
      this.renderer.listen(this.toggle, 'click', () => {
        this.menuContainer.classList.toggle('show');
      })
    );

    this.renderer.appendChild(this.nav, this.toggle);
    this.renderer.appendChild(this.nav, this.menuContainer);
    this.renderer.appendChild(host, this.nav);
  }

  /* ---------------- MENU RENDER ---------------- */

  private renderMenu(): void {
    this.clearMenu();

    const [, menu] = this.config;

    menu.forEach(item => {
      const wrapper = this.renderer.createElement('div');
      this.renderer.addClass(wrapper, 'menu-item');

      if (item.tooltip) {
        this.renderer.setAttribute(wrapper, 'title', item.tooltip);
      }
      if (item.route) {
        this.renderer.setAttribute(wrapper, 'data-route', item.route);
      }

      const label = this.renderer.createElement('span');
      this.renderer.addClass(label, 'menu-label');

      if (item.icon) {
        this.renderer.appendChild(label, this.renderer.createText(item.icon));
      }
      if (item.label) {
        this.renderer.appendChild(label, this.renderer.createText(item.label));
      }

      const underline = this.renderer.createElement('div');
      this.renderer.addClass(underline, 'menu-underline');

      this.renderer.appendChild(wrapper, label);
      this.renderer.appendChild(wrapper, underline);

      this.listeners.push(
        this.renderer.listen(wrapper, 'click', () => {
          this.menuContainer.classList.remove('show');

          if (item.onClick) {
            item.onClick();
          } else if (item.route) {
            this.router.navigateByUrl(item.route);
          }
        })
      );

      this.renderer.appendChild(this.menuContainer, wrapper);
    });
  }

  /* ---------------- ACTIVE STATE ---------------- */

  private normalizeUrl(url: string): string {
    return url.replace(/^\/#/, '')
      .replace(/^#/, '')
      .split('?')[0]
      .split('#')[0];
  }

  private updateActiveStates(url: string): void {
    if (!this.menuContainer) return;

    const current = this.normalizeUrl(url);

    let bestEl: HTMLElement | null = null;
    let bestLen = -1;

    const items = this.menuContainer.querySelectorAll<HTMLElement>('.menu-item');

    items.forEach(el => {
      el.classList.remove('active');

      const route = el.getAttribute('data-route');
      if (!route) return;

      const normalizedRoute = this.normalizeUrl(route);

      if (
        current === normalizedRoute ||
        current.startsWith(normalizedRoute + '/')
      ) {
        if (normalizedRoute.length > bestLen) {
          bestLen = normalizedRoute.length;
          bestEl = el;
        }
      }
    });
     if (bestEl !== null) {
  (bestEl as HTMLElement).classList.add('active');
}
    // bestEl?.classList.add('active');
  }

  /* ---------------- HELPERS ---------------- */

  private clearMenu(): void {
    while (this.menuContainer.firstChild) {
      this.renderer.removeChild(this.menuContainer, this.menuContainer.firstChild);
    }
  }

  private cleanupListeners(): void {
    this.listeners.forEach(off => off());
    this.listeners = [];
  }
}
