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
        url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={OPENWEATHER_API_KEY}&units=metric"
        response = requests.get(url, timeout=10)
        api_data = response.json()

        if response.status_code == 200:
            weather_data = {
                "name": api_data["name"],
                "country": api_data["sys"]["country"],
                "temp": api_data["main"]["temp"],
                "feels_like": api_data["main"]["feels_like"],
                "description": api_data["weather"][0]["description"].capitalize(),
                "icon": api_data["weather"][0]["icon"],
                "humidity": api_data["main"]["humidity"],
                "wind_speed": api_data["wind"]["speed"],
                "pressure": api_data["main"]["pressure"],
                "sunrise": api_data["sys"]["sunrise"],
                "sunset": api_data["sys"]["sunset"],
            }

            # Fetch UV Index (requires separate API call with coordinates)
            lat = api_data["coord"]["lat"]
            lon = api_data["coord"]["lon"]
            try:
                uv_url = f"https://api.openweathermap.org/data/2.5/uvi?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}"
                uv_response = requests.get(uv_url, timeout=5)
                if uv_response.status_code == 200:
                    uv_data = uv_response.json()
                    weather_data["uv_index"] = uv_data.get("value", 0)
                else:
                    weather_data["uv_index"] = None
            except Exception:
                weather_data["uv_index"] = None

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


@app.route("/api/weather/coordinates", methods=["POST"])
def get_weather_by_coordinates():
    """Get weather data from OpenWeatherMap API using coordinates"""
    data = request.get_json()
    lat = data.get("lat")
    lon = data.get("lon")

    if lat is None or lon is None:
        return jsonify({"error": "Latitude and longitude are required"}), 400

    try:
        url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
        response = requests.get(url, timeout=10)
        api_data = response.json()

        if response.status_code == 200:
            weather_data = {
                "name": api_data["name"],
                "country": api_data["sys"]["country"],
                "temp": api_data["main"]["temp"],
                "feels_like": api_data["main"]["feels_like"],
                "description": api_data["weather"][0]["description"].capitalize(),
                "icon": api_data["weather"][0]["icon"],
                "humidity": api_data["main"]["humidity"],
                "wind_speed": api_data["wind"]["speed"],
                "pressure": api_data["main"]["pressure"],
                "sunrise": api_data["sys"]["sunrise"],
                "sunset": api_data["sys"]["sunset"],
            }

            # Fetch UV Index (requires separate API call with coordinates)
            try:
                uv_url = f"https://api.openweathermap.org/data/2.5/uvi?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}"
                uv_response = requests.get(uv_url, timeout=5)
                if uv_response.status_code == 200:
                    uv_data = uv_response.json()
                    weather_data["uv_index"] = uv_data.get("value", 0)
                else:
                    weather_data["uv_index"] = None
            except Exception:
                weather_data["uv_index"] = None

            return jsonify(weather_data)
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


@app.route("/api/forecast", methods=["POST"])
def get_forecast():
    """Get 5-day weather forecast from OpenWeatherMap API"""
    data = request.get_json()
    city = data.get("city", "").strip()

    if not city:
        return jsonify({"error": "Please enter a city name"}), 400

    try:
        url = f"https://api.openweathermap.org/data/2.5/forecast?q={city}&appid={OPENWEATHER_API_KEY}&units=metric"
        response = requests.get(url, timeout=10)
        api_data = response.json()

        if response.status_code == 200:
            # Process forecast data - get one forecast per day at noon
            forecast_list = []
            processed_dates = set()

            for item in api_data["list"]:
                # Get date from timestamp
                date_str = item["dt_txt"].split(" ")[0]

                # Only add one entry per day (prefer noon time)
                if date_str not in processed_dates:
                    forecast_list.append(
                        {
                            "date": item["dt_txt"],
                            "temp": item["main"]["temp"],
                            "temp_min": item["main"]["temp_min"],
                            "temp_max": item["main"]["temp_max"],
                            "description": item["weather"][0][
                                "description"
                            ].capitalize(),
                            "icon": item["weather"][0]["icon"],
                            "humidity": item["main"]["humidity"],
                            "wind_speed": item["wind"]["speed"],
                        }
                    )
                    processed_dates.add(date_str)

                # Limit to 5 days
                if len(forecast_list) >= 5:
                    break

            return jsonify(
                {"city": api_data["city"]["name"], "forecasts": forecast_list}
            )
        elif response.status_code == 404:
            return jsonify(
                {"error": "City not found! Please check the city name."}
            ), 404
        elif response.status_code == 401:
            return (
                jsonify(
                    {
                        "error": "Invalid API key! Your API key might need time to activate (up to 2 hours)."
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


@app.route("/api/forecast/coordinates", methods=["POST"])
def get_forecast_by_coordinates():
    """Get 5-day weather forecast using coordinates"""
    data = request.get_json()
    lat = data.get("lat")
    lon = data.get("lon")

    if lat is None or lon is None:
        return jsonify({"error": "Latitude and longitude are required"}), 400

    try:
        url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
        response = requests.get(url, timeout=10)
        api_data = response.json()

        if response.status_code == 200:
            # Process forecast data - get one forecast per day
            forecast_list = []
            processed_dates = set()

            for item in api_data["list"]:
                # Get date from timestamp
                date_str = item["dt_txt"].split(" ")[0]

                # Only add one entry per day
                if date_str not in processed_dates:
                    forecast_list.append(
                        {
                            "date": item["dt_txt"],
                            "temp": item["main"]["temp"],
                            "temp_min": item["main"]["temp_min"],
                            "temp_max": item["main"]["temp_max"],
                            "description": item["weather"][0][
                                "description"
                            ].capitalize(),
                            "icon": item["weather"][0]["icon"],
                            "humidity": item["main"]["humidity"],
                            "wind_speed": item["wind"]["speed"],
                        }
                    )
                    processed_dates.add(date_str)

                # Limit to 5 days
                if len(forecast_list) >= 5:
                    break

            return jsonify(
                {"city": api_data["city"]["name"], "forecasts": forecast_list}
            )
        elif response.status_code == 401:
            return (
                jsonify(
                    {
                        "error": "Invalid API key! Your API key might need time to activate (up to 2 hours)."
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


@app.route("/api/hourly", methods=["POST"])
def get_hourly_forecast():
    """Get hourly weather forecast from OpenWeatherMap API"""
    data = request.get_json()
    city = data.get("city", "").strip()

    if not city:
        return jsonify({"error": "Please enter a city name"}), 400

    try:
        url = f"https://api.openweathermap.org/data/2.5/forecast?q={city}&appid={OPENWEATHER_API_KEY}&units=metric"
        response = requests.get(url, timeout=10)
        api_data = response.json()

        if response.status_code == 200:
            # Get next 24 hours (8 entries x 3-hour intervals = 24 hours)
            hourly_list = []

            for item in api_data["list"][:8]:  # First 8 entries = 24 hours
                hourly_list.append(
                    {
                        "time": item["dt_txt"],
                        "temp": item["main"]["temp"],
                        "description": item["weather"][0]["description"].capitalize(),
                        "icon": item["weather"][0]["icon"],
                        "humidity": item["main"]["humidity"],
                        "wind_speed": item["wind"]["speed"],
                        "pop": item.get("pop", 0) * 100,  # Probability of precipitation
                    }
                )

            return jsonify({"city": api_data["city"]["name"], "hourly": hourly_list})
        elif response.status_code == 404:
            return jsonify(
                {"error": "City not found! Please check the city name."}
            ), 404
        elif response.status_code == 401:
            return (
                jsonify(
                    {
                        "error": "Invalid API key! Your API key might need time to activate (up to 2 hours)."
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


@app.route("/api/hourly/coordinates", methods=["POST"])
def get_hourly_forecast_by_coordinates():
    """Get hourly weather forecast using coordinates"""
    data = request.get_json()
    lat = data.get("lat")
    lon = data.get("lon")

    if lat is None or lon is None:
        return jsonify({"error": "Latitude and longitude are required"}), 400

    try:
        url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
        response = requests.get(url, timeout=10)
        api_data = response.json()

        if response.status_code == 200:
            # Get next 24 hours (8 entries x 3-hour intervals = 24 hours)
            hourly_list = []

            for item in api_data["list"][:8]:  # First 8 entries = 24 hours
                hourly_list.append(
                    {
                        "time": item["dt_txt"],
                        "temp": item["main"]["temp"],
                        "description": item["weather"][0]["description"].capitalize(),
                        "icon": item["weather"][0]["icon"],
                        "humidity": item["main"]["humidity"],
                        "wind_speed": item["wind"]["speed"],
                        "pop": item.get("pop", 0) * 100,  # Probability of precipitation
                    }
                )

            return jsonify({"city": api_data["city"]["name"], "hourly": hourly_list})
        elif response.status_code == 401:
            return (
                jsonify(
                    {
                        "error": "Invalid API key! Your API key might need time to activate (up to 2 hours)."
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
            "icon": "02d",
            "wind_speed": 3.5,
            "sunrise": 1705305600,
            "sunset": 1705339200,
            "uv_index": 3.5,
        },
        "new york": {
            "name": "New York",
            "country": "US",
            "temp": 22.0,
            "feels_like": 21.5,
            "humidity": 65,
            "pressure": 1015,
            "description": "Clear sky",
            "icon": "01d",
            "wind_speed": 4.2,
            "sunrise": 1705326000,
            "sunset": 1705359600,
            "uv_index": 5.8,
        },
        "tokyo": {
            "name": "Tokyo",
            "country": "JP",
            "temp": 18.8,
            "feels_like": 18.0,
            "humidity": 80,
            "pressure": 1010,
            "description": "Light rain",
            "icon": "10d",
            "wind_speed": 2.8,
            "sunrise": 1705312800,
            "sunset": 1705346400,
            "uv_index": 2.1,
        },
        "paris": {
            "name": "Paris",
            "country": "FR",
            "temp": 16.3,
            "feels_like": 15.8,
            "humidity": 68,
            "pressure": 1012,
            "description": "Scattered clouds",
            "icon": "03d",
            "wind_speed": 3.1,
            "sunrise": 1705308000,
            "sunset": 1705341600,
            "uv_index": 4.2,
        },
    }

    return demo_data.get(city.lower())


if __name__ == "__main__":
    print("\n" + "=" * 50)
    print("🌤️  Weather App is running!")
    print("=" * 50)
    port = int(os.environ.get("PORT", 8080))
    print(f"📍 Open your browser and go to: http://localhost:{port}")
    print("=" * 50 + "\n")

    # Use debug=False in production
    debug_mode = os.environ.get("FLASK_ENV") != "production"
    app.run(debug=debug_mode, host="0.0.0.0", port=port)
