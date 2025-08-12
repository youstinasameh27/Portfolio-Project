import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TopicService } from '../core/services/topic.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-topic-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './topic-form.html',
  styleUrl: './topic-form.css'
})
export class TopicForm implements OnInit{
  form!: FormGroup;
  isEdit = false; id: string | null = null;

  constructor(private fb:FormBuilder, private route:ActivatedRoute, private router:Router, private svc:TopicService){}

  ngOnInit(){
    this.id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.id;

    this.form = this.fb.group({
      section: ['introduction', Validators.required],
      name: ['', [Validators.required, Validators.minLength(3)]],
      grade: [0, [Validators.required]]
    });

    if (this.isEdit && this.id){
      this.svc.list$.subscribe(list => {
        const t:any = list.find((x:any) => x._id === this.id);
        if (t){
          this.form.patchValue({ section: t.section, name: t.name, grade: t.grade });
        }
      });
    }
  }

  submit(){
    if (this.form.invalid){
      Object.values(this.form.controls).forEach(c => c.markAsTouched());
      return;
    }
    const v = this.form.value;
    if (this.isEdit){ this.svc.update(this.id!, v as any); }
    else { this.svc.create(v as any); }
    this.router.navigate(['/topics']);
  }
}
