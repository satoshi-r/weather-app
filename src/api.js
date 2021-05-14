import ip from "ip";
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

    getLocation() {
        return new Promise((resolve, reject) => {
            const url =
                "https://suggestions.dadata.ru/suggestions/api/4_1/rs/iplocate/address?ip=";
            const token = process.env.VUE_APP_API_GET_IP;
            const query =
                process.env.NODE_ENV == "development" ? "5.3.212.179" : ip.address();
            console.log(query);

            const options = {
                method: "GET",
                mode: "cors",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: "Token " + token,
                },
            };

            fetch(url + query, options)
                .then((response) => response.text())
                .then((result) => {
                    resolve(JSON.parse(result));
                })
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