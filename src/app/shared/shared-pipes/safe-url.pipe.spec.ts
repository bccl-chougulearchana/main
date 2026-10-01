import { SafeUrlPipe } from './safe-url.pipe';
import { DomSanitizer } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';

describe('SafeUrlPipe', () => {
  it('create an instance', () => {
    const pipe = new SafeUrlPipe(TestBed.inject(DomSanitizer));
    expect(pipe).toBeTruthy();
  });
});
