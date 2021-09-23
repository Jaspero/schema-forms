import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeoEditorComponent } from './seo-editor.component';

describe('SeoEditorComponent', () => {
  let component: SeoEditorComponent;
  let fixture: ComponentFixture<SeoEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeoEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeoEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
