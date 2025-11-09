import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NotFoundComponent } from "./components/not-found/not-found.component";
import { HomePageComponent } from "./components/home-page/home-page.component";
import { AdminLoginComponent } from "./components/admin-login/admin-login.component";
import { AdminDashboardComponent } from "./components/admin-dashboard/admin-dashboard.component";
import { AdminAuthGuard } from "./guards/admin-auth.guard";

const routes: Routes = [
  { path: "", component: HomePageComponent },
  { path: "admin", component: AdminLoginComponent },
  {
    path: "admin/dashboard",
    component: AdminDashboardComponent,
    canActivate: [AdminAuthGuard], // ✅ Guard applied
  },
  { path: "**", component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
