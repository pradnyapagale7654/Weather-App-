const cityInput = document.getElementById("city");
const weatherEl = document.getElementById("weather");

const weatherCodes = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail"
};

const weatherIcons = {
    0: "☀️",
    1: "🌤️",
    2: "⛅",
    3: "☁️",
    45: "🌫️",
    48: "🌫️",
    51: "🌦️",
    53: "🌧️",
    55: "🌧️",
    56: "🌧️",
    57: "🌧️",
    61: "🌧️",
    63: "🌧️",
    65: "🌧️",
    66: "🌧️",
    67: "🌧️",
    71: "🌨️",
    73: "🌨️",
    75: "🌨️",
    77: "🌨️",
    80: "🌧️",
    81: "🌧️",
    82: "⛈️",
    85: "🌨️",
    86: "🌨️",
    95: "⛈️",
    96: "⛈️",
    99: "⛈️"
};

function getWeatherDescription(code) {
    return weatherCodes[code] || "Weather conditions unavailable";
}

function getWeatherIcon(code) {
    return weatherIcons[code] || "🌈";
}

function setStatus(message, isError = false) {
    weatherEl.innerHTML = `<p class="${isError ? "error" : "info"}">${message}</p>`;
}

async function getWeather() {
    const city = cityInput.value.trim();
    if (!city) {
        setStatus("Please enter a city name to continue.", true);
        return;
    }

    setStatus(`Searching weather for ${city}...`);

    try {
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
        if (!geoResponse.ok) {
            throw new Error("Location service is unavailable. Please try again later.");
        }

        const geoData = await geoResponse.json();
        if (!geoData.results || geoData.results.length === 0) {
            setStatus(`No location found for "${city}". Try another city.`, true);
            return;
        }

        const location = geoData.results[0];
        const latitude = location.latitude;
        const longitude = location.longitude;
        const locationName = `${location.name}${location.admin1 ? `, ${location.admin1}` : ""}${location.country ? `, ${location.country}` : ""}`;

        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`);
        if (!weatherResponse.ok) {
            throw new Error("Weather service is unavailable. Please try again later.");
        }

        const weatherData = await weatherResponse.json();
        if (!weatherData.current_weather) {
            throw new Error("Weather data is unavailable for this location.");
        }

        const current = weatherData.current_weather;
        weatherEl.innerHTML = `
            <div class="weather-card">
                <h2>${locationName}</h2>
                <div class="weather-icon">${getWeatherIcon(current.weathercode)}</div>
                <p class="temperature">${current.temperature.toFixed(1)}°C</p>
                <p class="condition">${getWeatherDescription(current.weathercode)}</p>
                <p>Wind: ${current.windspeed} km/h</p>
                <p>Observed: ${new Date(current.time).toLocaleString()}</p>
            </div>
        `;
    } catch (error) {
        setStatus(error.message, true);
        console.error(error);
    }
}

cityInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        getWeather();
    }
});
