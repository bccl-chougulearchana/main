import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { FunLevityComponent } from './fun-levity.component';
import { CommonService } from '../../core/services/common.service';
import { SharedApiService } from '../../shared/shared-services/shared-api.service';
import { LoaderService } from '../../shared/shared-services/loader.service';
import { CommonDialogService } from '../../shared/shared-services/common-dialog.service';

describe('FunLevityComponent', () => {
  let component: FunLevityComponent;
  let fixture: ComponentFixture<FunLevityComponent>;

  beforeEach(async () => {
    const apiSpy = jasmine.createSpyObj<SharedApiService>('SharedApiService', ['getMyStories']);
    apiSpy.getMyStories.and.returnValue(of({ funlevityconnect: [] } as any));

    const commonSpy = jasmine.createSpyObj<CommonService>('CommonService', ['getFunConfig', 'getIsAdmin']);
    commonSpy.getFunConfig.and.returnValue(of({ heroBanner: [], heroBannerSM: [] }));
    commonSpy.getIsAdmin.and.returnValue(false);

    const loaderSpy = jasmine.createSpyObj<LoaderService>('LoaderService', ['show', 'hide']);
    const dialogSpy = jasmine.createSpyObj<CommonDialogService>('CommonDialogService', ['alert', 'confirm']);
    dialogSpy.alert.and.returnValue(Promise.resolve());
    dialogSpy.confirm.and.returnValue(Promise.resolve(true));

    await TestBed.configureTestingModule({
      imports: [FunLevityComponent],
      providers: [
        { provide: SharedApiService, useValue: apiSpy },
        { provide: CommonService, useValue: commonSpy },
        { provide: LoaderService, useValue: loaderSpy },
        { provide: CommonDialogService, useValue: dialogSpy },
        { provide: Router, useValue: jasmine.createSpyObj<Router>('Router', ['navigate']) },
        { provide: ActivatedRoute, useValue: {} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FunLevityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
