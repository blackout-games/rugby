<?php


// True = conflicted file kept, other file removed
// False = conflicted file removed
$keepConflicted = true;


processFolder();

function processFolder($path='.'){
  
  global $keepConflicted;
  
  $files = scandir($path);
  
  foreach($files as $filepath){
    
    if($filepath==='.' || $filepath==='..') continue;
    
    $filepath = $path . '/' . $filepath;
    
    if(is_dir($filepath)){
      
      processFolder($filepath);
      
    } else {
      
      if(strpos($filepath,'conflicted copy')){
        
        if($keepConflicted){
          
          // Figure out real file name
          $cleanFilepath = preg_replace( '/ \(.+?conflicted copy.+?\)/i', '', $filepath );
          //print_r('|'.$filepath.'|'); echo "\n";
          
          echo 'Processed '.$cleanFilepath."\n";
          
          // Remove current
          unlink($cleanFilepath);
          
          // Move conflicted to current
          rename($filepath,$cleanFilepath);
          
        } else {
          
          // Remove conflicted
          unlink($filepath);
          echo 'Removed '.$filepath."\n";
          
        }
        
      }
      
    }
    
  }
  
}