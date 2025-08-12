import { Component, OnInit, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../core/services/project.service';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [NgFor, RouterLink, FormsModule],
  templateUrl: './project-list.html',
  styleUrl: './project-list.css'
})
export class ProjectList implements OnInit {
  private svc = inject(ProjectService);

  list$ = this.svc.list$;
  projects: any[] = [];
  q = '';

  ngOnInit(){
    this.svc.list$.subscribe(list => this.projects = list);
    this.svc.refresh();
  }

  search(){ this.svc.search(this.q || ''); }

  // Works with _id or id coming from API/template
  getId(item:any){ return item?._id || item?.id; }

  delete(item:any, $event?: Event){
    if ($event){ $event.preventDefault(); $event.stopPropagation(); }
    const id = this.getId(item);
    if (!id) return;
    if (confirm('Delete this project?')) this.svc.delete(id);
  }
}
