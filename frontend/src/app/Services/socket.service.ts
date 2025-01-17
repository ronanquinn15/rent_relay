import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor(private http: HttpClient) {
    this.socket = io('http://127.0.0.1:5000'); // Ensure this URL matches your backend server's address
  }

  joinRoom(room: string, user: string) {
    this.socket.emit('join', { room, user });
  }

  leaveRoom(room: string, user: string) {
    this.socket.emit('leave', { room, user });
  }

  sendMessage(property_id: string, sender: string, receiver: string, message: string) {
    this.socket.emit('message', { property_id, sender, receiver, msg: message });
  }

  onMessage(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('message', (data) => {
        observer.next(data);
      });
    });
  }

  onStatus(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('status', (data) => {
        observer.next(data);
      });
    });
  }

  getMessages(room: string): Observable<any> {
    return this.http.get(`http://127.0.0.1:5000/messages/${room}`);
  }
}
