@echo off
echo 🚀 Setting up Documate Backend...

REM Check if .env exists
if not exist .env (
    echo 📝 Creating .env file from template...
    copy env.example .env
    echo ⚠️  Please edit .env and add your OpenAI API key!
    echo    OPENAI_API_KEY=your_openai_api_key_here
    echo.
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Initialize database
echo 🗄️  Initializing database...
npm run init-db

REM Start the server
echo 🌐 Starting server...
echo    Server will be available at: http://localhost:3000
echo    Health check: http://localhost:3000/health
echo.
npm start 