# MoodMeal - Meal and Symptom Tracker

A React Native app built with Expo that helps users track their meals and symptoms to identify potential food-related health patterns.

## Features

- **Authentication**: Secure user registration and login with Supabase
- **Profile Management**: Create and edit user profiles with medical history
- **Meal Logging**: Track meals with ingredients, descriptions, and meal times
- **Symptom Tracking**: Log symptoms with severity ratings and descriptions
- **Calendar View**: Monthly visualization of meals and symptoms
- **Quick Logging**: Fast symptom logging with preset options
- **Data Export**: Export all data as PDF for sharing with healthcare providers
- **Settings**: Change password and manage account

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL database, Authentication, Real-time)
- **Navigation**: React Navigation v6
- **UI Components**: React Native Paper, React Native Calendars
- **State Management**: React Context API
- **TypeScript**: Full type safety

## Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Supabase account

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd MoodMeal
npm install
```

### 2. Set up Environment Variables

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Create a new project at [supabase.com](https://supabase.com)
3. Go to Settings > API to get your project URL and anon key
4. Update `.env` with your credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 4. Run the App

```bash
npm start
```

This will start the Expo development server. You can then:
- Press `i` to open iOS simulator
- Press `a` to open Android emulator
- Scan the QR code with Expo Go app on your phone

## Usage

1. **Sign Up**: Create an account with email and password
2. **Create Profile**: Add your personal information and medical history
3. **Log Meals**: Record what you eat with ingredients and meal times
4. **Track Symptoms**: Log any symptoms with severity ratings
5. **View Calendar**: See patterns in your data over time
6. **Export Data**: Generate PDF reports to share with healthcare providers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.

## Support

For support or questions, please open an issue in the GitHub repository.

## Demo
