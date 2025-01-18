import {Component, OnInit} from '@angular/core';
import {UserService} from '../Services/user.service';
import {SocketService} from '../Services/socket.service';
import {AuthService} from '../Services/authService.service';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';

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

export class ChatComponent implements OnInit {
  properties: any[] = [];
  selectedProperty: string = '';
  messages: any[] = [];
  message: string = '';
  userRole: string = '';

  constructor(private userService: UserService,
              private socketService: SocketService,
              private authService: AuthService) {
  }


  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    if (this.userRole === 'landlord') {
      this.getProperties();
      this.socketService.onMessage().subscribe((msg) => {
        this.messages.push(msg);
      });
    } else if (this.userRole === 'tenant') {
      this.fetchMessagesForTenant();
      this.socketService.onMessage().subscribe((msg) => {
        this.messages.push(msg);
      });
    }
  }


  fetchMessagesForTenant(): void {
    this.userService.getTenantPropertyID().subscribe(
      (tenantPropertyId) => {
        if (tenantPropertyId) {
          this.socketService.getMessages(tenantPropertyId).subscribe(
            (messages) => {
              this.messages = messages;
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
    this.selectedProperty = '6776e3e94527ce5d8fbf7988';
    if (this.selectedProperty) {
      this.socketService.getMessages(this.selectedProperty).subscribe(
        (data) => {
          console.log('Fetched Messages:', data); // Log the fetched messages
          this.messages = data;
        },
        (error) => {
          console.error('Error fetching messages', error);
        }
      );
    } else {
      console.error('No property selected');
    }
  }

  onPropertySelect(): void {
    this.selectedProperty = '6776e3e94527ce5d8fbf7988';
    console.log('Selected Property ID:', this.selectedProperty); // Log the selected property ID
    if (this.selectedProperty) {
      this.userService.getPropertyById(this.selectedProperty).subscribe(
        (property) => {
          console.log('Fetched Property:', property); // Log the fetched property details
          this.selectedProperty = property._id; // Ensure the property ID is an ObjectId
          this.loadMessages();
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
      const receiver = this.userRole === 'landlord' ? 'tenant' : 'landlord';
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
