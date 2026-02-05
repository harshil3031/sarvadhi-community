# Direct Messages Feature - Quick Reference

## Quick Start

### Display DM List
```tsx
// app/(tabs)/messages/index.tsx
import { dmApi } from '@/api/dm.api';
import { useDMSocket } from '@/hooks/useDMSocket';
import DMCard from '@/components/DMCard';

export default function MessagesScreen() {
  const { isConnected, addEventListener } = useDMSocket();
  const [conversations, setConversations] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const response = await dmApi.getConversations(50, 0);
      setConversations(response.data.data);

      // Listen for real-time message updates
      addEventListener('dm:message_received', (message) => {
        setConversations(prev =>
          prev.map(conv =>
            conv.id === message.conversationId
              ? { ...conv, lastMessage: message }
              : conv
          )
        );
      });
    }, [addEventListener])
  );

  return (
    <FlatList
      data={conversations}
      renderItem={({ item }) => <DMCard conversation={item} />}
    />
  );
}
```

### Display DM Chat
```tsx
// app/(tabs)/messages/[id].tsx
import { dmApi } from '@/api/dm.api';
import { useDMSocket } from '@/hooks/useDMSocket';
import MessageBubble from '@/components/MessageBubble';
import TypingIndicator from '@/components/TypingIndicator';

export default function DMChatScreen() {
  const { id } = useLocalSearchParams();
  const { isConnected, addEventListener, sendMessage, sendTyping } = useDMSocket();
  const [messages, setMessages] = useState([]);

  // Listen for real-time messages
  addEventListener('dm:message_received', (message) => {
    if (message.conversationId === id) {
      setMessages(prev => [message, ...prev]);
    }
  });

  const handleSendMessage = async () => {
    const response = await dmApi.sendMessage({
      conversationId: id,
      text: messageText
    });
    sendMessage(id, messageText);
  };

  return (
    <View>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <MessageBubble message={item} isOwn={item.senderId === user?.id} />
        )}
      />
      {typingUsers.length > 0 && <TypingIndicator userName={typingUsers[0]} />}
    </View>
  );
}
```

---

## Component Props

### DMCard
```typescript
<DMCard
  conversation={DM.Conversation}  // Conversation object
/>
```

### MessageBubble
```typescript
<MessageBubble
  message={DM.Message}  // Message object
  isOwn={boolean}       // Is current user's message
/>
```

### TypingIndicator
```typescript
<TypingIndicator
  userName={string}     // Name of typing user
/>
```

---

## API Methods

### Get Conversations
```typescript
const response = await dmApi.getConversations(
  limit = 50,   // Conversations per page
  offset = 0    // Pagination offset
);
const conversations = response.data.data; // DM.Conversation[]
```

### Get Conversation Details
```typescript
const response = await dmApi.getConversation(conversationId);
const conversation = response.data.data; // DM.Conversation
```

### Get Messages
```typescript
const response = await dmApi.getConversationMessages(
  conversationId,
  limit = 50,   // Messages per page
  offset = 0    // Pagination offset
);
const messages = response.data.data; // DM.Message[]
```

### Send Message
```typescript
const response = await dmApi.sendMessage({
  conversationId: string,  // Conversation ID
  text: string            // Message text (max 1000 chars)
});
const message = response.data.data; // DM.Message
```

### Mark as Read
```typescript
const response = await dmApi.markAsRead(conversationId);
// Returns: void (check response.data.success)
```

### Start Conversation
```typescript
const response = await dmApi.startConversation(userId);
const conversation = response.data.data; // DM.Conversation
```

---

## WebSocket Events

### Listen for Real-Time Messages
```typescript
const { addEventListener } = useDMSocket();

addEventListener('dm:message_received', (message: DM.Message) => {
  // New message received
  console.log(message.text);
});
```

### Listen for Typing Indicator
```typescript
addEventListener('dm:user_typing', (data: { conversationId: string; userName: string }) => {
  // User started typing
  setTypingUsers(prev => [...prev, data.userName]);
});

addEventListener('dm:typing_stop', (data: { conversationId: string }) => {
  // User stopped typing
  setTypingUsers(prev => prev.filter(name => name !== data.userName));
});
```

### Send Message via WebSocket
```typescript
const { sendMessage } = useDMSocket();

sendMessage(conversationId, text);
```

### Send Typing Indicator
```typescript
const { sendTyping, stopTyping } = useDMSocket();

// User started typing
sendTyping(conversationId);

// User stopped typing (after 2 seconds inactivity)
stopTyping(conversationId);
```

### Mark as Read
```typescript
const { markAsRead } = useDMSocket();

markAsRead(conversationId);
```

---

## Socket Lifecycle

### Connect After Login
```typescript
// In auth.store.ts login/register/loginWithGoogle:
const socketStore = getSocketStore();
if (socketStore) {
  socketStore.getState().connect();
}
```

### Disconnect on Logout
```typescript
// In auth.store.ts logout:
const socketStore = getSocketStore();
if (socketStore) {
  socketStore.getState().disconnect();
}
```

### Connect on Session Restore
```typescript
// In auth.store.ts restoreSession:
const socketStore = getSocketStore();
if (socketStore) {
  socketStore.getState().connect();
}
```

---

## Hook Usage

### useDMSocket Hook
```typescript
import { useDMSocket } from '@/hooks/useDMSocket';

const {
  isConnected,           // boolean - Socket connected
  addEventListener,      // Register event listeners
  sendMessage,          // (conversationId, text) => void
  sendTyping,           // (conversationId) => void
  stopTyping,           // (conversationId) => void
  markAsRead,           // (conversationId) => void
} = useDMSocket();
```

---

## Common Patterns

### Optimistic Message Updates
```typescript
const handleSendMessage = async () => {
  const text = messageText.trim();
  
  // Create optimistic message
  const optimisticMessage: DM.Message = {
    id: `temp_${Date.now()}`,
    conversationId: id,
    senderId: user?.id,
    sender: { id: user?.id, fullName: user?.fullName },
    text,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Add immediately
  setMessages(prev => [optimisticMessage, ...prev]);

  try {
    // Send via API
    const response = await dmApi.sendMessage({ conversationId: id, text });
    
    // Replace optimistic with real message
    setMessages(prev =>
      prev.map(msg =>
        msg.id === optimisticMessage.id ? response.data.data! : msg
      )
    );

    // Emit via socket
    sendMessage(id, text);
  } catch (err) {
    // Remove on error
    setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp_')));
  }
};
```

### Typing Indicator Management
```typescript
const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

const handleTyping = (text: string) => {
  setMessageText(text);

  // Clear existing timeout
  if (typingTimeoutRef.current) {
    clearTimeout(typingTimeoutRef.current);
  }

  // Send typing if not already sent
  if (!isTyping && text.trim()) {
    sendTyping(id);
    setIsTyping(true);
  }

  // Set timeout to stop after 2 seconds
  typingTimeoutRef.current = setTimeout(() => {
    if (isTyping) {
      stopTyping(id);
      setIsTyping(false);
    }
  }, 2000) as unknown as NodeJS.Timeout;
};
```

### Connection Status Handling
```typescript
{!isConnected && (
  <View style={styles.connectionWarning}>
    <Ionicons name="warning" size={14} color="#dc2626" />
    <Text>Reconnecting... Messages will send when connected</Text>
  </View>
)}

<TextInput
  editable={isConnected && !isSending}
  placeholder="Type a message..."
/>

<TouchableOpacity
  disabled={!messageText.trim() || !isConnected || isSending}
  onPress={handleSendMessage}
>
  Send
</TouchableOpacity>
```

---

## Rules Enforced

### ✅ WebSocket Only for DMs
- Socket is NOT used for channels or groups
- Only DM conversations use real-time WebSocket
- All other features use REST API

### ✅ Connect Socket After Login
- `login()` → connects socket
- `register()` → connects socket
- `loginWithGoogle()` → connects socket
- `restoreSession()` → connects socket

### ✅ Disconnect on Logout
- `logout()` → disconnects socket before clearing auth
- Ensures no orphaned socket connections

---

## File Structure

```
components/
├── MessageBubble.tsx       (Message display bubble)
├── TypingIndicator.tsx     (Typing animation)
└── DMCard.tsx              (Conversation card)

app/(tabs)/messages/
├── index.tsx               (DM list screen)
└── [id].tsx                (DM chat screen)

src/
├── api/
│   └── dm.api.ts           (DM API client - already exists)
├── hooks/
│   └── useDMSocket.ts      (WebSocket event management)
├── store/
│   └── auth.store.ts       (Socket lifecycle - updated)
└── utils/
    └── date.ts             (Date formatting)
```

---

## Testing Examples

### Send & Receive Message
```typescript
// 1. Send message
await dmApi.sendMessage({
  conversationId: convId,
  text: 'Hello!'
});

// 2. Listen for received message
addEventListener('dm:message_received', (message) => {
  assert(message.text === 'Hello!'); // ✓
});
```

### Typing Indicator
```typescript
// 1. Send typing
sendTyping(convId);

// 2. Other user receives
addEventListener('dm:user_typing', (data) => {
  assert(data.conversationId === convId); // ✓
});

// 3. Stop typing
stopTyping(convId);

// 4. Other user receives stop
addEventListener('dm:typing_stop', (data) => {
  assert(data.conversationId === convId); // ✓
});
```

### Socket Lifecycle
```typescript
// 1. User logs in
await login(email, password);
const socketConnected = useSocketStore.getState().isConnected;
assert(socketConnected === true); // ✓

// 2. User logs out
await logout();
const socketConnected = useSocketStore.getState().isConnected;
assert(socketConnected === false); // ✓
```

---

## Summary

**Files Created**:
- `components/MessageBubble.tsx` - 114 lines
- `components/TypingIndicator.tsx` - 60 lines
- `components/DMCard.tsx` - 128 lines
- `src/hooks/useDMSocket.ts` - 85 lines
- `src/utils/date.ts` - 105 lines
- `app/(tabs)/messages/index.tsx` - 220 lines
- `app/(tabs)/messages/[id].tsx` - 400 lines

**Total**: ~1112 lines of implementation

**Key Features**:
✅ WebSocket real-time messaging
✅ Send & receive messages with optimistic UI
✅ Typing indicators with animation
✅ Message timestamps and read receipts
✅ Conversation list with unread counts
✅ Connection status indicator
✅ Message pagination
✅ Automatic socket connection/disconnection
✅ Error handling and reconnection logic

**Socket Events**:
- `dm:message_received` - New message received
- `dm:user_typing` - User started typing
- `dm:typing_stop` - User stopped typing
- `dm:message_read` - Conversation marked as read

**Rules**:
✅ WebSocket only for DMs (not channels/groups)
✅ Socket connects after login
✅ Socket disconnects on logout
✅ Automatic reconnection with exponential backoff
