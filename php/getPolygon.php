<?php
//this is for getting the country border.

//this is for checking errors
ini_set('display_errors', 'On');

error_reporting(E_ALL);


$url = 'countries_large.geo.json';

$countries = json_decode(file_get_contents($url), true);

$output = $countries['features'];

//this is for choosing which selector to use.

if($_REQUEST['type'] == 'code'){ // it was 'code'
    $selector = 'ISO_A3';
}else{
    $selector = 'ADMIN';
}

foreach($output as $key => $val ){
    if($val['properties'][$selector] == $_REQUEST['country']){
        echo json_encode($val);
        break;
    }
    
}

?>