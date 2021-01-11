<?php

//this is for checking errors
ini_set('display_errors', 'On');

error_reporting(E_ALL);

$url = "https://restcountries.eu/rest/v2/alpha/".$_REQUEST['alpha2Code'];

//https://restcountries.eu/rest/v2/alpha/{code}
//https://restcountries.eu/rest/v2/alpha/col
//http://restcountries.eu/rest/v2/alpha/COL

// Below is what worked when testing it in the browser along with the url above:
//==> http://localhost/Gazetteer/php/getCountryInfo.php?alpha2Code=GB


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