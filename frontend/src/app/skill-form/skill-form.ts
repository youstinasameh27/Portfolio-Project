import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SkillService } from '../core/services/skill.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-skill-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './skill-form.html',
  styleUrl: './skill-form.css'
})
export class SkillForm implements OnInit{
  form!: FormGroup;
  isEdit = false; id: string | null = null;

  file: File | null = null;
  previewUrl: string | null = null;  // <-- used by the template

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private fb:FormBuilder,
    private route:ActivatedRoute,
    private router:Router,
    private svc:SkillService
  ){}

  ngOnInit(){
    this.id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.id;

    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      level: ['beginner', Validators.required]
    });

    if (this.isEdit && this.id){
      this.svc.list$.subscribe(list => {
        const s:any = list.find((x:any) => x._id === this.id);
        if (s){
          this.form.patchValue({ name: s.name || '', level: s.level || 'beginner' });
          this.previewUrl = s.iconUrl ? ('http://localhost:4000' + s.iconUrl) : null;
        }
      });
    }
  }

  /** Template calls this */
  onFile(evt:any){
    this.pickFile(evt); // alias
  }

  /** Internal helper (and backward compatible) */
  pickFile(evt:any){
    this.file = evt?.target?.files?.[0] ?? null;
    if (this.file){
      const reader = new FileReader();
      reader.onload = () => this.previewUrl = reader.result as string;
      reader.readAsDataURL(this.file);
    } else {
      this.previewUrl = null;
    }
  }

  /** Template calls this */
  cancel(){
    this.router.navigate(['/skills']);
  }

  submit(){
    if (this.form.invalid){
      Object.values(this.form.controls).forEach(c => c.markAsTouched());
      return;
    }
    const v = this.form.value;
    const fd = new FormData();
    fd.append('name', v.name || '');
    fd.append('level', v.level || 'beginner');
    if (this.file) fd.append('icon', this.file);

    if (this.isEdit){
      this.svc.update(this.id!, fd);
    } else {
      this.svc.create(fd);
    }
    this.router.navigate(['/skills']);
  }
}
