import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-mes-taches',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mes-taches.component.html',
  styleUrl: './mes-taches.component.css'
})
export class MesTachesComponent implements OnInit {
  tasks: any[] = [];
  agentId: string | null = null;

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    // Récupérer l'ID de l'agent à partir du token (supposé JWT)
    const token = this.auth.getToken();
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.agentId = payload.id || payload.userId || payload.sub;
    }
    // Appel API pour récupérer toutes les tâches
    this.http.get<any[]>('http://localhost:8080/tasks').subscribe({
      next: (data) => {
        // Filtrer les tâches de l'agent connecté
        this.tasks = data.filter(task => task.agentId == this.agentId);
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des tâches', err);
      }
    });
  }
}
