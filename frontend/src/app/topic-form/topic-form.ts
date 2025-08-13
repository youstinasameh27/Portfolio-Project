import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TopicService } from '../core/services/topic.service';

@Component({
  selector: 'app-topic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './topic-form.html', 
  styleUrl: './topic-form.css'
})
export class TopicForm implements OnInit {
  form!: FormGroup;
  isEdit = false;
  id: string | null = null;

  constructor(private router: Router, private svc: TopicService) {

    this.form = new FormGroup({
      title: new FormControl('', Validators.required),
      description: new FormControl('')
    });
  }


  private getIdFromUrl(): string | null {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const editIdx = parts.indexOf('edit');
    if (editIdx > 0) return parts[editIdx - 1] || null;
    const i = parts.indexOf('topics');
    const candidate = i >= 0 ? parts[i + 1] : null;
    const hex24 = parts.find(p => /^[a-f0-9]{24}$/i.test(p));
    return candidate && candidate !== 'new' ? candidate : (hex24 || null);
  }

  ngOnInit() {
    this.id = this.getIdFromUrl();
    this.isEdit = !!this.id;

    if (this.isEdit && typeof (this.svc as any).get === 'function') {
      (this.svc as any).get(this.id!).subscribe((res: any) => {
        const t = res?.data ?? res;
        this.form.patchValue({
          title: t?.title || '',
          description: t?.description || ''
        });
      });
    }
  }

  cancel() { this.form.reset(); }


  submit() { this._doSubmit(); }
  save() { this._doSubmit(); }
  onSubmit() { this._doSubmit(); }
  update() { this._doSubmit(); }

  private _doSubmit() {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(c => c.markAsTouched());
      return;
    }

    const payload = {
      title: this.form.value.title || '',
      description: this.form.value.description || ''
    };

    let req: any;
    if (this.isEdit) req = (this.svc as any).update(this.id!, payload);
    else req = (this.svc as any).create(payload);

    if (req?.subscribe) req.subscribe({ next: () => this.router.navigate(['/topics']), error: () => this.router.navigate(['/topics']) });
    else if (req?.then) req.then(() => this.router.navigate(['/topics'])).catch(() => this.router.navigate(['/topics']));
    else this.router.navigate(['/topics']);
  }
}
