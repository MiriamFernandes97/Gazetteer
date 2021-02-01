        <?php

        //This is for checking errors
        ini_set('display_errors', 'On');

        error_reporting(E_ALL);


        // getBoundingBox

        $url = "http://api.geonames.org/countryInfoJSON?formatted=true&country=".$_REQUEST['country']."&username=miriam97&style=full";


        $ch = curl_init();

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_URL,$url);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            
        $result=curl_exec($ch);

        curl_close($curl);

        $boundingBox = json_decode($result,true);	

            
        // $output['data'] = $boundingBox['geonames'];


    

    // getCityData

    $url = "http://api.geonames.org/searchJSON?country=".$_REQUEST['country']."&countryBias=".$_REQUEST['countryBias']."&featureClass=P&maxRows=10&orderby=population&username=miriam97";

    $ch = curl_init();

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_URL,$url);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        $result=curl_exec($ch);

        curl_close($curl);

        $cityData = json_decode($result,true);	
        
        

        
        // $output['data'] = $cityData['geonames'];
        
        



    // getCountryFromCoords

    $url ='http://api.geonames.org/countryCodeJSON?formatted=true&lat=' . $_REQUEST['lat'] . '&lng=' . $_REQUEST['lng'] . '&username=miriam97&style=full';

    $ch = curl_init();
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_URL,$url);

        $result=curl_exec($ch);

        curl_close($curl);

        $countryFromCoords = json_decode($result,true);	


        
        // $output['data'] = $countryFromCoords;
        
        




    // getCountryInfo

    $url = "https://restcountries.eu/rest/v2/alpha/".$_REQUEST['alpha2Code'];


    $ch = curl_init();

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_URL,$url);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        $result=curl_exec($ch);

        curl_close($curl);

        $countryInfo = json_decode($result,true);	
    
        
        // $output['data'] = $countryInfo;
        
        





        // getEarthquakes

        $url = 'http://api.geonames.org/earthquakesJSON?north='.$_REQUEST['north'].'&south='.$_REQUEST['south'].'&east='.$_REQUEST['east'].'&west='.$_REQUEST['west'].'&maxRows=10&username=miriam97';

        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

        $result = curl_exec($ch);

        curl_close($curl);
        
        $earthquakes = json_decode($result, true);


        // $output['data'] = $earthquakes['earthquakes'];







    //getMonuments

    $url = "http://api.geonames.org/searchJSON?formatted=true&country=".$_REQUEST['country']."&countryBias=".$_REQUEST['countryBias']. '&maxRows=10&featureCode=MNMT&lang=en&username=miriam97&style=full';



    $ch = curl_init();

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_URL,$url);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        $result=curl_exec($ch);

        curl_close($curl);

        $monuments = json_decode($result,true);	
        

        
        // $output['data'] = $monuments['geonames'];
        
        






    // getWeatherForecast

    $appId="048d2f277161c737361281a06008b561";

    $url = "https://api.openweathermap.org/data/2.5/onecall?lat=".$_REQUEST['lat']."&lon=".$_REQUEST['lon']."&units=metric&exclude=hourly,minutely&appid=" . $appId;

    // http://localhost/Gazetteer/php/getweatherForecast.php?lat=33.441792&lon=-94.037689&appid=048d2f277161c737361281a06008b561


    $ch = curl_init();

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_URL,$url);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        $result=curl_exec($ch);

        curl_close($curl);

        $weatherForecast = json_decode($result,true);	
        
    

        
        // $output['data'] = $weatherForecast;
        
        
        

    // getWikiSummary

    $url = 'https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&explaintext&exintro=&redirects=1&exsentences=2&titles=' .$_REQUEST['titles']; 



    $ch = curl_init();


        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_URL,$url);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        $result=curl_exec($ch);

        curl_close($curl);

        $wikiSummary = json_decode($result,true);	
        
    
    
        
        // $output['data'] = $wikiSummary ['query']['pages'];
        
        




    // url for getWikiUrl

    $url = "http://api.geonames.org/getJSON?geonameId=".$_REQUEST['geonameId']."&username=miriam97";


    $ch = curl_init();


        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_URL,$url);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        $result=curl_exec($ch);

        curl_close($curl);

        $wikiUrl = json_decode($result,true);	
        
    
        
        // $output['data'] = $wikiUrl;
        
        
    


        $output['status']['code'] = "200";
        $output['status']['name'] = "ok";


        $output['data'] = $boundingBox['geonames'];
        $output['data'] = $cityData['geonames'];
        $output['data'] = $countryFromCoords;
        $output['data'] = $countryInfo;
        $output['data'] = $weatherForecast;
        $output['data'] = $earthquakes['earthquakes'];
        $output['data'] = $monuments['geonames'];
        $output['data'] = $wikiSummary ['query']['pages'];
        $output['data'] = $wikiUrl;

        
        $output['status']['executedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
        header('Content-Type: application/json; charset=UTF-8');

        echo json_encode($output); 



    ?>
