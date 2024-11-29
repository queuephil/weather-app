// import CSS into JS
import './style.css'
import Chart from 'chart.js/auto'
import { format, fromUnixTime } from 'date-fns'
import { dom } from './modules'

getWeatherData('Innsbruck')

async function getWeatherData(location) {
  const apiCall = await fetch(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?unitGroup=metric&key=EHJZF3GRS5GHMG9G89JCY82YJ&contentType=json`,
    { mode: 'cors' },
  )
  const rawData = await apiCall.json()
  const dataByHours = await rawData.days.flatMap((day) =>
    day.hours.map((hour) => ({
      hours: parseInt(format(fromUnixTime(hour.datetimeEpoch), 'H')),
      days: format(fromUnixTime(hour.datetimeEpoch), 'EEEE dd.MM'),
      temp: hour.temp,
      icon: hour.icon,
      precip: hour.precip,
      windDirection: hour.winddir,
      windSpeed: hour.windspeed,
      windGust: hour.windgust,
    })),
  )
  const dataByDays = await rawData.days.map((day) => ({
    dataTemperature: `min ${parseInt(day.tempmin)}° max ${parseInt(day.tempmax)}°`,
    dataPrecipitation: `total ${day.precip}mm`,
    dataWind: `max ${parseInt(day.windspeed)}  (${parseInt(day.windgust)}) km/h`,
  }))
  document.querySelector('#location').textContent =
    `Meteogram for ${rawData.address}`
  plotDates('#dates', dataByHours)
  plotLineChart('#temperatureGraphDiv', dataByHours, 'hours', 'temp')
  plotIcons('#icons', dataByHours)
  plotBarChart('#precipitationGraphDiv', dataByHours, 'hours', 'precip')
  plotWindDirection('#windDirection', dataByHours)
  plotLineChart(
    '#windGraphDiv',
    dataByHours,
    'hours',
    '',
    'windSpeed',
    'windGust',
  )
  plotText('#dataTemperature', dataByDays, 'dataTemperature')
  plotText('#dataPrecipitation', dataByDays, 'dataPrecipitation')
  plotText('#dataWind', dataByDays, 'dataWind')
}

// define absolute value for the meteogram ------------------------------------

const aspectRatio = 3 / 40
const actualWidthCanvas = 6000
const actualHeightCanvas = actualWidthCanvas * aspectRatio
const scaledWidthCanvas = 2400 // also adjust CSS
const scaledHeightCanvas = scaledWidthCanvas * aspectRatio
const width1day = scaledWidthCanvas / 15

// text -----------------------------------------------------------------------

function plotDates(parentElement, data) {
  document.querySelector(parentElement).innerHTML = ''
  data
    .map((item) => item.days)
    .forEach((item, i) => {
      if (i % 24 === 0) {
        dom.addElement(parentElement, 'span', item, {
          style: `width: ${width1day}px`,
        })
      }
    })
}

function plotText(parentElement, data, key) {
  document.querySelector(parentElement).innerHTML = ''
  data
    .map((item) => item[key])
    .forEach((item) => {
      dom.addElement(parentElement, 'span', item, {
        style: `width: ${width1day}px`,
      })
    })
}

// icons ----------------------------------------------------------------------

function plotIcons(parentElement, data) {
  document.querySelector(parentElement).innerHTML = ''
  data
    .map((item) => item.icon)
    .forEach((item, i) => {
      if (i % 6 === 3) {
        dom.addElement(parentElement, 'img', '', {
          src: `https://raw.githubusercontent.com/visualcrossing/WeatherIcons/58c79610addf3d4d91471abbb95b05e96fb43019/SVG/2nd%20Set%20-%20Color/${item}.svg`,
          style: `width: ${width1day / 4}px`,
        })
      }
    })
}

// winddirection --------------------------------------------------------------

function plotWindDirection(parentElement, data) {
  document.querySelector(parentElement).innerHTML = ''
  data
    .map((item) => item.windDirection)
    .forEach((item, i) => {
      if (i % 3 === 0) {
        dom.addElement(parentElement, 'span', 'navigation', {
          class: 'material-symbols-outlined',
          style: `transform: rotate(${item}deg); width: ${width1day / 8}px`,
        })
      }
    })
}

// charts ---------------------------------------------------------------------

const chartOptions = {
  responsive: false,
  maintainAspectRatio: true,
  scales: {
    y: {
      grid: {
        color: 'rgba(47, 79, 79, 0.5)',
        lineWidth: (context) => (context.tick.value === 0 ? 4 : 2),
      },
      ticks: {
        display: false,
      },
    },
    x: {
      ticks: { display: false },
      grid: { color: 'rgba(47, 79, 79, 0.5)', lineWidth: 4 },
      afterBuildTicks: function (scale) {
        scale.ticks = scale.ticks.filter(
          (tick, index) => index % 24 === 0 && index !== 0,
        )
      },
    },
  },
  plugins: {
    legend: { display: false },
    ticks: { display: false },
  },
  layout: {
    padding: {
      left: -7,
      bottom: -7,
    },
  },
}

function plotLineChart(
  parentElement,
  data,
  xKey,
  yKeyRed,
  yKeyBlue,
  yKeyPurple,
) {
  document.querySelector(parentElement).innerHTML = ''
  const timestamp = Date.now()
  dom.addElement(parentElement, 'canvas', '', {
    id: timestamp,
    width: actualWidthCanvas,
    height: actualHeightCanvas,
    style: `width: ${scaledWidthCanvas}px; height: ${scaledHeightCanvas}px`,
  })

  new Chart(document.getElementById(timestamp), {
    data: {
      labels: data.map((row) => row[xKey]),
      datasets: [
        {
          type: 'line',
          data: data.map((row) => row[yKeyRed]),
          borderColor: 'red',
          borderWidth: 4,
          tension: 0.5,
          pointRadius: 0,
        },
        {
          type: 'line',
          data: data.map((row) => row[yKeyBlue]),
          borderColor: 'blue',
          borderWidth: 4,
          tension: 0.5,
          pointRadius: 0,
        },
        {
          type: 'line',
          data: data.map((row) => row[yKeyPurple]),
          borderColor: 'purple',
          borderWidth: 4,
          tension: 0.5,
          pointRadius: 0,
        },
      ],
    },
    options: chartOptions,
  })
}

function plotBarChart(parentElement, data, xKey, yKey) {
  document.querySelector(parentElement).innerHTML = ''
  const timestamp = Date.now()
  dom.addElement(parentElement, 'canvas', '', {
    id: timestamp,
    width: actualWidthCanvas,
    height: actualHeightCanvas,
    style: `width: ${scaledWidthCanvas}px; height: ${scaledHeightCanvas}px`,
  })

  new Chart(document.getElementById(timestamp), {
    data: {
      labels: data.map((row) => row[xKey]),
      datasets: [
        {
          type: 'bar',
          data: data.map((row) => row[yKey]),
        },
      ],
    },
    options: chartOptions,
  })
}

// search bar -----------------------------------------------------------------

document.querySelector('input').addEventListener('keydown', (e) => {
  if (e.key == 'Enter') {
    const searchInput = e.target
    let searchTerm = searchInput.value
    getWeatherData(searchTerm)
    searchInput.value = ''
    searchInput.blur()
  }
})

document.querySelector('.searchIcon').addEventListener('click', () => {
  const searchInput = document.querySelector('input')
  let searchTerm = searchInput.value
  getWeatherData(searchTerm)
  searchInput.value = ''
  searchInput.blur()
})
