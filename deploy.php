<?php


echo "Installing ember deploy\n";
//system('npm install ember-cli-deploy --save-dev --yes > /dev/null 2>&1 &');
//sleep(22);
system('npm install ember-cli-deploy --save-dev --yes');
echo "Deploying...\n";
system('ember deploy production', $output);
system('npm uninstall ember-cli-deploy --save-dev');

