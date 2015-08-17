<?php

/**
 * For setting up environment at different locations
 */

if(isset($argv)){
  foreach($argv as $arg){
    if(strpos($arg,"=")!==false){
      $keyval = explode("=",$arg,2);
      $_GET[$keyval[0]] = $keyval[1];
    }
  }
}

if(isset($_GET['localip'])){
  
  $contents = file_get_contents("config/environment.js");
  
  // Comment all
  $contents = str_replace("  var localIP = '192.168.20.5';","  //var localIP = '192.168.20.5';",$contents);
  $contents = str_replace("  var localIP = '192.168.1.150';","  //var localIP = '192.168.1.150';",$contents);
  
  // Uncomment local
  $contents = str_replace("  //var localIP = '".$_GET['localip']."';","  var localIP = '".$_GET['localip']."';",$contents);
  
  file_put_contents("config/environment.js",$contents);
  
}
