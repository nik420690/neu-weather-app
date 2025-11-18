# ⚡ Weather App - Neubrutalism Edition

A bold, modern weather application with a stunning **Neubrutalism design** inspired by Gumroad. Built with Flask, featuring dark/light mode and metric/imperial unit switching.

![Weather App](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.0.0-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## ✨ Features

✅ **Neubrutalism Design** - Bold colors, thick borders, heavy shadows
✅ **Dark/Light Mode** - Toggle between themes
✅ **Metric/Imperial Units** - Switch between °C/°F and m/s/mph
✅ **Real-time Weather Data** - Powered by OpenWeatherMap API
✅ **Responsive Design** - Works on desktop, tablet, and mobile
✅ **Fast & Lightweight** - Pure HTML, CSS, and JavaScript

## 🎨 Design Features

- **Bold Typography** - UPPERCASE text with heavy font weights
- **Vibrant Colors** - Pink, yellow, purple, cyan, orange
- **Thick Borders** - 4-5px black borders on all elements
- **Offset Shadows** - 3D layered effect with shadow displacement
- **No Rounded Corners** - Sharp, angular design
- **High Contrast** - Maximum visual impact

## 🚀 Quick Start (Local)

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. **Clone or download this repository**

2. **Install dependencies:**
```bash
python -m pip install -r requirements.txt
```

3. **Get your free API key:**
   - Visit: https://openweathermap.org/api
   - Sign up for a free account
   - Copy your API key
   - Add it as environment variable or keep the default in `app.py`

4. **Run the app:**
```bash
python app.py
```

5. **Open your browser:**
   - Go to: http://localhost:5000
   - Search for any city worldwide!

## 🌐 Deploy Online (Make it Public!)

Want others to use your app? Deploy it for **FREE**!

### Recommended: Deploy to Render (Easiest)

1. **Push to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/weather-app.git
git push -u origin main
```

2. **Deploy to Render:**
   - Go to https://render.com and sign up (free)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Build Command:** `pip install -r requirements.txt`
     - **Start Command:** `gunicorn app:app`
   - Add environment variable: `OPENWEATHER_API_KEY` = `your_key`
   - Click "Create Web Service"

3. **Done!** Your app is live at: `https://your-app-name.onrender.com`

📖 **Full deployment guide:** See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for more hosting options!

## 📁 Project Structure

```
weather_app/
├── app.py                 # Flask backend server
├── requirements.txt       # Python dependencies
├── Procfile              # Deployment configuration
├── .gitignore            # Git ignore rules
├── static/
│   ├── style.css         # Neubrutalism styling
│   └── script.js         # Frontend JavaScript
├── templates/
│   └── index.html        # Main HTML page
├── README.md             # This file
└── DEPLOYMENT_GUIDE.md   # Detailed deployment instructions
```

## 🎯 How to Use

1. **Enter a city name** in the search box
2. **Click "GET WEATHER"** or press Enter
3. **Toggle Dark Mode** by clicking the 🌙 DARK button
4. **Switch Units** by clicking the °F IMPERIAL button
5. **View weather details** including:
   - Temperature
   - Feels Like
   - Humidity
   - Wind Speed
   - Atmospheric Pressure
   - Weather Description

## 🔧 Configuration

### API Key Setup

For security, use environment variables:

**Local Development:**
```bash
# Windows (PowerShell)
$env:OPENWEATHER_API_KEY="your_key_here"

# Mac/Linux
export OPENWEATHER_API_KEY="your_key_here"
```

**Production (Hosting Platform):**
Add `OPENWEATHER_API_KEY` in your platform's environment variables section.

## 🎨 Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Pink | `#ff6b9d` | Primary button |
| Yellow | `#ffd93d` | Theme toggle |
| Purple | `#b794f6` | Unit toggle |
| Cyan | `#4ecdc4` | Accents |
| Orange | `#ff8c42` | Errors |
| Green | `#6bcf7f` | Success |

## 🌍 Browser Support

✅ Chrome/Edge (Recommended)
✅ Firefox
✅ Safari
✅ Opera
✅ Mobile browsers (iOS/Android)

## 🚀 Technologies Used

- **Backend:** Flask 3.0.0 (Python)
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **API:** OpenWeatherMap API
- **Deployment:** Gunicorn WSGI server
- **Design:** Neubrutalism / Brutalist Web Design

## 📊 API Usage

Free tier limits:
- **60 calls per minute**
- **1,000,000 calls per month**
- More than enough for personal use!

## 🔒 Security

- ✅ API keys stored in environment variables
- ✅ No hardcoded credentials in code
- ✅ HTTPS enabled on all deployment platforms
- ✅ Input validation and error handling

## 🐛 Troubleshooting

### API Key Not Working
- Wait 10-30 minutes for new keys to activate
- Verify email with OpenWeatherMap
- Check key status at: https://home.openweathermap.org/api_keys

### App Won't Start Locally
```bash
# Reinstall dependencies
python -m pip install --upgrade -r requirements.txt

# Check Python version
python --version  # Should be 3.8+
```

### Deployment Issues
- See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- Check platform logs for errors
- Verify all environment variables are set

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to fork, modify, and improve this project!

## 🎉 Credits

- **Design Inspiration:** Gumroad, Neubrutalism movement
- **Weather Data:** OpenWeatherMap API
- **Icons:** Emoji (universal support)

## 📞 Support

- **OpenWeatherMap API Docs:** https://openweathermap.org/api
- **Flask Documentation:** https://flask.palletsprojects.com/
- **Deployment Help:** See DEPLOYMENT_GUIDE.md

---

**Made with ⚡ and bold design choices**

Enjoy your weather app! 🌤️