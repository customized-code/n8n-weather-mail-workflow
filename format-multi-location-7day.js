// Process all weather items and match with location data
const weatherItems = $input.all();
const locationItems = $('Parse & Split Locations').all();

// Process each weather response
const results = weatherItems.map((weatherItem, index) => {
  const weather = weatherItem.json;
  const locationData = locationItems[index].json;

  const locationName = locationData.locationName || 'Unknown';
  const latitude = weather.latitude || locationData.lat;
  const longitude = weather.longitude || locationData.lon;
  const units = locationData.units || 'us';

  // Extract current weather data
  const currently = weather.currently || {};
  const daily = weather.daily?.data?.[0] || {};
  const dailyForecast = weather.daily?.data || [];
  const hourly = weather.hourly?.data || [];

  // Format temperature based on units
  const getTemp = (temp) => {
    if (!temp) return 'N/A';
    const unit = units === 'si' || units === 'ca' ? '°C' : '°F';
    return `${Math.round(temp)}${unit}`;
  };

  // Format wind speed
  const getWindSpeed = (speed) => {
    if (!speed) return 'N/A';
    const unit = units === 'si' ? 'm/s' : (units === 'ca' ? 'km/h' : 'mph');
    return `${Math.round(speed)} ${unit}`;
  };

  // Get weather icon description
  const getIconDescription = (icon) => {
    const icons = {
      'clear-day': '☀️ Clear',
      'clear-night': '🌙 Clear',
      'rain': '🌧️ Rain',
      'snow': '❄️ Snow',
      'sleet': '🌨️ Sleet',
      'wind': '💨 Windy',
      'fog': '🌫️ Foggy',
      'cloudy': '☁️ Cloudy',
      'partly-cloudy-day': '⛅ Partly Cloudy',
      'partly-cloudy-night': '☁️ Partly Cloudy'
    };
    return icons[icon] || '🌤️ ' + icon;
  };

  // Build weather details
  const weatherDetails = [
    `Current Conditions: ${getIconDescription(currently.icon)}`,
    `Temperature: ${getTemp(currently.temperature)}`,
    `Feels Like: ${getTemp(currently.apparentTemperature)}`,
    `Humidity: ${Math.round(currently.humidity * 100)}%`,
    `Wind Speed: ${getWindSpeed(currently.windSpeed)}`,
    `Wind Gust: ${getWindSpeed(currently.windGust)}`,
    `Precipitation Probability: ${Math.round((currently.precipProbability || 0) * 100)}%`,
    `Cloud Cover: ${Math.round((currently.cloudCover || 0) * 100)}%`,
    `UV Index: ${currently.uvIndex || 'N/A'}`,
    `Visibility: ${currently.visibility || 'N/A'} miles`,
    `Pressure: ${currently.pressure ? Math.round(currently.pressure) + ' mb' : 'N/A'}`,
    ``,
    `Today's Forecast:`,
    `High: ${getTemp(daily.temperatureHigh)} at ${new Date(daily.temperatureHighTime * 1000).toLocaleTimeString()}`,
    `Low: ${getTemp(daily.temperatureLow)} at ${new Date(daily.temperatureLowTime * 1000).toLocaleTimeString()}`,
    `Summary: ${daily.summary || currently.summary || 'No summary available'}`
  ];

  // Add next 6 hours forecast
  weatherDetails.push('', '6-Hour Forecast:');
  hourly.slice(0, 6).forEach((hour, i) => {
    const time = new Date(hour.time * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    weatherDetails.push(`${time}: ${getTemp(hour.temperature)}, ${getIconDescription(hour.icon)}`);
  });

  // Add 7-day forecast
  weatherDetails.push('', '7-Day Forecast:');
  dailyForecast.slice(0, 7).forEach((day, i) => {
    const dayName = new Date(day.time * 1000).toLocaleDateString('en-US', { weekday: 'long' });
    const high = getTemp(day.temperatureHigh);
    const low = getTemp(day.temperatureLow);
    const precip = Math.round((day.precipProbability || 0) * 100);
    weatherDetails.push(`${dayName}: High ${high}, Low ${low}, ${getIconDescription(day.icon)}, ${precip}% precip`);
  });

  const weatherInfo = weatherDetails.join('\n');

  // Create HTML formatted email
  const htmlBody = `
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 20px; }
    .weather-report { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .location { font-size: 18px; opacity: 0.9; margin-top: 5px; }
    .current-weather { background: #f8f9fa; padding: 25px; text-align: center; border-bottom: 2px solid #e9ecef; }
    .temperature { font-size: 48px; font-weight: bold; color: #667eea; margin: 10px 0; }
    .condition { font-size: 24px; color: #666; }
    .details { padding: 25px; }
    .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e9ecef; }
    .detail-label { font-weight: 600; color: #555; }
    .detail-value { color: #777; }
    .forecast-section { background: #f8f9fa; padding: 20px 25px; margin: 20px 0; border-radius: 8px; }
    .forecast-title { font-size: 18px; font-weight: 600; color: #667eea; margin-bottom: 15px; }
    .hourly-item { padding: 8px 0; border-bottom: 1px solid #dee2e6; }
    .forecast-day { padding: 12px 0; border-bottom: 1px solid #dee2e6; display: flex; justify-content: space-between; align-items: center; }
    .day-name { font-weight: 600; color: #555; min-width: 100px; }
    .day-temps { color: #667eea; font-weight: 500; }
    .day-condition { color: #777; flex: 1; text-align: right; }
    .footer { background: #343a40; color: #adb5bd; padding: 15px; text-align: center; font-size: 12px; }
  </style>
</head>
<body>
  <div class="weather-report">
    <div class="header">
      <h1>🌤️ Weather Report</h1>
      <div class="location">${locationName}</div>
      <div class="location" style="font-size: 14px; margin-top: 10px;">${latitude}°, ${longitude}°</div>
    </div>

    <div class="current-weather">
      <div class="condition">${getIconDescription(currently.icon)}</div>
      <div class="temperature">${getTemp(currently.temperature)}</div>
      <div style="color: #888; font-size: 16px;">Feels like ${getTemp(currently.apparentTemperature)}</div>
    </div>

    <div class="details">
      <div class="detail-row">
        <span class="detail-label">💧 Humidity</span>
        <span class="detail-value">${Math.round(currently.humidity * 100)}%</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">💨 Wind Speed</span>
        <span class="detail-value">${getWindSpeed(currently.windSpeed)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">🌧️ Precipitation</span>
        <span class="detail-value">${Math.round((currently.precipProbability || 0) * 100)}%</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">☁️ Cloud Cover</span>
        <span class="detail-value">${Math.round((currently.cloudCover || 0) * 100)}%</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">☀️ UV Index</span>
        <span class="detail-value">${currently.uvIndex || 'N/A'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">👁️ Visibility</span>
        <span class="detail-value">${currently.visibility || 'N/A'} miles</span>
      </div>
    </div>

    <div style="padding: 0 25px;">
      <div class="forecast-section">
        <div class="forecast-title">📅 Today's Forecast</div>
        <div style="color: #666;">
          <strong>High:</strong> ${getTemp(daily.temperatureHigh)} <br>
          <strong>Low:</strong> ${getTemp(daily.temperatureLow)} <br>
          <strong>Summary:</strong> ${daily.summary || currently.summary || 'No summary available'}
        </div>
      </div>

      <div class="forecast-section">
        <div class="forecast-title">⏰ 6-Hour Forecast</div>
        ${hourly.slice(0, 6).map(hour => `
          <div class="hourly-item">
            ${new Date(hour.time * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}:
            <strong>${getTemp(hour.temperature)}</strong> -
            ${getIconDescription(hour.icon)}
          </div>
        `).join('')}
      </div>

      <div class="forecast-section">
        <div class="forecast-title">📆 7-Day Forecast</div>
        ${dailyForecast.slice(0, 7).map((day, index) => `
          <div class="forecast-day">
            <span class="day-name">${new Date(day.time * 1000).toLocaleDateString('en-US', { weekday: 'long' })}</span>
            <span class="day-temps">High ${getTemp(day.temperatureHigh)} / Low ${getTemp(day.temperatureLow)}</span>
            <span class="day-condition">${getIconDescription(day.icon)} ${Math.round((day.precipProbability || 0) * 100)}%</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="footer">
      <p>Powered by PirateWeather API | Generated ${new Date().toLocaleString()}</p>
      <p style="margin-top: 5px; font-size: 11px;">Data updated: ${new Date(currently.time * 1000).toLocaleTimeString()}</p>
    </div>
  </div>
</body>
</html>
`;

  return {
    json: {
      location: locationName,
      coordinates: `${latitude}, ${longitude}`,
      weatherInfo: weatherInfo,
      htmlBody: htmlBody,
      temperature: currently.temperature,
      conditions: currently.icon,
      timestamp: new Date().toISOString(),
      rawData: weather
    }
  };
});

return results;
