<?php

system('yes n | npm install ember-cli-deploy --save-dev');
system('ember deploy production', $output);
system('npm uninstall ember-cli-deploy --save-dev');

