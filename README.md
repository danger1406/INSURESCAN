# 🛡️ InsureScan

**Decode, Compare & Understand Insurance in Seconds**

An AI-powered web application that analyzes insurance policy documents and generates easy-to-understand "Smart Policy Reports" in plain language.

![InsureScan Demo](https://img.shields.io/badge/Status-MVP%20Complete-brightgreen)
![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react)
![Flask](https://img.shields.io/badge/Backend-Flask-000000?logo=flask)
![Python](https://img.shields.io/badge/Python-3.8+-3776AB?logo=python)

---

## 🎯 Problem Statement

Insurance policies in India are notoriously difficult to understand:
- 📄 Average policy: **40+ pages** of complex legal jargon
- ❌ **₹50,000 Cr+** claims rejected annually due to policy misunderstanding
- 😰 Hidden clauses discovered only at claim time
- 🔍 No easy way to decode room rent caps, waiting periods, co-payments

## 💡 Our Solution

InsureScan uses AI to analyze any insurance policy and provides:

| Feature | Description |
|---------|-------------|
| 🎯 **Safety Score** | 0-100 rating of how consumer-friendly the policy is |
| 🚩 **Red Flags** | Hidden clauses with severity levels (HIGH/MEDIUM/LOW) |
| ✅ **Good Features** | Positive aspects that benefit the policyholder |
| 📋 **Coverage Gaps** | What's NOT covered by the policy |
| 💡 **Recommendations** | Actionable advice based on the analysis |
| 📚 **Jargon Decoder** | Insurance terms explained in plain language |

---

## 🚀 Features

- ✅ **PDF & Image Upload** - Supports policy documents in any format
- ✅ **AI-Powered Analysis** - Uses multiple AI models for accurate analysis
- ✅ **Triple-Redundant AI** - OpenRouter → Gemini → Bytez fallback chain
- ✅ **Dark/Light Mode** - Eye-friendly interface for any lighting
- ✅ **Hindi Support** - Regional language accessibility
- ✅ **Instant Results** - Analysis in under 30 seconds
- ✅ **Demo Mode** - Quick demonstration without file upload

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **CSS Variables** - Dynamic theming
- **Axios** - API communication
- **Context API** - State management

### Backend
- **Flask** - Python web framework
- **pdfplumber** - PDF text extraction
- **Tesseract OCR** - Image text extraction
- **OpenRouter API** - Primary AI provider
- **Google Gemini API** - Secondary fallback
- **Bytez API** - Tertiary fallback

---

## 📦 Installation

### Prerequisites
- Node.js 16+
- Python 3.8+
- Tesseract OCR installed on system

### Clone the Repository
```bash
git clone https://github.com/danger1406/INSURESCAN.git
cd INSURESCAN
```

### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file and add your API keys
cp .env.example .env
# Edit .env with your API keys

# Run the server
python app.py
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The app will be available at `http://localhost:3000`

---

## 🔑 Environment Variables

### Backend (.env)
```env
OPENROUTER_API_KEY=your-openrouter-key
GOOGLE_API_KEY=your-gemini-key
BYTEZ_API_KEY=your-bytez-key
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000
```

---

## 📁 Project Structure

```
INSURESCAN/
├── backend/
│   ├── app.py              # Flask API server
│   ├── requirements.txt    # Python dependencies
│   ├── .env.example        # Environment template
│   └── uploads/            # Temporary file storage
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js          # Main application
│   │   ├── index.js        # Entry point
│   │   ├── index.css       # Global styles
│   │   ├── context/
│   │   │   └── ThemeContext.js
│   │   └── components/
│   │       ├── Hero.js
│   │       ├── FileUpload.js
│   │       ├── LoadingState.js
│   │       └── ResultsDashboard.js
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## 🎮 Usage

1. **Open the app** at `http://localhost:3000`
2. **Upload a policy** - Drag & drop or click to select a PDF/image
3. **Wait for analysis** - AI processes the document (10-30 seconds)
4. **View your report** - Navigate through tabs to see all insights

### Demo Mode
Click "Quick Demo" to see a sample analysis without uploading a file.

---

## 🔄 AI Fallback Chain

InsureScan uses a triple-redundant AI system for maximum reliability:

```
1. OpenRouter (5 free models)
   ├── google/gemini-2.0-flash-exp:free
   ├── meta-llama/llama-3.3-70b-instruct:free
   ├── deepseek/deepseek-r1:free
   ├── qwen/qwen3-14b:free
   └── mistralai/mistral-small-3.1-24b-instruct:free
   
2. Google Gemini API (gemini-2.0-flash-lite)

3. Bytez API (Qwen3-4B)

4. Mock Data (Final safety net)
```

---

## 📸 Screenshots

### Home Page
![Home Page](docs/screenshots/home.png)

### Analysis Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Dark Mode
![Dark Mode](docs/screenshots/dark-mode.png)

---

## 🚀 Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Connect repo to Vercel
3. Set build command: `npm run build`
4. Set output directory: `build`
5. Add environment variable: `REACT_APP_API_URL`

### Backend (Railway/Render)
1. Create new project
2. Connect GitHub repo
3. Set root directory: `backend`
4. Add environment variables
5. Deploy

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Team

Built with ❤️ for the hackathon

---

## 📞 Contact

- **GitHub**: [@danger1406](https://github.com/danger1406)
- **Project Link**: [https://github.com/danger1406/INSURESCAN](https://github.com/danger1406/INSURESCAN)

---

<p align="center">
  <b>InsureScan</b> - Because everyone deserves to understand what they're paying for.
</p>
