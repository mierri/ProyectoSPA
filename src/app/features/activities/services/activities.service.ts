import { Injectable, signal } from '@angular/core';
import { Activity, Comment } from '../models/activity.model';
import { ACTIVITIES_MOCK } from '../mocks/activities.mock';

@Injectable({ providedIn: 'root' })
export class ActivitiesService {
  private activities = signal<Activity[]>([...ACTIVITIES_MOCK]);

  getActivities() {
    return this.activities();
  }

  getActivityById(id: string): Activity | undefined {
    return this.activities().find(a => a.id === id);
  }

  addActivity(activity: Activity) {
    this.activities.set([...this.activities(), activity]);
  }

  updateActivity(id: string, update: Partial<Activity>) {
    this.activities.set(
      this.activities().map(a => a.id === id ? { ...a, ...update } : a)
    );
  }

  deleteActivity(id: string) {
    this.activities.set(this.activities().filter(a => a.id !== id));
  }

  addComment(activityId: string, comment: Comment) {
    this.activities.set(
      this.activities().map(a => 
        a.id === activityId 
          ? { ...a, comentarios: [...a.comentarios, comment] }
          : a
      )
    );
  }

  deleteComment(activityId: string, commentId: string) {
    this.activities.set(
      this.activities().map(a =>
        a.id === activityId
          ? { ...a, comentarios: a.comentarios.filter(c => c.id !== commentId) }
          : a
      )
    );
  }

  generateActivityWithId(activity: Omit<Activity, 'id' | 'comentarios'>): Activity {
    return {
      ...activity,
      id: `ACT-${Date.now().toString().slice(-6)}`,
      comentarios: [],
    };
  }

  generateCommentWithId(texto: string, usuario: string): Comment {
    return {
      id: `COM-${Date.now()}`,
      usuario,
      texto,
      timestamp: new Date().toISOString(),
    };
  }
}
