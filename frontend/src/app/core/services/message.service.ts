import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MessageService{
  api = 'http://localhost:4000/api/messages';
  private _list$ = new BehaviorSubject<any[]>([]);
  list$ = this._list$.asObservable();

  constructor(private http: HttpClient){
    this.refresh();
  }

  refresh(){
    this.http.get<{success:boolean; data:any[]}>(this.api)
      .subscribe(r => this._list$.next(r.data));
  }

  create(body: {name:string; email:string; message:string}){
    return this.http.post(this.api, body)
      .subscribe(() => this.refresh());
  }

  markRead(id: string){
    return this.http.put(`${this.api}/${id}/read`, {})
      .subscribe(() => this.refresh());
  }

  delete(id: string){
    return this.http.delete(`${this.api}/${id}`)
      .subscribe(() => this.refresh());
  }
}
