import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { IProject } from '../model';

@Injectable({ providedIn: 'root' })
export class ProjectService{
  api = 'http://localhost:4000/api/projects';
  private _list$ = new BehaviorSubject<IProject[]>([]);
  list$ = this._list$.asObservable();

  constructor(private http: HttpClient){ this.refresh(); }

  refresh(){
    this.http.get<{success:boolean; data:IProject[]}>(this.api)
      .subscribe(r => this._list$.next(r.data));
  }

  search(q: string){
    const url = q ? `${this.api}?q=${encodeURIComponent(q)}` : this.api;
    this.http.get<{success:boolean; data:IProject[]}>(url)
      .subscribe(r => this._list$.next(r.data));
  }

  get(id: string){ return this.http.get<{success:boolean; data:IProject}>(`${this.api}/${id}`); }
  create(fd: FormData){ return this.http.post(this.api, fd).subscribe(()=> this.refresh()); }
  update(id: string, fd: FormData){ return this.http.put(`${this.api}/${id}`, fd).subscribe(()=> this.refresh()); }
  delete(id: string){ return this.http.delete(`${this.api}/${id}`).subscribe(()=> this.refresh()); }
}
