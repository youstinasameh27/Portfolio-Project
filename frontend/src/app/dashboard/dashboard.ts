import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from '../core/services/message.service';
import { ProjectService } from '../core/services/project.service';
import { SkillService } from '../core/services/skill.service';
import { TopicService } from '../core/services/topic.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  totals = { projects: 0, skills: 0, topics: 0, messages: 0, cvDownloads: 0 };
  projByYear: Array<{ _id: number; count: number }> = [];
  skillByLevel: Array<{ _id: string; count: number }> = [];
  maxYearCount = 1;

  messages: any[] = [];
  recentProjects: any[] = [];
  recentSkills: any[] = [];
  recentTopics: any[] = [];

  constructor(
    private msgSvc: MessageService,
    private projSvc: ProjectService,
    private skillSvc: SkillService,
    private topicSvc: TopicService
  ) {}

  ngOnInit(): void {
    this.ensureLoaded();

    (this.projSvc as any).list$?.subscribe((list: any[]) => {
      const arr = Array.isArray(list) ? list : [];
      this.totals.projects = arr.length;
      const perYear = new Map<number, number>();
      for (const p of arr) {
        const d = p?.createdAt ? new Date(p.createdAt) : null;
        const y = d && !isNaN(d.getTime()) ? d.getFullYear() : new Date().getFullYear();
        perYear.set(y, (perYear.get(y) || 0) + 1);
      }
      this.projByYear = Array.from(perYear.entries()).sort((a,b)=>a[0]-b[0]).map(([y,c])=>({_id:y,count:c}));
      this.maxYearCount = Math.max(1, ...this.projByYear.map(x=>x.count));
      this.recentProjects = this.pickRecent(arr);
    });

    (this.skillSvc as any).list$?.subscribe((list: any[]) => {
      const arr = Array.isArray(list) ? list : [];
      this.totals.skills = arr.length;
      const levels = new Map<string, number>();
      for (const s of arr) {
        const lvl = (s?.level || 'beginner').toString();
        levels.set(lvl, (levels.get(lvl) || 0) + 1);
      }
      this.skillByLevel = Array.from(levels.entries()).map(([k,v])=>({_id:k,count:v}));
      this.recentSkills = this.pickRecent(arr);
    });

    (this.topicSvc as any).list$?.subscribe((list: any[]) => {
      const arr = Array.isArray(list) ? list : [];
      this.totals.topics = arr.length;
      this.recentTopics = this.pickRecent(arr);
    });

    (this.msgSvc as any).list$?.subscribe((list: any[]) => {
      this.messages = Array.isArray(list) ? list : [];
      this.totals.messages = this.messages.length;
    });
  }

  barHeight(c:number){ return (c / (this.maxYearCount || 1)) * 100; }
  markRead(id:string){ this.msgSvc.markRead(id); }
  del(id:string){
    if (!id) return;
    if (confirm('Delete this message?')) {
      const req:any = (this.msgSvc as any).delete?.(id);
      if (req?.subscribe) req.subscribe({ next:()=>{}, error:()=>{} });
      else if (req?.then) req.then(()=>{}).catch(()=>{});
    }
  }

  private ensureLoaded(){
    for (const svc of [this.projSvc, this.skillSvc, this.topicSvc, this.msgSvc]){
      const s:any = svc;
      if (typeof s.refresh === 'function'){ try{s.refresh(); continue;}catch{} }
      if (typeof s.search  === 'function'){ try{s.search(''); continue;}catch{} }
      if (typeof s.list    === 'function'){ try{s.list();    continue;}catch{} }
      if (typeof s.load    === 'function'){ try{s.load();    continue;}catch{} }
    }
  }
  private pickRecent(arr:any[]){ return [...arr].sort((a,b)=>{
    const ad=a?.createdAt?new Date(a.createdAt).getTime():0;
    const bd=b?.createdAt?new Date(b.createdAt).getTime():0;
    return bd-ad;
  }).slice(0,5); }
}
