import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SkillService } from '../core/services/skill.service';

@Component({
  selector: 'app-skill-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './skill-list.html',
  styleUrl: './skill-list.css'
})
export class SkillList implements OnInit {
  skills: any[] = [];
  q = ''; 

  constructor(private svc: SkillService, private router: Router) {}

  ngOnInit() {

    (this.svc as any).list$?.subscribe((list: any[]) => {
      this.skills = Array.isArray(list) ? list : [];
    });


    this.ensureLoaded();
  }


  search() {
    const term = (this.q || '').trim();
    if (typeof (this.svc as any).search === 'function') (this.svc as any).search(term);
    else this.ensureLoaded();
  }

  edit(id: string, ev?: Event) {
    try { ev?.stopPropagation(); ev?.preventDefault(); } catch {}
    if (!id) return;
    this.router.navigate(['/skills', id, 'edit']);
  }


  delete(id: string, ev?: Event) { this.del(id, ev); }
  onDelete(id: string, ev?: Event) { this.del(id, ev); }
  remove(id: string, ev?: Event) { this.del(id, ev); }
  onRemove(id: string, ev?: Event) { this.del(id, ev); }


  del(id: string, ev?: Event) {
    try { ev?.stopPropagation(); ev?.preventDefault(); } catch {}
    if (!id) return;
    if (!confirm('Delete this skill?')) return;

    const req: any = (this.svc as any).delete(id);

    
    if (req?.subscribe) req.subscribe({ next: () => this.ensureLoaded(), error: () => this.ensureLoaded() });
    else if (req?.then) req.then(() => this.ensureLoaded()).catch(() => this.ensureLoaded());
    else this.ensureLoaded(); 
  }


  private ensureLoaded() {
    const s: any = this.svc;
    if (typeof s.search === 'function') { try { s.search(''); return; } catch {} }
    if (typeof s.refresh === 'function') { try { s.refresh(); return; } catch {} }
    if (typeof s.list === 'function')    { try { s.list(); return; }    catch {} }
  }
}
