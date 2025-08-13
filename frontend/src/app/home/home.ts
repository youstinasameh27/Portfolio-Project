import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';


import { ProjectService } from '../core/services/project.service';
import { SkillService } from '../core/services/skill.service';
import { TopicService } from '../core/services/topic.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

  education: any[] = [];          
  projects: any[] = [];          
  skills: any[] = [];             
  topics: any[] = [];             

  constructor(
    private projectsSvc: ProjectService,
    private skillsSvc: SkillService,
    private topicsSvc: TopicService
  ) {}

  ngOnInit(): void {
 
    if ((this.projectsSvc as any).list$) {
      (this.projectsSvc as any).list$.subscribe((list: any[]) => this.projects = list || []);
    }
    if ((this.skillsSvc as any).list$) {
      (this.skillsSvc as any).list$.subscribe((list: any[]) => this.skills = list || []);
    }
    if ((this.topicsSvc as any).list$) {
      (this.topicsSvc as any).list$.subscribe((list: any[]) => this.topics = list || []);
    }

 
    this.education = this.education.length ? this.education : [
      { title: 'B.Sc. in Computer Science', place: 'Your University', year: '2024' },
      { title: 'AI & ML Internship',        place: 'Company/Institute', year: '2025' }
    ];
  }


  downloadCV(): void {
    const a = document.createElement('a');
    a.href = 'http://localhost:4000/cv';
    a.download = 'CV.pdf';
    a.click();
  }
}
