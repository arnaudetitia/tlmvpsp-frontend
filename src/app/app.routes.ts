import { Routes } from '@angular/router';
import { QualifsComponent } from './components/qualifs/qualifs.component';
import { CompetComponent } from './components/compet/compet.component';
import { DefiComponent } from './components/defi/defi.component';
import { HomepageComponent } from './components/homepage/homepage.component';
import { GestionPartiesComponent } from './components/admin/gestion-parties/gestion-parties.component';
import { GestionQuestionsComponent } from './components/admin/gestion-questions/gestion-questions.component';
import { homepageGuard } from './guards/homepage.guard';
import { LoginAdminComponent } from './components/login-admin/login-admin.component';

export const routes: Routes = [
  { path: '', component: HomepageComponent, canActivate: [homepageGuard] },
  { path: 'login', component: LoginAdminComponent },
  { path: 'qualifs', component: QualifsComponent },
  { path: 'compet', component: CompetComponent },
  { path: 'defi', component: DefiComponent },
  {
    path: 'admin',
    canActivate: [homepageGuard],
    children: [
      {
        path: 'gestion-questions',
        component: GestionQuestionsComponent,
      },
      {
        path: 'gestion-parties',
        component: GestionPartiesComponent,
      },
    ],
  },
];
