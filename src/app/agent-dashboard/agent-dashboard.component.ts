import { Component, OnInit, PLATFORM_ID, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, FullCalendarModule, RouterModule],
  templateUrl: './agent-dashboard.component.html',
  styleUrls: ['./agent-dashboard.component.css']
})
export class AgentDashboardComponent implements OnInit {
  showForm = false;
  isBrowser = false;
  calendarLoaded = false;

  task = {
    title: '',
    description: '',
    startDate: '',
    duration: 1,
    priority: 'Moyenne'
  };

  tasks: any[] = [];

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
    weekends: true,

    eventDrop: this.handleEventDrop.bind(this),
    eventResize: this.handleEventResize.bind(this),
    select: this.handleDateSelect.bind(this),

    eventContent: (arg) => {
  const task = arg.event.extendedProps;
  return {
    html: `
      <div style="font-size: 0.85em;">
        <b>${arg.event.title}</b><br/>
        <i>${task['description'] || ''}</i><br/>
        <small>Durée: ${task['duration'] || 1} heure(s)</small><br/>
        <small>Priorité: ${task['priority'] || 'Moyenne'}</small>
      </div>
    `
  };
}
  };

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.http.get<any[]>('http://localhost:8080/tasks').subscribe({
        next: (data) => {
          this.tasks = data;
          this.updateCalendarEvents();
        },
        error: (err) => {
          console.error('Erreur lors de la récupération des tâches', err);
        }
      });
      setTimeout(() => {
        this.calendarLoaded = true;
        this.cdr.detectChanges();
        this.updateCalendarEvents();
      }, 100);
    }
  }

  handleEventDrop(changeInfo: any) {
    const event = changeInfo.event;
    const id = Number(event.id);
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.startDate = event.startStr;
      alert(`Tâche déplacée au ${task.startDate}`);
      this.updateCalendarEvents();
    }
  }

  handleEventResize(changeInfo: any) {
    const event = changeInfo.event;
    const id = Number(event.id);
    const task = this.tasks.find(t => t.id === id);
    if (task && event.end) {
      const durationMs = event.end.getTime() - event.start.getTime();
      task.duration = Math.ceil(durationMs / (1000 * 60 * 60));
      alert(`Durée modifiée : ${task.duration} heures`);
      this.updateCalendarEvents();
    }
  }

  handleDateSelect(selectInfo: any) {
    const start = selectInfo.startStr;
    this.showForm = true;
    this.task.startDate = start;
    this.cdr.detectChanges();
  }

  createTask() {
    const newTask = { ...this.task, id: Date.now() };
    this.tasks.push(newTask);

    if (this.isBrowser && this.calendarLoaded) {
      this.updateCalendarEvents();
    }

    alert('Tâche créée avec succès !');

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
      case 'Haute': return '#ef4444';
      case 'Moyenne': return '#f59e0b';
      case 'Basse': return '#10b981';
      default: return '#6b7280';
    }
  }
}
