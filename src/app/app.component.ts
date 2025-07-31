import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, CommonModule],
  template: `
    <app-header *ngIf="isLoginPage()"></app-header>
    <router-outlet></router-outlet>
  `,
  styleUrl: './app.component.css'
})
export class AppComponent {
  constructor(private router: Router) {}

  isLoginPage(): boolean {
    return this.router.url === '/login' || this.router.url === '/';
  }
}
