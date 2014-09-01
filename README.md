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

	process.env.AZURE_DOCUMENTDB_HOST = process.env.AZURE_DOCUMENTDB_HOST || nconf.get('documentdb:host'); 
	process.env.AZURE_DOCUMENTDB_AUTHKEY = process.env.AZURE_DOCUMENTDB_AUTHKEY || nconf.get('documentdb:authkey');

	var app = express();

	app.use(cookieParser('azure ermahgerd'));
	app.use(session({ store: new DocumentDBSessionStore({ host: process.env.AZURE_DOCUMENTDB_HOST, authKey: process.env.AZURE_DOCUMENTDB_AUTHKEY }) }));	

