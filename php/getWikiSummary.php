<?php

//this is for checking errors
ini_set('display_errors', 'On');

error_reporting(E_ALL);


$url = 'https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=' .$_REQUEST['title']; 

$ch = curl_init();


    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL,$url);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $result=curl_exec($ch);

	curl_close($ch);

    $decode = json_decode($result,true);	
    
   
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
	
    $output['data'] = $decode['query']['pages'];
    
    
    header('Content-Type: application/json; charset=UTF-8');
        echo json_encode($output);

?>