import { Component, OnInit, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TopicService } from '../core/services/topic.service';

@Component({
  selector: 'app-topic-list',
  standalone: true,
  imports: [NgFor, RouterLink],
  templateUrl: './topic-list.html',
  styleUrl: './topic-list.css'
})
export class TopicList implements OnInit {
  private svc = inject(TopicService);
  list$ = this.svc.list$;
  topics: any[] = [];

  ngOnInit(){
    this.svc.list$.subscribe(list => this.topics = list);
    this.svc.refresh();
  }

  getId(item:any){ return item?._id || item?.id; }

  delete(item:any, $event?: Event){
    if ($event){ $event.preventDefault(); $event.stopPropagation(); }
    const id = this.getId(item);
    if (!id) return;
    if (confirm('Delete this topic?')) this.svc.delete(id);
  }
}
