class Api {
    constructor(key) {
        this.key = key;
    }

    async getCurrentWeather(lat, lon) {
        try {
            const data = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.key}&units=metric`);
            return data.json();
        } catch (error) {
            console.error(error);
            alert('Ошибка загрузки. Попробуйте обновить страницу');
        }
    }
}

const api = new Api(process.env.VUE_APP_API_KEY);
export default api;