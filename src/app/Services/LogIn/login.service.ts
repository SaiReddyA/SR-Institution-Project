import { Injectable } from '@angular/core';
import { Signup } from '../../Models/signup';
import { catchError, map, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = 'http://localhost:3000/SignUp';

  constructor(private http: HttpClient) {}

  // Create a new user
  createUser(user: Signup): Observable<Signup> {
    return this.http.post<Signup>(this.apiUrl, user);
  }

  // Update an existing user
  updateUser(id: number, user: Signup): Observable<Signup> {
    return this.http.put<Signup>(`${this.apiUrl}/${id}`, user);
  }
  checkEmail(email: string): Observable<boolean> {
    return this.http.get<any[]>(`${this.apiUrl}?EmailAddress=${email}`).pipe(
      map(users => users.length > 0),
      catchError(() => of(false))
    );
  }
  // Get all users
  getUsers(): Observable<Signup[]> {
    return this.http.get<Signup[]>(this.apiUrl);
  }
}
