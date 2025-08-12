import { Component, OnInit, inject } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../core/services/message.service';
import { ProjectService } from '../core/services/project.service';
import { SkillService } from '../core/services/skill.service';
import { TopicService } from '../core/services/topic.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit{
  private http  = inject(HttpClient);
  private msg   = inject(MessageService);
  private proj  = inject(ProjectService);
  private skill = inject(SkillService);
  private topic = inject(TopicService);

  totals = { projects: 0, skills: 0, topics: 0, messages: 0, cvDownloads: 0 };

  recentProjects:any[] = [];
  recentSkills:any[]   = [];
  recentTopics:any[]   = [];
  messages:any[]       = [];

  ngOnInit(){
    this.proj.list$.subscribe(l => {
      this.totals.projects = l.length;
      this.recentProjects = l.slice(0, 6);
    });

    this.skill.list$.subscribe(l => {
      this.totals.skills = l.length;
      this.recentSkills  = l.slice(0, 12); // show more so the sliders look nice
    });

    this.topic.list$.subscribe(l => {
      this.totals.topics = l.length;
      this.recentTopics  = l.slice(0, 8);
    });

    this.msg.list$.subscribe(l => {
      this.messages = l;
      this.totals.messages = l.length;
    });

    // fetch fresh data
    this.proj.refresh();
    this.skill.refresh();
    this.topic.refresh();
    this.msg.refresh();

    // only need CV downloads from stats now
    this.http.get<any>('http://localhost:4000/stats').subscribe(s => {
      if (s?.totals?.cvDownloads != null) this.totals.cvDownloads = s.totals.cvDownloads;
    });
  }

  /** Position of the knob on the track (0–100). Accepts common names. */
  levelPercent(level:string){
    const l = (level || '').toLowerCase().trim();
    if (l === 'expert') return 100;
    if (l === 'advanced') return 85;
    if (l === 'proficient') return 75;
    if (l === 'intermediate' || l === 'specialist') return 55;
    if (l === 'beginner') return 25;
    // default mid if unknown
    return 50;
  }

  /** Pretty label for the level on the right side */
  prettyLevel(level:string){
    if (!level) return '—';
    return level.charAt(0).toUpperCase() + level.slice(1);
  }

  markRead(id:string){ this.msg.markRead(id); }
  deleteMessage(id:string){ this.msg.delete(id); }
}
