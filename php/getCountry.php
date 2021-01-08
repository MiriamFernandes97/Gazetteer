<?php

 //this is to populate the select

    $executionStartTime = microtime(true);

 
    $countryCode = $_REQUEST['countryCode'];

    $countryData = json_decode(file_get_contents("countries_large.geo.json"), true);

 

    $country = [];

 

    foreach ($countryData['features'] as $feature) {

 

        $temp = null;

        $temp['code'] = $feature["properties"]['ISO_A3'];

        $temp['name'] = $feature["properties"]["ADMIN"];

 

        array_push($country, $temp);

        

    }

 
    //to sort the list alphabetically.
    usort($country, function ($item1, $item2) {

 

        return $item1['name'] <=> $item2['name'];

 

    });

 

    $output['status']['code'] = "200";

    $output['status']['name'] = "ok";

    $output['status']['description'] = "success";

    $output['status']['executedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

    $output['data'] = $country;

    

    header('Content-Type: application/json; charset=UTF-8');

 

    echo json_encode($output);

 

?>