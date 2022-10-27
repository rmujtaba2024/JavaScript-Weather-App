// Fetch weather using openweathermap.org API
let weather = {
    apiKey: "9fe97c0252db7914bea6724c28d375a6",
    fetchWeather: function (city) {
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${this.apiKey}`)
            .then((response) => response.json())
            .then((data) => this.displayWeather(data));
    },
    displayWeather: function (data) {
        const { name } = data;
        const { icon, description } = data.weather[0];
        const { temp, humidity } = data.main;
        const { speed } = data.wind;
        console.log(name, icon, description, temp, humidity, speed);
        document.querySelector(".city").innerText = `Weather in ${name}`;
        document.querySelector(".temp").innerText = `${temp}°`;
        document.querySelector(".icon").src = `https://openweathermap.org/img/wn/${icon}.png`;
        document.querySelector(".description").innerText = description;
        document.querySelector(".humidity").innerText = `Humidity: ${humidity}%`;
        document.querySelector(".wind").innerText = `Wind speed: ${speed} km/h`;
        document.querySelector(".weather").classList.remove("loading");
        document.body.style.backgroundImage = `url('https://source.unsplash.com/random/1600x900/?${name}')`;
    },
    search: function () {
        this.fetchWeather(document.querySelector(".search-bar").value);
    },
};

// Use IP address to get location via ipgeolocation API
let geocode = {
    apiKey: "191265c76d374d529965505c0e59a743",
    getLoc: function () {
        fetch(`https://ipgeolocation.abstractapi.com/v1/?api_key=${this.apiKey}`)
            .then((response) => response.json())
            .then((data) => weather.fetchWeather(data.city));
    },
}

// Search when search icon clicked
document.querySelector(".search button")
    .addEventListener("click", function () {
        weather.search();
    });

// Search when enter clicked on keypad
document.querySelector(".search-bar")
    .addEventListener("keyup", function (event) {
        if (event.key == "Enter") {
            weather.search();
        }
    });

geocode.getLoc();

// Read city names from JSON file
function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}

const cities = [];

// Add city names to cities array
readTextFile("./cities.json", function (text) {
    var data = JSON.parse(text);
    for (let i = 0; i < data.length; i++) {
        cities[i] = data[i].name;
    }
});

// Debounce suggestions
const debounce = (func, delay) => {
    let debounceTimer;
    return function () {
        const context = this;
        const args = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
}

// Add autocomplete functionality
let suggBox = document.querySelector(".autocom-box");
let searchBar = document.querySelector(".search-bar");
const searchWrapper = document.querySelector(".wrapper");

searchBar.onkeyup = debounce((e) => {
    let userData = e.target.value;
    let emptyArray = [];

    if (userData) {
        document.querySelector(".search button")
            .addEventListener("click", function () {
                weather.search();
            });
        document.querySelector(".search-bar")
            .addEventListener("keyup", function (event) {
                if (event.key == "Enter") {
                    weather.search();
                }
            });
        // Populate array with city names from cities array based on starting characters
        emptyArray = cities.filter((data) => {
            return data.toLocaleLowerCase().startsWith(userData.toLocaleLowerCase());
        });
        // Return data in a list
        emptyArray = emptyArray.map((data) => {
            return data = `<li>${data}</li>`;
        });
        // Show the suggestion box
        searchWrapper.classList.add("active");
        showSuggestions(emptyArray);
        let allList = suggBox.querySelectorAll("li");
        // Call select for the city that was clicked on
        for (let i = 0; i < allList.length; i++) {
            allList[i].setAttribute("onclick", "select(this)");
        }
    } else {
        searchWrapper.classList.remove("active");
    }
}, 500);

// Select and search the city that was clicked on
function select(element) {
    let selectData = element.textContent;
    searchBar.value = selectData;

    weather.search();

    document.querySelector(".search button")
        .addEventListener("click", function () {
            weather.search();
        });

    document.querySelector(".search-bar")
        .addEventListener("keyup", function (event) {
            if (event.key == "Enter") {
                weather.search();
            }
        });

    searchWrapper.classList.remove("active");
}

// Show the suggestion box
function showSuggestions(list) {
    let listData;

    if (!list.length) {
        userValue = searchBar.value;
        listData = `<li>${userValue}</li>`;
    } else {
        listData = list.join('');
    }

    suggBox.innerHTML = listData;
}
