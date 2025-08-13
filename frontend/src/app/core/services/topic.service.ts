import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TopicService {
  private api = 'http://localhost:4000/api/topics';

  private _list$ = new BehaviorSubject<any[]>([]);
  list$ = this._list$.asObservable();

  constructor(private http: HttpClient) {
    this.refresh();
  }

  refresh() {
    this.http.get<{ success: boolean; data: any[] }>(this.api)
      .subscribe(res => this._list$.next(res?.data ?? []));
  }

  search(q: string) {
    const url = q ? `${this.api}?q=${encodeURIComponent(q)}` : this.api;
    this.http.get<{ success: boolean; data: any[] }>(url)
      .subscribe(res => this._list$.next(res?.data ?? []));
  }

  get(id: string) {
    return this.http.get<{ success: boolean; data: any }>(`${this.api}/${id}`);
  }

  create(payload: any) {

    return this.http.post(this.api, payload)
      .subscribe(() => this.refresh());
  }

  update(id: string, payload: any) {
    return this.http.put(`${this.api}/${id}`, payload)
      .subscribe(() => this.refresh());
  }

  delete(id: string) {
    return this.http.delete(`${this.api}/${id}`)
      .subscribe(() => this.refresh());
  }
}
