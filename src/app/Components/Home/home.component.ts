import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatIconModule,MatMenuModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
username:any = "Sai Reddy"
currentYear :number
  constructor(private toaster:ToastrService) { 
    this.currentYear = new Date().getFullYear();
  }
  ngOnInit(): void {
    this.toaster.success('Hello world!');
  }
  logout() {
    alert('Logged out successfully!');
    // Implement your logout logic here, e.g., redirecting to a login page
  }
}
