import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { ProjectService } from '../core/services/project.service';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.css'
})
export class ProjectDetail implements OnInit{
  p:any;
  constructor(private route:ActivatedRoute, private svc:ProjectService){}
  ngOnInit(){ const id=this.route.snapshot.paramMap.get('id')!; this.svc.get(id).subscribe(r=> this.p=r.data); }
}
