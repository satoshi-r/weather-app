class Api {
    async getCurrentWeather(lat, lon) {
        try {
            const data = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.VUE_APP_API_CURRENT_WEATHER}&units=metric`);
            return data.json();
        } catch (error) {
            console.error(error);
            alert('Ошибка загрузки. Попробуйте обновить страницу');
        }
    }

    async getForecastWeather(lat, lon) {
        try {
            const data = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.VUE_APP_API_CURRENT_WEATHER}&units=metric`);
            return data.json();
        } catch (error) {
            console.error(error);
            alert('Ошибка загрузки. Попробуйте обновить страницу');
        }
    }

    getLocation(lat, lon) {
        return new Promise((resolve, reject) => {
            const url =
                "https://suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/address";
            const token = process.env.VUE_APP_API_GET_LOCATION;
            const query = {lat, lon};

            const options = {
                method: "POST",
                    mode: "cors",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "Authorization": "Token " + token
                    },
                    body: JSON.stringify(query)
            };

            fetch(url, options)
                .then((response) => response.text())
                .then((result) => resolve(JSON.parse(result).suggestions[0].data))
                .catch((error) => {
                    console.error(error);
                    alert('Ошибка загрузки. Попробуйте обновить страницу');
                    reject(error);
                });
        });
    }
}

const api = new Api();
export default api;