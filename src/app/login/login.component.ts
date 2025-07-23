import { Component } from '@angular/core';
import{FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,FontAwesomeModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm:FormGroup;
  faUser = faUser;
  errorMessage: string='';
  constructor(private fb: FormBuilder, private authService: AuthService, private router:Router){
    this.loginForm=this.fb.group({
      email:['',[Validators.required,Validators.email]],
      password:['',[Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit():void{
    if (this.loginForm.invalid){
      console.log('formulaire invalide');
      return
    }
    const { email, password } = this.loginForm.value;
    
    this.authService.login({email, password}).subscribe({
      next: (response: any)=>{
        const token= response.token;
        localStorage.setItem('token', token);

        const decoded: any = jwtDecode(token);
        const role = decoded.role;

         if (role === 'ADMIN') {
          this.router.navigate(['/admin-dashboard']);
        } else if (role === 'AGENT') {
          this.router.navigate(['/agent-dashboard']);
        } else {
          this.errorMessage = 'Rôle inconnu.';
        }
      },
      error: (err) => {
        console.error("erreur de login:",err);
        this.errorMessage = 'Email ou mot de passe incorrect, veillez réessayer';
      }
      
    })

  }


}
