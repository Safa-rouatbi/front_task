import { Component, OnInit, PLATFORM_ID, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, FullCalendarModule],
  templateUrl: './agent-dashboard.component.html',
  styleUrls: ['./agent-dashboard.component.css']
})
export class AgentDashboardComponent implements OnInit {
  showForm = false;
  isBrowser = false;
  calendarLoaded = false;

  // Données du formulaire
  task = {
    title: '',
    description: '',
    startDate: '',
    duration: 1,
    priority: 'Moyenne'
  };

  // Liste des tâches ajoutées
  tasks: any[] = [];

  // Configuration FullCalendar
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: 'fr',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek'
    },
    events: [],
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    weekends: true
  };

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private http: HttpClient // Ajout de l'injection HttpClient
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    // Initialisation côté client seulement
    if (this.isBrowser) {
      // Appel API pour récupérer les tâches
      this.http.get<any[]>('http://localhost:8080/tasks').subscribe({
        next: (data) => {
          this.tasks = data;
          this.updateCalendarEvents();
        },
        error: (err) => {
          console.error('Erreur lors de la récupération des tâches', err);
        }
      });
      // Attendre que le DOM soit prêt
      setTimeout(() => {
        this.calendarLoaded = true;
        this.cdr.detectChanges();
        // Mettre à jour le calendrier si les tâches sont déjà chargées
        this.updateCalendarEvents();
      }, 100);
    }
  }

  createTask() {
    // Ajouter une copie de la tâche dans la liste
    const newTask = { ...this.task, id: Date.now() };
    this.tasks.push(newTask);

    // Ajouter l'événement au calendrier seulement côté client
    if (this.isBrowser && this.calendarLoaded) {
      this.addEventToCalendar(newTask);
    }

    alert('Tâche créée avec succès !');

    // Réinitialiser le formulaire
    this.task = {
      title: '',
      description: '',
      startDate: '',
      duration: 1,
      priority: 'Moyenne'
    };
    this.showForm = false;
  }

  deleteTask(taskId: number) {
    const index = this.tasks.findIndex(task => task.id === taskId);
    if (index > -1) {
      this.tasks.splice(index, 1);
      if (this.isBrowser && this.calendarLoaded) {
        this.updateCalendarEvents();
      }
      alert('Tâche supprimée avec succès !');
    }
  }

  addEventToCalendar(task: any) {
    if (!this.isBrowser || !this.calendarLoaded) return;

    const event: EventInput = {
      id: task.id.toString(),
      title: task.title,
      start: task.startDate,
      backgroundColor: this.getPriorityColor(task.priority),
      borderColor: this.getPriorityColor(task.priority),
      extendedProps: {
        description: task.description,
        duration: task.duration,
        priority: task.priority
      }
    };

    // Mettre à jour les événements de manière sûre
    const currentEvents = this.calendarOptions.events as EventInput[] || [];
    this.calendarOptions.events = [...currentEvents, event];
  }

  updateCalendarEvents() {
    if (!this.isBrowser || !this.calendarLoaded) return;

    const events = this.tasks.map(task => ({
      id: task.id.toString(),
      title: task.title,
      start: task.startDate,
      backgroundColor: this.getPriorityColor(task.priority),
      borderColor: this.getPriorityColor(task.priority),
      extendedProps: {
        description: task.description,
        duration: task.duration,
        priority: task.priority
      }
    })) as EventInput[];

    this.calendarOptions.events = events;
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'Haute': return '#ef4444'; // Rouge
      case 'Moyenne': return '#f59e0b'; // Orange
      case 'Basse': return '#10b981'; // Vert
      default: return '#6b7280'; // Gris
    }
  }
}
