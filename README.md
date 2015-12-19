# Blackout Rugby

This is the ember.js app for Blackout Rugby. The live app can be found at https://v2.blackoutrugby.com.

Be warned that this version is in development, so changes are being made often, and direct to Master (for now) so may break your local copy.

If you have any trouble or just want to chat feel free to [contact us](mailto:support@blackoutrugby.com). We'd love to hear from anyone interested in developing for Blackout Rugby.

## Ember 101

If any of the below is new to you. The best place to start is to read through the [Ember CLI E-book](https://leanpub.com/ember-cli-101). This will give you a solid understanding of ember.js. After you've been through the book, come back here to continue.

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM)
* [Bower](http://bower.io/)
* [Ember CLI](http://www.ember-cli.com/)

## Installation

In terminal/command prompt:

* `git clone https://github.com/blackout-games/rugby.git`
* `cd rugby`
* `npm install`
* `bower install`

### Environment

You'll need to make some changes to `config/environment.js` to suit your local setup.

* Uncomment `var localIP = 'localhost';`
* Uncomment the block containing `Development API (Live, Production)` to ensure you'll be connecting to the Live API.
* Comment out other variables/blocks of the same name.

### Code accuracy

Make sure you're using `jshint` in your code editor, this will show you any syntax imperfections. We recommend [Sublime Text](http://www.sublimetext.com/) with the [Sublime​Linter-jshint](https://packagecontrol.io/packages/SublimeLinter-jshint) package.

## Running / Development

* `ember server`
* Visit your app at [http://localhost:4200](http://localhost:4200).

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Deploying

You will not be deploying Blackout Rugby. You can make changes and submit pull requests, then we will deploy to production.

### API

The API documentation can be found [here](http://docs.blackoutrugby.apiary.io/). If you need any changes please [create a new issue](https://github.com/blackout-games/rugby/issues/new).

## Further Reading / Useful Links

* [ember.js](http://emberjs.com/)
* [ember-cli](http://www.ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)

