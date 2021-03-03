import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefTableComponent } from './ref-table.component';

describe('RefTableComponent', () => {
  let component: RefTableComponent;
  let fixture: ComponentFixture<RefTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RefTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RefTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
