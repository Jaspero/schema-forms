import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateEditorInnerComponent } from './template-editor-inner.component';

describe('TemplateEditorInnerComponent', () => {
  let component: TemplateEditorInnerComponent;
  let fixture: ComponentFixture<TemplateEditorInnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TemplateEditorInnerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateEditorInnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
