import { Component, OnInit, PLATFORM_ID, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router'; // ✅ Ajout ici

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

  currentAgent: any = null;
  agents: any[] = [];
  selectedAgentId: number | null = null;

  searchText: string = '';
  filterAgent: number | '' = '';
  filterPriority: string = '';
  filteredTasks: any[] = [];

  task = {
    id: null as number | null,
    title: '',
    description: '',
    startDate: '',
    duration: 1,
    priority: 'Moyenne',
    assignedTo: null
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
            <small>Durée: ${task['duration'] || 1} h</small><br/>
            <small>Priorité: ${task['priority'] || 'Moyenne'}</small><br/>
            <small>Agent: ${this.getAgentName(task['assignedTo'])}</small>
          </div>
        `
      };
    }
  };

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private router: Router // ✅ Ajout du Router
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.loadCurrentAgent();
    }
  }

  logout() {
    // ✅ Déconnexion front : suppression du token/localStorage et redirection
    localStorage.clear();
    sessionStorage.clear();
    this.currentAgent = null;
    this.router.navigate(['/login']); // adapte la route selon ton app
  }

  loadCurrentAgent() {
    this.http.get<any>('http://localhost:8080/me').subscribe({
      next: (agent) => {
        this.currentAgent = agent;
        this.selectedAgentId = agent.id;
        this.loadAgents();
      },
      error: (err) => {
        console.error('Erreur récupération agent connecté', err);
        this.currentAgent = null;
        this.loadAgents();
      }
    });
  }

  loadAgents() {
    this.http.get<any[]>('http://localhost:8080/agents').subscribe({
      next: (data) => {
        if (this.currentAgent) {
          this.agents = [this.currentAgent, ...data.filter(a => a.id !== this.currentAgent.id)];
        } else {
          this.agents = data;
        }
        this.loadTasks();
        this.calendarLoaded = true;
        this.cdr.detectChanges();
        this.updateCalendarEvents();
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des agents', err);
        this.agents = this.currentAgent ? [this.currentAgent] : [];
        this.calendarLoaded = true;
        this.cdr.detectChanges();
        this.updateCalendarEvents();
      }
    });
  }

  loadTasks() {
    this.http.get<any[]>('http://localhost:8080/tasks').subscribe({
      next: (data) => {
        this.tasks = data;
        this.filteredTasks = [...this.tasks];
        this.updateCalendarEvents();
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des tâches', err);
      }
    });
  }

  filterTasks() {
    this.filteredTasks = this.tasks.filter(task => {
      const matchesSearch = this.searchText
        ? (task.title.toLowerCase().includes(this.searchText.toLowerCase()) ||
          task.description.toLowerCase().includes(this.searchText.toLowerCase()))
        : true;

      const matchesAgent = this.filterAgent !== ''
        ? task.assignedTo === this.filterAgent
        : true;

      const matchesPriority = this.filterPriority
        ? task.priority === this.filterPriority
        : true;

      return matchesSearch && matchesAgent && matchesPriority;
    });
  }

  canEditTask(task: any): boolean {
    return this.currentAgent && task.assignedTo === this.currentAgent.id;
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) this.cancelEdit();
  }

  handleDateSelect(selectInfo: any) {
    this.resetForm();
    this.task.startDate = selectInfo.startStr;
    this.showForm = true;
    this.cdr.detectChanges();
  }

  handleEventDrop(info: any) {
    const task = this.tasks.find(t => t.id === +info.event.id);
    if (task && this.canEditTask(task)) {
      task.startDate = info.event.startStr;
      this.updateCalendarEvents();
    } else {
      info.revert();
      alert("Modification non autorisée.");
    }
  }

  handleEventResize(info: any) {
    const task = this.tasks.find(t => t.id === +info.event.id);
    if (task && this.canEditTask(task) && info.event.end) {
      const hours = (info.event.end.getTime() - info.event.start.getTime()) / (1000 * 60 * 60);
      task.duration = Math.ceil(hours);
      this.updateCalendarEvents();
    } else {
      info.revert();
      alert("Modification non autorisée.");
    }
  }

  submitTask() {
    if (this.task.id) {
      const index = this.tasks.findIndex(t => t.id === this.task.id);
      if (index !== -1 && this.canEditTask(this.tasks[index])) {
        this.tasks[index] = { ...this.task, assignedTo: this.selectedAgentId };
        alert('Tâche modifiée');
      } else {
        alert("Modification non autorisée.");
      }
    } else {
      const newTask = {
        ...this.task,
        id: Date.now(),
        assignedTo: this.selectedAgentId
      };
      this.tasks.push(newTask);
      alert('Tâche ajoutée');
    }

    this.showForm = false;
    this.resetForm();
    this.filterTasks();
    this.updateCalendarEvents();
  }

  editTask(task: any) {
    if (!this.canEditTask(task)) {
      alert("Modification non autorisée.");
      return;
    }
    this.task = { ...task };
    this.selectedAgentId = task.assignedTo;
    this.showForm = true;
    this.cdr.detectChanges();
  }

  deleteTask(id: number) {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index !== -1 && this.canEditTask(this.tasks[index])) {
      this.tasks.splice(index, 1);
      this.filterTasks();
      this.updateCalendarEvents();
      alert("Tâche supprimée");
    } else {
      alert("Suppression non autorisée.");
    }
  }

  resetForm() {
    this.task = {
      id: null,
      title: '',
      description: '',
      startDate: '',
      duration: 1,
      priority: 'Moyenne',
      assignedTo: null
    };
    this.selectedAgentId = this.currentAgent?.id ?? null;
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'Haute': return '#ef4444';
      case 'Moyenne': return '#f59e0b';
      case 'Basse': return '#10b981';
      default: return '#6b7280';
    }
  }

  updateCalendarEvents() {
    if (!this.isBrowser || !this.calendarLoaded) return;

    this.calendarOptions.events = this.tasks.map(task => ({
      id: task.id.toString(),
      title: task.title,
      start: task.startDate,
      backgroundColor: this.getPriorityColor(task.priority),
      borderColor: this.getPriorityColor(task.priority),
      extendedProps: {
        description: task.description,
        duration: task.duration,
        priority: task.priority,
        assignedTo: task.assignedTo
      }
    }));
  }

  getAgentName(agentId: number | null): string {
    const agent = this.agents.find(a => a.id === agentId);
    return agent ? agent.name : 'N/A';
  }

  cancelEdit() {
    this.showForm = false;
    this.resetForm();
  }
}
