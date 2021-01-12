<?php
//this is for getting the country border.

//this is for checking errors
ini_set('display_errors', 'On');

error_reporting(E_ALL);


$url = 'countries_large.geo.json';

$countries = json_decode(file_get_contents($url), true);

$output = $countries['features'];


//this is for choosing which selector to use.

if($_REQUEST['type'] == 'Feature'){ // it was 'code'
    $selector = ['properties']['iso_a3']; 
    $selector = ['properties']['name'];

}

foreach($output as $key => $val ){ // this means the output should be in in key value pairs.
    if($val['properties']['name'] == $_REQUEST['country']){ 
        echo json_encode($val);
        break;
    }
    
}



?>