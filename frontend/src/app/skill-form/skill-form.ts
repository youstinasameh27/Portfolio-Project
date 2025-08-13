import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SkillService } from '../core/services/skill.service';

@Component({
  selector: 'app-skill-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './skill-form.html',
  styleUrl: './skill-form.css'
})
export class SkillForm implements OnInit {
  form!: FormGroup;
  isEdit = false;
  id: string | null = null;

  
  file: File | null = null;
  previewUrl: string | undefined;

  constructor(private router: Router, private svc: SkillService) {
 
    this.form = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(2)]),
      level: new FormControl('beginner', Validators.required)
    });
  }


  private getIdFromUrl(): string | null {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const editIdx = parts.indexOf('edit');
    if (editIdx > 0) return parts[editIdx - 1] || null;
    const i = parts.indexOf('skills');
    const candidate = i >= 0 ? parts[i + 1] : null;
    const hex24 = parts.find(p => /^[a-f0-9]{24}$/i.test(p));
    return candidate && candidate !== 'new' ? candidate : (hex24 || null);
  }

  ngOnInit() {
    this.id = this.getIdFromUrl();
    this.isEdit = !!this.id;

    if (this.isEdit && typeof (this.svc as any).get === 'function') {
      (this.svc as any).get(this.id!).subscribe((res: any) => {
        const s = res?.data ?? res;
        this.form.patchValue({
          name: s?.name || '',
          level: s?.level || 'beginner'
        });
        if (s?.iconUrl) this.previewUrl = 'http://localhost:4000' + s.iconUrl;
      });
    }
  }


  onFile(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input?.files && input.files.length) {
      this.file = input.files[0];
      const r = new FileReader();
      r.onload = () => (this.previewUrl = r.result as string);
      r.readAsDataURL(this.file);
    }
  }
  clearFile() { this.file = null; this.previewUrl = undefined; }
  cancel() { this.form.reset(); this.clearFile(); }


  submit() { this._doSubmit(); }
  save() { this._doSubmit(); }
  onSubmit() { this._doSubmit(); }
  update() { this._doSubmit(); }

  private _doSubmit() {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(c => c.markAsTouched());
      return;
    }

  
    const v = this.form.value;
    const fd = new FormData();
    fd.append('name', v.name || '');
    fd.append('level', (v.level || 'beginner').toString());
    if (this.file) fd.append('icon', this.file);

    let req: any;
    if (this.isEdit) {
      if (!this.file) fd.append('keepIcon', 'true');
      req = (this.svc as any).update(this.id!, fd);
    } else {
      req = (this.svc as any).create(fd);
    }

    
    if (req?.subscribe) req.subscribe({ next: () => this.router.navigate(['/skills']), error: () => this.router.navigate(['/skills']) });
    else if (req?.then) req.then(() => this.router.navigate(['/skills'])).catch(() => this.router.navigate(['/skills']));
    else this.router.navigate(['/skills']);
  }
}
