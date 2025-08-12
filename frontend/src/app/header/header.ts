import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header{
  cv(){
    const a = document.createElement('a');
    a.href = 'http://localhost:4000/cv';
    a.download = 'Youstina_Sameh_Fahim_CV.pdf';
    a.click();
  }
}
