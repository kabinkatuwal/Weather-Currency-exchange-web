//Weather API 
const weatherAPIKey = "448ccbd59832d591d502bbbf8b58cba5"; //API get from https://home.openweathermap.org/api_keys website
const city = "Calgary";
const units = "metric";
const weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherAPIKey}&units=${units}`;

function fetchWeather() {
    const lastFetch = localStorage.getItem("weatherTimestamp");
    const now = Date.now();
    if (lastFetch && now - lastFetch < 10 * 60 * 1000) {
        const cachedData = JSON.parse(localStorage.getItem("weatherData"));
        if (cachedData) {
            displayWeather(cachedData);
            return;
        }
    }

    $.getJSON(weatherURL, function (data) {
        localStorage.setItem("weatherData", JSON.stringify(data));
        localStorage.setItem("weatherTimestamp", now);
        displayWeather(data);
    }).fail(function () {
        $("#weather-container").html("<p>Failed to load weather data.</p>");
    });
}

function displayWeather(data) {
    const temperature = data.main.temp;
    const description = data.weather[0].description;
    const timestamp = new Date(data.dt * 1000).toLocaleString();

    $("#temperature").text(`Temperature: ${temperature}°C`);
    $("#description").text(`Condition: ${description}`);
    $("#timestamp").text(`Last updated: ${timestamp}`);
}

//Currency exchange API

const currencyAPIKey = "ae193df459da9ac1ee626d55";//This API key was obtian from https://app.exchangerate-api.com/dashboard/confirmed
const currencyURL = `https://v6.exchangerate-api.com/v6/${currencyAPIKey}/latest/`;

const currencies = ["USD", "CAD", "EUR", "GBP", "JPY", "AUD", "INR", "CHF", "CNY", "NZD"];

function populateCurrencyDropdowns() {
    currencies.forEach(curr => {
        $("#from-currency, #to-currency").append(`<option value="${curr}">${curr}</option>`);
    });
    $("#from-currency").val("USD");
    $("#to-currency").val("CAD");
}

function fetchExchangeRate(from, to, amount) {
    const cacheKey = `rate_${from}`;
    const lastFetch = localStorage.getItem(`${cacheKey}_time`);
    const now = Date.now();

    if (lastFetch && now - lastFetch < 10 * 60 * 1000) {
        const cachedRates = JSON.parse(localStorage.getItem(cacheKey));
        if (cachedRates) {
            displayConversion(cachedRates, from, to, amount);
            return;
        }
    }

    $.getJSON(currencyURL + from, function (data) {
        localStorage.setItem(cacheKey, JSON.stringify(data.conversion_rates));
        localStorage.setItem(`${cacheKey}_time`, now);
        displayConversion(data.conversion_rates, from, to, amount);
    }).fail(function () {
        $("#currency-container").append("<p>Failed to load currency data.</p>");
    });
}

function displayConversion(rates, from, to, amount) {
    const rate = rates[to];
    const converted = (amount * rate).toFixed(2);

    $("#exchange-rate").text(`1 ${from} = ${rate} ${to}`);
    $("#converted-value").text(`${amount} ${from} = ${converted} ${to}`);
}
$(document).ready(function () {
    fetchWeather();
    populateCurrencyDropdowns();

    $("#convert-btn").click(function () {
        const amount = parseFloat($("#amount").val());
        const from = $("#from-currency").val();
        const to = $("#to-currency").val();

        if (isNaN(amount) || amount <= 0) {
            alert("Please enter a valid amount");
            return;
        }

        fetchExchangeRate(from, to, amount);
    });
});
