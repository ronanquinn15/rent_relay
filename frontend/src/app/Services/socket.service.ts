import {Injectable} from '@angular/core';
import {io, Socket} from 'socket.io-client';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';

// This service is responsible for managing WebSocket connections and interactions
// It uses the Socket.IO library to establish a connection with the server

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor(private http: HttpClient) {
    this.socket = io('http://127.0.0.1:5000');
  }

  // This method is used to get Messages for a specific property
  // It makes an HTTP GET request to the server and returns an observable
  getMessages(property_id: string): Observable<any> {
    return this.http.get(`http://127.0.0.1:5000/messages/${property_id}`);
  }

  // This method is used to send a message
  // It emits a 'message' event to the server with the property ID, sender, receiver, and message content
  // The server will handle this event and broadcast the message to the appropriate clients
  sendMessage(property_id: string, sender: string, receiver: string, message: string) {
    this.socket.emit('message', {property_id, sender, receiver, msg: message});
  }

  // This method is used
  onMessage(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('message', (data) => {
        observer.next(data);
      });
    });
  }

  // This method updates the read status of a message
  updateReadStatus(message_id: string) {
    this.socket.emit('update_read_receipt', {message_id});
  }

}
