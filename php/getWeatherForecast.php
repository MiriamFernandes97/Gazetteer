<?php

//this is for checking errors
ini_set('display_errors', 'On');

error_reporting(E_ALL);

$appId="048d2f277161c737361281a06008b561";

$url = "https://api.openweathermap.org/data/2.5/onecall?lat=".$_REQUEST['lat']."&lon=".$_REQUEST['lon']."&units=metric&exclude=hourly,minutely&appid=" . $appId;

// http://localhost/Gazetteer/php/getweatherForecast.php?lat=33.441792&lon=-94.037689&appid=048d2f277161c737361281a06008b561


$ch = curl_init();

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL,$url);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $result=curl_exec($ch);

	curl_close($ch);

    $decode = json_decode($result,true);	
    
    $output['status']['code'] = "200";
	$output['status']['name'] = "ok";

	
    $output['data'] = $decode;
    
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 



?>
