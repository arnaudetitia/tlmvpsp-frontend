import { Routes } from '@angular/router';
import { QualifsComponent } from './components/qualifs/qualifs.component';
import { CompetComponent } from './components/compet/compet.component';
import { DefiComponent } from './components/defi/defi.component';
import { HomepageComponent } from './components/homepage/homepage.component';

export const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: 'qualifs', component: QualifsComponent },
  { path: 'compet', component: CompetComponent },
  { path: 'defi', component: DefiComponent },
];
