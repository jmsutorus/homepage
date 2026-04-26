I want to implement a notification service for my homepage.
The api in this should be updated to store two new things in cloud firestore.
The first is the notification table:
This table will be used to store the notifications that are scheduled to be sent out.
It will need to be connected to create and delete events.
The second will be used to store fcm tokens for users that can be used to send notifications to their devices.

Firestore: /notifications/{docId}
This document is written by your Next.js API whenever a scheduled notification needs to go out.

typescript
interface NotificationDocument {
  id: string;                   // Firestore auto-ID
  userId: string;               // Links to user table
  title: string;
  body: string;
  icon?: string;                
  imageUrl?: string;            
  clickAction?: string;         
  data?: Record<string, string>; 
  sourceType: 'event' | 'achievement' | 'goal' | 'vacation | 'task' | 'habit' | 'custom';
  sourceId?: string | number;   
  scheduledAt: Timestamp;       
  status: 'pending' | 'scheduled' | 'sent' | 'failed' | 'cancelled';
  cloudTaskName?: string;       // GCP Cloud Task resource name
  sentAt?: Timestamp;           
  error?: string;               
  retryCount?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
Firestore: /fcm_tokens/{userId}/tokens/{tokenId}
typescript
interface FcmTokenDocument {
  token: string;          
  platform: 'web' | 'android' | 'ios';
  userAgent?: string;     
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
