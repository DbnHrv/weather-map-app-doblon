const DEFAULT_CENTER = { lat: 7.1907, lng: 125.4553 }; // Davao, PH

let map;
let marker;

// Initialize Google Map
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 5,
    center: DEFAULT_CENTER,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
  });
}

// Allow search on Enter key
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("cityInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") getWeather();
  });
});

async function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  const errorDiv = document.getElementById("error");
  const weatherDiv = document.getElementById("weatherResult");
  const btn = document.getElementById("searchBtn");

  // Reset UI
  errorDiv.textContent = "";
  weatherDiv.classList.add("hidden");
  weatherDiv.innerHTML = "";

  if (!city) {
    showError("Please enter a city name.");
    return;
  }

  // Loading state
  btn.disabled = true;
  btn.textContent = "Loading...";

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=b66ce80c7bc3c0ce74ae877a2da18ec2&units=metric`
    );

    if (!res.ok) {
      const messages = {
        404: "City not found. Please check the spelling.",
        401: "API key is invalid or not yet activated. New keys can take up to 2 hours to activate. Please check your OpenWeatherMap account.",
      };
      throw new Error(messages[res.status] || "Failed to fetch weather data.");
    }

    const data = await res.json();
    renderWeather(data);

  } catch (err) {
    showError(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "Search";
  }
}

function renderWeather(data) {
  const weatherDiv = document.getElementById("weatherResult");

  const name = data?.name ?? "Unknown";
  const country = data?.sys?.country ?? "";
  const temp = data?.main?.temp?.toFixed(1) ?? "N/A";
  const feelsLike = data?.main?.feels_like?.toFixed(1) ?? "N/A";
  const humidity = data?.main?.humidity ?? "N/A";
  const desc = data?.weather?.[0]?.description ?? "N/A";
  const icon = data?.weather?.[0]?.icon;
  const lat = data?.coord?.lat;
  const lon = data?.coord?.lon;

  const iconUrl = icon
    ? `https://openweathermap.org/img/wn/${icon}@2x.png`
    : "";

  weatherDiv.innerHTML = `
    <div class="weather-header">
      ${iconUrl ? `<img src="${iconUrl}" alt="${desc}" class="weather-icon">` : ""}
      <div>
        <h2>${name}${country ? `, ${country}` : ""}</h2>
        <p class="desc">${capitalize(desc)}</p>
      </div>
    </div>
    <div class="weather-stats">
      <div class="stat"><span class="label">Temperature</span><span class="value">${temp} °C</span></div>
      <div class="stat"><span class="label">Feels Like</span><span class="value">${feelsLike} °C</span></div>
      <div class="stat"><span class="label">Humidity</span><span class="value">${humidity}%</span></div>
    </div>
  `;

  weatherDiv.classList.remove("hidden");

  if (lat !== undefined && lon !== undefined) {
    updateMap(lat, lon, name);
  }
}

function updateMap(lat, lon, title = "Selected City") {
  if (!map) {
    console.warn("Map not initialized yet.");
    return;
  }

  const location = { lat, lng: lon };
  map.setCenter(location);
  map.setZoom(10);

  if (marker) marker.setMap(null);

  marker = new google.maps.Marker({
    position: location,
    map,
    title,
    animation: google.maps.Animation.DROP,
  });
}

function showError(msg) {
  document.getElementById("error").textContent = msg;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
