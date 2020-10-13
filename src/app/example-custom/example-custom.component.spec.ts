import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExampleCustomComponent } from './example-custom.component';

describe('ExampleCustomComponent', () => {
  let component: ExampleCustomComponent;
  let fixture: ComponentFixture<ExampleCustomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExampleCustomComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExampleCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
