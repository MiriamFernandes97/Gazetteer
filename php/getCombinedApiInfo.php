<?php

//this is for checking errors
ini_set('display_errors', 'On');

error_reporting(E_ALL);


function getCountryFromCoords($lat,$lng){
    $url ='http://api.geonames.org/countryCodeJSON?formatted=true&lat=' . $lat . '&lng=' . $lng . '&username=miriam97&style=full';

    // http://localhost/Gazetteer/php/getCountryFromCoords.php?lat=55&lng=-4

	$ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true);	 
	
	return $decode; 
}

function getBoundingBox($countryCode){
    $url = "http://api.geonames.org/countryInfoJSON?formatted=true&country=".$countryCode."&username=miriam97&style=full";

    //it was requesting countryCode before. The $_REQUEST['country'] request is for the iso2 code.
    //localhost/Gazetteer/php/getBoundingBox.php?country=UK&username=miriam97

    $ch = curl_init();

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL,$url);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
    $result=curl_exec($ch);

    curl_close($ch);
    $decode = json_decode($result,true);	
        
    return $decode;
}

function getCityData($countryCode, $countryBias){
    $url = "http://api.geonames.org/searchJSON?country=".$countryCode."&countryBias=".$countryBias."&featureClass=P&maxRows=10&orderby=population&username=miriam97";
    //used to be country= countryCode and countryBias = countryCode.
    //http://localhost/Gazetteer/php/getCityData.php?country=CA&countryBias=CA&username=miriam97



    $ch = curl_init();

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL,$url);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $result=curl_exec($ch);

    curl_close($ch);

    $decode = json_decode($result,true);	   

    return $decode['geonames'];
}

function getCountry(){
     //this is to populate the select

     $executionStartTime = microtime(true);
 
     $countryData = json_decode(file_get_contents("countries_large.geo.json"), true);
 
     $country = [];
 
     foreach ($countryData['features'] as $feature) {
 
         $temp = null;
 
         $temp['code'] = $feature["properties"]['iso_a2'];
 
         $temp['name'] = $feature["properties"]["name"];
 
         array_push($country, $temp);
 
     }
 
     //to sort the list alphabetically.
     usort($country, function ($item1, $item2) {
 
         return $item1['name'] <=> $item2['name'];
 
     });
 
    //  $output['status']['code'] = "200";
    //  $output['status']['name'] = "ok";
    //  $output['status']['description'] = "success";
    //  $output['status']['executedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
    //  $output['data'] = $country;
    //  header('Content-Type: application/json; charset=UTF-8');  
    //  echo json_encode($output);

    return $country;
}


function getCountryInfo($alpha2Code){
    $url = "https://restcountries.eu/rest/v2/alpha/".$alpha2Code;

    //https://restcountries.eu/rest/v2/alpha/{code}
    //https://restcountries.eu/rest/v2/alpha/co

    // Below is what worked when testing it in the browser along with the url above:
    //==> http://localhost/Gazetteer/php/getCountryInfo.php?alpha2Code=CO

    $ch = curl_init();

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL,$url);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $result=curl_exec($ch);

    curl_close($ch);

    $decode = json_decode($result,true);	   

    return $decode;
}


function CountryList(){
    $url ='countries_large.geo.json';

    $countries = json_decode(file_get_contents($url), true);

    $countryList = array();

    $output = $countries['features'];
    foreach($countries['features'] as $key => $val){
        if($val['properties']["iso_a2"] != "-99"){
            array_push($countryList, $val['properties']['name']);
        }
    }

    sort($countryList);

    return $countryList; 

}

function getEarthquakes($north, $south, $east, $west){
    $url = 'http://api.geonames.org/earthquakesJSON?north='.$north.'&south='.$south.'&east='.$east.'&west='.$west.'&maxRows=10&username=miriam97';

    $ch = curl_init();
    
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $result = curl_exec($ch);
    
    curl_close($ch);
    
    $decode = json_decode($result, true);   
    
    return $decode['earthquakes'];
}

function getMonuments($countryCode, $countryBias){
    $url = "http://api.geonames.org/searchJSON?formatted=true&country=".$countryCode."&countryBias=".$countryBias. '&maxRows=10&featureCode=MNMT&lang=en&username=miriam97&style=full';

    //it was countryCode before.

    //http://localhost/Gazetteer/php/getMonuments.php?formatted=true&country=UK&countryBias=UK&maxRows=10&featureCode=MNMT&lang=en&username=miriam97&style=full

    $ch = curl_init();

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL,$url);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $result=curl_exec($ch);

	curl_close($ch);

    $decode = json_decode($result,true);	
    
	return $decode['geonames'];

}

function getPolygon($countryCode){
    $url = 'countries_large.geo.json';

    $countries = json_decode(file_get_contents($url), true); // to convert JSON to PHP assoc array.

    $features = $countries['features'];

    // print_r($features); // to check what $features shows. 

    //this is for choosing which selector to use.

    // if($type == 'code'){  // if the type ends up being in a code format, the selector will be the iso code else it will be by name.
    //     $selector = 'iso_a2'; 
    // }else{
    //     $selector = 'name';
    // }

    foreach($features as  $key=>$val ){ //this means that features will be stored as values. [it was as key value pairs before.]
        if($val['properties']['iso_a2'] == $countryCode){ 
            return $val;
        } // you should echo only once or where there is an exit (meaning that there is nothing after that.)
    }
}

function getWeatherForecast($lat, $lon){
    $appId="048d2f277161c737361281a06008b561";

    $url = "https://api.openweathermap.org/data/2.5/onecall?lat=".$lat."&lon=".$lon."&units=metric&exclude=hourly,minutely&appid=" . $appId;

    // http://localhost/Gazetteer/php/getweatherForecast.php?lat=33.441792&lon=-94.037689&appid=048d2f277161c737361281a06008b561


    $ch = curl_init();

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL,$url);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $result=curl_exec($ch);

    curl_close($ch);

    $decode = json_decode($result,true);	

    return $decode;
}


function getWikiSummary($titles){
    $url = 'https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&explaintext&exintro=&redirects=1&exsentences=2&titles=' .$titles; 

    //http://localhost/Gazetteer/php/getWikiSummary.php?&titles=glasgow

    $ch = curl_init();

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL,$url);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $result=curl_exec($ch);

    curl_close($ch);

    $decode = json_decode($result,true);	

    return $decode['query']['pages'];

}

function getWikiUrl($geonameId){
    $url = "http://api.geonames.org/getJSON?geonameId=".$geonameId."&username=miriam97";

    //http://localhost/Gazetteer/php/getWikiUrl.php?geonameId=6295630&username=miriam97

    $ch = curl_init();

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL,$url);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $result=curl_exec($ch);

    curl_close($ch);

    $decode = json_decode($result,true);	

    return $decode;
}

$countryCode = $_REQUEST['code'];


//$country = getCountry($countryCode);
$polygon = getPolygon($countryCode);
$boundingBox = getBoundingBox($countryCode);
$cityData = getCityData($countryCode,$countryCode);
$countryInfo = getCountryInfo($countryCode);
$monuments = getMonuments($countryCode,$countryCode);

$north = $boundingBox['geonames'][0]['north'];
$south = $boundingBox['geonames'][0]['south'];
$east = $boundingBox['geonames'][0]['east'];
$west = $boundingBox['geonames'][0]['west'];
$earthquakes = getEarthquakes($north,$south,$east,$west);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";


$output['data'] = compact('countryCode','polygon','boundingBox','cityData','countryInfo','monuments','earthquakes');

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output); 


?>