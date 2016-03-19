<?php

system('yes n | npm install ember-cli-deploy --save-dev > /dev/null 2>&1 &');
sleep(22);
system('ember deploy production', $output);
system('npm uninstall ember-cli-deploy --save-dev');

