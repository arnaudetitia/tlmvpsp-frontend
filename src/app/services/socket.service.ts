import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { JoueursStore } from '../store/joueurs.store';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket | undefined;

  constructor(private joueursStore: JoueursStore) {
    this.socket = io(environment.socketUrl, {
      transports: ['websocket'],
      upgrade: false,
    });

    this.socket.on('reponse-joueur', (data) => {
      this.joueursStore.recordReponseJoueur(data.joueur, data.reponse);
    });
  }
}
