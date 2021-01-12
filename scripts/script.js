
//Global variables to store the users coordinates, coutries for the autoselect, and polygon of the current country
let userCoords = {};
const countryList = [];
let countryOutline;

let weatherUrl;//???

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


const temp = L.tileLayer(weatherUrl, { // doesn't work
  tileSize: 512,
  zoomOffset: -1,
  layer: 'temp_new',
  minZoom: 2,
});
const precipitation = L.tileLayer(weatherUrl, { // doesn't work
  tileSize: 512,
  minZoom: 2,
  zoomOffset: -1,
  layer: 'precipitation_new',
});


//Initializing the map and setting its default layer to the dark theme which was defined above.
const map = L.map('map', {
  layers: [dark],
});

//Adding the different tile layers to the control button and adding the button/s to the map
const baseMaps = {
  Light: light,
  Dark: dark,
  Satellite: satellite,
  'Earth At Night': earthAtNight,
};

const weatherOverlays = { // doesn't work bec of temp & precip.
  Temperature: temp, 
  Precipitation: precipitation,
};
L.control.layers(baseMaps, weatherOverlays).addTo(map); 


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
  const url = 'php/getCountryList.php';
  $.getJSON(url, (data) => {
    $(data).each((key, value) => {
      countryList.push(value);
    });
  });
};

//Getting the info for the country which was selected
const getCountryInfo = (countryCode) => {
  $.ajax({
    url: 'php/getCountryInfo.php',
    dataType: 'json',
    type: 'POST',
    data: {
      countryCode: countryCode,
    },
  }).done((result) => {
    const c = result.data;
    //Use the returned info to create new Country class
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
};

//Handle selection of a new country
//The PHP routines will search the json file by either name or 3-letter code depending on the action that triggered it
//Autocomplete is populated by the json file so the names will always be a match, but other sources names may differ slightly so the code is preferred
const selectNewCountry = (country, type) => {
  const start = Date.now();

  $.ajax({// posting this info to the php file and getting the info from the api call in the php file and returning it to us.
    url: 'php/getPolygon.php',
    type: 'GET',
    // dataType: 'json',
    data: {
      country: country,
      type: type,
    },
  })
    .done((result) => {
      const countryCode = result['properties']['iso_a3']; // setting the country code to be the ISO_A3 one from the .json file.
      //If a polygon is already drawn, clear it
      if (countryOutline) {
        countryOutline.clearLayers();
      }
      countryOutline = L.geoJSON(result, {
        style: {
          color: '#fd7e14',
        },
      }).addTo(map);
      map.fitBounds(countryOutline.getBounds());
      getCountryInfo(countryCode);

      console.log(Date.now() - start);
    })
    .fail(() => {
      console.log('Error in selectNewCountry');
    });
};

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
      long: longitude,
    },
  })
    .done((result) => {
      console.log(result);

      const data = result.data[0];

      if(data ===  undefined || data === null ){
        handleFail();
        return;
      }

      const alpha3Code = data['ISO_3166-1_alpha-3'];
      

      //Only change value if a country was found for the location otherwise searchbar empties when ocean is clicked
      if (data.country) {
        $('#countrySearch').val(data.country);
        adjustFontToFitSearchbar(data.country);
        selectNewCountry(alpha3Code, 'code');

      }
    })
    .fail(() => {
      handleFail();
    });

};


// Error handler
function onLocationError(e) {

  alert(e.message);
}

function onLocationFound(e) {

  console.log(e);

  $.ajax({
      type: 'POST',
      url: 'php/getCountryFromCoords.php',
      dataType: 'json',
      data: {
          lat: e['latlng']['lat'],
          lng: e['latlng']['lng']
      },
      success: function(result){
          console.log(result);

          $('#dropdownCountry').val(result.data.countryCode).change();

      },

      error: function(jqXHR, textStatus, errorThrown){
          alert(`${textStatus} error`);
      }

  });

}

// Populate Select
const loadCountrySelect =()=>{
//  console.log('loadCountrySelect'); // for checking if loadCountrySelect was working.

  $.ajax({  
      type: 'POST',  
      url: 'php/getCountry.php',
      dataType: 'json',
      data: {
          countryCode: 'country',

      }, 
  })   
      .done((result)=> {  
      //console.log("🚀 ~ file: script.js ~ line 239 ~ .done ~ result", result) // for checking.
        
          console.log(result);
          
          map.on('locationfound',onLocationFound);

          /*
          (event,s)=>{
              console.log('locationfound',event,s); // for checking.
          }
          */
          map.on('locationerror',onLocationError);

          /*(event,s)=>{ 
            console.log('locationerror',event,s) // for checking.
          }
          */
          map.locate({setView: true, maxZoom: 5});

          $('#countrySelect').html('<option selected="true" disabled>Select a Country</option>');
          
          $.each(result.data, function(i) {

              $('#countrySelect').append($('<option>', {
                  text: result.data[i].name,
                  value: result.data[i].code,
              }));
          });
            
      }).fail((err)=>{
        console.log('something',err.responseText);
        handleFail();
      });
     
  };



//Find the user location and uses it to locate country on the map
const jumpToUserLocation = () => {
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
        getCountryFromCoords(latitude, longitude);
      },
      (error) => {
        //If user denies location access, default to UK
        selectNewCountry('GBR', 'code');
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
    selectNewCountry('GBR', 'code');
  }
};

//Event triggered when a country is selected from the searchbar
const handleSearchbarChange = (event, ui) => { // Look at https://api.jqueryui.com/autocomplete/#event-select
  const country = ui.item.value; 
  adjustFontToFitSearchbar(country);
  selectNewCountry(country, 'name');
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

//Function to handle map click
const getCountryFromClick = (event) => {
  const { lat, lng } = event.latlng; //deconstructing. Long form : const lat = event.latlng.lat; const lng = event.latlng.lng;
  getCountryFromCoords(lat, lng);
};
/*
//Associate the autocomplete field with the list of countries and set the function to be triggered when a country is selected
$('#countrySearch').autocomplete({
  source: countryList,
  minLength: 0,
  select: handleSearchbarChange,
  position: { my: 'top', at: 'bottom', of: '#countrySearch' },  // this means the seach results when autocompleting where it is posiitioned relative to the search bar which has the id of countrySearch. Look at https://api.jqueryui.com/position/
});
*/

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

/*
//Remove Loading Screen // take this off. There is no loading screen.
const removeLoader = () => {
  //Check if a country has been loaded, if so then remove loading screen. Otherwise keep checking at short intervals until it has.
  if (countryOutline) {
    $('#preloader')
      .delay(100)
      .fadeOut('slow', () => {
        $(this).remove();
      });
    clearInterval(checkInterval);
  }
};
let checkInterval = setInterval(removeLoader, 50);
*/

//When HTML is rendered...
$(document).ready(() => {
  jumpToUserLocation();

 // removeLoader();

  //Populate list of countries 
  loadCountrySelect();


  //Clear the searchbar of text when it is clicked for a smoother experience
  $('#countrySelect').click(() => $('#countrySelect').val(''));

  //Change country based on map click
  map.on('click', getCountryFromClick);

  $('#earthquakeBtn').click(() => {
    map.removeLayer(cityLayer);
    map.removeLayer(monumentMarkers);
    earthquakeLayer.addTo(map);
  });

  $('#cityBtn').click(() => {
    map.removeLayer(earthquakeLayer);
    map.removeLayer(monumentMarkers);
    map.addLayer(cityLayer);
  });

  $('#monumentBtn').click(() => {
    map.removeLayer(earthquakeLayer);
    map.removeLayer(cityLayer);
    map.addLayer(monumentMarkers);
  });
});

