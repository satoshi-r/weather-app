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
      <img
        :src="require(`@/assets/images/${background || 'day-clouds'}.jpg`)"
        alt="bg"
      />
    </div>

    <section class="main">
      <div class="head" :class="(animate) ? 'fadeIn': ''">
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

      <div class="current" :class="(animate) ? 'fadeIn': ''">
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

      <div class="forecast" :class="(animate) ? 'fadeInUp': ''">
        <div v-for="item of forecast" :key="item" class="forecast-item">
          <div class="forecast-item-day">{{ item.number }}, {{ item.day }}</div>
          <img
            :src="
              require(`@/assets/images/icons/${item.icon ||
                'broken-clouds'}.svg`)
            "
            class="forecast-item-icon"
            alt="icon"
          />
          <div class="forecast-item-temp">{{ item.temp }}&deg;C</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import api from "./api";

export default {
  name: "App",

  data() {
    return {
      animate: false,
      loading: true,
      time: "",
      timesOfDay: "",
      coords: {
        lat: null,
        lon: null,
      },
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
      background: null,
      forecast: [],
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
      days: [
        "Воскресенье",
        "Понедельник",
        "Вторник",
        "Среда",
        "Четверг",
        "Пятница",
        "Суббота",
      ],
    };
  },

  mounted() {
    setInterval(() => {
      this.setTime();
      this.setDate();
    }, 1000);

    this.setTimesOfDay();
    this.setLocation();
  },

  methods: {
    setTime() {
      const date = new Date();
      this.time = date.toLocaleTimeString();
    },

    setDate() {
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
      this.date.day = this.days[date.getDay()];
      this.date.month = months[date.getMonth()];
    },

    setTimesOfDay() {
      const hours = new Date().getHours();
      if (hours < 22 && hours > 5) this.timesOfDay = "day";
      if (hours >= 22 || hours <= 5) this.timesOfDay = "night";
    },

    async setCurrentWeather() {
      const data = await api.getCurrentWeather(
        this.coords.lat,
        this.coords.lon
      );

      this.weather.temp = parseInt(data.main.temp);
      this.setCondition(data.weather[0]);
    },

    setCondition({ main, description }) {
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
          this.conditions[key].filter((item) => item == main)[0];

        if (main == this.conditions[key] || filteredDescription) {
          this.weather.description.ru = key;

          this.weather.description.en = Array.isArray(this.conditions[key])
            ? "Mist"
            : this.conditions[key];

          this.weather.icon = `${
            this.timesOfDay
          }-${this.weather.description.en.toLowerCase()}`;

          for (const desc in descriptions) {
            if (description == desc) {
              this.weather.description.ru = descriptions[desc];
              if (desc == "few clouds" || desc == "overcast clouds") {
                this.weather.icon = `${this.timesOfDay}-few-clouds`;
              } else {
                this.weather.icon = `${desc.split(" ").join("-")}`;
              }
            }
          }
        }
      }

      this.setBackground();
    },

    setLocation() {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          api
            .getLocation(pos.coords.latitude, pos.coords.longitude)
            .then(async (data) => {
              this.location.country = data.country;
              this.location.city = data.city;
              this.coords.lat = data.geo_lat;
              this.coords.lon = data.geo_lon;
              await this.setCurrentWeather();
              await this.setForecastWeather();
              this.loading = false;
            })
            .catch((err) => {
              console.log(err);
              alert("Ошибка загрузки.");
            });
        },
        (error) => {
          alert("Пожалуйста, включите геолокацию");
          console.error(error.message);
          this.setCurrentWeather();
        }
      );
    },

    async setForecastWeather() {
      const data = await api.getForecastWeather(
        this.coords.lat,
        this.coords.lon
      );

      const list = [];
      data.list.forEach((obj) => {
        if (obj.dt_txt.includes("15:00:00")) {
          list.push(obj);
        }
      });

      const getIcon = ({ main, description }) => {
        let result;
        const descriptions = {
          "few clouds": "Малооблачно",
          "scattered clouds": "Облачно",
          "broken clouds": "Пасмурно",
          "overcast clouds": "Пасмурно",
        };

        for (const key in this.conditions) {
          let condition;
          const filteredDescription =
            Array.isArray(this.conditions[key]) &&
            this.conditions[key].filter((item) => item == main)[0];

          if (main == this.conditions[key] || filteredDescription) {
            condition = Array.isArray(this.conditions[key])
              ? "Mist"
              : this.conditions[key];

            result = `day-${condition.toLowerCase()}`;

            for (const desc in descriptions) {
              if (description == desc) {
                if (desc == "few clouds" || desc == "overcast clouds") {
                  result = `day-few-clouds`;
                } else {
                  result = `${desc.split(" ").join("-")}`;
                }
              }
            }
          }
        }

        return result;
      };

      list.forEach((obj) => {
        const date = new Date(obj.dt * 1000);
        this.forecast.push({
          temp: parseInt(obj.main.temp),
          number: date.getDate(),
          day: this.days[date.getDay()],
          icon: getIcon(obj.weather[0]),
        });
      });
    },

    setBackground() {
      this.background = `${this.timesOfDay}-${this.weather.description.en
        .toLowerCase()
        .split(" ")
        .join("-")}`;
    },
  },

  watch: {
    loading() {
      setTimeout(() => {
        this.animate = true;
      }, 300);
    }
  }
};
</script>
