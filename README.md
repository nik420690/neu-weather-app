# Weather App

A modern, feature-rich weather application built with Flask and vanilla JavaScript, featuring a bold Neubrutalism design aesthetic.

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.0.0-green.svg)

## 🌟 Live Demo

[View Live App](https://neu-weather-app.onrender.com)

## 📋 Overview

A full-stack weather application that provides real-time weather data, forecasts, and location-based services. The app features a unique Neubrutalism design with bold colors, thick borders, and heavy shadows for maximum visual impact.

## ✨ Key Features

### Core Functionality
- **Real-time Weather Data** - Current conditions for any city worldwide
- **Geolocation Support** - Automatic weather detection using browser location API
- **24-Hour Forecast** - Hourly weather predictions with 3-hour intervals
- **5-Day Forecast** - Extended weather outlook with daily high/low temperatures
- **Search History** - Persistent local storage of recent searches (last 10 cities)
- **City Autocomplete** - Smart suggestions from 130+ major cities worldwide

### Weather Data
- Temperature (°C/°F with toggle)
- "Feels Like" temperature
- Weather conditions with icons
- Humidity levels
- Wind speed (m/s or mph)
- Atmospheric pressure
- Sunrise/Sunset times
- UV Index with color-coded safety levels
- Precipitation probability

### User Experience
- **Dark/Light Mode** - Theme toggle with persistent preference
- **Metric/Imperial Units** - Switchable temperature and speed units
- **Refresh Button** - One-click weather data update
- **Last Updated Timestamp** - Auto-updating relative time display
- **Responsive Design** - Optimized for desktop, tablet, and mobile
- **Offline-First** - Cached search history and autocomplete data

## 🛠️ Tech Stack

### Backend
- **Python 3.8+**
- **Flask 3.0.0** - Lightweight WSGI web framework
- **Requests** - HTTP library for API calls
- **Gunicorn** - Production WSGI server

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom styling with CSS variables
- **Vanilla JavaScript** - No frameworks, pure ES6+
- **Font Awesome 6.4.0** - Icon library

### APIs
- **OpenWeatherMap API** - Weather data and forecasts
  - Current Weather API
  - 5-Day Forecast API
  - UV Index API

### Design
- **Neubrutalism** - Bold, brutalist web design principles
- **Responsive** - Mobile-first approach
- **Accessibility** - WCAG compliant color contrasts

## 📂 Project Structure

```
weather-app/
├── app.py                 # Flask application and API routes
├── requirements.txt       # Python dependencies
├── Procfile              # Deployment configuration
├── fix_security.py       # Security update utility
├── static/
│   ├── style.css         # Neubrutalism styling
│   ├── script.js         # Frontend JavaScript
│   └── cities.json       # City autocomplete database
├── templates/
│   └── index.html        # Main application template
└── README.md             # Project documentation
```

## 📊 API Usage

The app makes efficient use of the OpenWeatherMap API:
- **2-3 API calls per search** (current weather + forecast + UV index)
- **Free tier limits**: 60 calls/min, 1,000,000 calls/month
- **Caching**: Browser-side caching of icons and static data

## 🎨 Design Highlights

### Neubrutalism Principles
- **Bold Typography** - Heavy font weights and uppercase text
- **Vibrant Colors** - Pink, yellow, purple, cyan, orange palette
- **Thick Borders** - 4-5px solid borders on all elements
- **Offset Shadows** - 3D effect with shadow displacement
- **Sharp Edges** - No rounded corners, angular design
- **High Contrast** - Maximum visual impact and readability

### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Pink | `#ff6b9d` | Primary actions, temperature |
| Yellow | `#ffd93d` | Theme toggle, highlights |
| Purple | `#b794f6` | Unit toggle, accents |
| Cyan | `#4ecdc4` | Location, humidity |
| Orange | `#ff8c42` | Errors, time indicators |
| Green | `#6bcf7f` | Success states |

## 🧪 Testing

### Manual Testing Checklist
- [ ] Search functionality with valid/invalid cities
- [ ] Geolocation permission handling
- [ ] Unit conversion (°C ↔ °F)
- [ ] Theme toggle persistence
- [ ] Responsive layout on mobile/tablet/desktop
- [ ] Dark mode styling
- [ ] API error handling
- [ ] Search history persistence
- [ ] Autocomplete suggestions
- [ ] Hourly forecast scrolling
- [ ] All icons loading correctly

## 🔧 Technical Highlights

### Frontend
- **Modular JavaScript** - Clean separation of concerns
- **ES6+ Features** - Arrow functions, template literals, async/await
- **LocalStorage API** - Persistent user preferences and search history
- **Geolocation API** - Browser-based location detection
- **Fetch API** - Modern HTTP requests
- **Responsive Design** - CSS Grid and Flexbox

### Backend
- **RESTful API Design** - Clean endpoint structure
- **Error Handling** - Comprehensive try-catch blocks
- **Input Validation** - Sanitized user inputs
- **Rate Limiting Ready** - Prepared for production constraints
- **CORS Enabled** - Cross-origin resource sharing
- **Environment Variables** - Secure configuration management

## 🐛 Known Issues & Future Improvements

### Potential Enhancements
- Add weather maps with radar imagery
- Implement weather alerts and notifications
- Add weather comparison between cities
- Include air quality index (AQI) data
- Add multi-language support
- Implement progressive web app (PWA) features
- Add weather charts and graphs

## 🙏 Acknowledgments

- [OpenWeatherMap](https://openweathermap.org/) - Weather data API
- [Font Awesome](https://fontawesome.com/) - Icon library
- [Flask Documentation](https://flask.palletsprojects.com/) - Framework reference
- Neubrutalism design inspiration from [Brutalist Websites](https://brutalistwebsites.com/)

---

**Built with ⚡ and modern web technologies**
