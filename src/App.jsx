import { useEffect , useState } from "react";
import axios from "axios";
import "./App.css";
// import "bootstrap/dist/css/bootstrap.min.css";

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);
  const [hourly, setHourly] = useState([]);
  const [daily, setDaily] = useState([]);


  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

  const fetchWeather = async (cityName) => {
    try {
      setError(null);
      const geoResponse = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`
      );
      
      if (!geoResponse.data.length) {
        setError("City not found");
        return;
      }
      
      const { lat, lon } = geoResponse.data[0];

      const currentWeatherPromise = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );

      const forecastPromise = axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );

      const [weatherResponse, forecastResponse] = await Promise.all([
        currentWeatherPromise,
        forecastPromise,
      ]);
      
      setWeather(weatherResponse.data);
      // console.log(weatherResponse.data);

      setHourly(forecastResponse.data.list.slice(0, 24));
      console.log(forecastResponse.data.list.slice(0, 24));

      setDaily(groupDaily(forecastResponse.data.list));
      console.log(groupDaily(forecastResponse.data.list));

    } catch (err) {
      setError("Error fetching weather data");
    }
  };

  function groupDaily(forecastList) {
    const dailyMap = {};

    forecastList.forEach((item) => {
      const date = item.dt_txt.split(" ")[0];
      const hour = parseInt(item.dt_txt.split(" ")[1].split(":")[0]);

      // Pick the forecast closest to 12:00 (midday)
      if (
        !dailyMap[date] ||
        Math.abs(hour - 12) <
          Math.abs(new Date(dailyMap[date].dt_txt).getHours() - 12)
      ) {
        dailyMap[date] = item;
      }
    });

    return Object.values(dailyMap).slice(0, 5); // Return only the next 5 days
  }


  const handleSubmit = (e) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeather(city);
    }
  };
  

  // const getBackgroundImage = (iconCode) => {
  //   if (iconCode === "01d") return "clear.jpeg";
  //   if (iconCode === "01n") return "nightClear.jpg";

  //   const main = iconCode.slice(0, 2); // general weather code

  //   switch (main) {
  //     case "02":
  //     case "03":
  //     case "04":
  //       return "clouds.gif";
  //     case "09":
  //     case "10":
  //       return "rain.gif";
  //     case "13":
  //       return "snow.gif";
  //     case "11":
  //       return "thunder.gif";
  //     default:
  //       return null;
  //   }
  // };

  // const backgroundImage = weather
  //   ? `url("/assets/${getBackgroundImage(weather.weather[0].icon)}")`
  //   : "none";

  return (
    <div
      className="weather-app"
      // style={{
      //   backgroundImage: backgroundImage,
      //   backgroundSize: "cover",
      //   backgroundRepeat: "no-repeat",
      //   backgroundPosition: "center",
      //   // minHeight: "100vh",
      //   width: "100wh",
      //   padding: "2rem",
      //   color: "#fff",
      // }}
    >
      <h1>Weather App</h1>
      <div className="weather-card">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter city name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button type="submit">Get Weather</button>
        </form>
        {error && <p className="error">{error}</p>}
        {weather && (
          <div className="weather-info">
            <div className="weather-header">
              <img
                className="weather-icon"
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`}
                alt={weather.weather[0].description}
              />
              <p className="city-name">{weather.name}</p>
              <p className="temp">{Math.round(weather.main.temp)}°</p>
              <p className="weather-desc">{weather.weather[0].description}</p>
              <div className="temp-range">
                <p>H: {Math.round(weather.main.temp_max)}°</p>
                <p>L: {Math.round(weather.main.temp_min)}°</p>
              </div>
            </div>

            <div className="card3 hourly-scroll-card">
              {/* <p className="card-title">
            <i className="bi bi-clock-history"></i> Hourly Forecast
          </p> */}
              <div className="hourly-scroll-container">
                {hourly.map((hour, index) => (
                  <div key={index} className="hourly-card">
                    <p>{new Date(hour.dt * 1000).getHours()}:00</p>
                    <img
                      src={`https://openweathermap.org/img/wn/${hour.weather[0].icon}.png`}
                      alt={hour.weather[0].description}
                    />
                    <p>{Math.round(hour.main.temp)}°</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card4 daily-scroll-card">
              {/* <p className="card-title">5-Day Forecast</p> */}
              <div className="daily-scroll-container">
                {daily.map((day, index) => (
                  <div key={index} className="daily-card">
                    <div className="day">
                      <p>
                        {new Date(day.dt * 1000).toLocaleDateString(undefined, {
                          weekday: "short",
                        })}
                      </p>
                      <img
                        src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                        alt={day.weather[0].description}
                      />
                    </div>
                    <p>{day.weather[0].main}</p>
                    <p>{Math.round(day.main.temp)}°</p>
                    {/* <p>{day.weather[0].main}</p> */}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-cards">
              <div className="card">
                <p className="card-title">
                  <i className="bi bi-graph-up-arrow"></i> Averages
                </p>
                <p className="card-desc">Average °</p>
                <p className="card-desc averages">
                  Today H: {Math.round(weather.main.temp_max)}°
                </p>
                <p className="card-desc averages">Average H: °</p>
              </div>
              <div className="card">
                <p className="card-title">
                  <i className="bi bi-thermometer-half"></i> Feels Like
                </p>
                <p className="card-desc">
                  {Math.round(weather.main.feels_like)}°
                </p>
              </div>
            </div>

            <div className="cards">
              <div className="card2">
                <p className="card-title">
                  <i className="bi bi-wind"></i> Wind
                </p>
                <div className="bottom-border">
                  <div className="desc">
                    <p className="card2-desc">Wind</p>
                    <p className="desc-details">
                      {Math.round(weather.wind.speed)} m/s
                    </p>
                  </div>
                </div>

                <div className="bottom-border">
                  <div className="desc">
                    <p className="card2-desc">Gusts </p>
                    <p className="desc-details">
                      {Math.round(weather.wind.gust)} m/s
                    </p>
                  </div>
                </div>

                <div>
                  <div className="desc">
                    <p className="card2-desc">Direction </p>
                    <p className="desc-details">{weather.wind.deg}°</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-cards">
              <div className="card">
                <p className="card-title">
                  <i className="bi bi-sunrise"></i> SUNRISE
                </p>
                <p className="card-desc">
                  {new Date(weather.sys.sunrise * 1000).toLocaleTimeString()}
                </p>
              </div>
              <div className="card">
                <p className="card-title">
                  <i className="bi bi-sunset"></i> SUNSET
                </p>
                <p className="card-desc">
                  {new Date(weather.sys.sunset * 1000).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="flex-cards">
              <div className="card">
                <p className="card-title">
                  <i className="bi bi-eye-fill"></i> Visibility
                </p>
                <p className="card-desc">{weather.visibility / 1000} km</p>
              </div>
              <div className="card">
                <p className="card-title">
                  <i className="bi bi-clouds-fill"></i> Cloudiness
                </p>
                <p className="card-desc"> {weather.clouds.all}%</p>
              </div>
            </div>

            <div className="flex-cards">
              <div className="card">
                <p className="card-title">
                  <i className="bi bi-droplet-fill"></i> Humidity
                </p>
                <p className="card-desc">{weather.main.humidity}%</p>
              </div>
              <div className="card">
                <p className="card-title">
                  <i className="bi bi-speedometer2"></i> Pressure
                </p>
                <p className="card-desc">{weather.main.pressure} hPa</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
