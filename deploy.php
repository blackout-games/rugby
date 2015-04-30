<?php

$last_line = system('ember deploy -prod',$output);

if(strpos($last_line,'Uploaded revision:')!==false){
  $revision = trim(explode(": ",$last_line)[1]);
  echo "Activating revision: ".$revision."\n";
  system('ember deploy:activate --revision '.$revision.' -prod');
}
