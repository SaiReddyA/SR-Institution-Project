import { Injectable } from '@angular/core';
import { Signup } from '../../Models/signup';
import { catchError, map, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
 // private apiUrl = 'http://localhost:3000/SignUp';

  private storageKey = 'users'; // Key to store data in localStorage

  constructor() {}

  // Create a new user
  createUser(user: Signup): Observable<Signup> {
    const users = this.getStoredUsers();
    user.Id = users.length ? Math.max(...users.map(u => u.Id || 0)) + 1 : 1; // Generate a new ID
    users.push(user);
    this.saveUsersToSession(users);
    return of(user);
  }

  // Update an existing user
  updateUser(id: number, user: Signup): Observable<Signup> {
    const users = this.getStoredUsers();
    const index = users.findIndex(u => u.Id === id);
    if (index !== -1) {
      users[index] = { ...user, Id: id }; // Ensure ID remains unchanged
      this.saveUsersToSession(users);
    }
    return of(user);
  }

  // Get all users
  getUsers(): Observable<Signup[]> {
    return of(this.getStoredUsers());
  }

  // Helper to retrieve users from localStorage
  private getStoredUsers(): Signup[] {
    try {
      // Try retrieving users from localStorage
      const users = localStorage.getItem(this.storageKey);
      if (users) return JSON.parse(users);
  
      // If localStorage is empty, initialize with default user
      const defaultUser: Signup = this.getDefaultUser();
      this.saveUsersToStorage([defaultUser]);
      return [defaultUser];
    } catch (error) {
      console.warn('LocalStorage exceeded limit. Switching to sessionStorage.');
      
      // Use sessionStorage as a fallback
      const users = sessionStorage.getItem(this.storageKey);
      if (users) return JSON.parse(users);
  
      // If sessionStorage is also empty, initialize with default user
      const defaultUser: Signup = this.getDefaultUser();
      this.saveUsersToSession([defaultUser]);
      return [defaultUser];
    }
  }
  
  // Get the default user object
  private getDefaultUser(): Signup {
    return {
      Id: 1,
      UserName: 'SaiReddy',
      EmailAddress: 'sai@gmail.com',
      PhoneNumber: 9892383834,
      Password: 'saiA@123',
    };
  }
  
  // Save users to localStorage
  private saveUsersToStorage(users: Signup[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(users));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }
  
  // Save users to sessionStorage (fallback)
  private saveUsersToSession(users: Signup[]): void {
    sessionStorage.setItem(this.storageKey, JSON.stringify(users));
  }
}
