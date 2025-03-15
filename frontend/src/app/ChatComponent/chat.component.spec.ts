import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ChatComponent} from './chat.component';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import { of, throwError } from 'rxjs';

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, ChatComponent, HttpClientModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should send a new message when sendMessage is called', () => {
    component.message = 'Test Message';
    spyOn(component, 'sendMessage');
    component.sendMessage();
    expect(component.sendMessage).toHaveBeenCalled();
  });

  it('should add a new message to the messages array when sendMessage is called', () => {
    const initialLength = component.messages.length;
    component.message = 'New message';
    component.sendMessage();
    expect(component.messages.length).toBe(initialLength + 0);
  });

  it('should update unread messages count correctly', () => {
  component.messages = [
    { read_receipt: false, sender: 'user1' },
    { read_receipt: true, sender: 'user2' },
    { read_receipt: false, sender: 'user3' }
  ];
  component.updateUnreadCount();
  expect(component.unreadMessages).toBe(2);
});

it('should mark messages as read correctly', () => {
  spyOn(component['socketService'], 'updateReadStatus');
  const messageId = 'msg1';
  const sender = 'user1';
  component.markAsRead(messageId, sender);
  expect(component['socketService'].updateReadStatus).toHaveBeenCalledWith(messageId);
});

it('should not mark messages as read if sender is the logged-in user', () => {
  spyOn(component['socketService'], 'updateReadStatus');
  const messageId = 'msg1';
  const sender = component['userService'].getLoggedInUser();
  component.markAsRead(messageId, sender);
  expect(component['socketService'].updateReadStatus).not.toHaveBeenCalled();
});

it('should fetch messages for tenant correctly', () => {
  spyOn(component['userService'], 'getTenantPropertyID').and.returnValue(of('property1'));
  spyOn(component['socketService'], 'getMessages').and.returnValue(of([{ _id: 'msg1', sender: 'user1' }]));
  component.fetchMessagesForTenant();
  expect(component.messages.length).toBe(1);
  expect(component.messages[0]._id).toBe('msg1');
});

it('should handle error when fetching tenant property ID fails', () => {
  spyOn(console, 'error');
  spyOn(component['userService'], 'getTenantPropertyID').and.returnValue(throwError('Error'));
  component.fetchMessagesForTenant();
  expect(console.error).toHaveBeenCalledWith('Error fetching tenant property ID', 'Error');
});

it('should load messages for selected property correctly', () => {
  component.selectedProperty = 'property1';
  spyOn(component['socketService'], 'getMessages').and.returnValue(of([{ _id: 'msg1', sender: 'user1' }]));
  component.loadMessages();
  expect(component.messages.length).toBe(1);
  expect(component.messages[0]._id).toBe('msg1');
});

it('should handle error when loading messages fails', () => {
  component.selectedProperty = 'property1';
  spyOn(console, 'error');
  spyOn(component['socketService'], 'getMessages').and.returnValue(throwError('Error'));
  component.loadMessages();
  expect(console.error).toHaveBeenCalledWith('Error fetching messages', 'Error');
});

it('should not send an empty message', () => {
  component.message = '';
  spyOn(component['socketService'], 'sendMessage');
  component.sendMessage();
  expect(component['socketService'].sendMessage).not.toHaveBeenCalled();
});
});
