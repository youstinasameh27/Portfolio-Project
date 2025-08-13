import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../core/services/message.service';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact {
  model: any = { name: '', email: '', message: '' };
  sent = false;
  sending = false;               
  error: string | null = null;   

  constructor(private msgSvc: MessageService) {}

  submit(f: any) {
    if (!f.valid) {
      Object.values(f.controls).forEach((c: any) => c.control.markAsTouched());
      return;
    }

    this.error = null;
    this.sending = true;

    const payload = { ...this.model };
    const result: any = this.msgSvc.create(payload);

    // Observable-like
    if (result?.subscribe) {
      result.subscribe({
        next: () => this.handleSuccess(f),
        error: (e: any) => this.handleError(e),
        complete: () => (this.sending = false)
      });
      return;
    }
   
    if (result?.then) {
      result.then(() => this.handleSuccess(f))
            .catch((e: any) => this.handleError(e))
            .finally(() => (this.sending = false));
      return;
    }
    
    if (result?.unsubscribe) {
      this.handleSuccess(f);
      this.sending = false;
      return;
    }
 
    this.handleSuccess(f);
    this.sending = false;
  }

  private handleSuccess(f: any) {
    this.sent = true;
    f.resetForm();
    setTimeout(() => (this.sent = false), 3000);
  }

  private handleError(e: any) {
    this.error = (e && e.message) || 'Something went wrong. Please try again.';
  }
}
