import { Routes } from '@angular/router';
import { QualifsComponent } from './components/qualifs/qualifs.component';
import { CompetComponent } from './components/compet/compet.component';
import { DefiComponent } from './components/defi/defi.component';
import { LobbyComponent } from './components/lobby/lobby.component';

export const routes: Routes = [
  { path: '', component: LobbyComponent },
  { path: 'qualifs', component: QualifsComponent },
  { path: 'compet', component: CompetComponent },
  { path: 'defi', component: DefiComponent },
];
