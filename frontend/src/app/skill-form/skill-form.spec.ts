import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillForm } from './skill-form';

describe('SkillForm', () => {
  let component: SkillForm;
  let fixture: ComponentFixture<SkillForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkillForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
