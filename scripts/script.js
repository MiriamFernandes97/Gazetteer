
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

//Populating the countryList array to be used with the autocomplete functionality.
const getCountryList = () => {
  //console.log('a'); // check
  const url = 'php/getCountryList.php';
  $.getJSON(url, (data) => {
   //console.log('A'); //check

    $(data).each((key, value) => {
      countryList.push(value);
    });

  });
};

//Getting the info for the country which was selected
const getCountryInfo = (countryCode) => { // the parameter was countryCode before 
  
  $.ajax({
    url: 'php/getCountryInfo.php',
    dataType: 'json',
    type: 'POST',
    data: { // the data is what parameter/s get sent to the php file.
       alpha2Code: countryCode, 
     }, 
  }).done((result) => { // this result is the part which is being echoed by the getPolygon.php file.

   //console.log('B'); //check
       
      // //console.log(result.data);

      const c = result.data;
      //console.log("🚀 ~ file: script.js ~ line 162 ~ check ~ c", c)
     
      //alert(c);
      //Use the returned info to create new Country class

    // const activeCountry = new Country(
    //   c.name,
    //   c.alpha2Code, 
    //   c.area,
    //   c.flag,
    //   c.capital,
    //   c.population,
    //   c.currencies[0].name,
    //   c.currencies[0].symbol
    // );
    // //Display info and fetch & create markers for the cities, monuments, and earthquakes
    // activeCountry.displayInfo();
    // activeCountry.getCities();
    // activeCountry.getMonuments();
    // activeCountry.getBoundingBox();
    

    }) 
 
  .fail((jqXHR, textStatus, errorThrown) => {
      alert(`${textStatus} is the ERROR!!`);
   });
};

//Handle selection of a new country
//The PHP routines will search the json file by 2-letter code depending on the action that triggered it
const selectNewCountryByCode = (countryCode) => {
 
  const start = Date.now(); //The Date.now() method returns the number of milliseconds elapsed since 1 January 1970

  loadCountryData(countryCode)
    .then(()=>{

      // If a polygon is already drawn, clear it
      if (countryOutline) {
        countryOutline.clearLayers();
      }

      countryOutline = L.geoJSON(countryData.data.polygon, { 
            
        style: {
          color: '#fd7e14',
        },
      }).addTo(map);
      map.fitBounds(countryOutline.getBounds());

      // getCountryInfo(countryCode); 
      const c = countryData.data.countryInfo;

      const activeCountry = new Country(
        c.name,
        c.alpha2Code, 
        c.area,
        c.flag,
        c.capital,
        c.population,
        c.currencies[0].name,
        c.currencies[0].symbol
      );
      //Display info and fetch & create markers for the cities, monuments, and earthquakes
      activeCountry.displayInfo();
      activeCountry.getCities();
      activeCountry.getMonuments();
      activeCountry.getBoundingBox();
    });
    
}

function handleFail(){
  $('#modalTitle').html(`Error`);
  $('#modalBody').html(
    'Unfortunately there was an error finding a country for these coordinates. Please try a different location'
  );
  $('#infoModal').modal();
}

//Use the users coordinates to get the name of their country
const getCountryFromCoords = (latitude, longitude) => { 
  $.ajax({
    url: 'php/getCountryFromCoords.php',
    type: 'POST',
    dataType: 'json',
    data: {
      lat: latitude, 
      lng: longitude,
    },
  })
    .done((result) => {
      const data = result.data;
      
      //Only change value if a country was found for the location otherwise search empties when ocean is clicked
      if (result.data.countryCode) { 
       //console.log(result.data.countryName); //prints United Kingdom
       
       
        $('#countrySelect').val(result.data.countryCode).change();
        adjustFontToFitSearchbar(result.data.countryCode);
        let countryCode= result.data.countryCode;
        // //console.log(country); // works 
      
        selectNewCountryByCode(countryCode); 
      }

    })
    .fail(() => {
      handleFail();
    });

};

//This is for the select dropdown

const onLocationFound=(event)=>{
//console.log("🚀 ~ file: script.js ~ line 263 ~ onLocationFound ~ event", event)

//console.log('e'); // this is to check whether this function is getting called.
// e is like the event

$.ajax({
      type: 'POST',
      url: 'php/getCountryFromCoords.php',
      dataType: 'json',
      data: {
        lat: event['latlng']['lat'],
        lng: event['latlng']['lng'],

      },
      success: function(result){
        //console.log(result.data);
        //console.log('E'); //check

          $('#countrySelect').val(result.data.countryCode).change(); // it was countryCode before // this is to change the countryCode to the one of the country that the user selects
         //console.log(result.data.countryCode); // this prints GB

        },

      error: function(jqXHR, textStatus, errorThrown){
          alert(`${textStatus} error`);
      }

  });

}

// Error handler 
const onLocationError=(e)=> {

  alert(e.message);
}

// Populate Select
const loadCountrySelect =()=>{ // this works
  //console.log('f'); //check

 //console.log('loadCountrySelect'); // for checking if loadCountrySelect was working.

  $.ajax({  
      type: 'POST',  
      url: 'php/getCountry.php',
      dataType: 'json',
      data: {
          countryCode: 'country' 

      }, 
  })   
      .done((result)=> {          
       //console.log('F'); //check

          //console.log(result);
          
          map.on('locationfound',onLocationFound);

         
          map.on('locationerror',onLocationError);

          
          map.locate({setView: true, maxZoom: 5});

          $('#countrySelect').html('<option selected="true" disabled>Select a Country</option>');
          
          $.each(result.data, function(i) {

              $('#countrySelect').append($('<option>', {
                  text: result.data[i].name,
                  value: result.data[i].code, // this makes it into name: code pairs in the data result array.
                  
                }));
                
          });
      }).fail((err)=>{
        //console.log('something',err.responseText);
        handleFail();
      });
     
  };


//Find the user location and uses it to locate country on the map
const jumpToUserLocation = () => { //this works.
 //console.log('g'); //check

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
        // //console.log(userCoords); //this works
        getCountryFromCoords(latitude, longitude);
      },
      (error) => {
        //If user denies location access, default to UK
        selectNewCountryByCode('GB');
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
    selectNewCountryByCode('GB');
    
     }
};

//Adjusting font height to make sure country name fits the searchbar
const adjustFontToFitSearchbar = (country) => {
  if (country.length > 25) {
    $('#countrySelect').css('font-size', '0.6em');
  } else if (country.length > 15) {
    $('#countrySelect').css('font-size', '1em');
  } else {
    $('#countrySelect').css('font-size', '1.3em');
  }
};

const loadCountryData =(code)=>{
  return new Promise(function(resolve,reject){
    $.ajax({  
      type: 'POST',  
      url: 'php/getCombinedApiInfo.php',
      dataType: 'json',
      data: {
        code:code
      }, 
    })   
      .done((result)=> {          
        //console.log("🚀 ~ file: script.js ~ line 457 ~ .done ~ result", result)    
        countryData = result;  // this can be done because countryData is a global variable. Here, we are 'filling' it will the result of the AJAX request to the combined PHP file.
        resolve(result);      
      }).fail((err)=>{
        //console.log('something',err.responseText);
        handleFail();
      });
  });

   
};

//Creating a pop up when a monument marker is clicked
const infoPopup = (event) => {
  //console.log('k'); //check
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

//When HTML is rendered...
$(document).ready(() => {

 //console.log('l'); //check

  jumpToUserLocation();

  //Populate list of countries 
  loadCountrySelect();
  getCountryList();

 

$('#countrySelect').on('change',function(){
  //console.log(this.value);
  const code = this.value; // this gives the code of the country clicked on.
  const countryCode = this.value;
  selectNewCountryByCode(countryCode);
  countryData = loadCountryData(code);
})



  //Change country based on map click
  map.on('click', getCountryFromClick);



  $('#earthquakeBtn').click(() => {
    // map.removeLayer(cityLayer);
    // map.removeLayer(monumentMarkers);
    earthquakeLayer.addTo(map);
  });

  $('#cityBtn').click(() => {
    // map.removeLayer(earthquakeLayer);
    // map.removeLayer(monumentMarkers);
    map.addLayer(cityLayer);
  });

  $('#monumentBtn').click(() => {
    // map.removeLayer(earthquakeLayer);
    // map.removeLayer(cityLayer);
    map.addLayer(monumentMarkers);
    
  });

});
