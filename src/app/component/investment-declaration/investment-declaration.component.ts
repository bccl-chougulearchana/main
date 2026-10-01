import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, HostListener, OnInit } from '@angular/core';
import { catchError, map, of, Subject,  takeUntil,  Observable} from 'rxjs';
import { RouterModule } from '@angular/router';
import { DynamicColDirective, DynamicGridDirective, FileuploadDirective, LibLabelTextDirective, PopupDirective, RequiredDirective, SelectDirective, TabDirective, TabsDirective, TextareaDirective } from 'toi-libraries';
import { QuestionnaireComponent } from "./questionnaire/questionnaire.component";
import { HistoryComponent } from "./history/history.component";
import { InvestmentSuccessComponent } from './investment-success/investment-success.component';
import { InvestmentDeclarationService } from '../../services/investment-declaration/investment-declaration.service';
import { LoaderService } from '../../shared/shared-services/loader.service';
import { CommonDialogService } from '../../shared/shared-services/common-dialog.service';


/** A single "Related Links" menu entry, loaded from asset/configdata JSON. */
interface RelatedLink {
  label: string;
  url: string;
  fileName?: string;
}

/** Shape of asset/configdata/disclosureconfig.json. */
interface DisclosureConfig {
  relatedLinks: RelatedLink[];
}

@Component({
  selector: 'app-investment-declaration',
  standalone: true,
   imports: [DynamicGridDirective, TabDirective, TabsDirective, CommonModule, PopupDirective,  QuestionnaireComponent, HistoryComponent, InvestmentSuccessComponent, RouterModule],
  templateUrl: './investment-declaration.component.html',
  styleUrl: './investment-declaration.component.scss'
})
export class InvestmentDeclarationComponent implements OnInit{
showInfo = false;
showPopup = false;
currentQuarter = '';
currentYear = new Date().getFullYear();
activeTab: string = 'Questionnaire';
/** Toggled to force the tabs to re-initialise when switching programmatically. */
tabsVisible = true;
destroy$ = new Subject<boolean>();

/** null = checking, true = allowed, false = not authorised. */
authorized: boolean | null = null;
/** When true, the in-component success screen replaces the tabs. */
submitted = false;

/** "Related Links" dropdown (top-right of the title row). */
relatedLinksOpen = false;

/** Path to the runtime-editable config (no rebuild needed to change links). */
private static readonly DISCLOSURE_CONFIG_URL = 'asset/configdata/disclosureconfig.json';

/**
 * "Related Links" menu items, loaded at runtime from DISCLOSURE_CONFIG_URL.
 * Edit that JSON (labels / urls / fileNames) — no Angular rebuild required.
 */
relatedLinks: RelatedLink[] = [];

constructor(
  private readonly service: InvestmentDeclarationService,
  private readonly loader: LoaderService,
  private readonly dialog: CommonDialogService,
  private readonly http: HttpClient,
) {}

ngOnInit(): void {
  this.loadRelatedLinks();
  this.checkRole()
    .pipe(takeUntil(this.destroy$))
    .subscribe((authorized) => {
      this.authorized = authorized;
      if (authorized) {
        // Only an authorised user triggers any further API (the questionnaire
        // renders, which is what calls getInitialQuestion on its own init).
        this.setCurrentQuarterAndYear();
      }
    });
}

/** Authorised only when the role flag res[0].data[0][0] === '1'. */
private checkRole(): Observable<boolean> {
  return this.service.listRoles().pipe(
    map((res:any) => res?.[0]?.data?.[0]?.[0] === '1'),
    catchError((error) => {
      console.error(error);
      return of(false);
    }),
  );
}

/** Show the in-component success screen after a successful submit. */
onSubmitted(): void {
  this.submitted = true;
}

/** Success-screen links and tooltip "click here" return to the History tab. */
onViewHistory(): void {
  this.submitted = false;
  this.activeTab = 'History';
  // Re-init the tabs so the active tab actually switches at runtime.
  this.tabsVisible = false;
  setTimeout(() => {
    this.tabsVisible = true;
  });
}

    onTabChange(event: Event | string) {
    if (event === 'History') {

    }
  };

private setCurrentQuarterAndYear(): void {
  const month = new Date().getMonth() + 1; // January = 1

  if (month >= 1 && month <= 3) {
    this.currentQuarter = 'JAN-MAR';
  } else if (month >= 4 && month <= 6) {
    this.currentQuarter = 'APR-JUN';
  } else if (month >= 7 && month <= 9) {
    this.currentQuarter = 'JUL-SEP';
  } else {
    this.currentQuarter = 'OCT-DEC';
  }
}

  openPopup() {
    this.showPopup = true;
  }
  closePopup() {
    this.showPopup = false;
  }
  openInfo() {
    this.showInfo = true;
  }
  closeInfo() {
    this.showInfo = false;
  }

  /** Load the Related Links menu from the runtime JSON config. */
  private loadRelatedLinks(): void {
    this.http
      .get<DisclosureConfig>(InvestmentDeclarationComponent.DISCLOSURE_CONFIG_URL)
      .pipe(
        catchError(() => of<DisclosureConfig>({ relatedLinks: [] })),
        takeUntil(this.destroy$),
      )
      .subscribe((config) => {
        this.relatedLinks = Array.isArray(config?.relatedLinks) ? config.relatedLinks : [];
      });
  }

  /** Toggle the Related Links menu (stopPropagation so the document handler
   *  below doesn't immediately close it). */
  toggleRelatedLinks(event: MouseEvent): void {
    event.stopPropagation();
    this.relatedLinksOpen = !this.relatedLinksOpen;
  }

  /** Close the menu on any outside click. */
  @HostListener('document:click')
  closeRelatedLinks(): void {
    this.relatedLinksOpen = false;
  }

  /** Download the selected resource's PDF from its server path. */
  downloadResource(link: RelatedLink): void {
    this.relatedLinksOpen = false;
    const anchor = document.createElement('a');
    anchor.href = link.url;
    if (link.fileName) {
      anchor.download = link.fileName;
    }
    anchor.target = '_blank';
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}