# PAMAHRES

A modern, AI-powered learning management system that helps students create courses, generate quizzes from PDF materials, and get personalized tutoring through an intelligent chatbot.

## 🌟 Features

### 📚 Course Management
- Create and organize courses with custom titles, codes, and descriptions
- Upload PDF materials and documents for each course
- Modern, responsive dashboard with beautiful dark/light mode support

### 🤖 AI-Powered Learning
- **Intelligent Course Assistant**: Ask questions about your course materials and get instant, contextual answers
- **Automatic Quiz Generation**: Upload PDFs and generate quizzes automatically using AI
- **Smart Content Analysis**: AI processes your documents to provide relevant help and insights

### 📝 Interactive Quizzes
- Multiple choice and True/False question support
- Timed quizzes with customizable time limits
- **Review Mode**: Review completed quizzes with correct answers and explanations
- Real-time progress tracking

### 💬 Chat & History
- Chat with AI about specific course materials
- **Chat History**: Keep track of all your conversations with the AI tutor
- Context-aware responses based on your uploaded materials

### 🎨 Modern UI/UX
- Clean, minimalist design with professional typography
- Consistent color theming across all components
- Fully responsive design for desktop and mobile
- Smooth animations and transitions
- Dark mode support throughout the application

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **TailwindCSS** for styling with custom design system
- **React Router** for navigation
- **TanStack Query** for state management and caching
- **React Feather** for beautiful icons
  
### Backend
- **Django** REST API
- **Python** with modern async support
- **Supabase** for database and file storage
- **Groq and OpenRouter** for AI-powered features
- **Celery** for background task processing
- **PDF Processing** utilities for document analysis

### Deployment
- **Docker** for containerization
- **AWS EC2** for cloud-based virtual machine deployment
- **Nginx** as reverse proxy and static file server

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **uv** (Python package manager)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kabsmeiou/pamahres.git
   cd pamahres
   ```

2. **Backend Setup**
   ```bash
   cd server
   
   # Install dependencies using uv
   uv sync
   
   # Activate virtual environment
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   
   # Set up environment variables
   cp .env.example .env
   # Edit .env with your configuration (see Environment Variables section)
   
   # Run migrations
   python app/manage.py migrate
   
   # Start the development server
   python app/manage.py runserver
   ```

3. **Frontend Setup**
   ```bash
   cd client
   
   # Install dependencies
   npm install
   
   # Start the development server
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - Admin Panel: http://localhost:8000/admin

### Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```env
# Django Settings
SECRET_KEY=your-django-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# PostgreSQL Database (Supabase)
POSTGRES_HOST=your-supabase-host
POSTGRES_PORT=6543
POSTGRES_DB=postgres
POSTGRES_USER=your-postgres-user
POSTGRES_PASSWORD=your-postgres-password

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# AI Services
OPENAI_API_KEY=sk-or-v1-your-openrouter-api-key
GROK_API_KEY=gsk_your-groq-api-key

# Vector Database
PINECONE_API_KEY=pcsk_your-pinecone-api-key

# Authentication (Clerk)
CLERK_FRONTEND_API_URL=https://your-clerk-instance.clerk.accounts.dev
CLERK_SECRET_KEY=sk_test_your-clerk-secret-key

# Celery (for background tasks) - Optional
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

DJANGO_SETTINGS_MODULE=app.settings
DJANGO_ENV=local
DJANGO_ADMIN_URL=admin/

REDIS_URL=redis://localhost:6379/1
```

### Getting API Keys

You'll need to obtain API keys from the following services:

1. **OpenRouter** (for AI features): [https://openrouter.ai/](https://openrouter.ai/)
2. **Groq** (for fast AI inference): [https://groq.com/](https://groq.com/)
3. **Supabase** (database & storage): [https://supabase.com/](https://supabase.com/)
4. **Pinecone** (vector database): [https://www.pinecone.io/](https://www.pinecone.io/)
5. **Clerk** (authentication): [https://clerk.com/](https://clerk.com/)

### Additional Setup (Optional)

1. **Redis** (for Celery background tasks)
   ```bash
   # Install Redis
   # macOS
   brew install redis
   brew services start redis
   
   # Ubuntu
   sudo apt-get install redis-server
   sudo systemctl start redis-server
   ```

2. **Celery Worker** (for background quiz generation)
   ```bash
   cd server
   celery -A app worker --loglevel=info
   ```

## 📖 Usage

### Creating Your First Course
1. Navigate to the dashboard
2. Click "Create New Course"
3. Fill in course details (name, code, description)
4. Upload PDF materials
5. Start chatting with your AI tutor or generate quizzes!

### Generating Quizzes
1. Go to your course page
2. Navigate to the "Quizzes" tab
3. Click "Generate Quiz"
4. Select materials and set quiz parameters
5. Wait for AI to generate questions
6. Take the quiz or review previous attempts

### Using the AI Tutor
1. Go to the "AI Tutor" tab in your course
2. Ask questions about your materials
3. Get instant, contextual responses
4. View chat history for reference

## 🔧 Development

### Project Structure
```
pamahres/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── lib/            # Utilities
│   └── public/
├── server/                 # Django backend
│   ├── app/
|   |   ├── app/            # main django app dir
|   |   |   ├── settings/   # django settings (local/prod)
│   │   ├── courses/        # Course management
|   |   ├── auth/           
│   │   ├── quiz/           # Quiz functionality
│   │   ├── user/           # User management
│   │   ├── services/       # AI services
│   │   └── utils/          # Utilities
│   └── requirements files
└── README.md
```

### Available Scripts

**Frontend (client/)**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

**Backend (server/)**
```bash
python app/manage.py runserver    # Start Django server
python app/manage.py migrate      # Run database migrations
python app/manage.py createsuperuser  # Create admin user
python app/manage.py test         # Run tests
```

## 🎯 Future Roadmap

- [ ] **AI Review System**: Optional AI review after quiz completion for detailed explanations
- [ ] **Flash Cards**: Generate interactive flash cards from quiz content
- [ ] **Analytics Dashboard**: Statistics and insights per quiz and user profile
- [ ] **Custom Quiz Builder**: Allow users to create custom questions and quizzes
- [ ] **Mobile App**: Native mobile applications for iOS and Android
- [ ] **Collaboration Features**: Share courses and study together
- [ ] **Advanced AI Features**: More sophisticated content analysis and recommendations

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## 📞 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check our documentation
- Join our community discussions

---

**Made with ❤️ for better learning experiences**
