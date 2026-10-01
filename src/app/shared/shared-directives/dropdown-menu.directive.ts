
import {
    Directive,
    ElementRef,
    Renderer2,
    Input,
    OnInit,
    HostListener
} from '@angular/core';

@Directive({
    selector: '[libDynamicDropdown]',
    standalone: true
})
export class DynamicDropdownDirective implements OnInit {

    @Input('libDynamicDropdown') menuItems: any[] = [];
    @Input() dropdownLabel = 'Dropdown';

    private container!: HTMLElement;
    private button!: HTMLElement;
    private iconSpan!: HTMLElement;
    private menu!: HTMLElement;

    private isOpen = false;
    private isTouchDevice = false;
    private static openedDropdown: HTMLElement | null = null;

    constructor(private el: ElementRef, private renderer: Renderer2) { }

    ngOnInit(): void {
        this.isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
        this.buildDropdown();
    }

    private buildDropdown() {
        this.container = this.el.nativeElement;
        this.renderer.addClass(this.container, 'lib-dropdown');

        /* ---------- BUTTON ---------- */
        this.button = this.renderer.createElement('button');
        this.renderer.addClass(this.button, 'lib-dropdown-toggle');

        const label = this.renderer.createText(this.dropdownLabel);
        this.iconSpan = this.renderer.createElement('span');
        this.renderer.addClass(this.iconSpan, 'lib-dropdown-icon');
        this.renderer.setProperty(this.iconSpan, 'innerText', '▼');

        this.renderer.appendChild(this.button, label);
        this.renderer.appendChild(this.button, this.iconSpan);

        /* ---------- MENU ---------- */
        this.menu = this.renderer.createElement('ul');
        this.renderer.addClass(this.menu, 'lib-dropdown-menu');
        this.renderer.setStyle(this.menu, 'display', 'none');

        this.menuItems.forEach(item => {
            const li = this.renderer.createElement('li');
            this.renderer.addClass(li, 'lib-dropdown-item');
            this.renderer.setProperty(li, 'innerText', item.label);

            this.renderer.listen(li, 'click', () => {
                item.action?.();
                this.closeMenu();
            });

            this.renderer.appendChild(this.menu, li);
        });

        /* ---------- EVENTS ---------- */
        this.renderer.listen(this.button, 'click', (e: Event) => {
            if (this.isTouchDevice) {
                e.preventDefault();
                e.stopPropagation();
                this.toggleMenu();
            }
        });

        this.renderer.appendChild(this.container, this.button);
        this.renderer.appendChild(this.container, this.menu);
    }

    /* ---------- DESKTOP HOVER ---------- */
    @HostListener('mouseenter')
    onMouseEnter() {
        if (!this.isTouchDevice) this.openMenu();
    }

    @HostListener('mouseleave')
    onMouseLeave() {
        if (!this.isTouchDevice) this.closeMenu();
    }

    /* ---------- OUTSIDE CLICK (MOBILE) ---------- */
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event) {
        if (this.isTouchDevice && this.isOpen && !this.container.contains(event.target as Node)) {
            this.closeMenu();
        }
    }

    /* ---------- OPEN / CLOSE ---------- */
    private toggleMenu() {
        this.isOpen ? this.closeMenu() : this.openMenu();
    }

    // private openMenu() {
    //     this.isOpen = true;

    //     this.renderer.setStyle(this.menu, 'display', 'block');
    //     this.renderer.addClass(this.iconSpan, 'rotate');

    //     requestAnimationFrame(() => this.adjustPosition());
    // }

    // private closeMenu() {
    //     this.isOpen = false;
    //     this.renderer.setStyle(this.menu, 'display', 'none');
    //     this.renderer.removeClass(this.iconSpan, 'rotate');
    // }

    private openMenu() {

        // MOBILE/TABLET → enforce single open dropdown
        if (this.isTouchDevice) {
            if (DynamicDropdownDirective.openedDropdown &&
                DynamicDropdownDirective.openedDropdown !== this.menu) {

                // Close the previously opened dropdown
                (DynamicDropdownDirective.openedDropdown as any).controller?.closeMenu();
            }
            DynamicDropdownDirective.openedDropdown = this.menu;
        }

        this.isOpen = true;
        (this.menu as any).controller = this; // give menu a reference for closing

        this.renderer.setStyle(this.menu, 'display', 'block');
        this.renderer.addClass(this.iconSpan, 'rotate');

        requestAnimationFrame(() => this.adjustPosition());
    }


    private closeMenu() {
        this.isOpen = false;

        if (DynamicDropdownDirective.openedDropdown === this.menu) {
            DynamicDropdownDirective.openedDropdown = null;
        }

        this.renderer.setStyle(this.menu, 'display', 'none');
        this.renderer.removeClass(this.iconSpan, 'rotate');
    }


    /* ---------- SMART POSITION LOGIC ---------- */
    private adjustPosition() {
        const btnRect = this.button.getBoundingClientRect();
        const menuRect = this.menu.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        const spaceBottom = vh - btnRect.bottom;
        const spaceTop = btnRect.top;
        const spaceRight = vw - btnRect.right;
        const spaceLeft = btnRect.left;

        /* RESET */
        this.renderer.setStyle(this.menu, 'top', 'auto');
        this.renderer.setStyle(this.menu, 'bottom', 'auto');
        this.renderer.setStyle(this.menu, 'left', 'auto');
        this.renderer.setStyle(this.menu, 'right', 'auto');

        /* VERTICAL */
        if (spaceBottom >= menuRect.height || spaceBottom >= spaceTop) {
            this.renderer.setStyle(this.menu, 'top', '100%');
        } else {
            this.renderer.setStyle(this.menu, 'bottom', '100%');
        }

        /* HORIZONTAL */
        if (spaceRight >= menuRect.width || spaceRight >= spaceLeft) {
            this.renderer.setStyle(this.menu, 'left', '0');
        } else {
            this.renderer.setStyle(this.menu, 'right', '0');
        }
    }
}
