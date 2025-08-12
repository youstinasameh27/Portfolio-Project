import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { ProjectService } from '../core/services/project.service';
import { SkillService } from '../core/services/skill.service';
import { TopicService } from '../core/services/topic.service';  // <-- NEW

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, NgIf, NgFor],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit{
  projects:any[] = [];
  skills:any[] = [];
  topics:any[] = [];    // <-- NEW
  cardHoverIndex = -1;

  education = [
    { school:'Ain Shams University', degree:'B.Eng. Computer & Systems Engineering', years:'2021 – 2026', note:'AI & ML track' }
  ];

  constructor(
    private proj:ProjectService,
    private skill:SkillService,
    private topic:TopicService   // <-- NEW
  ){}

  ngOnInit(){
    this.proj.list$.subscribe(list => this.projects = list.slice(0, 6));
    this.skill.list$.subscribe(list => this.skills = list.slice(0, 8));
    this.topic.list$.subscribe(list => this.topics = list.slice(0, 8));  // <-- NEW

    // ensure fresh data when landing on Home
    this.proj.refresh();
    this.skill.refresh();
    this.topic.refresh();  // <-- NEW
  }

  downloadCV(){
    const a = document.createElement('a');
    a.href = 'http://localhost:4000/cv';
    a.download = 'CV-Youstina-Sameh-Fahim.pdf';
    a.click();
  }

  enter(i:number){ this.cardHoverIndex = i; }
  leave(){ this.cardHoverIndex = -1; }
}
