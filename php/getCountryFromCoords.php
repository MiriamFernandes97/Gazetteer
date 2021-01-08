<?php
/*\this was what was done before
$key = '46fdacac5d374155ba838d479dd73fab';

$url = 'https://api.opencagedata.com/geocode/v1/json?q='.$_REQUEST['lat'].','.$_REQUEST['long'].'&pretty=1&key=' . $key; // change to the geonames api for getting country coordinates.

*/

$url = 'http://api.geonames.org/countryCodeJSON?formatted=true&lat='. $_REQUEST['lat']. ',long='.$_REQUEST['lng'] . '&username=miriam97&style=full';

	$ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // this line was commented out before.
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true);	

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";

	
    $output['data'] = $decode['results'];
    
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 


?>
