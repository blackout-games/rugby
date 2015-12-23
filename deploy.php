<?php

system('yes n | ember install ember-cli-deploy');
system('ember deploy production', $output);
system('npm uninstall ember-cli-deploy --save-dev');

