//Create POI class with methods for displaying information about city and monument markers

// this is for the modal for each monument marker, city marker.
class PointOfInterest {
  constructor(lat, lon, geonameId, name, population, type) {
    this.latitude = lat;
    this.longitude = lon;
    this.geonameId = geonameId;
    this.name = name;
    this.population = population;
    this.type = type;
  }

  //Degrees to radians for getDistancefromLatLon
  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  //Calculate distance based on coordinates
  getDistanceFromLatLonInKm(lat1, lon1) {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(this.latitude - lat1);
    const dLon = this.deg2rad(this.longitude - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
      Math.cos(this.deg2rad(this.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    this.distance = d.toFixed();
  }

  //Get wikipedia article url for the POI and display a short extract
  getWikiDetails() {
   
    $.ajax({
      url: 'php/getWikiUrl.php',
      dataType: 'json',
      type: 'POST',
      data: {
        geonameId: this.geonameId,
      },
    })
      .then((result) => {

        const data = result['data']; // data is a property of the object results. The data has all the information returned from the Geonames API
       
        // console.log(data); // this prints out the link to whatever you have clicked on.
      
        this.timeZone = data.timezone.timeZoneId;
      
        this.wikiUrl = data.wikipediaURL; 
            
        const titles = this.wikiUrl.split('/')[2]; // this is because you want the title(which is after two 2 /'s) It is this.wikiUrl.split because we are trying to get the title of the wiki article from the wiki url. The url is split with /'s and the normal format is tha the title comes after two /'s.
       
        this.displayInfo(); // this is to display the info from the url.
       
        $.ajax({ // this AJAX call is to the php routine to get the wiki summary from the above Wiki url.
          url: 'php/getWikiSummary.php',
          dataType: 'json',
          type: 'POST',
          data: {
            titles: titles,
          },
        })
          .done((result) => {

            const data = Object.values(result['data'])[0]; // But why was Object used?
            const extract = data['extract']; // this is to go to the data obj and look for the extract property.
            const cleaned = extract.replace('(listen)','') // to get rid of the other '(listen)'s which were not getting filtered out below.
            // console.log(cleaned);

            //Extracts have '(listen)' where the wikipedia sound button would be, remove it
            const regex = /\((listen)\)/;
            this.cleanExtract = cleaned.replace(regex, '');
            const cleanerRegex =  /\(( )\)/;
            this.cleanerExtract = this.cleanExtract.replace(cleanerRegex,'');

            // console.log( this.cleanerExtract)
            // console.log("🚀 ~ file: point-of-interest.js ~ line 83 ~ PointOfInterest ~ .done ~  this.cleanExtract",  this.cleanExtract)
            
            this.displayWikiDetails();
          })
          .fail(() => {
            this.displayInfo();
            this.wikiFailure();
          });
      })
      .fail(() => {
        this.displayInfo();
        this.wikiFailure();
      });
 }
  //Add wiki details to the modal
  displayWikiDetails() {
    $('#modalBody').html(
      `${this.cleanerExtract}<br><a href=https://${this.wikiUrl} target="_blank">Full Wikipedia Article</a>` // this displays the link to the wiki article.
    );
  }


  //get current time at marker
  getTime() {
    const date = new Date();

    this.time = date.toLocaleString('en-GB', {
      //Pass in the timezone to get the proper time for the coordinates
      timeZone: this.timeZone,
      timeStyle: 'short',
    });
  }

  //If no article is found
  wikiFailure() {
    $('#modalBody').html(
      `No wikipedia article could be found for this ${this.type}.`
    );
  }

 

  //Get current weather & forecast. Also get current time included in json
  getWeatherInfo() {
    $.ajax({
      url: 'php/getWeatherForecast.php',
      type: 'POST',
      dataType: 'json',
      data: {
        lat: this.latitude,
        lon: this.longitude,
      },
    }).done((result) => {

      this.currentWeather = result.data.current.weather[0]; 

      this.currentTemp = result.data.current.temp; 

      this.humidity = result.data.current.humidity; 
     
      this.pressure =result.data.current.pressure; 
     
      this.dailyWeather = result.data.daily; 

      this.displayWeather();

    }).fail((jqXHR, textStatus, errorThrown) => {
      alert(`${textStatus} is the ERROR!!`);
   });
  }

 
  //Add weather info to the modal
  displayWeather() {
    const forecast = [];
    //Set up a counter to be used to set up index of forecast array
    let i = 0;
    this.dailyWeather.forEach((day) => {
      //dt is in seconds so it needs to be converted to milliseconds
      const date = new Date(day.dt * 1000);
      //Make sure the correct day is displayed for the timezone
      const dayOfWeek = date.toLocaleString('en-GB', {
        timeZone: this.timeZone,
        weekday: 'long', // full form of the names of the days
      });
      $(`#forecastImg${i}`).attr(
        'src',
        `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png` // setting the src attribute of the forecast image to the openWeather url with the first entry of the weather as the icon.
      );
    
      $(`#forecast${i}`).html(
        `<li>${dayOfWeek}</li><li>${ 
          day.weather[0].description
        }</li><li>Min Temp:&nbsp;${day.temp.min.toFixed()}&#8451;</li><li>Max Temp:&nbsp;${day.temp.max.toFixed()}&#8451;</li>`
      );

      i++;
    });

    //Display current weather info for location
    $('#weatherImage').attr( // this is the weather button.
      'src',
      `https://openweathermap.org/img/wn/${this.currentWeather.icon}@2x.png` // this is to assign the right icon according to the weather prediction.
    );
    $('#weatherModalList').html(
      `<li>${
        this.currentWeather.description
      }</li><li>Temperature:&nbsp; ${this.currentTemp.toFixed()}&#8451;</li><li>Humidity:&nbsp;${
        this.humidity
      }%</li><li>Pressure:&nbsp${this.pressure}mb</li>`
    );
  }
}

class Monument extends PointOfInterest { // this is because monument has the same properties as the Point of Interest parent class
  constructor(latitude, longitude, geonameId, name) {  //this is to make monument objects.
    super(latitude, longitude, geonameId, name);
    this.type = 'monument';
  }
  //Add general info to the modal then display it
  displayInfo() { // this is the info we want to display when you click on the monumnet icon.
   
    this.getTime();
    $('#modalTitle').html(`${this.name}`); 
    $('#modalInfo').html(
      `<li>Current Time: &nbsp; ${this.time}</li><li>Latitude: &nbsp; ${this.latitude}</li><li>Longitude: &nbsp; ${this.longitude}</li><li>Distance from your location: &nbsp; ${this.distance}km</li>`
    );
    $('#wikiInfo').removeClass('show');
    $('#forecastInfo').removeClass('show');
    $('#weatherInfo').removeClass('show'); //this is to remove  the class show from the element with the id of weatherInfo.
    $('#generalInfo').addClass('show'); //this is to add the  class show to the element with id of generalInfo.
    $('#infoModal').modal(); // this is to show the popup box.
  }
}

class City extends PointOfInterest {
  constructor(latitude, longitude, geonameId, name, population, type) {
    super(latitude, longitude, geonameId, name, population, type);
  }

  displayInfo() {
    this.getTime();
    $('#modalTitle').html(`${this.name}`);
    $('#modalInfo').html(
      `<li>Current Time: &nbsp; ${this.time}</li><li>Estimated Population: &nbsp; ${this.population}</li>
      <li>Latitude: &nbsp; ${this.latitude}</li><li>Longitude: &nbsp; ${this.longitude}</li><li>Distance from your location: &nbsp; ${this.distance}km</li>`
    );
    $('#wikiInfo').removeClass('show');
    $('#forecastInfo').removeClass('show');
    $('#weatherInfo').removeClass('show');
    $('#generalInfo').addClass('show'); // this is because it has to show the generalInfo first. So add the class show to element with id of generalInfo.
    $('#infoModal').modal();
  }
}

