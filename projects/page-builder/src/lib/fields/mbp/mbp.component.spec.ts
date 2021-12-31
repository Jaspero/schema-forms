import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MbpComponent } from './mbp.component';

describe('MbpComponent', () => {
  let component: MbpComponent;
  let fixture: ComponentFixture<MbpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MbpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MbpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
