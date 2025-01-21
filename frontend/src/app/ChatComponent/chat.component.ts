import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { UserService } from '../Services/user.service';
import { SocketService } from '../Services/socket.service';
import { AuthService } from '../Services/authService.service';
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
  providers: [SocketService, AuthService]
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatMessages') private chatMessagesContainer!: ElementRef;

  properties: any[] = [];
  selectedProperty: string = '';
  messages: any[] = [];
  unreadMessages: number = 0;
  message: string = '';
  userRole: string = '';

  constructor(public userService: UserService,
              private socketService: SocketService,
              private authService: AuthService) {
  }

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    if (this.userRole === 'landlord') {
      this.getProperties();
      this.socketService.onMessage().subscribe((msg) => {
        this.messages.push(msg); // Add new messages to the end of the array
        this.markAsRead(msg._id, msg.sender);
        this.scrollToBottom();
        this.updateUnreadCount();
      });
    } else if (this.userRole === 'tenant') {
      this.fetchMessagesForTenant();
      this.socketService.onMessage().subscribe((msg) => {
        this.messages.push(msg); // Add new messages to the end of the array
        this.markAsRead(msg._id, msg.sender);
        this.scrollToBottom();
        this.updateUnreadCount();
      });
    }
    this.updateUnreadCount();
  }

  updateUnreadCount(): void {
  const loggedInUser = this.userService.getLoggedInUser();
  this.unreadMessages = this.messages.filter((msg) => !msg.read_receipt && msg.sender !== loggedInUser).length;
}

  getFirstUnreadMessageIndex(): number {
    return this.messages.findIndex((msg) => !msg.read_receipt);
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.chatMessagesContainer.nativeElement.scrollTop = this.chatMessagesContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  markAsRead(messageId: string, sender: string): void {
  const loggedInUser = this.userService.getLoggedInUser();
  if (loggedInUser !== sender) {
    this.socketService.updateReadStatus(messageId);
  }
}

  fetchMessagesForTenant(): void {
    this.userService.getTenantPropertyID().subscribe(
      (tenantPropertyId) => {
        if (tenantPropertyId) {
          this.socketService.getMessages(tenantPropertyId).subscribe(
            (messages) => {
              this.messages = messages; // Keep the order of messages
              messages.forEach((msg: any) => this.markAsRead(msg._id, msg.sender)); // Mark each message as read
              this.scrollToBottom();
              this.updateUnreadCount();
            },
            (error) => {
              console.error('Error fetching messages for tenant', error);
            }
          );
        } else {
          console.error('Tenant property ID is not available');
        }
      },
      (error) => {
        console.error('Error fetching tenant property ID', error);
      }
    );
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

  loadMessages(): void {
    if (this.selectedProperty) {
      this.socketService.getMessages(this.selectedProperty).subscribe(
        (data) => {
          console.log('Fetched Messages:', data); // Log the fetched messages
          this.messages = data; // Keep the order of messages
          data.forEach((msg: any) => this.markAsRead(msg._id, msg.sender)); // Mark each message as read
          this.scrollToBottom();
          this.updateUnreadCount();
        },
        (error) => {
          console.error('Error fetching messages', error);
        }
      );
    } else {
      console.error('No property selected');
    }
  }

  sendMessage(): void {
    if (this.message.trim()) {
      const sender = this.userService.getLoggedInUser();
      const receiver = this.userRole === 'landlord' ? 'tenant' : 'landlord';

      if (this.userRole === 'landlord') {
        const propertyId = this.selectedProperty;
        this.sendMessageToServer(propertyId, sender, receiver, this.message);
      } else {
        this.userService.getTenantPropertyID().subscribe(
          (propertyId) => {
            this.sendMessageToServer(propertyId, sender, receiver, this.message);
          },
          (error) => {
            console.error('Error fetching tenant property ID', error);
          }
        );
      }
    } else {
      console.error('Message is empty');
    }
  }

  private sendMessageToServer(propertyId: string, sender: string, receiver: string, message: string): void {
    const newMessage = {
      sender,
      receiver,
      msg: message,
      propertyId,
      timestamp: new Date().toISOString(), // Add timestamp
      read_receipt: false // Initialize read_receipt
    };

    // Send the message to the server with the required arguments
    this.socketService.sendMessage(newMessage.propertyId, newMessage.sender, receiver, newMessage.msg);

    // Add the message to the local messages array
    this.messages.push(newMessage); // Add new messages to the end of the array

    // Clear the input field
    this.message = '';
    this.scrollToBottom();
    this.updateUnreadCount();
  }
}
