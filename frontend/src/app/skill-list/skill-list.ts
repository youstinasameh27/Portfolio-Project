import { Component, OnInit, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SkillService } from '../core/services/skill.service';

@Component({
  selector: 'app-skill-list',
  standalone: true,
  imports: [NgFor, RouterLink],
  templateUrl: './skill-list.html',
  styleUrl: './skill-list.css'
})
export class SkillList implements OnInit {
  private svc = inject(SkillService);
  list$ = this.svc.list$;
  skills: any[] = [];

  ngOnInit(){
    this.svc.list$.subscribe(list => this.skills = list);
    this.svc.refresh();
  }

  getId(item:any){ return item?._id || item?.id; }

  delete(item:any, $event?: Event){
    if ($event){ $event.preventDefault(); $event.stopPropagation(); }
    const id = this.getId(item);
    if (!id) return;
    if (confirm('Delete this skill?')) this.svc.delete(id);
  }
}
