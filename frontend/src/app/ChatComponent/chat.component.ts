import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { UserService } from '../Services/user.service';
import { SocketService } from '../Services/socket.service';
import { AuthService } from '../Services/authService.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// This component is responsible for managing the chat functionality
// It handles sending and receiving messages between landlords and tenants

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
  // ViewChild is used to get a reference to the chat messages container
  // This allows us to scroll to the bottom of the chat when new messages arrive
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

  // This method is called when the component is initialised
  // It checks the user's role and fetches the relevant messages
  // It also sets up a WebSocket connection to listen for new messages
  // The messages are displayed in the chat window
  // The scrollToBottom method is called to ensure the chat window is scrolled to the latest message
  // The updateUnreadCount method is called to update the number of unread messages
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

  // This method is called when the user selects a property from the dropdown
  // It fetches the messages for the selected property and updates the chat window
  updateUnreadCount(): void {
  const loggedInUser = this.userService.getLoggedInUser();
  this.unreadMessages = this.messages.filter((msg) => !msg.read_receipt && msg.sender !== loggedInUser).length;
}

  // This method is to get the index of the first unread message
  // It is used to scroll to the first unread message when the user opens the chat
  getFirstUnreadMessageIndex(): number {
    return this.messages.findIndex((msg) => !msg.read_receipt);
  }

  // This method is called after the view has been checked
  // It scrolls the chat window to the bottom to display the latest messages
  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  // This method is used to scroll the chat window to the bottom
  // It ensures that the latest messages are always visible
  private scrollToBottom(): void {
    try {
      // Scroll to the bottom of the chat messages container
      this.chatMessagesContainer.nativeElement.scrollTop = this.chatMessagesContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  // This method is called when the receiver enters the chat
  // It marks the message as read and updates the read status on the server
  markAsRead(messageId: string, sender: string): void {
  const loggedInUser = this.userService.getLoggedInUser();
  if (loggedInUser !== sender) {
    this.socketService.updateReadStatus(messageId);
  }
}

  // This method is used to fetch messages for the tenant
  // It gets the tenant property ID and fetches the messages from the server
  // The messages are displayed in the chat window
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

  // This method is called when the user selects a property from the dropdown
  // It fetches the messages for the selected property and updates the chat window
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

  // This method is called to load messages for the selected property
  // It fetches the messages from the server and updates the chat window
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

  // This method is called to send a message
  // It checks if the message is not empty and sends it to the server
  // The message is added to the local messages array and displayed in the chat window
  // The input field is cleared after sending the message
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

  // This method is used to send a message to the server
  // It creates a new message object with the sender, receiver, and message content
  private sendMessageToServer(propertyId: string, sender: string, receiver: string, message: string): void {
    const newMessage = {
      sender,
      receiver,
      msg: message,
      propertyId,
      timestamp: new Date().toISOString(), // This is the timestamp of the message
      read_receipt: false // Initialise read_receipt
    };

    // Send the message to the server with the required arguments
    this.socketService.sendMessage(newMessage.propertyId, newMessage.sender, receiver, newMessage.msg);

    // Add the message to the local messages array
    this.messages.push(newMessage);

    // Clear the input field
    this.message = '';
    this.scrollToBottom();
    this.updateUnreadCount();
  }
}
