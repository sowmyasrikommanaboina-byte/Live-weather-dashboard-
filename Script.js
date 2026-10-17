
const cityInput = document.getElementById("city");
const message = document.getElementById("message");

async function getWeather() {
  const city = cityInput.value.trim();

  if (!city) {
    message.textContent = "Please enter a city name.";
    return;
  }

  message.textContent = "Loading weather...";
  document.getElementById("weather").hidden = true;
  document.getElementById("forecast").innerHTML = "";

  try {
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );

    if (!geoResponse.ok) throw new Error("Unable to find city.");

    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("City not found. Check the spelling.");
    }

    const place = geoData.results[0];

    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}` +
      `&longitude=${place.longitude}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
      `&timezone=auto&forecast_days=5`;

    const response = await fetch(url);

    if (!response.ok) throw new Error("Weather data unavailable.");

    const data = await response.json();
    const current = data.current;
    const daily = data.daily;

    document.getElementById("cityName").textContent =
      place.name + (place.country ? ", " + place.country : "");

    document.getElementById("icon").textContent =
      getIcon(current.weather_code);

    document.getElementById("temperature").textContent =
      Math.round(current.temperature_2m) + "°C";

    document.getElementById("description").textContent =
      getDescription(current.weather_code);

    document.getElementById("details").textContent =
      `Feels like ${Math.round(current.apparent_temperature)}°C | Humidity ${current.relative_humidity_2m}%`;

    const forecast = document.getElementById("forecast");

    daily.time.forEach((date, i) => {
      const day = document.createElement("div");
      day.className = "day";

      const dateText = new Date(date + "T12:00:00")
        .toLocaleDateString("en", {
          weekday: "short",
          day: "numeric"
        });

      day.textContent =
        `${dateText} ${getIcon(daily.weather_code[i])} ` +
        `${Math.round(daily.temperature_2m_max[i])}° / ` +
        `${Math.round(daily.temperature_2m_min[i])}°`;

      forecast.appendChild(day);
    });

    document.getElementById("weather").hidden = false;
    message.textContent = "";

  } catch (error) {
    message.textContent = error.message ||
      "Something went wrong. Please try again.";
  }
}

function getIcon(code) {
  if (code === 0) return "☀️";
  if ([1, 2].includes(code)) return "🌤️";
  if (code === 3) return "☁️";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55, 56, 57].includes(code)) return "🌦️";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "🌧️";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "🌡️";
}

function getDescription(code) {
  if (code === 0) return "Clear sky";
  if ([1, 2].includes(code)) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if ([45, 48].includes(code)) return "Fog";
  if (code >= 51 && code <= 67) return "Drizzle or rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Rain showers";
  if (code >= 95) return "Thunderstorm";
  return "Current weather";
}

cityInput.addEventListener("keydown", function(event) {
  if (event.key === "Enter") getWeather();
});
      
