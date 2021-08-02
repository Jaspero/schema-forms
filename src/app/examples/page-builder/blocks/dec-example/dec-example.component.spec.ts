import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecExampleComponent } from './dec-example.component';

describe('DecExampleComponent', () => {
  let component: DecExampleComponent;
  let fixture: ComponentFixture<DecExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DecExampleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DecExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
