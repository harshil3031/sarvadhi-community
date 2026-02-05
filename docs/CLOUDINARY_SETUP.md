# Cloudinary Setup Guide

## Profile Image Upload Configuration

This app uses Cloudinary to store user profile photos. Follow these steps to set it up:

### 1. Create a Cloudinary Account

1. Go to [https://cloudinary.com/](https://cloudinary.com/)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your Credentials

1. Log in to your Cloudinary dashboard
2. Find your **Cloud Name** (shown at the top of the dashboard)
3. Navigate to **Settings → Upload**
4. Create an **Upload Preset**:
   - Click "Add upload preset"
   - Set **Signing Mode** to "Unsigned" (for direct uploads from mobile)
   - Set **Folder** to something like "sarvadhi-community/profiles"
   - Configure transformations if needed (e.g., auto-resize to 500x500)
   - Save the preset and copy the **Preset Name**

### 3. Update Environment Variables

Add these to your `.env.local` file:

```env
# Cloudinary Configuration
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset_name_here
```

### 4. Test the Upload

1. Restart your Expo development server: `npm start`
2. Open the app on your device
3. Go to the Profile tab
4. Tap the camera icon on your profile picture
5. Choose to take a photo or select from gallery
6. The image should upload to Cloudinary and update your profile

### Security Considerations

**For Production:**
- Use **signed uploads** instead of unsigned presets
- Implement server-side upload signing
- Set up folder permissions and access controls
- Enable moderation features if needed
- Set upload limits and file size restrictions

### Troubleshooting

**"Cloudinary configuration missing" error:**
- Make sure you've set both environment variables
- Restart Expo after adding env vars (`npx expo start -c`)

**Upload fails:**
- Check your Cloudinary upload preset is set to "Unsigned"
- Verify the cloud name is correct
- Check network connectivity
- Look at the browser/app console for detailed error messages

**Image doesn't show after upload:**
- Check the backend is saving the `profilePhotoUrl` correctly
- Verify the Cloudinary URL is publicly accessible
- Try refreshing the profile screen

### Example Cloudinary URLs

Your images will be stored at URLs like:
```
https://res.cloudinary.com/your_cloud_name/image/upload/v1234567890/sarvadhi-community/profiles/abc123.jpg
```

### Free Tier Limits

Cloudinary's free tier includes:
- 25 GB storage
- 25 GB bandwidth/month
- 25,000 transformations/month

This should be more than enough for development and small-scale production.
