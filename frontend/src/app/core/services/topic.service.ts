import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { ITopic } from '../model';

@Injectable({ providedIn: 'root' })
export class TopicService{
  api = 'http://localhost:4000/api/topics';
  private _list$ = new BehaviorSubject<ITopic[]>([]);
  list$ = this._list$.asObservable();

  constructor(private http: HttpClient){ this.refresh(); }
  refresh(){ this.http.get<{success:boolean; data:ITopic[]}>(this.api).subscribe(r => this._list$.next(r.data)); }
  create(body: Partial<ITopic>){ return this.http.post(this.api, body).subscribe(()=> this.refresh()); }
  update(id: string, body: Partial<ITopic>){ return this.http.put(`${this.api}/${id}`, body).subscribe(()=> this.refresh()); }
  delete(id: string){ return this.http.delete(`${this.api}/${id}`).subscribe(()=> this.refresh()); }
}
