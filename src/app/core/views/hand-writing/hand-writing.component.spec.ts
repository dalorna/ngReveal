import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HandWritingComponent } from './hand-writing.component';

describe('HandWritingComponent', () => {
  let component: HandWritingComponent;
  let fixture: ComponentFixture<HandWritingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HandWritingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HandWritingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
