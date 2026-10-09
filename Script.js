
const form = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const message = document.getElementById("message");
const currentWeather = document.getElementById("currentWeather");
const forecast = document.getElementById("forecast");
const forecastSection = document.getElementById("forecastSection");

function getWeather(code) {
  if (code === 0) return ["☀️", "Clear sky"];
  if ([1, 2].includes(code)) return ["🌤️", "Partly cloudy"];
  if (code === 3) return ["☁️", "Overcast"];
  if ([45, 48].includes(code)) return ["🌫️", "Fog"];
  if ([51, 53, 55, 56, 57].includes(code))
    return ["🌦️", "Drizzle"];
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return ["🌧️", "Rain"];
  if ([71, 73, 75, 77, 85, 86].includes(code))
    return ["❄️", "Snow"];
  if ([95, 96, 99].includes(code))
    return ["⛈️", "Thunderstorm"];

  return ["🌡️", "Weather conditions"];
}

function showError(text) {
  message.textContent = text;
}

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const city = cityInput.value.trim();

  if (!city) {
    showError("Please enter a city name.");
    return;
  }

  searchBtn.disabled = true;
  searchBtn.textContent = "Loading...";
  message.textContent = "Fetching weather data...";
  currentWeather.replaceChildren();
  forecast.replaceChildren();
  forecastSection.hidden = true;

  try {
    const geoUrl =
      "https://geocoding-api.open-meteo.com/v1/search?name=" +
      encodeURIComponent(city) +
      "&count=1&language=en&format=json";

    const geoResponse = await fetch(geoUrl);

    if (!geoResponse.ok) {
      throw new Error("Network error. Please try again.");
    }

    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("City not found. Check the spelling.");
    }

    const place = geoData.results[0];

    const weatherUrl =
      "https://api.open-meteo.com/v1/forecast?" +
      "latitude=" + place.latitude +
      "&longitude=" + place.longitude +
      "&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code" +
      "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
      "&forecast_days=5&timezone=auto";

    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) {
      throw new Error("Weather data is unavailable.");
    }

    const data = await weatherResponse.json();
    const now = data.current;
    const info = getWeather(now.weather_code);

    const heading = document.createElement("h2");
    heading.textContent =
      place.name + (place.country ? ", " + place.country : "");

    const icon = document.createElement("div");
    icon.className = "weather-icon";
    icon.textContent = info[0];

    const temperature = document.createElement("div");
    temperature.className = "temperature";
    temperature.textContent =
      now.temperature_2m + "°" + data.current_units.temperature_2m;

    const condition = document.createElement("p");
    condition.textContent = info[1];

    const details = document.createElement("div");
    details.className = "details";

    const feels = document.createElement("div");
    feels.className = "detail";
    feels.textContent = "Feels like: " + now.apparent_temperature + "°C";

    const humidity = document.createElement("div");
    humidity.className = "detail";
    humidity.textContent = "Humidity: " + now.relative_humidity_2m + "%";

    details.append(feels, humidity);
    currentWeather.append(heading, icon, temperature, condition, details);

    data.daily.time.forEach(function (date, index) {
      const card = document.createElement("article");
      card.className = "day-card";

      const dayName = document.createElement("strong");
      dayName.textContent = new Date(date + "T12:00:00")
        .toLocaleDateString("en-IN", {
          weekday: "short",
          day: "numeric"
        });

      const dayWeather = getWeather(data.daily.weather_code[index]);

      const dayIcon = document.createElement("div");
      dayIcon.className = "weather-icon";
      dayIcon.textContent = dayWeather[0];

      const dayCondition = document.createElement("p");
      dayCondition.textContent = dayWeather[1];

      const maxTemp = document.createElement("strong");
      maxTemp.textContent = data.daily.temperature_2m_max[index] + "°";

      const minTemp = document.createElement("p");
      minTemp.textContent = data.daily.temperature_2m_min[index] + "°";

      card.append(dayName, dayIcon, dayCondition, maxTemp, minTemp);
      forecast.appendChild(card);
    });

    forecastSection.hidden = false;
    message.textContent = "";

  } catch (error) {
    showError(error.message ||
      "Unable to load weather. Check your internet connection.");
  } finally {
    searchBtn.disabled = false;
    searchBtn.textContent = "Search";
  }
});
