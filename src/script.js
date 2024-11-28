// import CSS into JS
import './style.css'
import Chart from 'chart.js/auto'
// import {} from 'date-fns'
import { dom } from './modules'

// .days = array of the next 15 days
// .days[0-14] = object of the day
// .hours = array of 24h
// .hours[0-23]

// windspeed = "windspeed" radar-chart [{ winddir: 180, windspeed: 10 }]
// windgust = "windgust" radar-chart [{ winddir: 180, windgust: 10 }]
// winddirection = "winddir" (round to 0 / 45 / 90 / ...)

const location = 'Rjukan'

async function getWeatherData(location) {
  const apiCall = await fetch(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?unitGroup=metric&key=EHJZF3GRS5GHMG9G89JCY82YJ&contentType=json`,
    { mode: 'cors' },
  )
  const rawData = await apiCall.json()
  console.log(rawData)
  // chart with temperature & precipitation (timebased)
  const timeData = await rawData.days[0].hours.map((hour) => ({
    time: parseInt(hour.datetime.split(':')[0]),
    temp: hour.temp,
    precip: hour.precip,
  }))
  //   console.log(timeData)
  plotLineChart(timeData, 'time', 'temp')
  plotBarChart(timeData, 'time', 'precip')
  // icons for each hour
  const iconData = await rawData.days[0].hours.map((hour) => hour.icon)
  //   console.log(iconData)
  plotIcons(iconData)
}

getWeatherData(location)

function plotBarChart(data, xKey, yKey) {
  new Chart(document.getElementById('precipitation'), {
    data: {
      labels: data.map((row) => row[xKey]),
      datasets: [
        {
          type: 'bar',
          data: data.map((row) => row[yKey]),
        },
      ],
    },
    options: {
      scales: {
        y: {
          grid: { display: true },
          min: 0, // Set minimum y value
          max: 10, // Set maximum y value
          ticks: { display: false },
        },
        x: { grid: { display: false }, ticks: { display: false } },
      },
      plugins: {
        legend: { display: false },
      },
    },
  })
}

function plotLineChart(data, xKey, yKey) {
  new Chart(document.getElementById('temperature'), {
    data: {
      labels: data.map((row) => row[xKey]),
      datasets: [
        {
          type: 'line',
          data: data.map((row) => row[yKey]),
          fill: false,
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.5, // flatten the curve 0-1
          pointRadius: 0, // dots radius
        },
      ],
    },
    options: {
      scales: {
        y: {
          grid: { display: false },
          min: -15, // Set minimum y value
          max: 15, // Set maximum y value
          ticks: { display: false },
        },
        x: { grid: { display: false }, ticks: { display: false } },
      },
      plugins: {
        legend: { display: false },
      },
    },
  })
}

function plotIcons(data) {
  data.forEach((icon) => {
    dom.addElement('#icons', 'img', '', {
      src: `https://raw.githubusercontent.com/visualcrossing/WeatherIcons/refs/heads/main/PNG/2nd%20Set%20-%20Color/${icon}.png`,
      style: 'width: 33px',
    })
  })
}
