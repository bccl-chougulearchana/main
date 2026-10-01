import { Routes } from '@angular/router';
import { MainLayoutComponent } from './component/main-layout/main-layout.component';
import { authGuard } from './services/auth/auth.guard';
import { ErrorExitComponent } from './component/errorExit/errorexit.component';
import { InvestmentDeclarationComponent } from './component/investment-declaration/investment-declaration.component';

export const routes: Routes = [
  // Default route
  {
    path: '',
    loadComponent: () =>
      import('./component/authetication/login/login.component').then(
        c => c.LoginComponent
      )
  },

  // Login route
  {
    path: 'login',
    loadComponent: () =>
      import('./component/authetication/login/login.component').then(
        c => c.LoginComponent
      )
  },
  { path: 'error/:val', component: ErrorExitComponent },


  // Main layout (protected)
  {
    path: 'portal',
    component: MainLayoutComponent,
    canActivate: [authGuard], // Protect layout + all children
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home'
      },
      {
        path: 'home',
        loadComponent: () =>
          import('./component/home/home.component').then(c => c.HomeComponent),
        runGuardsAndResolvers: 'always'
      },
      {
        path: 'contentPreview',
        loadComponent: () =>
          import('./component/content-preview/content-preview.component').then(
            c => c.ContentPreviewComponent
          ),
      },
      // {
      //   path: 'contentPreview',
      //   loadComponent: () =>
      //     import('./employee-connect/employee-connect.component').then(
      //       c => c.EmployeeConnectComponent
      //     ),
      // },
      {
        path: 'story',
        loadComponent: () =>
          import('./component/story/story.component').then(
            c => c.StoryComponent
          ),
      },
      {
        path: 'funAndLevity',
        loadComponent: () =>
          import('./component/fun-levity/fun-levity.component').then(
            c => c.FunLevityComponent
          ),
      },
      {
        path: 'EquityInvestment',
        loadComponent: () =>
          import('./component/investment-declaration/investment-declaration.component').then(
            c => c.InvestmentDeclarationComponent
          ),
      },
      {
        path: 'serviceDesk',
        loadComponent: () =>
          import('./component/service-desk/service-desk.component').then(
            c => c.ServiceDeskComponent
          ),
      },
      {
        path: 'oca',
        loadComponent: () =>
          import('./component/oca/oca.component').then(
            c => c.OcaComponent
          ),
      },
      {
        path: 'timesSocietyAccount', loadComponent: () =>
          import('./component/times-society-account/times-society-account.component').then(
            c => c.TimesSocietyAccountComponent)
      },
      {
        path: 'peopleLocator',
        loadComponent: () => import('./component/people-locator/people-locator.component').then(
          c => c.PeopleLocatorComponent)
      },
      {
        path: 'partnerLocator',
        loadComponent: () => import('./component/partner-locator/partner-locator.component').then(
          c => c.PartnerLocatorComponent)
      },
      {
        path: 'requisitionerLocator',
        loadComponent: () => import('./component/requisitioner-locator/requisitioner-locator.component').then(
          c => c.RequisitionerLocatorComponent)
      },
      {
        path: 'governacecodedeclaration',
        loadComponent: () => import('./component/governance-code-declaration/governance-code-declaration.component').then(
          c => c.GovernanceCodeDeclarationComponent)
      },
      {
        path: 'Mycompliancereport',
        loadComponent: () => import('./component/governance-code-declaration/mycompliancereport/mycompliancereport.component').then(
          c => c.MycompliancereportComponent)
      },
      {
        path: 'viewcompliancecode',
        loadComponent: () => import('./component/governance-code-declaration/viewcompliancecode/viewcompliancecode.component').then(
          c => c.ViewcompliancecodeComponent)
      }, {
        path: 'govdeclarationmycompliancecode',
        loadComponent: () => import('./component/governance-code-declaration/governance-declaration-mycompliancecode/governance-declaration-mycompliancecode.component').then(
          c => c.GovernanceDeclarationMycompliancecodeComponent)
      },

    ]
  },

  // Wildcard route
  { path: '**', component: ErrorExitComponent }

];