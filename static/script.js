// State management
let isDarkMode = false;
let isImperial = false;
let currentWeatherData = null;
let currentForecastData = null;
let currentHourlyData = null;
let citiesDatabase = [];
let searchHistory = [];
let lastSearchedCity = null;
let lastUpdateTime = null;

// DOM Elements
const themeBtn = document.getElementById("themeBtn");
const unitBtn = document.getElementById("unitBtn");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const refreshBtn = document.getElementById("refreshBtn");
const cityInput = document.getElementById("cityInput");
const weatherCard = document.getElementById("weatherCard");
const weatherContent = document.getElementById("weatherContent");
const loadingSpinner = document.getElementById("loadingSpinner");
const errorMessage = document.getElementById("errorMessage");

// Weather display elements
const cityName = document.getElementById("cityName");
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const pressure = document.getElementById("pressure");
const lastUpdatedDiv = document.getElementById("lastUpdated");
const updateTimeSpan = document.getElementById("updateTime");

// Sunrise/Sunset & UV elements
const sunUvInfo = document.getElementById("sunUvInfo");
const sunriseTime = document.getElementById("sunriseTime");
const sunsetTime = document.getElementById("sunsetTime");
const uvIndex = document.getElementById("uvIndex");

// Forecast elements
const forecastSection = document.getElementById("forecastSection");
const forecastCards = document.getElementById("forecastCards");

// Hourly forecast elements
const hourlySection = document.getElementById("hourlySection");
const hourlyCards = document.getElementById("hourlyCards");

// Search history elements
const searchHistorySection = document.getElementById("searchHistory");
const historyChips = document.getElementById("historyChips");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

// Autocomplete elements
const suggestionsBox = document.getElementById("suggestions");

// Event Listeners
themeBtn.addEventListener("click", toggleTheme);
unitBtn.addEventListener("click", toggleUnits);
searchBtn.addEventListener("click", getWeather);
locationBtn.addEventListener("click", getWeatherByLocation);
refreshBtn.addEventListener("click", refreshWeather);
clearHistoryBtn.addEventListener("click", clearSearchHistory);

cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    getWeather();
  }
});

// Autocomplete listeners
cityInput.addEventListener("input", handleCityInput);
cityInput.addEventListener("focus", handleCityInput);
cityInput.addEventListener("blur", () => {
  // Delay to allow click on suggestion
  setTimeout(() => hideSuggestions(), 200);
});

// Click outside to close suggestions
document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-input-wrapper")) {
    hideSuggestions();
  }
});

// Toggle Dark/Light Mode
function toggleTheme() {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle("dark-mode");
  themeBtn.textContent = isDarkMode ? "☀️ LIGHT" : "🌙 DARK";
}

// Toggle Metric/Imperial Units
function toggleUnits() {
  isImperial = !isImperial;
  unitBtn.textContent = isImperial ? "°C METRIC" : "°F IMPERIAL";

  // Refresh display if we have data
  if (currentWeatherData) {
    displayWeather(currentWeatherData);
  }

  // Refresh forecast display if we have data
  if (currentForecastData) {
    displayForecast(currentForecastData);
  }

  // Refresh hourly forecast display if we have data
  if (currentHourlyData) {
    displayHourlyForecast(currentHourlyData);
  }
}

// Get Weather Data
async function getWeather() {
  const city = cityInput.value.trim();

  if (!city) {
    showError("⚠️ PLEASE ENTER A CITY NAME!");
    return;
  }

  // Show loading
  hideError();
  hideWeatherContent();
  showLoading();

  try {
    const response = await fetch("/api/weather", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        city: city,
        demo_mode: false,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      currentWeatherData = data;
      lastSearchedCity = city;
      displayWeather(data);
      updateLastRefreshTime();
      // Add to search history
      addToSearchHistory(data.name);
      // Fetch hourly and 5-day forecast after getting current weather
      fetchHourlyForecast(city);
      fetchForecast(city);
    } else {
      showError("❌ " + (data.error || "AN ERROR OCCURRED").toUpperCase());
      hideWeatherContent();
      hideForecast();
    }
  } catch (error) {
    showError("❌ FAILED TO FETCH WEATHER DATA. PLEASE TRY AGAIN.");
    hideWeatherContent();
    hideHourlyForecast();
    hideForecast();
  } finally {
    hideLoading();
  }
}

// Get Weather by User's Location
async function getWeatherByLocation() {
  // Check if geolocation is supported
  if (!navigator.geolocation) {
    showError("⚠️ GEOLOCATION IS NOT SUPPORTED BY YOUR BROWSER!");
    return;
  }

  // Show loading
  hideError();
  hideWeatherContent();
  showLoading();

  // Request location permission
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const response = await fetch("/api/weather/coordinates", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lat: latitude,
            lon: longitude,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          currentWeatherData = data;
          lastSearchedCity = data.name;
          cityInput.value = data.name; // Update input with detected city
          displayWeather(data);
          updateLastRefreshTime();
          // Add to search history
          addToSearchHistory(data.name);
          // Fetch hourly and 5-day forecast after getting current weather
          fetchHourlyForecastByCoordinates(latitude, longitude);
          fetchForecastByCoordinates(latitude, longitude);
        } else {
          showError("❌ " + (data.error || "AN ERROR OCCURRED").toUpperCase());
          hideWeatherContent();
          hideHourlyForecast();
        }
      } catch (error) {
        showError("❌ FAILED TO FETCH WEATHER DATA. PLEASE TRY AGAIN.");
        hideWeatherContent();
      } finally {
        hideLoading();
      }
    },
    (error) => {
      hideLoading();

      // Handle different error cases
      switch (error.code) {
        case error.PERMISSION_DENIED:
          showError(
            "❌ LOCATION PERMISSION DENIED. PLEASE ENABLE IT IN YOUR BROWSER SETTINGS.",
          );
          break;
        case error.POSITION_UNAVAILABLE:
          showError("❌ LOCATION INFORMATION IS UNAVAILABLE.");
          break;
        case error.TIMEOUT:
          showError("❌ LOCATION REQUEST TIMED OUT.");
          break;
        default:
          showError(
            "❌ AN UNKNOWN ERROR OCCURRED WHILE GETTING YOUR LOCATION.",
          );
          break;
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    },
  );
}

// Refresh Weather Data
async function refreshWeather() {
  if (!lastSearchedCity) {
    showError("⚠️ NO CITY TO REFRESH! PLEASE SEARCH FIRST.");
    return;
  }

  // Show loading
  hideError();
  showLoading();

  try {
    const response = await fetch("/api/weather", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        city: lastSearchedCity,
        demo_mode: false,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      currentWeatherData = data;
      displayWeather(data);
      updateLastRefreshTime();
      // Refresh hourly and 5-day forecast too
      fetchHourlyForecast(lastSearchedCity);
      fetchForecast(lastSearchedCity);
      showNotification(
        "✅ REFRESHED!",
        `Weather data updated for ${data.name}`,
      );
    } else {
      showError("❌ " + (data.error || "REFRESH FAILED").toUpperCase());
    }
  } catch (error) {
    showError("❌ FAILED TO REFRESH. PLEASE TRY AGAIN.");
  } finally {
    hideLoading();
  }
}

// Update Last Refresh Time
function updateLastRefreshTime() {
  lastUpdateTime = new Date();
  displayLastUpdateTime();
  showRefreshButton();
}

function displayLastUpdateTime() {
  if (!lastUpdateTime) return;

  const now = new Date();
  const diff = Math.floor((now - lastUpdateTime) / 1000); // seconds

  let timeText;
  if (diff < 60) {
    timeText = "JUST NOW";
  } else if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    timeText = `${minutes} MIN${minutes > 1 ? "S" : ""} AGO`;
  } else if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    timeText = `${hours} HOUR${hours > 1 ? "S" : ""} AGO`;
  } else {
    timeText = lastUpdateTime.toLocaleTimeString();
  }

  updateTimeSpan.textContent = timeText;
  lastUpdatedDiv.classList.remove("hidden");
}

// Display Sunrise/Sunset and UV Index
function displaySunUvInfo(data) {
  if (!data) return;

  // Format sunrise time
  if (data.sunrise) {
    const sunrise = new Date(data.sunrise * 1000);
    sunriseTime.textContent = sunrise.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  // Format sunset time
  if (data.sunset) {
    const sunset = new Date(data.sunset * 1000);
    sunsetTime.textContent = sunset.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  // Display UV Index with level
  if (data.uv_index !== null && data.uv_index !== undefined) {
    const uv = data.uv_index;
    let uvLevel = "";
    let uvColor = "";

    if (uv <= 2) {
      uvLevel = "LOW";
      uvColor = "#6bcf7f"; // Green
    } else if (uv <= 5) {
      uvLevel = "MODERATE";
      uvColor = "#ffd93d"; // Yellow
    } else if (uv <= 7) {
      uvLevel = "HIGH";
      uvColor = "#ff8c42"; // Orange
    } else if (uv <= 10) {
      uvLevel = "VERY HIGH";
      uvColor = "#ff6b9d"; // Pink
    } else {
      uvLevel = "EXTREME";
      uvColor = "#b794f6"; // Purple
    }

    uvIndex.innerHTML = `<span style="color: ${uvColor};">${uv.toFixed(1)}</span> <span style="font-size: 0.8rem;">(${uvLevel})</span>`;
  } else {
    uvIndex.textContent = "N/A";
  }

  sunUvInfo.classList.remove("hidden");
}

function hideSunUvInfo() {
  sunUvInfo.classList.add("hidden");
}

function showRefreshButton() {
  refreshBtn.classList.remove("hidden");
}

function hideRefreshButton() {
  refreshBtn.classList.add("hidden");
}

// Fetch Hourly Forecast by City
async function fetchHourlyForecast(city) {
  try {
    const response = await fetch("/api/hourly", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        city: city,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      currentHourlyData = data;
      displayHourlyForecast(data);
    } else {
      hideHourlyForecast();
    }
  } catch (error) {
    hideHourlyForecast();
  }
}

// Fetch Hourly Forecast by Coordinates
async function fetchHourlyForecastByCoordinates(lat, lon) {
  try {
    const response = await fetch("/api/hourly/coordinates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lat: lat,
        lon: lon,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      currentHourlyData = data;
      displayHourlyForecast(data);
    } else {
      hideHourlyForecast();
    }
  } catch (error) {
    hideHourlyForecast();
  }
}

// Display Hourly Forecast
function displayHourlyForecast(data) {
  if (!data || !data.hourly || data.hourly.length === 0) {
    hideHourlyForecast();
    return;
  }

  // Clear previous hourly forecast
  hourlyCards.innerHTML = "";

  // Create hourly forecast cards
  data.hourly.forEach((hour) => {
    const card = createHourlyCard(hour);
    hourlyCards.appendChild(card);
  });

  showHourlyForecast();
}

// Create Individual Hourly Card
function createHourlyCard(hour) {
  const card = document.createElement("div");
  card.className = "hourly-card";

  // Parse time
  const date = new Date(hour.time);
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // Convert units if needed
  let temp = hour.temp;
  let tempUnit = "°C";

  if (isImperial) {
    temp = celsiusToFahrenheit(temp);
    tempUnit = "°F";
  }

  // Get weather icon
  const iconUrl = `https://openweathermap.org/img/wn/${hour.icon}@2x.png`;

  // Get precipitation probability
  const pop = Math.round(hour.pop);

  card.innerHTML = `
    <div class="hourly-time">${timeStr}</div>
    <div class="hourly-icon-container">
      <img src="${iconUrl}" alt="${hour.description}" class="hourly-icon-img" />
    </div>
    <div class="hourly-temp">${temp.toFixed(0)}${tempUnit}</div>
    <div class="hourly-pop">
      <i class="fa-solid fa-droplet"></i> ${pop}%
    </div>
  `;

  return card;
}

// Show/Hide Hourly Forecast
function showHourlyForecast() {
  hourlySection.classList.remove("hidden");
}

function hideHourlyForecast() {
  hourlySection.classList.add("hidden");
  hourlyCards.innerHTML = "";
}

// Fetch 5-Day Forecast by City
async function fetchForecast(city) {
  try {
    const response = await fetch("/api/forecast", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        city: city,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      currentForecastData = data;
      displayForecast(data);
    } else {
      hideForecast();
    }
  } catch (error) {
    hideForecast();
  }
}

// Fetch 5-Day Forecast by Coordinates
async function fetchForecastByCoordinates(lat, lon) {
  try {
    const response = await fetch("/api/forecast/coordinates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lat: lat,
        lon: lon,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      currentForecastData = data;
      displayForecast(data);
    } else {
      hideForecast();
    }
  } catch (error) {
    hideForecast();
  }
}

// Display 5-Day Forecast
function displayForecast(data) {
  if (!data || !data.forecasts || data.forecasts.length === 0) {
    hideForecast();
    return;
  }

  // Clear previous forecast
  forecastCards.innerHTML = "";

  // Create forecast cards
  data.forecasts.forEach((forecast) => {
    const card = createForecastCard(forecast);
    forecastCards.appendChild(card);
  });

  showForecast();
}

// Create Individual Forecast Card
function createForecastCard(forecast) {
  const card = document.createElement("div");
  card.className = "forecast-card";

  // Parse date
  const date = new Date(forecast.date);
  const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
  const monthDay = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  // Convert units if needed
  let tempMin = forecast.temp_min;
  let tempMax = forecast.temp_max;
  let tempUnit = "°C";

  if (isImperial) {
    tempMin = celsiusToFahrenheit(tempMin);
    tempMax = celsiusToFahrenheit(tempMax);
    tempUnit = "°F";
  }

  // Get weather icon
  const iconUrl = `https://openweathermap.org/img/wn/${forecast.icon}@2x.png`;

  card.innerHTML = `
    <div class="forecast-day">${dayName}</div>
    <div class="forecast-date">${monthDay}</div>
    <div class="forecast-icon-container">
      <img src="${iconUrl}" alt="${forecast.description}" class="forecast-icon-img" />
    </div>
    <div class="forecast-desc">${forecast.description.toUpperCase()}</div>
    <div class="forecast-temp">
      <span class="temp-high">${tempMax.toFixed(0)}${tempUnit}</span>
      <span class="temp-low">${tempMin.toFixed(0)}${tempUnit}</span>
    </div>
  `;

  return card;
}

// Get Weather Emoji based on description
function getWeatherEmoji(description) {
  const desc = description.toLowerCase();

  if (desc.includes("clear")) return "☀️";
  if (desc.includes("cloud")) return "☁️";
  if (desc.includes("rain") || desc.includes("drizzle")) return "🌧️";
  if (desc.includes("thunder") || desc.includes("storm")) return "⛈️";
  if (desc.includes("snow")) return "❄️";
  if (desc.includes("mist") || desc.includes("fog")) return "🌫️";
  if (desc.includes("wind")) return "💨";

  return "🌤️"; // default
}

// Show/Hide Forecast
function showForecast() {
  forecastSection.classList.remove("hidden");
}

function hideForecast() {
  forecastSection.classList.add("hidden");
  forecastCards.innerHTML = "";
}

// Display Weather Data
function displayWeather(data) {
  // Convert units if needed
  let temp = data.temp;
  let feels = data.feels_like;
  let wind = data.wind_speed;
  let tempUnit = "°C";
  let windUnit = "m/s";

  if (isImperial) {
    temp = celsiusToFahrenheit(temp);
    feels = celsiusToFahrenheit(feels);
    wind = mpsToMph(wind);
    tempUnit = "°F";
    windUnit = "mph";
  }

  // Update DOM - Now using spans inside the paragraphs
  cityName.textContent = `${data.name}, ${data.country}`;

  // Update weather icon
  if (data.icon) {
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.icon}@4x.png`;
    weatherIcon.alt = data.description;
    weatherIcon.style.display = "block";
  }

  temperature.textContent = `${temp.toFixed(1)}${tempUnit}`;
  description.textContent = data.description.toUpperCase();

  // Display sunrise/sunset and UV index
  displaySunUvInfo(data);

  // Update the spans inside the detail paragraphs
  feelsLike.querySelector("span").textContent =
    `Feels Like: ${feels.toFixed(1)}${tempUnit}`;
  humidity.querySelector("span").textContent = `Humidity: ${data.humidity}%`;
  windSpeed.querySelector("span").textContent =
    `Wind: ${wind.toFixed(1)} ${windUnit}`;
  pressure.querySelector("span").textContent = `Pressure: ${data.pressure} hPa`;

  showWeatherContent();
}

// Unit Conversion Functions
function celsiusToFahrenheit(celsius) {
  return (celsius * 9) / 5 + 32;
}

function mpsToMph(mps) {
  return mps * 2.237;
}

// UI Helper Functions
function showLoading() {
  loadingSpinner.classList.remove("hidden");
}

function hideLoading() {
  loadingSpinner.classList.add("hidden");
}

function showWeatherContent() {
  weatherContent.classList.remove("hidden");
}

function hideWeatherContent() {
  weatherContent.classList.add("hidden");
  cityName.textContent = "";
  weatherIcon.style.display = "none";
  weatherIcon.src = "";
  temperature.textContent = "";
  description.textContent = "";
  lastUpdatedDiv.classList.add("hidden");
  hideSunUvInfo();
  feelsLike.querySelector("span").textContent = "";
  humidity.querySelector("span").textContent = "";
  windSpeed.querySelector("span").textContent = "";
  pressure.querySelector("span").textContent = "";
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
}

function hideError() {
  errorMessage.classList.add("hidden");
}

function showNotification(title, message) {
  alert(`${title}\n\n${message}`);
}

// Search History Functions
function loadSearchHistory() {
  const saved = localStorage.getItem("weatherSearchHistory");
  if (saved) {
    try {
      searchHistory = JSON.parse(saved);
      displaySearchHistory();
    } catch (e) {
      searchHistory = [];
    }
  }
}

function saveSearchHistory() {
  localStorage.setItem("weatherSearchHistory", JSON.stringify(searchHistory));
}

function addToSearchHistory(cityName) {
  // Remove if already exists (to move to front)
  searchHistory = searchHistory.filter(
    (city) => city.toLowerCase() !== cityName.toLowerCase(),
  );

  // Add to beginning
  searchHistory.unshift(cityName);

  // Keep only last 10
  if (searchHistory.length > 10) {
    searchHistory = searchHistory.slice(0, 10);
  }

  saveSearchHistory();
  displaySearchHistory();
}

function displaySearchHistory() {
  if (searchHistory.length === 0) {
    searchHistorySection.classList.add("hidden");
    return;
  }

  historyChips.innerHTML = "";

  searchHistory.forEach((city) => {
    const chip = document.createElement("button");
    chip.className = "history-chip";
    chip.textContent = city.toUpperCase();
    chip.addEventListener("click", () => {
      cityInput.value = city;
      getWeather();
    });
    historyChips.appendChild(chip);
  });

  searchHistorySection.classList.remove("hidden");
}

function clearSearchHistory() {
  if (confirm("CLEAR ALL SEARCH HISTORY?")) {
    searchHistory = [];
    localStorage.removeItem("weatherSearchHistory");
    searchHistorySection.classList.add("hidden");
  }
}

// Autocomplete Functions
async function loadCitiesDatabase() {
  try {
    const response = await fetch("/static/cities.json");
    citiesDatabase = await response.json();
  } catch (error) {
    console.error("Failed to load cities database:", error);
    citiesDatabase = [];
  }
}

function handleCityInput(e) {
  const query = cityInput.value.trim();

  if (query.length < 2) {
    hideSuggestions();
    return;
  }

  const matches = citiesDatabase
    .filter((city) => city.name.toLowerCase().startsWith(query.toLowerCase()))
    .slice(0, 8); // Show max 8 suggestions

  if (matches.length === 0) {
    hideSuggestions();
    return;
  }

  displaySuggestions(matches);
}

function displaySuggestions(cities) {
  suggestionsBox.innerHTML = "";

  cities.forEach((city) => {
    const suggestion = document.createElement("div");
    suggestion.className = "suggestion-item";
    suggestion.innerHTML = `
      <span class="suggestion-city">${city.name}</span>
      <span class="suggestion-country">${city.country}</span>
    `;

    suggestion.addEventListener("click", () => {
      cityInput.value = city.name;
      hideSuggestions();
      getWeather();
    });

    suggestionsBox.appendChild(suggestion);
  });

  showSuggestions();
}

function showSuggestions() {
  suggestionsBox.classList.remove("hidden");
}

function hideSuggestions() {
  suggestionsBox.classList.add("hidden");
}

// Initialize
hideWeatherContent();
hideLoading();
hideHourlyForecast();
hideForecast();
hideRefreshButton();
loadSearchHistory();
loadCitiesDatabase();

// Update "last updated" time every minute
setInterval(() => {
  if (lastUpdateTime) {
    displayLastUpdateTime();
  }
}, 60000); // Update every 60 seconds
