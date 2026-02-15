import { useState, useEffect } from 'react';
import axios from 'axios';
const api_key = import.meta.env.VITE_WEATHER_KEY;

function App() {
  const [search, setSearch] = useState('');
  const [countries, setCountries] = useState([]);
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const baseURL = 'https://studies.cs.helsinki.fi/restcountries';

    axios.get(`${baseURL}/api/all`).then((response) => {
      setCountries(response.data);
    });
  }, []);

  const handleSearch = (event) => {
    setSearch(event.target.value);
  };
  const filterCountries = countries.filter((country) => {
    return country.name.common.toLowerCase().includes(search.toLowerCase());
  });

  useEffect(() => {
    if (!search) return;

    const matchedCountries = countries.filter((country) =>
      country.name.common.toLowerCase().includes(search.toLowerCase()),
    );
    if (matchedCountries.length === 1) {
      const country = matchedCountries[0];
      if (country.capitalInfo?.latlng) {
        const [lat, lon] = country.capitalInfo.latlng;

        axios
          .get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}&units=metric`,
          )
          .then((response) => {
            setWeather(response.data);
          })
          .catch((err) => {
            console.error('Weather API error:', err);
          });
      }
    }
  }, [search, countries]);

  const handleShowButton = (countryName) => {
    setSearch(countryName);
  };

  return (
    <>
      find countries <input value={search} onChange={handleSearch} />
      {search && (
        <>
          {filterCountries.length === 0 && <p>No matches found</p>}

          {filterCountries.length === 1 && (
            <div>
              <h2>{filterCountries[0].name.common}</h2>
              <p>Capital: {filterCountries[0].capital}</p>
              <p>Area: {filterCountries[0].area}</p>
              <h3>Languages</h3>
              <ul>
                {Object.values(filterCountries[0].languages).map((lang) => (
                  <li key={lang}>{lang}</li>
                ))}
              </ul>
              <img
                src={filterCountries[0].flags.png}
                alt={`Flag of ${filterCountries[0].name.common}`}
                width={100}
              />
              <h2>Weather in {filterCountries[0].capital}</h2>
              {weather && (
                <div>
                  <p>temperature {weather.main.temp} Celsius</p>
                  <img
                    src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                  />
                  <p>Wind {weather.wind.speed} m/s</p>
                </div>
              )}
            </div>
          )}

          {filterCountries.length > 1 && filterCountries.length <= 10 && (
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {filterCountries.map((country) => (
                <li key={country.name.common}>
                  {country.name.common}{' '}
                  <button onClick={() => handleShowButton(country.name.common)}>
                    show
                  </button>
                </li>
              ))}
            </ul>
          )}

          {filterCountries.length > 10 && (
            <p>Too many matches, specify another filter</p>
          )}
        </>
      )}
    </>
  );
}

export default App;
