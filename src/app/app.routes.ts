import { Routes } from '@angular/router';
import { LoginComponent } from './Components/LogIn/login/login.component';

export const routes: Routes = [
{path:"",pathMatch:"full", component:LoginComponent},
{path:"login",pathMatch:"full", component:LoginComponent},
];
