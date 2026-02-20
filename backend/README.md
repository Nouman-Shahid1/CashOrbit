# MoneyMinds Backend API

A Node.js Express backend with MongoDB for the MoneyMinds AI-powered quiz application with "Learn to Earn" reward system.

## Features

- User authentication (register/login/forgot password)
- Grade & Subject-based quiz system (Grade 1-12)
- AI-powered quiz generation (10 questions, 30s each, 5min total)
- Coin reward system ("Learn to Earn")
- Withdrawal system (JazzCash/Easypaisa/Bank/PayPal)
- User profiles with grade level and subject preferences
- Quiz history and performance tracking
- Dashboard with progress analytics
- Real-time scoring with bonus rewards
- AI-powered recommendations for weak topics
- Admin withdrawal management
- JWT-based authentication

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/moneyminds
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

3. Start MongoDB service

4. Run the server:
```bash
npm run dev  # Development mode
npm start    # Production mode
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (name, email, password, gradeLevel, subjectPreferences)
- `POST /api/auth/login` - Login user (email, password)
- `POST /api/auth/forgot-password` - Send password reset code to email
- `POST /api/auth/verify-reset-code` - Verify password reset code
- `POST /api/auth/reset-password` - Reset password with new password
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/facebook` - Facebook OAuth login
- `GET /api/auth/apple` - Apple OAuth login

### Users
- `GET /api/users/profile` - Get user profile (includes grade, subjects, quiz history, coin wallet)
- `PUT /api/users/profile` - Update user profile (grade, subjects, personal info)
- `GET /api/users/dashboard` - Get dashboard with performance analytics
- `GET /api/users/leaderboard` - Get coin-based leaderboard
- `POST /api/users/withdraw` - Request coin withdrawal
- `GET /api/users/withdrawals` - Get user withdrawal history

### Quizzes
- `GET /api/quizzes` - Get all quizzes (with filters: subject, gradeLevel, pagination)
- `GET /api/quizzes/:id` - Get quiz by ID
- `POST /api/quizzes` - Create new quiz (auth required)
- `PUT /api/quizzes/:id` - Update quiz (auth required)
- `DELETE /api/quizzes/:id` - Delete quiz (auth required)
- `GET /api/quizzes/:id/stats` - Get quiz statistics

### Questions
- `GET /api/questions/quiz/:quizId` - Get questions for a quiz (without answers)
- `GET /api/questions/quiz/:quizId/admin` - Get questions with answers (auth required)
- `POST /api/questions` - Create new question (auth required)
- `POST /api/questions/bulk` - Bulk create questions (auth required)
- `PUT /api/questions/:id` - Update question (auth required)
- `DELETE /api/questions/:id` - Delete question (auth required)

### Quiz Attempts
- `POST /api/attempts/start` - Start a new quiz attempt (auth required)
- `POST /api/attempts/answer` - Submit answer for a question (earns 10 coins if correct)
- `POST /api/attempts/complete` - Complete quiz attempt (calculates bonus coins)
- `GET /api/attempts/user` - Get user's quiz attempts (auth required)
- `GET /api/attempts/:id` - Get attempt details (auth required)
- `GET /api/attempts/leaderboard/:quizId` - Get coin-based leaderboard for a quiz

### Categories
- `GET /api/categories` - Get all subjects
- `POST /api/categories` - Create new subject (auth required)
- `PUT /api/categories/:id` - Update subject (auth required)
- `DELETE /api/categories/:id` - Delete subject (auth required)

### AI Features
- `GET /api/ai/suggestions` - Get AI-powered quiz suggestions based on weak subjects
- `GET /api/ai/analytics` - Get performance analytics with AI insights
- `POST /api/ai/generate-questions` - Generate 10 questions using AI (subject, gradeLevel)
- `POST /api/ai/create-quiz` - Create complete AI-generated quiz
- `POST /api/ai/generate-metadata` - Generate quiz title and description

### Achievements
- `GET /api/achievements` - Get all achievements
- `GET /api/achievements/user` - Get user achievements

### Admin Panel
- `GET /api/admin/stats` - Get dashboard statistics (admin only)
- `GET /api/admin/users` - Get all users with pagination and search (admin only)
- `GET /api/admin/users/:id` - Get user details with history (admin only)
- `GET /api/admin/export/users` - Export users data as CSV (admin only)
- `GET /api/admin/export/withdrawals` - Export withdrawals data as CSV (admin only)
- `GET /api/admin/export/quiz-data` - Export quiz attempts data as CSV (admin only)

### Admin - Withdrawals
- `GET /api/admin/withdrawals` - Get all withdrawal requests (admin only)
- `PUT /api/admin/withdrawals/:id/status` - Update withdrawal status (admin only)
- `PUT /api/admin/withdrawals/:id/approve` - Approve withdrawal (admin only)
- `PUT /api/admin/withdrawals/:id/reject` - Reject withdrawal (admin only)

## Coin Reward System

### Earning Coins
- **10 coins** per correct answer
- **50 bonus coins** for perfect score (100%)
- **25 bonus coins** for fast completion (under 60% of time limit)

### Withdrawal System
- Minimum withdrawal: **5000 coins**
- Supported methods: JazzCash, Easypaisa, Bank Transfer (PKR), PayPal (USD)
- Admin approval required

## Grade & Subject System

### Grade Levels
- Grade 1-5 (Elementary)
- Grade 6-8 (Middle School)
- Grade 9-10 (High School)
- Grade 11-12 (Senior High)

### Subjects
- Math, Science, English, History, Geography, Literature, Technology, Sports, General Knowledge

## Quiz System
- **10 questions** per quiz (AI-generated)
- **30 seconds** per question
- **5 minutes** total time limit
- Multiple choice and short answer questions
- AI checks open-ended answers intelligently

## Email Configuration

For forgot password functionality, configure Gmail SMTP:
1. Enable 2-factor authentication on Gmail
2. Generate an App Password
3. Add to .env:
```
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_digit_app_password
```