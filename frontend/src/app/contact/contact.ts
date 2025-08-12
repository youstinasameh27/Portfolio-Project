import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { MessageService } from '../core/services/message.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, NgIf],   // <-- ngForm + ngModel live here
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact {
  // matches template [(ngModel)]
  model = { name: '', email: '', message: '' };

  sending = false;
  sent = false;
  error: string | null = null;

  constructor(private messages: MessageService){}

  // template calls submit(f)
  submit(_f: any){
    if (!_f.valid) { return; }
    this.sending = true; this.error = null;

    this.messages.create({
      name: this.model.name,
      email: this.model.email,
      message: this.model.message
    });

    this.sending = false;
    this.sent = true;
    this.model = { name: '', email: '', message: '' };
    _f.resetForm();
  }
}
