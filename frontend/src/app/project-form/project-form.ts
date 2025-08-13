import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectService } from '../core/services/project.service';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './project-form.html',
  styleUrl: './project-form.css'
})
export class ProjectForm implements OnInit {
  form!: FormGroup;
  isEdit = false;
  id: string | null = null;

  file: File | null = null;
  previewUrl: string | undefined;

  constructor(
    private router: Router,
    private svc: ProjectService
  ) {
   
    this.form = new FormGroup({
      title: new FormControl('', [Validators.required, Validators.minLength(3)]),
      description: new FormControl('', [Validators.required, Validators.minLength(10)]),
      tech: new FormControl('', [Validators.required, Validators.minLength(2)]),
      link: new FormControl(''),
      grade: new FormControl(null)
    });
  }


  private getIdFromUrl(): string | null {
    const parts = window.location.pathname.split('/').filter(Boolean);
  
    const editIdx = parts.indexOf('edit');
    if (editIdx > 0) return parts[editIdx - 1] || null;
    const i = parts.indexOf('projects');
    return i >= 0 && parts[i + 1] && parts[i + 1] !== 'new' ? parts[i + 1] : null;
  }

  ngOnInit() {
    this.id = this.getIdFromUrl();
    this.isEdit = !!this.id;

    if (this.isEdit) {
      this.svc.get(this.id!).subscribe((res: any) => {
        const p = res?.data || res;
        this.form.patchValue({
          title: p?.title || '',
          description: p?.description || '',
          tech: Array.isArray(p?.tech) ? p.tech.join(', ') : (p?.tech || ''),
          link: p?.link || '',
          grade: p?.grade ?? null
        });
        this.previewUrl = p?.imageUrl ? ('http://localhost:4000' + p.imageUrl) : undefined;
      });
    }
  }

 
  onFile(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.file = input.files[0];
      const r = new FileReader();
      r.onload = () => (this.previewUrl = r.result as string);
      r.readAsDataURL(this.file);
    }
  }

 
  clearFile() {
    this.file = null;
    this.previewUrl = undefined;
  }

  
  cancel() {
    this.form.reset();
    this.clearFile();
  }

  
  submit() {
    if (this.form.invalid) {
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

    if (this.isEdit) {
      fd.append('keepImage', this.file ? 'false' : 'true');
      this.svc.update(this.id!, fd);
    } else {
      this.svc.create(fd);
    }

    this.router.navigate(['/projects']);
  }
}
