import { Component, OnInit } from '@angular/core';
import { UserService } from '../Services/user.service';
import { SocketService } from '../Services/socket.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  providers: [SocketService]
})

export class ChatComponent implements OnInit {
  properties: any[] = [];
  selectedProperty: string = '';
  messages: any[] = [];
  message: string = '';

  constructor(private userService: UserService, private socketService: SocketService) {}

  ngOnInit(): void {
    this.getProperties();
  }

  getProperties(): void {
    this.userService.getPropertiesByLandlord().subscribe(
      (resp) => {
        console.log('Loaded Properties:', resp); // Log the loaded properties
        this.properties = resp;
      },
      (error) => {
        console.error('Error fetching properties', error);
      }
    );
  }

  onPropertySelect(): void {
    this.selectedProperty = '6776e3e94527ce5d8fbf7988'; // Hard code the property ID
    console.log('Selected Property ID:', this.selectedProperty); // Log the selected property ID
    if (this.selectedProperty) {
      this.userService.getPropertyById(this.selectedProperty).subscribe(
        (property) => {
          console.log('Fetched Property:', property); // Log the fetched property details
          this.socketService.getMessages(this.selectedProperty).subscribe(
            (data) => {
              console.log('Fetched Messages:', data); // Log the fetched messages
              this.messages = data;
            },
            (error) => {
              console.error('Error fetching messages', error);
            }
          );
        },
        (error) => {
          console.error('Error fetching property', error);
        }
      );
    } else {
      console.error('No property selected');
    }
  }

  sendMessage(): void {
    if (this.message.trim() && this.selectedProperty) {
      const sender = this.userService.getLoggedInUser();
      const newMessage = {
        sender,
        msg: this.message,
        propertyId: this.selectedProperty
      };

      // Send the message to the server with the required arguments
      this.socketService.sendMessage(newMessage.propertyId, newMessage.sender, '', newMessage.msg);

      // Add the message to the local messages array
      this.messages.push(newMessage);

      // Clear the input field
      this.message = '';
    } else {
      console.error('Message or selected property is empty');
    }
  }
}
