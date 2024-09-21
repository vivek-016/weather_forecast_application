const search_btn = document.getElementById('srch');
const city_input = document.getElementById('city');
const API_key = 'b6d103966c184fef8eef9a49c7c7b7fe';
const loc_btn = document.getElementById('loc');

const fiveDayscards = document.getElementById('5d-container');

const curr_date = document.getElementById('curr_date');
const curr_loc = document.getElementById('curr_loc');
const weather_icon = document.getElementById('icon');

const curr_temp = document.getElementById('curr_temp');
const curr_description = document.getElementById('curr_description');

const hight_temp = document.getElementById('h-t');
const low_temp = document.getElementById('l-t');
const hum = document.getElementById('hu');
const windspeed = document.getElementById('ws');
const feelslike = document.getElementById('fl');
const pressure = document.getElementById('pr');


const inputWeather = function (weathercard){
    return `<div id="5d" class=" p-2 h-full rounded-[10px]  min-w-24 max-w-32 sm:w-36 sm:max-w-36 lg:w-40 lg:max-w-40 xl:w-44 xl:max-w-44 2xl:w-56 2xl:max-w-56 bg-white backdrop-blur-[100px] bg-opacity-0 flex flex-wrap items-center justify-around">
                    
                <div id="5d-temp1" class="h-[40%] flex flex-col    items-center justify-around">
                    <h3>${weathercard.dt_txt.split(" ")[0]}</h3><h4>${(weathercard.main.temp-273.15).toFixed(2)}°C</h4>
                </div>
                <div id="5d-icon1" class="w-full h-[60%] flex items-center justify-center mt-2">
                    <img src="https://openweathermap.org/img/wn/${weathercard.weather[0].icon}@2x.png" alt="">
                </div>
                
                    

            </div>`;
}

const weatherDetails = function(latitude, longitude, Name){

    const url_5Day = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_key}`;
    const url_curr = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_key}`;

    fetch(url_5Day)
        .then(response => response.json())
        .then(data=>{
            const uniqueDays = [];
            const today = new Date().getDate();
            const days5Forecast = data.list.filter(date=>{
                const wdate = new Date(date.dt_txt).getDate();
                const wtime = date.dt_txt.split(" ")[1];
                if(wdate !== today && !uniqueDays.includes(wdate) && wtime === "09:00:00"){
                    return uniqueDays.push(wdate);
                }
            })

            console.log(days5Forecast);

            fiveDayscards.innerHTML = "";
            city_input.value = "";

            days5Forecast.forEach(weathercard=>{
                fiveDayscards.insertAdjacentHTML("beforeend", inputWeather(weathercard));
                
            })
        })
        .catch(err=>{
            console.log(err.message);
        });
    
    fetch(url_curr)
    .then(response=>response.json())
    .then(data=>{
        console.log(data);
        const today = Date().split(" ").splice(0,4).join(" ");
        
        curr_date.textContent = `${today}`;
        curr_loc.textContent = `${data.name}`;
        weather_icon.innerHTML = `
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="weather icon">`
        
        curr_temp.textContent = `${(data.main.temp-273.15).toFixed(2)}`;
        curr_description.textContent = `${data.weather[0].description}`;

        hight_temp.textContent = `${(data.main.temp_max-273.15).toFixed(2)}°C`;
        low_temp.textContent = `${(data.main.temp_min-273.15).toFixed(2)}°C`;
        hum.textContent = `${data.main.humidity}%`;
        windspeed.textContent = `${data.wind.speed}m/s`;
        feelslike.textContent = `${(data.main.feels_like-273.15).toFixed(2)}°C`;
        pressure.textContent = `${data.main.pressure}hpa`;
    })
    .catch(err=>{
        console.log(err.message);
    }
    )
    
}

const cityLocation = function () {
    const city = city_input.value;

    const loc_url = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_key}`;

    fetch(loc_url)
        .then(response => {
            if (!response.ok) {
                throw new Error(response.status);
            }
            return response.json(); // return the parsed JSON
        })
        .then(data => {
            if (data.length === 0) {
                throw new Error('Location not found');
            }
            // Accessing the first result in the array
            const latitude = data[0].lat;
            const longitude = data[0].lon;
            const Name = data[0].name;
            console.log(latitude, longitude, Name);

            weatherDetails(latitude, longitude, Name);
        })
        .catch(err => {
            console.log('Error:', err.message);
        });
}

const myLocation = function(){
    const successCallback = function(position){
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        console.log(latitude, longitude);

        const reverse_loc_url = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=5&appid=${API_key}`;

        fetch(reverse_loc_url)
        .then(response=>response.json())
        .then(data=>{
            const Name = data[0].name;
            console.log(Name);
            weatherDetails(latitude, longitude, Name);
        })
        .catch(error=>{
            console.log(error.message);
        });

        
    }
    const errorCallback = function(error){
        alert(error.message);
    }
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
    }
    else{
        console.log("Geolocation is not supported in this browser.");
    }
    
    
}

search_btn.addEventListener('click', cityLocation);
loc_btn.addEventListener('click', myLocation);


// Create dropdown options from searches stored in localStorage
const updateSearchesDropdown = function () {
    const searches = JSON.parse(localStorage.getItem('searches')) || [];
    const datalist = document.getElementById('src_loc');
    
    // Clear previous options
    datalist.innerHTML = '';

    // Populate dropdown with stored searches
    searches.forEach(search => {
        const option = document.createElement('option');
        option.value = search;
        datalist.appendChild(option);
    });
}

// Store searched city in session storage
const storeSearch = function () {
    let searches = JSON.parse(localStorage.getItem('searches')) || [];
    const searchValue = city_input.value;
    
    if (searchValue && !searches.includes(searchValue)) {
        searches.push(searchValue);
        localStorage.setItem('searches', JSON.stringify(searches));
    }
    updateSearchesDropdown();

}



search_btn.addEventListener('click', storeSearch);
updateSearchesDropdown();

