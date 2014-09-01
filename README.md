# ExpressJS Session Store for Azure Document DB

Node.js express session store provider for Windows Azure documentDB.

Adapted from express-session-azure by Aaron Silvas.  

## Install

    npm install express-session-documentdb


## Usage

Typical usage:

    var express = require('express');
	var session = require('express-session');
	var cookieParser = require('cookie-parser');
	var DocumentDBSessionStore = require('express-session-documentdb');

	nconf = require('nconf');
	nconf.env().file({ file: 'config.json' });

	var options = { host: nconf.get('documentdb:host'), authKey: nconf.get('documentdb:authkey') };

	var app = express();

	app.use(cookieParser('azure ermahgerd'));
	app.use(session({ store: new DocumentDBSessionStore(options) }));	

