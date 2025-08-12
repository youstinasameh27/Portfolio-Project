import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../core/services/project.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './project-form.html',
  styleUrl: './project-form.css'
})
export class ProjectForm implements OnInit{
  form!: FormGroup;
  isEdit = false; id: string | null = null;

  file: File | null = null;
  previewUrl: string | null = null;   // <-- used by the template

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private fb:FormBuilder,
    private route:ActivatedRoute,
    private router:Router,
    private svc:ProjectService
  ){}

  ngOnInit(){
    this.id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.id;

    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      tech: [''],
      link: [''],
      grade: [null]
    });

    if (this.isEdit && this.id){
      this.svc.get(this.id).subscribe(r => {
        const p:any = r.data;
        if (p){
          this.form.patchValue({
            title: p.title || '',
            description: p.description || '',
            tech: (p.tech || []).join(', '),
            link: p.link || '',
            grade: p.grade ?? null
          });
          // if editing, show existing image if any
          this.previewUrl = p.imageUrl ? ('http://localhost:4000' + p.imageUrl) : null;
        }
      });
    }
  }

  /** Template calls this */
  onFile(evt:any){
    this.pickFile(evt); // keep both names to match any template
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
    this.router.navigate(['/projects']);
  }

  submit(){
    if (this.form.invalid){
      Object.values(this.form.controls).forEach(c => c.markAsTouched());
      return;
    }
    const v = this.form.value;
    const fd = new FormData();
    fd.append('title', v.title || '');
    fd.append('description', v.description || '');
    fd.append('tech', (v.tech || '').toString());
    if (v.link) fd.append('link', v.link);
    if (v.grade !== null && v.grade !== undefined) fd.append('grade', String(v.grade));
    if (this.file) fd.append('image', this.file);

    if (this.isEdit){
      fd.append('keepImage', this.file ? 'false' : 'true');
      this.svc.update(this.id!, fd);
    } else {
      this.svc.create(fd);
    }
    this.router.navigate(['/projects']);
  }
}
