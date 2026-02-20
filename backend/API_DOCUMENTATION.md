# MoneyMinds Backend - Complete API Documentation

## Base URL: `http://localhost:5000/api`

---

## 🔐 Authentication Endpoints

### POST `/auth/register`
**Payload:**
```json
{
  "name": "string (min 2 chars)",
  "email": "valid email",
  "password": "string (min 6 chars)",
  "role": "user|admin (optional, default: user)",
  "gradeLevel": "string (optional, default: Grade 1-5)",
  "subjectPreferences": ["Math", "Science", "English"]
}
```

### POST `/auth/login`
**Payload:**
```json
{
  "email": "valid email",
  "password": "string"
}
```

### POST `/auth/forgot-password`
**Payload:**
```json
{
  "email": "valid email"
}
```

### POST `/auth/verify-reset-code`
**Payload:**
```json
{
  "email": "valid email",
  "code": "6-digit string"
}
```

### POST `/auth/reset-password`
**Payload:**
```json
{
  "email": "valid email",
  "code": "6-digit string",
  "newPassword": "string (min 6 chars)",
  "confirmPassword": "string (min 6 chars)"
}
```

### GET `/auth/google` - Google OAuth (no payload)
### GET `/auth/facebook` - Facebook OAuth (no payload)
### GET `/auth/apple` - Apple OAuth (no payload)

---

## 👤 User Management Endpoints

### GET `/users/profile` - Get user profile (Auth required)
**No payload**

### PUT `/users/profile` - Update user profile (Auth required)
**Payload:**
```json
{
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "bio": "string (optional)",
  "gender": "string (optional)",
  "email": "string (optional)",
  "phoneNumber": "string (optional)",
  "dateOfBirth": "date (optional)",
  "school": "string (optional)",
  "college": "string (optional)",
  "city": "string (optional)",
  "country": "string (optional)",
  "avatar": "string (optional)",
  "gradeLevel": "string (optional)",
  "subjectPreferences": ["array of strings (optional)"]
}
```

### GET `/users/leaderboard` - Get coin leaderboard (Auth required)
**No payload**

### GET `/users/dashboard` - Get dashboard data (Auth required)
**No payload**

### POST `/users/withdraw` - Request withdrawal (Auth required)
**Payload:**
```json
{
  "amount": "number (min 5000)",
  "currency": "PKR|USD",
  "method": "JazzCash|Easypaisa|Bank|PayPal|Stripe",
  "accountDetails": {
    "accountNumber": "string",
    "accountTitle": "string",
    "bankName": "string (for bank transfers)",
    "email": "string (for PayPal)"
  }
}
```

### GET `/users/withdrawals` - Get user withdrawals (Auth required)
**No payload**

---

## 📝 Quiz Management Endpoints

### GET `/quizzes` - Get all quizzes
**Query Parameters:**
- `subject` (optional)
- `gradeLevel` (optional)
- `page` (optional, default: 1)
- `limit` (optional, default: 10)

### GET `/quizzes/:id` - Get quiz by ID
**No payload**

### POST `/quizzes` - Create new quiz (Auth required)
**Payload:**
```json
{
  "title": "string",
  "description": "string",
  "subject": "string",
  "gradeLevel": "string",
  "timeLimit": "number (minutes)",
  "totalQuestions": "number",
  "passingScore": "number",
  "isActive": "boolean (optional, default: true)",
  "tags": ["array of strings (optional)"]
}
```

### PUT `/quizzes/:id` - Update quiz (Auth required)
**Same payload as create quiz**

### DELETE `/quizzes/:id` - Delete quiz (Auth required)
**No payload**

### GET `/quizzes/:id/stats` - Get quiz statistics
**No payload**

---

## ❓ Question Management Endpoints

### GET `/questions/quiz/:quizId` - Get questions for quiz (without answers)
**No payload**

### GET `/questions/quiz/:quizId/admin` - Get questions with answers (Auth required)
**No payload**

### POST `/questions` - Create new question (Auth required)
**Payload:**
```json
{
  "quizId": "ObjectId",
  "questionText": "string",
  "questionType": "multiple-choice|short-answer",
  "options": [
    {
      "text": "string",
      "isCorrect": "boolean"
    }
  ],
  "correctAnswer": "string (for short-answer)",
  "explanation": "string",
  "gradeLevel": "string",
  "points": "number (default: 1)",
  "order": "number"
}
```

### POST `/questions/bulk` - Bulk create questions (Auth required)
**Payload:**
```json
{
  "quizId": "ObjectId",
  "questions": [
    {
      "questionText": "string",
      "questionType": "multiple-choice|short-answer",
      "options": [{"text": "string", "isCorrect": "boolean"}],
      "explanation": "string",
      "points": "number"
    }
  ]
}
```

### PUT `/questions/:id` - Update question (Auth required)
**Same payload as create question**

### DELETE `/questions/:id` - Delete question (Auth required)
**No payload**

---

## 🎯 Quiz Attempt Endpoints

### POST `/attempts/start` - Start quiz attempt (Auth required)
**Payload:**
```json
{
  "quizId": "ObjectId"
}
```

### POST `/attempts/answer` - Submit answer (Auth required)
**Payload:**
```json
{
  "attemptId": "ObjectId",
  "questionId": "ObjectId",
  "selectedAnswer": "string",
  "timeSpent": "number (seconds)"
}
```

### POST `/attempts/complete` - Complete quiz attempt (Auth required)
**Payload:**
```json
{
  "attemptId": "ObjectId"
}
```

### GET `/attempts/user` - Get user attempts (Auth required)
**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)

### GET `/attempts/:id` - Get attempt details (Auth required)
**No payload**

### GET `/attempts/leaderboard/:quizId` - Get quiz leaderboard
**Query Parameters:**
- `limit` (optional, default: 10)

---

## 📚 Category Endpoints

### GET `/categories` - Get all categories
**No payload**

### POST `/categories` - Create category (Auth required)
**Payload:**
```json
{
  "name": "string",
  "description": "string",
  "icon": "string (optional)",
  "isActive": "boolean (optional, default: true)"
}
```

### PUT `/categories/:id` - Update category (Auth required)
**Same payload as create category**

### DELETE `/categories/:id` - Delete category (Auth required)
**No payload**

---

## 🤖 AI Features Endpoints

### GET `/ai/suggestions` - Get AI quiz suggestions (Auth required)
**No payload**

### GET `/ai/analytics` - Get AI performance analytics (Auth required)
**No payload**

### POST `/ai/generate-questions` - Generate AI questions (Auth required)
**Payload:**
```json
{
  "subject": "string",
  "gradeLevel": "string",
  "count": "number (optional, default: 10)",
  "questionType": "multiple-choice|short-answer (optional, default: multiple-choice)"
}
```

### POST `/ai/create-quiz` - Create complete AI quiz (Auth required)
**Payload:**
```json
{
  "topic": "string",
  "difficulty": "Easy|Medium|Hard",
  "questionCount": "number (optional, default: 10)",
  "category": "string (optional)"
}
```

### POST `/ai/generate-metadata` - Generate quiz metadata (Auth required)
**Payload:**
```json
{
  "topic": "string",
  "difficulty": "Easy|Medium|Hard",
  "questionCount": "number"
}
```

---

## 🏆 Achievement Endpoints

### GET `/achievements` - Get all achievements (Auth required)
**No payload**

### GET `/achievements/user` - Get user achievements (Auth required)
**No payload**

---

## 💰 Transaction Endpoints

### POST `/transactions` - Create transaction (Auth required)
**Payload:**
```json
{
  "type": "income|expense",
  "category": "string",
  "amount": "number",
  "description": "string",
  "paymentMethod": "string"
}
```

### GET `/transactions` - Get transactions (Auth required)
**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)
- `type` (optional)
- `category` (optional)

### DELETE `/transactions/:id` - Delete transaction (Auth required)
**No payload**

---

## 💳 Stripe Integration Endpoints

### POST `/stripe/add-card` - Add Stripe card (Auth required)
**Payload:**
```json
{
  "cardToken": "string",
  "email": "string"
}
```

### GET `/stripe/status` - Get Stripe status (Auth required)
**No payload**

### POST `/stripe/withdraw` - Request Stripe withdrawal (Auth required)
**Payload:**
```json
{
  "amount": "number (min 5000 coins)"
}
```

### POST `/stripe/process/:withdrawalId` - Process Stripe withdrawal (Admin only)
**No payload**

---

## 🔧 Admin Panel Endpoints

### GET `/admin/stats` - Get dashboard stats (Admin only)
**No payload**

### GET `/admin/users` - Get all users (Admin only)
**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)
- `search` (optional)

### GET `/admin/users/:id` - Get user details (Admin only)
**No payload**

### GET `/admin/export/users` - Export users CSV (Admin only)
**No payload**

### GET `/admin/export/withdrawals` - Export withdrawals CSV (Admin only)
**No payload**

### GET `/admin/export/quiz-data` - Export quiz data CSV (Admin only)
**No payload**

---

## 💸 Admin Withdrawal Management

### GET `/admin/withdrawals` - Get all withdrawals (Admin only)
**Query Parameters:**
- `status` (optional)
- `page` (optional, default: 1)
- `limit` (optional, default: 10)

### PUT `/admin/withdrawals/:id/status` - Update withdrawal status (Admin only)
**Payload:**
```json
{
  "status": "pending|approved|rejected|completed",
  "adminNotes": "string (optional)"
}
```

### PUT `/admin/withdrawals/:id/approve` - Approve withdrawal (Admin only)
**Payload:**
```json
{
  "adminNotes": "string (optional)"
}
```

### PUT `/admin/withdrawals/:id/reject` - Reject withdrawal (Admin only)
**Payload:**
```json
{
  "adminNotes": "string (optional)"
}
```

---

## 🧪 Test Endpoints

### POST `/test-email` - Test email service
**Payload:**
```json
{
  "email": "string"
}
```

### GET `/test-stripe` - Test Stripe configuration
**No payload**

---

## 🔒 Authentication Headers

For protected routes, include:
```
Authorization: Bearer <JWT_TOKEN>
```

## 💰 Coin Reward System

- **10 coins** per correct answer
- **50 bonus coins** for perfect score (100%)
- **25 bonus coins** for fast completion (under 60% of time limit)
- **Minimum withdrawal**: 5000 coins

## 📊 Response Format

All API responses follow this format:
```json
{
  "message": "Success/Error message",
  "data": "Response data (varies by endpoint)",
  "error": "Error details (only on errors)"
}
```

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables in `.env`
4. Start the server: `npm run dev`
5. API will be available at `http://localhost:5000/api`

## 📝 Notes

- All timestamps are in ISO 8601 format
- ObjectIds are MongoDB ObjectId strings
- File uploads not yet implemented
- Rate limiting not implemented
- API versioning not implemented

---

*Last updated: $(date)*