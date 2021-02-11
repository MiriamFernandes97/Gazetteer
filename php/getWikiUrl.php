<?php
//this is for checking errors
ini_set('display_errors', 'On');

error_reporting(E_ALL);

$url = "http://api.geonames.org/getJSON?geonameId=".$_REQUEST['geonameId']."&username=miriam97";

//http://localhost/Gazetteer/php/getWikiUrl.php?geonameId=6295630&username=miriam97

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