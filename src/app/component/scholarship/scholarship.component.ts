import { Component, OnDestroy, OnInit } from '@angular/core';
import { PopupComponent } from './popup/popup.component';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from "@angular/router";
import { setPopupService , setProcessorRole, menu$, initMenu} from '../../services/scholarship/shared/menu.config';
import { MenuBarDirective } from '../../shared/shared-directives/menu-bar.directive'; 
import { PopupService } from '../../services/scholarship/shared/popup.service';
import { ScholarshipApiService } from '../../services/scholarship/scholarship_api.service';
import { distinctUntilChanged, filter, Subject, takeUntil } from 'rxjs';

export interface MenuItem {
  label: string;
  route?: string;
  icon?: string;
  tooltip?: string;
  onClick?: () => void;
  children?: MenuItem[];
}

@Component({
  selector: 'app-scholarship',
  standalone: true,
  imports: [CommonModule, RouterModule, PopupComponent, RouterOutlet, MenuBarDirective],
  templateUrl: './scholarship.component.html',
  styleUrl: './scholarship.component.scss'
})


export class ScholarshipComponent implements OnInit {

  menu: MenuItem[] = [];
  cachedMenu: MenuItem[] = [];
  isProcessor = false;

  constructor(
    private popupService: PopupService,
    private api: ScholarshipApiService
  ) {}

  ngOnInit(): void {
    this.popupServiceRef = this.popupService; 
    // this.menu = this.getSharedMenu();
    this.checkRole();
  }

  popupServiceRef: PopupService | null = null;

  checkRole(): void {
    this.api.checklist().subscribe({
      next: res => {
        const values: string[] = res[0]?.data?.flat() || [];
        this.setProcessorRole(values.includes('2'));
      },
      error: () => this.setProcessorRole(false)
    });
  }

  setProcessorRole(value: boolean): void {
    // if (this.isProcessor === value) return;

    this.isProcessor = value;
    this.cachedMenu = this.buildMenu();
    this.menu = this.cachedMenu;   
  }

  getSharedMenu(): MenuItem[] {
    if (!this.cachedMenu.length) {
      this.cachedMenu = this.buildMenu();
    }
    return this.cachedMenu;
  }

  buildMenu(): MenuItem[] {
    const menu: MenuItem[] = [
      { label: 'NEW SCHOLARSHIP', route: '/portal/scholarship/new-scholarship' },
      { label: 'CHECK STATUS', route: '/portal/scholarship/check-status' }
    ];

    if (this.isProcessor) {
      menu.push(
        { label: 'PROCESS', route: '/portal/scholarship/process' },
        { label: 'VIEW SHORTLISTED', route: '/portal/scholarship/view-short-list' }
      );
    }

    menu.push({
      label: '',
      icon: 'ℹ️',
      tooltip: 'Additional Info',
      onClick: () => this.popupServiceRef?.triggerPopup()
    });

    return menu;
  }
}
