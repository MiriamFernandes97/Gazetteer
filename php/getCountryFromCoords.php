<?php
//this is for checking errors
ini_set('display_errors', 'On');

error_reporting(E_ALL);

$url ='http://api.geonames.org/countryCodeJSON?formatted=true&lat=' . $_REQUEST['lat'] . '&lng=' . $_REQUEST['lng'] . '&username=miriam97&style=full';

// http://localhost/Gazetteer/php/getCountryFromCoords.php?lat=55&lng=-4

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL,$url);

$result=curl_exec($ch);

curl_close($ch);

$decode = json_decode($result,true);	

$output['status']['code'] = "200";
$output['status']['name'] = "ok";

$output['data'] = $decode;

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output); 


?>
