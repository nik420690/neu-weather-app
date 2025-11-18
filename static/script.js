// State management
let isDarkMode = false;
let isImperial = false;
let currentWeatherData = null;

// DOM Elements
const themeBtn = document.getElementById("themeBtn");
const unitBtn = document.getElementById("unitBtn");
const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const weatherCard = document.getElementById("weatherCard");
const weatherContent = document.getElementById("weatherContent");
const loadingSpinner = document.getElementById("loadingSpinner");
const errorMessage = document.getElementById("errorMessage");

// Weather display elements
const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const pressure = document.getElementById("pressure");

// Event Listeners
themeBtn.addEventListener("click", toggleTheme);
unitBtn.addEventListener("click", toggleUnits);
searchBtn.addEventListener("click", getWeather);
cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    getWeather();
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
      displayWeather(data);
    } else {
      showError("❌ " + (data.error || "AN ERROR OCCURRED").toUpperCase());
      hideWeatherContent();
    }
  } catch (error) {
    showError("❌ FAILED TO FETCH WEATHER DATA. PLEASE TRY AGAIN.");
    hideWeatherContent();
  } finally {
    hideLoading();
  }
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
  temperature.textContent = `${temp.toFixed(1)}${tempUnit}`;
  description.textContent = data.description.toUpperCase();

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
  temperature.textContent = "";
  description.textContent = "";
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

// Initialize
hideWeatherContent();
hideLoading();
