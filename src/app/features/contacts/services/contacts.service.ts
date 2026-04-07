import { Injectable, signal } from '@angular/core';
import { Contact } from '../models/contact.model';
import { CONTACTS_MOCK } from '../mocks/contacts.mock';

@Injectable({ providedIn: 'root' })
export class ContactsService {
  private contacts = signal<Contact[]>([...CONTACTS_MOCK]);
  private customTags = signal<string[]>([]);

  getContacts() {
    return this.contacts();
  }

  getContactById(id: string): Contact | undefined {
    return this.contacts().find(c => c.id === id);
  }

  addContact(contact: Contact) {
    this.contacts.set([...this.contacts(), contact]);
  }

  updateContact(id: string, update: Partial<Contact>) {
    this.contacts.set(
      this.contacts().map(c => c.id === id ? { ...c, ...update } : c)
    );
  }

  deleteContact(id: string) {
    this.contacts.set(this.contacts().filter(c => c.id !== id));
  }

  generateContactWithId(contact: Omit<Contact, 'id'>): Contact {
    return {
      ...contact,
      id: `CONT-${Date.now().toString().slice(-6)}`,
    };
  }

  getAllTags(): string[] {
    const tags = new Set<string>();
    this.contacts().forEach(contact => {
      contact.etiquetas.forEach(tag => tags.add(tag));
    });
    this.customTags().forEach(tag => tags.add(tag));
    return Array.from(tags).sort();
  }

  addTag(tag: string): void {
    if (tag.trim().length > 0 && !this.customTags().includes(tag)) {
      this.customTags.set([...this.customTags(), tag]);
    }
  }
}
