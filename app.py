import os

import requests
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

# API Configuration - Use environment variable for security
OPENWEATHER_API_KEY = os.environ.get(
    "OPENWEATHER_API_KEY", "4bd917d8b2b904ea5b37470b70cd260c"
)


@app.route("/")
def index():
    """Render the main page"""
    return render_template("index.html")


@app.route("/api/weather", methods=["POST"])
def get_weather():
    """Get weather data from OpenWeatherMap API"""
    data = request.get_json()
    city = data.get("city", "").strip()
    demo_mode = data.get("demo_mode", False)

    if not city:
        return jsonify({"error": "Please enter a city name"}), 400

    # Demo Mode
    if demo_mode:
        demo_data = get_demo_weather(city)
        if demo_data:
            return jsonify(demo_data)
        else:
            return (
                jsonify(
                    {
                        "error": f"'{city}' not available in demo mode. Try: London, New York, Tokyo, or Paris"
                    }
                ),
                404,
            )

    # Real API Mode
    try:
        url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={OPENWEATHER_API_KEY}&units=metric"
        response = requests.get(url, timeout=10)
        api_data = response.json()

        if response.status_code == 200:
            weather_data = {
                "name": api_data["name"],
                "country": api_data["sys"]["country"],
                "temp": api_data["main"]["temp"],
                "feels_like": api_data["main"]["feels_like"],
                "description": api_data["weather"][0]["description"].capitalize(),
                "humidity": api_data["main"]["humidity"],
                "wind_speed": api_data["wind"]["speed"],
                "pressure": api_data["main"]["pressure"],
            }
            return jsonify(weather_data)
        elif response.status_code == 404:
            return jsonify(
                {"error": "City not found! Please check the city name."}
            ), 404
        elif response.status_code == 401:
            return (
                jsonify(
                    {
                        "error": "Invalid API key! Your API key might need time to activate (up to 2 hours). Try Demo Mode instead!"
                    }
                ),
                401,
            )
        else:
            return (
                jsonify(
                    {"error": f"Error: {api_data.get('message', 'Unknown error')}"}
                ),
                500,
            )

    except requests.exceptions.ConnectionError:
        return jsonify({"error": "No internet connection!"}), 500
    except requests.exceptions.Timeout:
        return jsonify({"error": "Request timed out! Please try again."}), 500
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


def get_demo_weather(city):
    """Return sample weather data for demo mode"""
    demo_data = {
        "london": {
            "name": "London",
            "country": "GB",
            "temp": 15.5,
            "feels_like": 14.2,
            "humidity": 72,
            "pressure": 1013,
            "description": "Partly cloudy",
            "wind_speed": 3.5,
        },
        "new york": {
            "name": "New York",
            "country": "US",
            "temp": 22.0,
            "feels_like": 21.5,
            "humidity": 65,
            "pressure": 1015,
            "description": "Clear sky",
            "wind_speed": 4.2,
        },
        "tokyo": {
            "name": "Tokyo",
            "country": "JP",
            "temp": 18.8,
            "feels_like": 18.0,
            "humidity": 80,
            "pressure": 1010,
            "description": "Light rain",
            "wind_speed": 2.8,
        },
        "paris": {
            "name": "Paris",
            "country": "FR",
            "temp": 16.3,
            "feels_like": 15.8,
            "humidity": 68,
            "pressure": 1012,
            "description": "Scattered clouds",
            "wind_speed": 3.1,
        },
    }

    return demo_data.get(city.lower())


if __name__ == "__main__":
    print("\n" + "=" * 50)
    print("🌤️  Weather App is running!")
    print("=" * 50)
    port = int(os.environ.get("PORT", 5000))
    print(f"📍 Open your browser and go to: http://localhost:{port}")
    print("=" * 50 + "\n")

    # Use debug=False in production
    debug_mode = os.environ.get("FLASK_ENV") != "production"
    app.run(debug=debug_mode, host="0.0.0.0", port=port)
