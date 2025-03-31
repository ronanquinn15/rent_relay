import {Injectable} from '@angular/core';
import {io, Socket} from 'socket.io-client';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor(private http: HttpClient) {
    this.socket = io('http://127.0.0.1:5000');
  }

  joinRoom(property_id: string, user: string) {
    this.socket.emit('join', {room: property_id, user});
  }

  leaveRoom(property_id: string, user: string) {
    this.socket.emit('leave', {room: property_id, user});
  }

  getMessages(property_id: string): Observable<any> {
    return this.http.get(`http://127.0.0.1:5000/messages/${property_id}`);
  }

  sendMessage(property_id: string, sender: string, receiver: string, message: string) {
    this.socket.emit('message', {property_id, sender, receiver, msg: message});
  }

  onMessage(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('message', (data) => {
        observer.next(data);
      });
    });
  }

  updateReadStatus(message_id: string) {
    this.socket.emit('update_read_receipt', {message_id});
  }

}
