<?php

echo "Installing ember deploy\n";
//system('npm install ember-cli-deploy --save-dev --yes > /dev/null 2>&1 &');
//sleep(22);
system('npm install ember-cli-deploy --save-dev --yes');
echo "Deploying...\n";

exec('ember deploy production', $output);
$output = implode("\n",$output);

preg_match("/activate revision ([a-z0-9]+)\\./", $output, $matches);

if(isset($matches[1]) && !empty($matches[1])){
  
  $revision = $matches[1];
  echo "Activating revision: " . $revision . "\n";
  system('ember deploy:activate production --revision=' . $revision);
  
} else {
  
  echo "A valid revision was not detected\n";
  echo "------------------\n";
  echo $output . "\n";
  echo "------------------\n";
  
}

system('npm uninstall ember-cli-deploy --save-dev');