<?php
//this is for checking errors
ini_set('display_errors', 'On');

error_reporting(E_ALL);


$url = "http://api.geonames.org/searchJSON?country=".$_REQUEST['country']."&countryBias=".$_REQUEST['countryBias']."&featureClass=P&maxRows=10&orderby=population&username=miriam97";
//used to be country= countryCode and countryBias = countryCode.
//http://localhost/Gazetteer/php/getCityData.php?country=CA&countryBias=CA&username=miriam97



$ch = curl_init();

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL,$url);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$result=curl_exec($ch);

curl_close($ch);

$decode = json_decode($result,true);	

$output['status']['code'] = "200";
$output['status']['name'] = "ok";


$output['data'] = $decode['geonames'];


header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output); 


?>
