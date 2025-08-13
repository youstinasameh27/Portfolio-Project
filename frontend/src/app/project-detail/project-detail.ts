import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProjectService } from '../core/services/project.service';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.css'
})
export class ProjectDetail implements OnInit {

  project: any;
  p: any;

  constructor(private svc: ProjectService) {}

  
  private getIdFromUrl(): string | null {
    const parts = window.location.pathname.split('/').filter(Boolean);
   
    const editIdx = parts.indexOf('edit');
    if (editIdx > 0) return parts[editIdx - 1] || null;
    const i = parts.indexOf('projects');
    return i >= 0 && parts[i + 1] ? parts[i + 1] : null;
  }

  ngOnInit() {
    const id = this.getIdFromUrl();
    if (id) {
      this.svc.get(id).subscribe((res: any) => {
        const data = res?.data ?? res;
        this.p = data;
        this.project = data;
      });
    }
  }


  del(id?: string) {
    const target = id || this.getIdFromUrl();
    if (!target) return;
    if (confirm('Delete this project?')) {
      this.svc.delete(target);
    }
  }
}
