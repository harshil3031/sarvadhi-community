# Profile Quick Reference

## Overview
The Profile screen displays user account information and provides logout functionality. The screen is read-only (no editing in MVP) and shows all user details including ID, name, email, role, authentication provider, and join date.

## Features

### View Profile
- **User Avatar**: Visual representation with user icon
- **User Information**: Display of all account details
  - Full name
  - Email address
  - Role (admin, moderator, employee) with color-coded badge
  - Authentication provider (Email & Password or Google)
  - Member since date (formatted)
  - User ID (unique identifier)
- **Role Badge**: Color-coded indicator
  - Admin: Red (#dc2626)
  - Moderator: Orange (#ea580c)
  - Employee: Cyan (#0891b2)
- **Formatted Information**: All dates and text properly formatted

### Logout
- **Logout Button**: Prominent red button with icon
- **Confirmation Alert**: Users must confirm before logout
- **Loading State**: Button shows loading indicator during logout
- **Navigation**: Automatically redirects to login screen after logout
- **WebSocket Cleanup**: DM socket disconnects on logout (handled by auth store)

## Data Types

### Auth.User
```typescript
interface User {
  id: string;                              // Unique user identifier
  fullName: string;                        // User's full name
  email: string;                           // Email address
  role: 'admin' | 'moderator' | 'employee';  // User role
  authProvider: 'local' | 'google';        // Auth method used
  createdAt: string;                       // ISO timestamp of account creation
  updatedAt: string;                       // ISO timestamp of last update
}
```

## Screen Structure

### Sections
1. **Header Card**
   - Avatar with user icon
   - Full name
   - Role badge
   - Email address

2. **Account Information Section**
   - Full name with person icon
   - Email with mail icon
   - Role with shield icon
   - Auth provider with key icon
   - Member since with calendar icon
   - User ID with barcode icon

3. **Logout Section**
   - Red logout button with icon and text
   - Loading state during logout

4. **Help Section**
   - Support contact information
   - App version display

## API Integration

### Logout API
```typescript
authApi.logout()
// Returns: ApiResponse<void>
// Optional - mostly handled client-side
```

### Current User
The profile screen gets user data from auth store:
```typescript
const { user, logout } = useAuthStore();
```

## Usage Patterns

### Display User Profile
```typescript
import { useAuthStore } from '../../src/store/auth.store';

export default function ProfileScreen() {
  const { user } = useAuthStore();

  if (!user) {
    return <LoadingView />;
  }

  return (
    <View>
      <Text>{user.fullName}</Text>
      <Text>{user.email}</Text>
      <Text>{user.role}</Text>
    </View>
  );
}
```

### Handle Logout
```typescript
const { logout } = useAuthStore();
const [isLoggingOut, setIsLoggingOut] = useState(false);

const handleLogout = () => {
  Alert.alert(
    'Logout',
    'Are you sure you want to logout?',
    [
      { text: 'Cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          setIsLoggingOut(true);
          try {
            await logout();
            // Navigation handled automatically
          } catch (err) {
            setIsLoggingOut(false);
            Alert.alert('Error', 'Failed to logout');
          }
        },
        style: 'destructive',
      },
    ]
  );
};
```

### Format Dates
```typescript
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

// Usage
const memberSince = formatDate(user.createdAt);
// Output: "February 5, 2026"
```

### Role Badge Component
```typescript
function RoleBadge({ role, colors }: { 
  role: string; 
  colors: typeof ProfileScreenColors['light'] 
}) {
  const getRoleColor = () => {
    switch (role) {
      case 'admin':
        return '#dc2626';
      case 'moderator':
        return '#ea580c';
      case 'employee':
        return '#0891b2';
      default:
        return '#6b7280';
    }
  };

  return (
    <View style={{ backgroundColor: getRoleColor() + '20' }}>
      <Text style={{ color: getRoleColor() }}>
        {role.toUpperCase()}
      </Text>
    </View>
  );
}
```

### Profile Field Component
```typescript
function ProfileField({ 
  icon, 
  label, 
  value, 
  colors 
}: ProfileFieldProps) {
  return (
    <View>
      <View style={styles.fieldHeader}>
        <Ionicons name={icon as any} size={20} color="#2563EB" />
        <Text style={{ color: colors.mutedText }}>{label}</Text>
      </View>
      <Text style={{ color: colors.text }}>{value || 'N/A'}</Text>
    </View>
  );
}
```

## Theme Support

The profile screen supports light and dark modes using React Native's `useColorScheme()`:

```typescript
const colorScheme = useColorScheme();
const colors = ProfileScreenColors[colorScheme ?? 'light'];

const ProfileScreenColors = {
  light: {
    background: '#f9fafb',
    cardBackground: '#fff',
    text: '#000',
    mutedText: '#666',
    border: '#ddd',
    danger: '#ef4444',
  },
  dark: {
    background: '#0a0a0a',
    cardBackground: '#1a1a1a',
    text: '#fff',
    mutedText: '#aaa',
    border: '#333',
    danger: '#f87171',
  },
};
```

## Navigation

### Auto-redirect on Logout
The root layout automatically handles navigation based on auth state:
- If authenticated → Shows app tabs
- If not authenticated → Redirects to login screen

No manual navigation needed - logout triggers the redirect automatically.

### Access from Tabs
The profile screen is registered as a tab in `app/(tabs)/_layout.tsx`:
```typescript
<Tabs.Screen
  name="profile"
  options={{
    title: "Profile",
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="person-outline" size={size} color={color} />
    ),
  }}
/>
```

## State Management

### Auth Store Integration
```typescript
interface AuthState {
  user: Auth.User | null;           // Current user data
  token: string | null;             // JWT token
  isLoading: boolean;               // Loading state
  isAuthenticated: boolean;         // Auth status
  logout: () => Promise<void>;      // Logout function
}
```

### Local State
```typescript
const [isLoggingOut, setIsLoggingOut] = useState(false);  // Logout loading state
```

## Styling

### Colors
- Primary: #2563EB (blue) - Icons and accents
- Danger: #ef4444 / #f87171 - Logout button
- Admin Role: #dc2626 (red)
- Moderator Role: #ea580c (orange)
- Employee Role: #0891b2 (cyan)

### Layout
- Header card: 80px avatar, centered text
- Field containers: Icon (20px) + label + value
- Logout button: Full-width with icon and text
- Spacing: 16px margins, 12-16px padding

## Testing

### Test Profile Display
```typescript
describe('ProfileScreen', () => {
  it('should display user information', () => {
    const user: Auth.User = {
      id: 'user-123',
      fullName: 'John Doe',
      email: 'john@example.com',
      role: 'employee',
      authProvider: 'local',
      createdAt: '2026-01-15T10:00:00Z',
      updatedAt: '2026-02-05T10:00:00Z',
    };

    // Verify user data is displayed
    expect(screen.getByText('John Doe')).toBeDefined();
    expect(screen.getByText('john@example.com')).toBeDefined();
    expect(screen.getByText('Employee')).toBeDefined();
  });

  it('should show logout confirmation on logout press', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    
    fireEvent.press(screen.getByText('Logout'));
    
    expect(alertSpy).toHaveBeenCalledWith(
      'Logout',
      'Are you sure you want to logout?',
      expect.any(Array)
    );
  });
});
```

### Test Logout Flow
```typescript
describe('Logout functionality', () => {
  it('should call logout on confirmation', async () => {
    const { logout } = useAuthStore();
    const logoutSpy = jest.spyOn(useAuthStore, 'logout');

    fireEvent.press(screen.getByText('Logout'));
    fireEvent.press(screen.getByText('Logout'));  // Confirm

    expect(logoutSpy).toHaveBeenCalled();
  });

  it('should show loading state during logout', async () => {
    fireEvent.press(screen.getByText('Logout'));
    fireEvent.press(screen.getByText('Logout'));

    expect(screen.getByTestId('logout-loading')).toBeDefined();
  });
});
```

## Accessibility

### Icons with Labels
- Every icon is paired with descriptive text
- Field labels use uppercase with letter spacing for clarity
- Role badge shows text name (Admin, Moderator, Employee)

### Colors
- Role badges use distinct colors for visual differentiation
- High contrast between text and background
- Logout button uses red for clear danger signal

### Touch Targets
- Logout button: 44px+ height for easy tapping
- Full-width button for accessibility

## MVP Constraints

✅ **What's Included**:
- View all user profile information
- Logout with confirmation
- Light/dark theme support
- Formatted dates and role badges
- Loading states

❌ **Not Included (Future)**:
- Edit profile information
- Change password
- Account settings
- Privacy preferences
- Notification settings
- Two-factor authentication setup

## Integration Notes

1. **No Backend Profile Update**: Profile information is read-only from user object in auth store
2. **Logout Cleans Up WebSocket**: The auth store's logout function disconnects DM socket
3. **Navigation Auto-Redirect**: Root layout handles redirect to login after logout
4. **Token Cleared**: AsyncStorage token is cleared on logout via auth store
5. **Session Persisted**: User data cached in AsyncStorage for session restore

## Performance Considerations

1. **ScrollView**: Used to accommodate profile info on smaller screens
2. **Loading State**: Shows immediately while user data is being fetched
3. **No Network Calls**: Profile data comes from already-cached auth store
4. **Confirmation Alert**: Prevents accidental logout

## File Structure
```
app/(tabs)/
  profile.tsx                   - Profile screen component
src/api/
  auth.ts                       - Auth API (already exists)
src/store/
  auth.store.ts                 - Auth store with logout (already exists)
constants/
  theme.ts                      - Theme colors (already exists)
```

## Key Features Summary

✅ Display user profile information  
✅ Show role with color-coded badge  
✅ Format dates for readability  
✅ Logout with confirmation alert  
✅ Loading state during logout  
✅ Light/dark theme support  
✅ Read-only MVP (no editing)  
✅ Auto-redirect after logout  
✅ WebSocket cleanup on logout  
✅ Responsive layout with ScrollView  
✅ Support contact information display  
✅ App version display  
