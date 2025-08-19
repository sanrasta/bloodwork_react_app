# 🩸 Bloodwork Analysis Platform

A complete AI-powered bloodwork analysis platform built with **React Native** and **NestJS**. Upload PDF bloodwork results, get AI-powered health recommendations, and track your health insights over time.

## 🎯 Overview

This platform provides a complete end-to-end solution for bloodwork analysis:

- **📱 React Native App**: Modern mobile interface for uploading and viewing results
- **🖥️ NestJS Backend**: Enterprise-grade API with AI integration and background processing
- **🤖 AI Recommendations**: Intelligent health insights based on bloodwork patterns
- **📊 Real-time Processing**: Background job processing with progress tracking

## 🏗️ Architecture

```
📱 React Native Frontend
    ↓ HTTP Requests
🌐 NestJS Backend API
    ↓ Background Jobs
🔄 Redis Queue System
    ↓ Storage
🗄️ SQLite Database
```

## 🚀 Quick Start

**See [QUICK_START.md](./QUICK_START.md) for detailed setup instructions.**

### Prerequisites
- Node.js (v18+)
- Redis
- Expo CLI or React Native development environment

### TL;DR Setup
```bash
# 1. Start Redis
brew services start redis

# 2. Backend (Terminal 1)
cd bloodwork-backend
npm install
npm run start:dev

# 3. Frontend (Terminal 2)  
cd bloodwork_app
npm install
npx expo start
```

## 📁 Project Structure

```
bloodwork_react_app/
├── 📱 bloodwork_app/           # React Native Frontend
│   ├── app/                    # Expo Router pages
│   ├── src/                    # Feature-based architecture
│   │   ├── features/           # Business logic modules
│   │   │   └── bloodwork-results/
│   │   ├── shared/             # Reusable components
│   │   └── lib/                # Core utilities
│   └── package.json
├── 🖥️ bloodwork-backend/       # NestJS Backend
│   ├── src/                    # Feature modules
│   │   ├── uploads/            # File upload handling
│   │   ├── analysis/           # Background processing
│   │   ├── results/            # AI recommendations
│   │   └── common/             # Shared entities/DTOs
│   └── package.json
├── 📋 QUICK_START.md           # Setup instructions
└── 📖 README.md                # This file
```

## ✨ Features

### 📱 Frontend (React Native + Expo)
- **Modern UI**: Clean, intuitive interface for health data
- **File Upload**: Secure PDF bloodwork upload with validation
- **Real-time Updates**: Live progress tracking during analysis
- **AI Insights**: Rich display of health recommendations
- **State Management**: Zustand for complex UI flows
- **Data Fetching**: React Query for server state management

### 🖥️ Backend (NestJS + TypeScript)
- **RESTful API**: Complete HTTP API for all operations
- **Background Jobs**: Redis-powered queue system for AI processing
- **File Management**: Secure upload handling with validation
- **Database**: SQLite with TypeORM for development
- **AI Integration**: Ready for OpenAI or medical AI APIs
- **Real-time Status**: Job progress tracking and polling

## 🔄 MVP Flow

1. **📤 Upload**: User selects PDF bloodwork file
2. **🔬 Analysis**: Background AI processing starts
3. **📊 Progress**: Real-time status updates
4. **📈 Results**: AI-powered health recommendations

## 🧪 API Endpoints

```bash
# File Upload
POST /api/uploads

# Analysis Management  
POST /api/analysis
GET /api/analysis/:jobId

# Results & Insights
GET /api/results/:resultId

# Health & Monitoring
GET /api/health
GET /api/api/info
```

## 🤖 AI Integration

The platform includes a sophisticated AI recommendations system:

- **Medical Context Analysis**: Understands bloodwork relationships
- **Personalized Recommendations**: Context-aware health advice
- **Risk Assessment**: Severity scoring and follow-up timing
- **Safety Features**: Medical disclaimers and professional guidance

**Current**: AI simulation for development and testing
**Future**: Easy integration with OpenAI, medical AI APIs, or custom models

## 🔧 Technology Stack

### Frontend
- **React Native**: Cross-platform mobile development
- **Expo**: Development tools and runtime
- **TypeScript**: Type-safe development
- **Zustand**: State management
- **React Query**: Server state management
- **Zod**: Schema validation

### Backend  
- **NestJS**: Enterprise Node.js framework
- **TypeScript**: Type-safe server development
- **TypeORM**: Database ORM with SQLite
- **Redis + Bull**: Background job processing
- **Multer**: File upload handling
- **Class Validator**: Request validation

## 📊 Development

### Feature-First Architecture
Both frontend and backend use feature-based organization:

```
src/features/bloodwork-results/
├── components/     # UI components
├── hooks/          # Business logic
├── store/          # State management
├── api/            # Server communication
├── types/          # TypeScript interfaces
└── schemas/        # Validation schemas
```

### Development Workflow
1. **Backend**: `npm run start:dev` - Auto-reload on changes
2. **Frontend**: `npx expo start` - Hot reload with Expo
3. **Testing**: Built-in health checks and API testing endpoints

## 🚀 Deployment

### Backend Deployment
- **Database**: Upgrade to PostgreSQL for production
- **Queue**: Redis cluster for scalability
- **Storage**: Cloud file storage (AWS S3, etc.)
- **Monitoring**: Health checks and logging

### Frontend Deployment
- **iOS**: Apple App Store via Expo Application Services
- **Android**: Google Play Store via Expo Application Services
- **Web**: PWA deployment via Expo

## 🔐 Security Features

- **File Validation**: PDF type and size validation
- **CORS Configuration**: Secure cross-origin requests
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Secure error messages
- **Medical Disclaimers**: Appropriate health guidance

## 📈 Scaling Considerations

- **Database**: Easy migration from SQLite to PostgreSQL
- **AI Processing**: Horizontal scaling with Redis clusters
- **File Storage**: Cloud storage integration ready
- **Caching**: Redis caching for performance
- **Load Balancing**: Stateless API design

## 🤝 Contributing

This project uses:
- **TypeScript** for type safety
- **Feature-based architecture** for maintainability
- **Comprehensive documentation** in code
- **Testing-ready structure**

## 📄 License

This project is available for personal and educational use.

## 🆘 Support

- **Setup Issues**: See [QUICK_START.md](./QUICK_START.md)
- **Backend Docs**: See [bloodwork-backend/README.md](./bloodwork-backend/README.md)
- **API Testing**: Built-in endpoints at `/api/health` and `/api/api/info`

---

**🎉 Ready to revolutionize health tracking with AI-powered bloodwork analysis!**

Built with ❤️ using React Native, NestJS, and modern development practices.
