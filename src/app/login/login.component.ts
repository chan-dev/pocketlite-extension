import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: [],
})
export class LoginComponent implements OnInit {
  private url = environment.apiURL;

  ngOnInit(): void {}

  openInNewTab(): void {
    window.open(this.url);
  }
}
