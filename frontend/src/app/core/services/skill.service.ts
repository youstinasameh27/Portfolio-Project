import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { ISkill } from '../model';

@Injectable({ providedIn: 'root' })
export class SkillService{
  api = 'http://localhost:4000/api/skills';
  private _list$ = new BehaviorSubject<ISkill[]>([]);
  list$ = this._list$.asObservable();

  constructor(private http: HttpClient){ this.refresh(); }
  refresh(){ this.http.get<{success:boolean; data:ISkill[]}>(this.api).subscribe(r => this._list$.next(r.data)); }
  create(fd: FormData){ return this.http.post(this.api, fd).subscribe(()=> this.refresh()); }
  update(id: string, fd: FormData){ return this.http.put(`${this.api}/${id}`, fd).subscribe(()=> this.refresh()); }
  delete(id: string){ return this.http.delete(`${this.api}/${id}`).subscribe(()=> this.refresh()); }
}
