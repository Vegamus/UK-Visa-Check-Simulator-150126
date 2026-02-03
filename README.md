# UK Visa Eligibility Simulator

AI-powered UK Standard Visitor Visa eligibility checker with instant assessment based on official Home Office guidance.

## 🎯 Features

- ✅ **Multi-step Application Form** - Personal info, travel details, finances, history
- 🤖 **AI-Powered Analysis** - Gemini AI for intelligent visa eligibility assessment
- 📊 **Risk Scoring** - 0-100 score with Low/Medium/High risk classification
- 🔄 **What-If Scenarios** - Test different scenarios and compare results
- 📄 **PDF Export** - Download your assessment report
- 🎨 **Modern UI** - Beautiful, responsive Tailwind CSS design
- 🔔 **Smart Notifications** - Toast notifications for better UX
- ⚡ **Fast & Secure** - Built with Vite + React 19 + TypeScript

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Gemini API Key ([Get one free](https://ai.google.dev/))

### Installation

```bash
# Clone repository
git clone https://github.com/Vegamus/UK-Visa-Check-Simulator-150126.git
cd UK-Visa-Check-Simulator-150126

# Install dependencies
npm install

# Create .env.local file
echo "API_KEY=your_gemini_api_key_here" > .env.local
echo "VITE_API_KEY=your_gemini_api_key_here" >> .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📦 Build for Production

```bash
npm run build
npm run preview
```

## 🌐 Deploy to Vercel

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Vegamus/UK-Visa-Check-Simulator-150126)

### Option 2: Manual Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variable in Vercel dashboard:
# VITE_API_KEY = your_gemini_api_key
```

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS
- **Build Tool:** Vite
- **AI:** Google Gemini API
- **PDF Export:** jsPDF
- **Notifications:** react-hot-toast
- **Icons:** Heroicons
- **Deployment:** Vercel

## 📖 Project Structure

```
uk-visa-simulator/
├── src/
│   ├── components/
│   │   ├── ErrorBoundary.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ToastProvider.tsx
│   ├── utils/
│   │   └── pdfExport.ts
│   └── index.css
├── services/
│   └── visaAlgorithm.ts
├── App.tsx
├── types.ts
├── index.tsx
├── index.html
└── vercel.json
```

## ⚙️ Configuration

### Environment Variables

Create `.env.local`:

```env
API_KEY=your_gemini_api_key
VITE_API_KEY=your_gemini_api_key
```

### Tailwind Configuration

Custom theme with:
- Primary colors (Indigo)
- Success (Green)
- Warning (Amber)
- Danger (Red)
- Custom animations

## 🎨 Features Implemented (v2.0)

### ✅ Critical Improvements
- [x] Vercel deployment config
- [x] SEO meta tags
- [x] Error boundary
- [x] Loading states
- [x] Tailwind CSS optimization
- [x] PDF export
- [x] Toast notifications
- [x] Improved UI/UX

### 🚧 Roadmap
- [ ] LocalStorage progress save
- [ ] Multi-language support (i18n)
- [ ] Analytics integration
- [ ] User accounts
- [ ] Application history

## 📊 Assessment Criteria

Based on UK Home Office "Visit Caseworker Guidance":

1. **Genuine Visitor** - Intent to leave UK after visit
2. **Financial Viability** - Sufficient funds without public funds
3. **Immigration History** - Previous compliance record
4. **Ties to Home Country** - Employment, property, family
5. **Business Rules** - Permitted activities compliance

## 🔒 Privacy & Security

- All processing happens client-side
- No data stored on servers
- API calls made directly to Gemini
- Email verification is simulated (no actual emails sent)
- Secure headers configured in `vercel.json`

## 📄 License

MIT

## 👨‍💻 Author

[Vegamus](https://github.com/Vegamus)

## 🙏 Credits

- Powered by [Google Gemini AI](https://ai.google.dev/)
- UI Components by [Heroicons](https://heroicons.com/)
- Built with [Vite](https://vitejs.dev/)

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check the [Home Office guidance](https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-visitor-visa-routes)

---

**Disclaimer:** This is a simulation tool for educational purposes. It does not guarantee visa approval. Always consult official UK Home Office guidance and consider professional immigration advice.
