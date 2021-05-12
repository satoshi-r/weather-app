<template>
  <div class="main-wrapper">
    <transition name="fade">
      <div v-if="loading" id="preloader">
        <svg
          class=""
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class=""
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class=""
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    </transition>
    <div class="background">
      <img src="./assets/images/night-rain.jpg" alt="bg" />
    </div>

    <section class="main">
      <div class="head">
        <div class="head-col">
          <div class="head-time">{{ time }}</div>
          <div class="head-date">
            {{ date.number }} {{ date.month }}, {{ date.day }}
          </div>
        </div>
        <div class="head-col">
          <div class="head-city">{{ location.city }}</div>
          <div class="head-country">{{ location.country }}</div>
        </div>
      </div>

      <div class="current">
        <div class="current-temp">{{ weather.temp }}&deg;С</div>
        <img
          :src="
            require(`@/assets/images/icons/${weather.icon ||
              'broken-clouds'}.svg`)
          "
          alt="icon"
          class="current-icon"
        />
        <div class="current-description">{{ weather.description.ru }}</div>
      </div>
    </section>
  </div>
</template>

<script>
import api from "./api";
import ip from "ip";

export default {
  name: "App",

  data() {
    return {
      loading: true,
      time: "",
      timesOfDay: "",
      date: {
        number: null,
        day: null,
        month: null,
      },
      location: {
        country: null,
        city: null,
      },
      weather: {
        temp: null,
        description: {
          ru: "",
          en: "",
        },
        icon: null,
      },
      conditions: {
        Ясно: "Clear",
        Гроза: "Thunderstorm",
        Ливень: "Drizzle",
        Дождь: "Rain",
        Снег: "Snow",
        Облачно: "Clouds",
        Туман: [
          "Mist",
          "Smoke",
          "Haze",
          "Dust",
          "Fog",
          "Sand",
          "Ash",
          "Squall",
          "Tornado",
        ],
      },
    };
  },

  mounted() {
    setInterval(() => {
      this.setTime();
      this.setDate();
    }, 1000);

    this.setTimesOfDay();
    this.setCurrentWeather();
    this.setLocation();
  },

  methods: {
    setTime() {
      const date = new Date();
      this.time = date.toLocaleTimeString();
    },

    setDate() {
      const days = [
        "Воскресенье",
        "Понедельник",
        "Вторник",
        "Среда",
        "Четверг",
        "Пятница",
        "Суббота",
      ];
      const months = [
        "Января",
        "Февраля",
        "Марта",
        "Апреля",
        "Мая",
        "Июня",
        "Июля",
        "Августа",
        "Сентября",
        "Октября",
        "Ноября",
        "Декабря",
      ];
      const date = new Date();
      this.date.number = date.getDate();
      this.date.day = days[date.getDay()];
      this.date.month = months[date.getMonth()];
    },

    setTimesOfDay() {
      const hours = new Date().getHours();
      if (hours < 22 && hours > 5) this.timesOfDay = "day";
      if (hours >= 22 || hours <= 5) this.timesOfDay = "night";
    },

    setCurrentWeather() {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const data = await api.getCurrentWeather(
            pos.coords.latitude,
            pos.coords.longitude
          );
          this.weather.temp = parseInt(data.main.temp);
          this.setCondition(data.weather[0]);
          console.log(data);
        },

        (error) => {
          alert("Пожалуйста, включите геолокацию");
          console.error(error.message);
          this.setCurrentWeather();
        }
      );
    },

    setCondition(data) {
      this.weather.icon = null;
      const descriptions = {
        "few clouds": "Малооблачно",
        "scattered clouds": "Облачно",
        "broken clouds": "Пасмурно",
        "overcast clouds": "Пасмурно",
      };

      for (const key in this.conditions) {
        const filteredDescription =
          Array.isArray(this.conditions[key]) &&
          this.conditions[key].filter((item) => item == data.main)[0];

        if (data.main == this.conditions[key] || filteredDescription) {
          this.weather.description.ru = key;

          for (const desc in descriptions) {
            if (data.description == desc) {
              this.weather.description.ru = descriptions[desc];
              if (desc == "few clouds") {
                this.weather.icon = `${this.timesOfDay}-${desc
                  .split(" ")
                  .join("-")}`;
              } else {
                this.weather.icon = `${desc.split(" ").join("-")}`;
              }
            }
          }

          this.weather.description.en = Array.isArray(this.conditions[key])
            ? "Mist"
            : this.conditions[key];

          this.weather.icon = `${
            this.timesOfDay
          }-${this.weather.description.en.toLowerCase()}`;
        }
      }

      this.loading = false;
    },

    setLocation() {
      const url =
        "https://suggestions.dadata.ru/suggestions/api/4_1/rs/iplocate/address?ip=";
      const token = "5258659d61d595f815d120c5f2677c3675375b86";
      const query =
        process.env.NODE_ENV == "development" ? "5.3.212.179" : ip.address();

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
          const exchangeData = JSON.parse(result);
          this.location.country = exchangeData.location.data.country;
          this.location.city = exchangeData.location.data.city;
        })
        .catch((error) => console.log("error", error));
    },
  },
};
</script>
