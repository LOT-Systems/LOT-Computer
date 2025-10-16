import axios from 'axios';
import config from '#server/config';
import { COUNTRY_BY_ALPHA3 } from '#shared/constants';
export async function getTimeZone(lat, lng) {
    const response = await axios.get(`http://api.geonames.org/timezoneJSON`, {
        params: {
            lat,
            lng,
            username: config.geonamesUsername,
        },
    });
    return response.data?.timezoneId || null;
}
export async function getWeather(lat, lon) {
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
        params: {
            lat,
            lon,
            appid: config.openWeatherApiKey,
        },
    });
    const data = response.data;
    return {
        humidity: data?.main?.humidity ?? null,
        tempKelvin: data?.main?.temp ?? null,
        sunrise: data?.sys?.sunrise ?? null,
        sunset: data?.sys?.sunset ?? null,
    };
}
export async function getCoordinates(city, countryCode // alpha3
) {
    const country = COUNTRY_BY_ALPHA3[countryCode];
    if (!country)
        return null;
    const response = await axios(`http://api.openweathermap.org/geo/1.0/direct`, {
        params: {
            q: `${city},${country.alpha2}`,
            limit: 1,
            appid: config.openWeatherApiKey,
        },
    });
    const data = response.data?.[0];
    if (!data)
        return null;
    if (data.country !== country.alpha2)
        return null;
    return data;
}
