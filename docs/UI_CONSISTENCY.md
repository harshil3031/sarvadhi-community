# UI Consistency Guidelines

## Design System Overview

This document outlines the mobile-first, simple UI design system used across the Sarvadhi Community app. The system prioritizes consistency, reusability, and ease of implementation over complex theming.

### Key Principles
- **Mobile-First**: All layouts designed for mobile devices first
- **Simple**: Minimal complexity, clean interfaces
- **Reusable**: Component-based architecture for consistency
- **No Complex Theming**: Light mode only in MVP (dark mode NOT required)
- **Accessible**: Proper touch targets, clear hierarchy

## Design Constants

All design values are centralized in `src/constants/design.ts` for easy maintenance.

### Colors

```typescript
Colors = {
  primary: '#2563EB',       // Main blue - primary actions
  primaryLight: '#e3f2fd',  // Light blue - backgrounds
  background: '#FFFFFF',    // Card/section backgrounds
  surface: '#F9FAFB',       // Light gray - input backgrounds
  border: '#E5E7EB',        // Borders and dividers
  text: '#000000',          // Primary text
  textSecondary: '#6B7280', // Secondary text/muted
  textTertiary: '#9CA3AF',  // Light gray text
  disabled: '#D1D5DB',      // Disabled state
  placeholder: '#9CA3AF',   // Input placeholders
  success: '#10B981',       // Success state
  warning: '#F59E0B',       // Warning state
  danger: '#EF4444',        // Error/destructive
  info: '#3B82F6',          // Info state
}
```

### Spacing Scale

```typescript
Spacing = {
  xs: 4,      // Minimal gaps
  sm: 8,      // Small gaps
  md: 12,     // Default gap
  lg: 16,     // Large gap
  xl: 24,     // Extra large
  xxl: 32,    // Extra extra large
}
```

Used consistently for:
- Padding inside components
- Margins between elements
- Gaps in flexbox layouts

### Border Radius

```typescript
BorderRadius = {
  sm: 4,      // Subtle corners
  md: 8,      // Default radius
  lg: 12,     // Larger cards
  xl: 16,     // Modal corners
  full: 999,  // Circles/pills
}
```

### Typography

```typescript
Typography = {
  headingXL: { fontSize: 28, fontWeight: '700' },  // Page titles
  headingLg: { fontSize: 24, fontWeight: '700' },  // Section titles
  headingMd: { fontSize: 20, fontWeight: '600' },  // Card titles
  headingSm: { fontSize: 18, fontWeight: '600' },  // Subsections
  
  bodyLg: { fontSize: 16, fontWeight: '400' },     // Main text
  bodyMd: { fontSize: 14, fontWeight: '400' },     // Secondary text
  bodySm: { fontSize: 13, fontWeight: '400' },     // Small text
  
  labelMd: { fontSize: 14, fontWeight: '500' },    // Form labels
  labelSm: { fontSize: 12, fontWeight: '500' },    // Small labels
}
```

### Shadows

Simple, subtle shadows for depth:

```typescript
Shadows = {
  sm: { shadowOpacity: 0.05, elevation: 1 },  // Subtle
  md: { shadowOpacity: 0.1, elevation: 2 },   // Default
  lg: { shadowOpacity: 0.15, elevation: 4 },  // Prominent
}
```

### Component Sizes

```typescript
Sizes = {
  buttonHeight: 44,        // Minimum touch target (Apple/Android standards)
  inputHeight: 44,
  iconSmall: 16,
  iconMd: 20,             // Default icon size
  iconLg: 24,
  iconXl: 32,
  avatarSmall: 32,
  avatarMd: 48,           // Default avatar
  avatarLg: 64,
}
```

## Reusable Components

### Button Component

**Location**: `components/ui/Button.tsx`

**Variants**: `primary` | `secondary` | `danger` | `ghost`

**Sizes**: `sm` | `md` | `lg`

**Basic Usage**:
```tsx
import Button from '../components/ui/Button';

<Button
  label="Submit"
  onPress={() => handleSubmit()}
  variant="primary"
  size="md"
/>
```

**With Icon**:
```tsx
<Button
  label="Send"
  onPress={handleSend}
  variant="primary"
  icon="send"
  iconPosition="right"
/>
```

**Disabled/Loading**:
```tsx
<Button
  label="Loading..."
  onPress={handleAction}
  disabled={isLoading}
  loading={isLoading}
/>
```

**Full Width**:
```tsx
<Button
  label="Sign In"
  onPress={handleSignIn}
  fullWidth
/>
```

### Card Component

**Location**: `components/ui/Card.tsx`

**Padding Options**: `sm` | `md` | `lg` | `none`

**Shadow Options**: `sm` | `md` | `lg` | `none`

**Basic Usage**:
```tsx
import Card from '../components/ui/Card';

<Card padding="md" shadow="sm">
  <Text>Card content</Text>
</Card>
```

**No Border**:
```tsx
<Card border={false}>
  <Text>Content without border</Text>
</Card>
```

**Custom Styling**:
```tsx
<Card
  padding="lg"
  shadow="md"
  style={{ marginHorizontal: 16 }}
>
  {children}
</Card>
```

### Input Component

**Location**: `components/ui/Input.tsx`

**Basic Usage**:
```tsx
import Input from '../components/ui/Input';

<Input
  label="Email"
  placeholder="Enter your email"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
/>
```

**With Icon**:
```tsx
<Input
  label="Password"
  placeholder="Enter password"
  icon="lock-closed-outline"
  secureTextEntry
  value={password}
  onChangeText={setPassword}
/>
```

**With Error**:
```tsx
<Input
  label="Username"
  value={username}
  onChangeText={setUsername}
  error={validationError}  // Shows error message below
/>
```

## Design Patterns

### Consistent Spacing

All screens should use consistent spacing:

```tsx
<View style={{ padding: Spacing.lg }}>          // 16px
  <Text>Main content</Text>
  <View style={{ marginTop: Spacing.md }}>      // 12px gap
    <Button label="Action" />
  </View>
</View>
```

### List Items

Standard list item pattern:

```tsx
<TouchableOpacity
  style={{
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  }}
>
  <View style={{ width: 48, height: 48, backgroundColor: Colors.primaryLight }} />
  <View style={{ flex: 1 }}>
    <Text style={{ fontWeight: '600' }}>Title</Text>
    <Text style={{ color: Colors.textSecondary, fontSize: 14 }}>Subtitle</Text>
  </View>
  <Ionicons name="chevron-forward" color={Colors.textTertiary} />
</TouchableOpacity>
```

### Modal/Dialog Patterns

For modals and overlays:

```tsx
<Modal transparent>
  <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.lg,
      }}
    >
      <Card padding="lg" shadow="lg">
        <Text style={{ fontSize: 18, fontWeight: '600' }}>Dialog Title</Text>
        <Text style={{ marginTop: Spacing.md, color: Colors.textSecondary }}>
          Content here
        </Text>
        <View
          style={{
            flexDirection: 'row',
            gap: Spacing.md,
            marginTop: Spacing.lg,
          }}
        >
          <Button label="Cancel" variant="secondary" />
          <Button label="Confirm" variant="primary" />
        </View>
      </Card>
    </View>
  </View>
</Modal>
```

### Empty States

Consistent empty state pattern:

```tsx
<View
  style={{
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  }}
>
  <Ionicons
    name="inbox-outline"
    size={64}
    color={Colors.textTertiary}
  />
  <Text
    style={{
      fontSize: 18,
      fontWeight: '600',
      color: Colors.text,
      marginTop: Spacing.md,
    }}
  >
    No Items
  </Text>
  <Text
    style={{
      fontSize: 14,
      color: Colors.textSecondary,
      marginTop: Spacing.sm,
      textAlign: 'center',
    }}
  >
    No items to display
  </Text>
</View>
```

### Loading States

Consistent loading indicator:

```tsx
<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  <ActivityIndicator size="large" color={Colors.primary} />
  <Text style={{ marginTop: Spacing.md, color: Colors.textSecondary }}>
    Loading...
  </Text>
</View>
```

### Error Display

Consistent error messaging:

```tsx
<View
  style={{
    backgroundColor: '#FEF2F2',
    borderColor: Colors.danger,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  }}
>
  <Text style={{ color: Colors.danger, fontWeight: '500' }}>
    Error occurred
  </Text>
  <Text
    style={{
      color: Colors.danger,
      fontSize: 14,
      marginTop: Spacing.sm,
    }}
  >
    {errorMessage}
  </Text>
</View>
```

## Screen Structure

### Standard Mobile Screen Layout

```
┌─────────────────────────┐
│     Header/Title        │  Height: auto
├─────────────────────────┤
│                         │
│     Main Content        │  Flex: 1 (scrollable)
│                         │
├─────────────────────────┤
│   Action Buttons        │  Height: auto
└─────────────────────────┘
```

### Screen Padding

- **Horizontal**: Always `Spacing.lg` (16px) from edges
- **Top**: `Spacing.md` (12px)
- **Bottom**: `Spacing.lg` (16px)
- **Between sections**: `Spacing.xl` (24px)

## Mobile-First Considerations

### Touch Targets
- Minimum 44x44 points (Apple Human Interface Guidelines)
- Use `Sizes.buttonHeight` (44) for buttons
- Adequate spacing (minimum 8px) between interactive elements

### Viewport
- Design for: 360px - 428px width (common phones)
- Use flexible layouts (flex, percentages)
- Avoid fixed widths > 80% screen width

### Scrollable Content
- Use `ScrollView` with `contentContainerStyle={{ paddingBottom: 32 }}`
- Add proper bottom padding for fixed buttons
- Use `KeyboardAvoidingView` for forms

### Performance
- Simple shadows (use `Shadows` constants)
- Limit animation complexity
- Use reusable components to reduce bundle size

## Implementation Checklist

When building new screens:

- [ ] Use design constants from `src/constants/design.ts`
- [ ] Use reusable components (`Button`, `Card`, `Input`)
- [ ] Consistent spacing using `Spacing` values
- [ ] Proper typography from `Typography` constants
- [ ] Mobile-first layout (no landscape-specific code)
- [ ] Minimum 44pt touch targets
- [ ] Proper error/empty/loading states
- [ ] Consistent color usage
- [ ] Proper screen padding/margins
- [ ] ScrollView with proper content insets

## Future Extensions

These could be added later (NOT in MVP):

- [ ] Dark mode support
- [ ] RTL layout
- [ ] Custom fonts
- [ ] Advanced animations
- [ ] Responsive breakpoints
- [ ] Haptic feedback
- [ ] Custom theme personalization

## Common Mistakes to Avoid

❌ **Don't**:
- Use hardcoded colors instead of `Colors` constants
- Use arbitrary spacing instead of `Spacing` scale
- Create new button styles instead of using `Button` component
- Use different shadows for similar elements
- Inconsistent border radius values
- Different icon sizes in similar contexts
- Inconsistent typography styling

✅ **Do**:
- Reference design constants
- Use reusable components
- Keep layouts simple and flat
- Use consistent spacing patterns
- Center align text in buttons/cards
- Use icons from `@expo/vector-icons` (Ionicons)
- Test touch target sizes on actual devices

## Resources

- **Design Constants**: `src/constants/design.ts`
- **Button Component**: `components/ui/Button.tsx`
- **Card Component**: `components/ui/Card.tsx`
- **Input Component**: `components/ui/Input.tsx`
- **Design Tokens**: All values centralized and documented
