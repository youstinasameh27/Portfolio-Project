import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProjectService } from '../core/services/project.service';

@Component({
  selector: 'app-project-list',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './project-list.html',
  styleUrl: './project-list.css'
})
export class ProjectList implements OnInit {
  q = '';
  projects: any[] = [];

  constructor(private svc: ProjectService) {}

  ngOnInit() {
    
    (this.svc as any).list$?.subscribe((list: any[]) => {
      this.projects = Array.isArray(list) ? list : [];
    });

    
    this.ensureLoaded();
  }

  
  search() {
    const term = (this.q || '').trim();
    this.svc.search(term);
  }


  delete(id: string) { this.del(id); }


  del(id: string) {
    if (!id) return;
    if (!confirm('Delete this project?')) return;

    const req: any = this.svc.delete(id);

    
    if (req?.subscribe) {
      req.subscribe({ next: () => this.ensureLoaded() });
    } else if (req?.then) {
      req.then(() => this.ensureLoaded());
    } else if (req?.unsubscribe) {
      this.ensureLoaded();
    } else {
      this.ensureLoaded();
    }
  }


  private ensureLoaded() {
    const s: any = this.svc;
   
    if (typeof s.search === 'function') {
      try { s.search(''); return; } catch {}
    }
    
    if (typeof s.refresh === 'function') {
      try { s.refresh(); return; } catch {}
    }
  }
}
