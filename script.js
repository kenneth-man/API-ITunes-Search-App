'use strict';

//DOM selection variables
const searchInput = document.querySelector('#search-input');
const searchSelect = document.querySelector('#search-select');
const searchBtn = document.querySelector('#search-btn');
const results = document.querySelector('.results');
const resultsCount = document.querySelector('.results-count');
const spinner = document.querySelector('.spinner');

const popup = document.querySelector('.popup');
const popupImage = document.querySelector('.popup__row--img');
const popupTitle = document.querySelector('#popup-title');
const popupArtist = document.querySelector('#popup-artist');
const popupPrice = document.querySelector('#popup-price');
const popupType = document.querySelector('#popup-type');
const popupTime = document.querySelector('#popup-time');
const popupBtn = document.querySelector('.popup__btn');

//variables used to get specific data from ITunes API; 'term' is the artists name, 'country' is the country of which available results are shown
let searchTerm;
let searchCountry;

//user's latitude and longitude coordinates
let userLatitude;
let userLongitude;

//converting input to URL-encoded string ('+' inbetween each word); ITunes API only accepts URL-encoded search strings
const encodeInput = () => {
    const inputArr = searchInput.value.split(' ');
    searchTerm = inputArr.join('+');
}

//fetching data
//ITunes API - https://affiliate.itunes.apple.com/resources/documentation/itunes-store-web-service-search-api/
const getData = async () => {
    try {
        const response = await fetch(`https://itunes.apple.com/search?term=${searchTerm}&country=${searchCountry}&media=all`);
        const data = await response.json();

        if(data.resultCount > 0){
            data.results.forEach((curr, i) => {
                const resultsBoxImage = data.results[i].artworkUrl100;
                const resultsBoxTitle = data.results[i].trackName;
                const resultsBoxArtist = data.results[i].artistName;
        
                const resultsBoxPrice = data.results[i].trackPrice;
                const resultsBoxType = data.results[i].primaryGenreName;
                const resultsBoxUrl = data.results[i].collectionViewUrl;

                //converting milliseconds fetched to minutes, replacing '.' with ':', and padding start with '0'
                const convertedTime = ((data.results[i].trackTimeMillis / 1000) / 60).toFixed(2);
                const resultsBoxTime = (convertedTime.replace('.', ':')).padStart(5, '0');

                setResultsCount(data.resultCount);
    
                displayHideSpinner(false);
    
                results.insertAdjacentHTML('beforeend', 
                    `
                        <div class="results__box transition column rounded">
                            <h2 class="h2">'${resultsBoxTitle}'</h2>
                
                            <h3 class="h3">${resultsBoxArtist}</h3>
                
                            <button class="btn btn-results transition rounded">View Details</button>

                            <h5 class="data-storage">${resultsBoxImage}</h5>
                            <h5 class="data-storage">${resultsBoxPrice}</h5>
                            <h5 class="data-storage">${resultsBoxType}</h5>
                            <h5 class="data-storage">${resultsBoxTime}</h5>
                            <h5 class="data-storage">${resultsBoxUrl}</h5>
                        </div> 
                    `
                );
    
                results.lastElementChild.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)),url(${resultsBoxImage})`;
            });
        } else {
            alert('No results were found');
            displayHideSpinner(false);
        }
    } catch (error) {
        alert(`Geocode.xyz API throttled: Too many requests a minute.\nPlease wait and try again`);
    }
}

//to get user's current longitude and latitude coordinate location
//Geolocaton API - https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
const getUserLocation = async () => {
    try{
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => { 
                    userLatitude = position.coords.latitude;
                    userLongitude = position.coords.longitude;
                },
                () => alert('Could not get your current location')
            );
        }
    } catch (error) {
        console.log(error);
    }

    setTimeout(()=>{
        getUserCountryCode();
    }, 750);
}

//to get user's country code based on longitude and latitude
//Geocode API - https://geocode.xyz/api
const getUserCountryCode = async () => {
    try{
        const response = await fetch(`https://geocode.xyz/${userLatitude},${userLongitude}?geoit=json`);
        const data = await response.json();

        searchCountry = data.prov;

        //some geocode.xyz api country codes differ from ITunes country codes
        if(data.prov === 'UK')
            searchCountry = 'GB';

        if(data.prov === 'DO')
            searchCountry = 'CD';
    
         
        console.log(searchCountry);

        getData();
    } catch (error) {
        console.log(error);
    }
}

//update the total results retrieved number
const setResultsCount = (num) => {
    resultsCount.textContent = `results - ${num}`
}

//clear all results boxes and reset results count to 0
const resetResults = () => {
    results.innerHTML = '';
    resultsCount.textContent = `results - 0`
}

//display or hide spinner gif depending on bool parsed in
const displayHideSpinner = (bool) => {
    bool === true ? spinner.classList.remove('hidden') : spinner.classList.add('hidden');
}

//on search button click
searchBtn.addEventListener('click', () => {
    if(searchInput){
        resetResults();

        displayHideSpinner(true);

        encodeInput();
        
        //if country selection is 'Current' location
        if(searchSelect.options[searchSelect.selectedIndex].value === 'Current'){
            getUserLocation();
        } else {
            searchCountry = searchSelect.options[searchSelect.selectedIndex].value;
            getData();
        } 
    } else {
        alert('Please provide a search term');
    }
})

//event delegation on 'results' parent container
results.addEventListener('click', (e) => {
    //getting specific data on the element that was clicked
    if(e.target.closest('.results__box')){
        popup.classList.remove('hidden');
        popupImage.setAttribute('src', `${e.target.nextElementSibling.textContent}`);
        popupTitle.textContent = `Title: ${e.target.previousElementSibling.previousElementSibling.textContent}`;
        popupArtist.textContent = `Artist: ${e.target.previousElementSibling.textContent}`;
        popupPrice.textContent = `Price: $${e.target.nextElementSibling.nextElementSibling.textContent}`;
        popupType.textContent = `Genre: ${e.target.nextElementSibling.nextElementSibling.nextElementSibling.textContent}`;
        popupTime.textContent = `Time: ${e.target.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.textContent}mins`;
        popupBtn.setAttribute('href', `${e.target.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.textContent}`);
    }
})

//clicking on background of popup, closes it from view
popup.addEventListener('click', (e) => {
    if(e.target.classList.contains('popup'))
        popup.classList.add('hidden');
})