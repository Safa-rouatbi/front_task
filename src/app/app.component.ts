import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HeaderComponent } from './shared/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,LoginComponent,HeaderComponent],
  template:` 
<app-header></app-header>
    <app-login></app-login>`,
  styleUrl: './app.component.css'
})
export class AppComponent {
 
}
