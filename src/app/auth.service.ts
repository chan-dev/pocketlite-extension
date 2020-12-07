import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { User } from './user.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  url = environment.apiURL + '/api/auth/user';

  constructor(private http: HttpClient) {}

  fetchUser(): Observable<User> {
    return this.http.get<User>(this.url);
  }
}
