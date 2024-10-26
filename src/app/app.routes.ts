import { Routes } from '@angular/router';
import { LoginComponent } from './Components/LogIn/login/login.component';
import { HomeComponent } from './Components/Home/home.component';
import { PortfolioComponent } from './Components/portfolio/portfolio.component';

export const routes: Routes = [
{path:"",pathMatch:"full", redirectTo:'/login'},
{path:"login", component:LoginComponent},
{path:"home", component:HomeComponent},
{path:"saireddy", component:PortfolioComponent},
];
