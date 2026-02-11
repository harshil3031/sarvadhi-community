/*
You are building a production-level React Native (Expo) corporate community application called "Sarvadhi Community".

TECH STACK:
- React Native
- TypeScript
- Pure StyleSheet (NO Tailwind, NO UI libraries)
- Light + Dark theme support
- Modular reusable components
- Clean production-level architecture

APP PURPOSE:
This is an internal company community platform that combines:
- Corporate collaboration (channels, structured discussions)
- Personal engagement (employee achievements, announcements)
- Direct messaging
- Reactions and comments
- Notifications
- Profile management

The UI must feel:
- Professional (corporate tool)
- Modern (SaaS-like)
- Clean
- Friendly but not playful
- Consistent spacing and typography
- High readability
- Light & Dark mode adaptive

ARCHITECTURE RULES:

1. Create centralized theme system:
   - src/theme/colors.ts
   - src/theme/spacing.ts
   - src/theme/typography.ts
   - src/theme/radius.ts
   - src/theme/shadows.ts
   - src/theme/index.ts (export combined theme)
   - src/theme/ThemeProvider.tsx (context-based theme switch)

2. Create reusable base components:
   - BaseButton
   - BaseCard
   - BaseInput
   - Avatar
   - ScreenContainer
   - Divider
   - TagBadge
   - ReactionBar

3. Every screen must:
   - Use ScreenContainer
   - Use centralized theme values
   - Avoid hardcoded numbers
   - Use consistent spacing scale
   - Support dark mode
   - Use StyleSheet.create
   - Be fully typed with TypeScript

4. Design System Constraints:
   - Spacing scale: 4, 8, 16, 24, 32
   - Border radius scale: 8, 12, 16
   - Typography scale:
       Title: 20
       Subtitle: 16
       Body: 14
       Caption: 12
   - Card padding: 16
   - Screen padding: 16

5. Visual Style:
   - Rounded cards (16)
   - Soft shadows
   - Light background in light mode
   - Deep slate background in dark mode
   - Subtle separators
   - No heavy borders

6. Navigation structure (bottom tabs):
   - Home (Feed)
   - Channels
   - Messages
   - Notifications
   - Profile

7. Feed must include:
   - CreatePostCard
   - PostCard
   - ReactionBar
   - Comment preview
   - Tag for Announcement / Achievement

8. Channels screen:
   - Channel list
   - Unread indicator
   - Create channel button
   - Search bar

9. Messages:
   - Chat list
   - Chat screen
   - Message bubbles (left/right)
   - Typing indicator
   - Online indicator

10. Profile:
   - Avatar
   - Name + role
   - Stats row
   - Edit button
   - Activity list

IMPORTANT:
Do not generate everything in one file.
Generate structured files inside src/ folder.
Keep code clean and scalable.
*/
