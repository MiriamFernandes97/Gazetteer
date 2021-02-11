//Global variables to store the users coordinates, countries for the autoselect, and polygon of the current country
let userCoords = {};
const countryList = [];
let countryOutline;
let countryData = null;
//Setting the details for the different map displays

const light = L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
  }
);


const dark = L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
    minZoom:1
  }
);

const satellite = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  {
    minZoom: 1,
    attribution:
      'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  }
);

const earthAtNight = L.tileLayer(
  'https://map1.vis.earthdata.nasa.gov/wmts-webmerc/VIIRS_CityLights_2012/default/{time}/{tilematrixset}{maxZoom}/{z}/{y}/{x}.{format}',
  {
    attribution:
      'Imagery provided by services from the Global Imagery Browse Services (GIBS), operated by the NASA/GSFC/Earth Science Data and Information System (<a href="https://earthdata.nasa.gov">ESDIS</a>) with funding provided by NASA/HQ.',
    maxZoom: 8,
    minZoom: 2,
    format: 'jpg',
    time: '',
    tilematrixset: 'GoogleMapsCompatible_Level',
  }
);


const precipitation = L.tileLayer('https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={appId}', { 
  tileSize: 512,
  zoomOffset: -1,
  layer: 'precipitation_new',
  minZoom: 2,
  appId:'ecdd3db00553f4e381724e72bb3418e5',
  area:'worldwide'
});

const temp = L.tileLayer('https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={appId}', { 
  tileSize: 512,
  minZoom: 2,
  zoomOffset: -1,
  layer: 'temp_new',
  appId:'ecdd3db00553f4e381724e72bb3418e5',
  area:'worldwide'
});

const marker = L.ExtraMarkers.icon({
    icon: ' fa-location-arrow',
    markerColor: '#BBDEF0',
    shape: 'square',
    svg: true,
    prefix: 'fa',
});

const capitalMarker = L.ExtraMarkers.icon({ // the capital has a different colored marker.
    icon: ' fa-location-arrow',
    markerColor: '#2C95C9',
    shape: 'star',
    svg: true,
    prefix: 'fa',
});

const monumentMarker = L.ExtraMarkers.icon({
    icon: 'fa-binoculars',
    markerColor: '#AFD5AA',
    shape: 'penta',
    svg: true,
    prefix: 'fa',
  });


//Initializing the map and setting its default layer to the light theme which was defined above.

const map = L.map('map', {center: [39.73, -104.99],zoom:10,zoomControl: false, layers: [light]});

//zoom control buttons
L.control.zoom({position: 'topright'}).addTo(map);

//Adding the different tile layers to the control button and adding the button/s to the map
const baseMaps = {
  Light: light,
  Dark: dark,
  Satellite: satellite, 
  'Earth At Night': earthAtNight,
  
};

const weatherOverlays = { 
  Temperature: temp, 
  Precipitation: precipitation,
};

L.control.layers(baseMaps,weatherOverlays).addTo(map); 

//Initializing the layer groups to be populated with markers
const earthquakeLayer = L.layerGroup();
const cityLayer = L.layerGroup();
const monumentLayer = L.layerGroup();

const monumentMarkers = L.markerClusterGroup({
  iconCreateFunction: (cluster) => {
    return L.divIcon({
      html: `<div><span>${cluster.getChildCount()}</span></div>`, // this is the html for the icon. This is done using interpolation.
      className: 'monument-marker-cluster marker-cluster',
      iconSize: new L.Point(40, 40),
    });
  },
});

//Creating a pop up when a monument marker is clicked
const infoPopup = (event) => {
    let marker;
    const markerDetails = event.target.options;
    //creating either new city or monument object
    if (markerDetails.type == 'city') {
      marker = new City(
        markerDetails.latitude,
        markerDetails.longitude,
        markerDetails.geonameId,
        markerDetails.name,
        markerDetails.population,
        markerDetails.type
      );
    } else if (markerDetails.type == 'monument') {
      marker = new Monument(
        markerDetails.latitude,
        markerDetails.longitude,
        markerDetails.geonameId,
        markerDetails.name,
        markerDetails.type
      );
    }
    //Getting distance between marker and user
    marker.getDistanceFromLatLonInKm(userCoords.latitude, userCoords.longitude);
    marker.getWikiDetails();
    marker.getWeatherInfo();
};
  
//Display info for selected country
function displayInfo() {
  $('#flag').attr('src', countryData.flag);
  $('#area').html(` ${countryData.area}`);
  $('#capital').html(` ${countryData.capital}`);

  $('#currency').html(` ${countryData.currency.name} (${countryData.currency.symbol})`);
  $('#population').html(` ${countryData.population}`);
}

function handleFail(){
  $('#modalTitle').html(`Error`);
  $('#modalBody').html('Unfortunately there was an error finding a country for these coordinates. Please try a different location');
  $('#infoModal').modal();
}

function setCountryByCode(countryCode){
    countryData = new Country2(countryCode);

    countryData.getCountryInfo()
    .then(() => {

      //formatting country population
      const countryPopulation = countryData.population;
      const formattedCountryPopulation = countryPopulation.toLocaleString();
      countryData.population = formattedCountryPopulation;

      //formatting country area
      const countryArea = countryData.area;
      const formattedCountryArea = countryArea.toLocaleString();
      countryData.area = formattedCountryArea;

      displayInfo();
    })

    // If a polygon is already drawn, clear it
    if (countryOutline && countryOutline.clearLayers) {
        countryOutline.clearLayers();
    }
    countryData.getPolygon()
    .then(() => {
        countryOutline = L.geoJSON(countryData.polygon, { 
            style: {
                color: '#fd7e14',
            },
        }).addTo(map);
        
        map.fitBounds(countryOutline.getBounds());
    })

    //set up earthquake data
    earthquakeLayer.clearLayers();
    countryData.getEarthquakes()
    .then((earthquakes) => {
        earthquakes.forEach((quake) => {
            quake.datetime = new Date(quake.datetime); //convert to date obj. 
            const earthquakeDate = quake.datetime.getDate();
            const earthquakeMonth = quake.datetime.getMonth();
            const earthquakeYear = quake.datetime.getFullYear();
            const newQuake = L.circle([quake.lat, quake.lng], {
                color: '#dc3545',
                fillColor: '#9C1C28',
                fillOpacity: 0.5,
                //Cube the magnitude to emphasise difference, otherwise all circles will appear more or less the same size
                radius: Math.pow(quake.magnitude, 3) * 500,
            }).addTo(earthquakeLayer);

            newQuake.bindPopup( // .bindPopup is a popup method from the leaflet library. It binds what happens when you click on the popup icon.
                `Magnitude: ${quake.magnitude} <br> Date: ${earthquakeDate}/${earthquakeMonth}/${earthquakeYear}`  // this is what shows when you click on the earthquake icon.
            );
        });
    })

    //set up city data
    cityLayer.clearLayers();
    countryData.getCities()
    .then((cities) => {
        cities.forEach((city) => {
          const cityPopulation = city.population;
          const formattedPopulation = cityPopulation.toLocaleString();
            const newMarker = L.marker([city.lat, city.lng], {
                icon: (city.fcode == 'PPLC')? capitalMarker : marker,
                type: 'city',
                name: city.name,
                population: formattedPopulation,
                latitude: city.lat,
                longitude: city.lng,
                capital: (city.fcode == 'PPLC'),
                geonameId: city.geonameId,
            }).addTo(cityLayer);
            newMarker.on('click', infoPopup); // there is a different icon for city which is the capital.
        });
    })

    monumentLayer.clearLayers();
    monumentMarkers.clearLayers(monumentLayer);
    countryData.getMonuments()
    .then((monuments) => {
        monuments.forEach((monument) => {
        const newMarker = L.marker([monument.lat, monument.lng], {
            icon: monumentMarker,
            name: monument.name,
            latitude: monument.lat,
            longitude: monument.lng,
            type: 'monument',
            geonameId: monument.geonameId,
        }).addTo(monumentLayer);
        newMarker.on('click', infoPopup);
        });
       monumentMarkers.addLayer(monumentLayer); // adding the markers to the cluster group 

    })


}

//Use the users coordinates to get the name of their country
const getCountryCodeFromCoords = (latitude, longitude) => { 
    return $.ajax({
      url: 'php/getCountryFromCoords.php',
      type: 'POST',
      dataType: 'json',
      data: {
        lat: latitude, 
        lng: longitude,
      },
    })
    .then((result) => {  
        //Only change value if a country was found for the location otherwise search empties when ocean is clicked
        if (result.data.countryCode) { 
            let countryCode= result.data.countryCode;        
            return countryCode; 
        }
    })
    .catch(() => {
        $('#modalTitle').html(`Error`);
        $('#modalBody').html('Unfortunately there was an error');
        $('#infoModal').modal();
    });
  
};

//Find the user location and uses it to locate country on the map
const jumpToUserLocation = () => { //this works.
    //Check to see if user's browser supports navigator
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                //Save the lat & long and pass it to the function to get the country
                const { longitude, latitude } = position.coords; 
                //Store the coords in a global to be used later to calculate distances
                userCoords = {
                    longitude: longitude,
                    latitude: latitude,
                };
                getCountryCodeFromCoords(latitude, longitude)
                .then((countryCode) => {
                    setCountryByCode(countryCode);
                    $('#countrySelect').val(countryCode).change();
                });
            },
            (error) => {
                //If user denies location access, default to UK
                //getPolygon('GB');
                userCoords = {
                    longitude: -0.118092,
                    latitude: 51.509865,
                };
                alert(
                    'Location request denied. Sending you to the UK by default, distances shown will be based on London.'
                );
            }
        );
    } else {
      getPolygon('GB');     
    }
};
   
// Populate Select
const loadCountrySelect =()=>{ // this works 
    $.ajax({  
        type: 'POST',  
        url: 'php/getCountry.php',
        dataType: 'json',
        data: {
            countryCode: 'country' 
  
        }, 
    })   
    .done((result)=> {          
       
        map.locate({setView: true, maxZoom: 5});

        $('#countrySelect').html('<option selected="true" disabled>Select a Country</option>');
        
        $.each(result.data, function(i) {
            $('#countrySelect').append($('<option>', {
                text: result.data[i].name,
                value: result.data[i].code, // this makes it into name: code pairs in the data result array.
            }));
        });
    })
    .fail((err)=>{
        //console.log('something',err.responseText);
        handleFail();
    });
};

//This is for the select dropdown

const onLocationFound=(event)=>{ // for map click as well.
    const latitude = event['latlng']['lat'];
    const longitude = event['latlng']['lng'];

    getCountryCodeFromCoords(latitude,longitude)
    .then((countryCode) => {
        $('#countrySelect').val(countryCode).change(); // it was countryCode before // this is to change the countryCode to the one of the country that the user selects
    })
}
    
// Error handler 
const onLocationError=(e)=> {
    console.log(e.message);
}


//Populating the countryList array to be used with the autocomplete functionality.
const getCountryList = () => {
    const url = 'php/getCountryList.php';
    $.getJSON(url, (data) => {
        $(data).each((key, value) => {
            countryList.push(value);
        });
    });
};


//When HTML is rendered...
$(document).ready(() => {

  jumpToUserLocation();

  //Populate list of countries 
  loadCountrySelect();

  getCountryList();

  map.on('locationfound',onLocationFound);

  map.on('locationerror',onLocationError);

  //Change country based on map click
  map.on('click', onLocationFound);  

  $('#countrySelect').on('change',function(){
    const countryCode = this.value;
    setCountryByCode(countryCode);
  });
  
  $('#earthquakeBtn').click(() => {
    earthquakeLayer.addTo(map);
    
  });
  
  $('#cityBtn').click(() => {
    map.addLayer(cityLayer);
  });
  
  $('#monumentBtn').click(() => {
    map.addLayer(monumentMarkers); // adding the clustergroup to the map.
  });
  
});
   