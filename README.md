# 🏠 Smart EMI Calculator with Extra Payment Tracker

India's only EMI calculator that shows REAL savings when you pay more than your EMI.

## 🌐 Live Demo

**Website:** [https://rinmukt.com/](https://rinmukt.com/)

## ✨ Features

- **Extra Payment Tracking** - Unlike other calculators, we track the difference between your actual payment and standard EMI
- **Visual Comparison** - See side-by-side how paying extra compares to just paying EMI
- **Detailed Schedule** - Month-by-month or year-by-year breakdown
- **Interest Savings** - Instantly see how much money you'll save
- **Tenure Reduction** - Know exactly when your loan will be paid off
- **100% Private** - All calculations happen in your browser

## 🚀 Deployment

### Quick Deploy (Manual)

```bash
# Install dependencies
npm install

# Deploy to production
npm run deploy

# Test without uploading (dry run)
npm run deploy:dry-run
```

### Setup Instructions

1. Clone this repository
2. Copy `.env.example` to `.env`
3. Fill in your FTP credentials in `.env`
4. Run `npm install`
5. Run `npm run deploy`

### Environment Variables

Create a `.env` file with:

```env
FTP_HOST=ftp.yourdomain.com
FTP_USER=your_ftp_username
FTP_PASSWORD=your_ftp_password
FTP_REMOTE_DIR=/public_html
```

### GitHub Actions (CI/CD)

This project includes automatic deployment via GitHub Actions.

**Setup GitHub Secrets:**

1. Go to your repository → Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `FTP_HOST` - Your FTP hostname
   - `FTP_USER` - Your FTP username
   - `FTP_PASSWORD` - Your FTP password
   - `FTP_REMOTE_DIR` - Remote directory (e.g., `/public_html`)

**Automatic Deployment:**
- Push to `main` branch triggers automatic deployment
- Manual deployment available via "Actions" tab → "Deploy to Hostinger" → "Run workflow"

## 📁 Project Structure

```
Calculator/
├── index.html          # Main calculator page
├── deploy.js           # FTP deployment script
├── package.json        # Project configuration
├── .env               # Environment variables (not in git)
├── .env.example       # Environment template
├── .gitignore         # Git ignore rules
├── README.md          # This file
└── .github/
    └── workflows/
        └── deploy.yml  # GitHub Actions workflow
```

## 🏦 Supported Banks

Works with all Indian banks including:
- SBI
- HDFC
- ICICI
- Axis Bank
- Kotak
- PNB
- Bank of Baroda
- LIC HFL

## 📄 License

MIT License - Feel free to use and modify.

## 👤 Author

- **Email:** achaudhary7@gmail.com
- **GitHub:** [@achaudhary7](https://github.com/achaudhary7)

---

Made with ❤️ for Indian Home Loan Borrowers
