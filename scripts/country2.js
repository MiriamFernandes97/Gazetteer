class Country2 {
    constructor(countryCode) {
        this.countryCode = countryCode; //initializing countryCode
        
        this.population = null; // attributes
        this.capital = null;
        this.currency={
            name:null,
            symbol:null
        };
        this.area = null;
        this.polygon = null;
        this.boundingBox = null;
        this.cities = null;
        this.flag = null;
        this.countryName = null;

        this.earthquakes = null;
        this.monuments = null;
    }

    //Getting the info for the country which was selected
    getCountryInfo(){ // the parameter was countryCode before 
        return $.ajax({
        url: 'php/getCountryInfo.php',
        dataType: 'json',
        type: 'POST',
        data: { // the data is what parameter/s get sent to the php file.
            alpha2Code: this.countryCode, 
        }, 
        }).then((result) => { // this result is the part which is being echoed by the getPolygon.php file.       

            this.population = result.data.population;
            this.capital = result.data.capital;
            this.currency.name = result.data.currencies[0].name;
            this.currency.symbol = result.data.currencies[0].symbol;
            this.flag = result.data.flag;
            this.countryName = result.data.name;
            this.area = result.data.area;
        
            return this; // 'this' is the instance of country2.
        }) 
        .catch((jqXHR, textStatus, errorThrown) => {
            alert(`${textStatus} is the ERROR!!`);
        });
     };

    handleFail(){
        $('#modalTitle').html(`Error`);
        $('#modalBody').html(
          'Unfortunately there was an error finding a country for these coordinates. Please try a different location'
        );
        $('#infoModal').modal();
    }

    getPolygon(){ // the parameter was countryCode before 
        if(this.polygon){ // checking if this.polgyon has a value.
            return Promise.resolve(this.polygon);
        }

        return $.ajax({
            url: 'php/getPolygon.php',
            dataType: 'json',
            type: 'POST',
            data: { // the data is what parameter/s get sent to the php file.
                country: this.countryCode, 
                type:'code'
            }, 
        }).done((result) => { // this result is the part which is being echoed by the getPolygon.php file.       
            this.polygon = result;
            return this.polygon;
        }) 
        .fail((jqXHR, textStatus, errorThrown) => {
            alert(`${textStatus} is the ERROR!!`);
        });
     };

    getBoundingBox() {
        if(this.boundingBox == null){ // if bounding box is null, ping api and fill it
            return $.ajax({
                url: 'php/getCombinedApiInfo.php',
                dataType: 'json',
                type: 'POST',
                data: {
                  code:this.countryCode,     
                },
            })
            .then((result) => {   
                console.log('logging result.data.boundingBox.geonames',result.data.boundingBox.geonames);
                this.boundingBox = result.data.boundingBox.geonames[0];
                return this.boundingBox;

            })
            .catch(() => {
                $('#modalTitle').html(`Error`);
                $('#modalBody').html(
                'Unfortunately there was an error fetching the earthquake data. Please try selecting a different country'
                );
                $('#infoModal').modal();
            });
        }else{
            console.log('existing boundingBox result',this.boundingBox);
            return Promise.resolve(this.boundingBox); // otherwise just resolve the existing value.
            
        }
      
      }
    
    getMonuments() {
        //Clear any existing markers from previous country
        if(this.monuments){
            return Promise.resolve(this.monuments);
        }
       
        return $.ajax({
                url: 'php/getMonuments.php',
                dataType: 'json',   
                type: 'POST',
                data: {
                    country: this.countryCode,
                    countryBias:this.countryCode,
                },
            })
        .then((result) => {
            this.monuments = result.data;
            return this.monuments;
        })
          .catch(() => {
            $('#modalTitle').html(`Error`);
            $('#modalBody').html(
              'Unfortunately there was an error fetching the monument data. Please try selecting a different country'
            );
            $('#infoModal').modal();
        });
      }
      
      //Fetch most populous cities for active country and add markers to the city layer group
    getCities() {
        if(this.cities){
            return Promise.resolve(this.cities);
        }

        return $.ajax({
            url: 'php/getCityData.php',
            dataType: 'json',
            type: 'POST',
            data: {
                country:this.countryCode,
                countryBias:this.countryCode
            },
        })
        .then((result) => {
            this.cities = result.data;
            return this.cities;
        })
        .catch(() => {
            $('#modalTitle').html(`Error`);
            $('#modalBody').html(
            'Unfortunately there was an error fetching city information. Please try again or select a different country.'
            );
            $('#infoModal').modal(); // This creates a modal in jQuery. A modal is a popup window.
        });
    
    }

    //Get earthquake data
    getEarthquakes() {
        if(this.earthquakes){
            return Promise.resolve(this.earthquakes);
        }

        return this.getBoundingBox() // will either fetch and fill or just send back an existing result.
        .then(() => {
            if(this.earthquakes == null){
                return  $.ajax({
                    url: 'php/getEarthquakes.php',
                    dataType: 'json',
                    type: 'POST',
                    data: {
                        north: this.boundingBox.north,
                        south: this.boundingBox.south,
                        east: this.boundingBox.east,
                        west: this.boundingBox.west,
                    },
                })
            }else{
                return Promise.resolve({
                    data: this.earthquakes 
                })
            }
           
        }) 
        .then((result) => {
            this.earthquakes = result.data;
            return this.earthquakes;
        })
        .catch(() => {
            $('#modalTitle').html(`Error`);
            $('#modalBody').html(
            'Unfortunately there was an error fetching the earthquake data. Please try selecting a different country'
            );
            $('#infoModal').modal();
        });

       
    }


}