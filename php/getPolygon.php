<?php
//this is for getting the country border.

//this is for checking errors
ini_set('display_errors', 'On');

error_reporting(E_ALL);


$url = 'countries_large.geo.json';

$countries = json_decode(file_get_contents($url), true);

$output = $countries['features'];


//this is for choosing which selector to use.

if($_REQUEST['type'] == 'code'){  // if the type ends up being in a code format, the selector will be the iso code else it will be by name.
    $selector = 'iso_a3'; 
}else{
    $selector = 'name';

}

foreach($output as $key => $val ){ // this means the output should be in in key value pairs.
    if($val['properties'][$selector] == $_REQUEST['country']){ 
        echo json_encode($val);
        break;
    }
    
}



?>