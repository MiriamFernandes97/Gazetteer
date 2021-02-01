<?php

//this is for checking errors
ini_set('display_errors', 'On');

error_reporting(E_ALL);

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
echo json_encode($countryList); 
?>