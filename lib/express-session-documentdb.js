/* DocumentDBSessionStore
    Author: Luke Van Horn
    License: MIT
    Description: An express session store using Azure DocumentDB.
*/

var Documentclient = require('documentdb').DocumentClient;
var util = require(process.binding('natives').util ? 'util' : 'sys');
var Session = require('express-session');

//compatability with express 3.x
Session = Session.session || Session;  

module.exports = DocumentDBSessionStore;

function DocumentDBSessionStore(options) {
    this.config = options || {};
    Session.Store.call(this, options);

    this.client = new Documentclient(this.config.host, { masterKey: this.config.authKey });
    this.databaseId = this.config.databaseId || 'AzureSessionStore';
    this.collectionId = this.config.collectionId || 'sessions';
}

util.inherits(DocumentDBSessionStore, Session.Store);

var p = DocumentDBSessionStore.prototype;

DocumentDBSessionStore.prototype.get = function(sid, callback) {
    var self = this;

    self.readOrCreateDatabase(self.databaseId, function(database) { 
        self.readOrCreateCollection(database, self.collectionId, function(collection) {
            self.client.queryDocuments(collection._self, 'SELECT * FROM root r WHERE r.id="' + sid + '"').toArray(function (err, results) {
                if(!err && results.length === 0) {
                    return callback();
                } else if (err) {
                    return callback(err);
                }

                callback(null, results[0].sess);
            });
        });
    });
}

DocumentDBSessionStore.prototype.set = function(sid, session, callback) {
    var self = this;

    var sess = {
        id: sid,
        sess: session
    }

    self.readOrCreateDatabase(self.databaseId, function(database) { 
        self.readOrCreateCollection(database, self.collectionId, function(collection) {
            self.client.queryDocuments(collection._self, 'SELECT * FROM root r WHERE r.id="' + sid + '"').toArray(function (err, results) {                 
                if(!err && results.length > 0) {
                    var doc = results[0];
                    doc.sess = session;

                    self.client.replaceDocument(doc._self, doc, function (err, doc) {
                        if (err) {
                            return callback(err);
                        }

                        return callback(null, session);
                    });  
                } else {
                    self.client.createDocument(collection._self, sess, function (err, doc) {
                        if (err) {
                            return callback(err);
                        }

                        return callback(null, session);
                    });
                }
            });
        });
    });               

}

DocumentDBSessionStore.prototype.destroy = function(sid, callback) {
    var self = this;

    self.readOrCreateDatabase(self.databaseId, function(database) { 
        self.readOrCreateCollection(database, self.collectionId, function(collection) {
            self.client.queryDocuments(collection._self, 'SELECT * FROM root r WHERE r.id="' + sid + '"').toArray(function (err, results) {
                if (err || !results || !results[0]) {
                    return callback(e);
                }

                self.client.deleteDocument(results[0],function(e) {
                    callback(e);
                });
            });
        });
    });
}

DocumentDBSessionStore.prototype.on = function(cmd) {
    console.log("DocumentDBSessionStore.on." + cmd);
}

// if the database does not exist, then create it, else return the database object
DocumentDBSessionStore.prototype.readOrCreateDatabase = function (databaseId, callback) {
    var self = this;

    self.client.queryDatabases('SELECT * FROM root r WHERE r.id="' + databaseId + '"').toArray(function (err, results) {
        if (err) {
            // some error occured, rethrow up
            throw (err);
        }
        if (!err && results.length === 0) {
            // no error occured, but there were no results returned 
            // indicating no database exists matching the query            
            self.client.createDatabase({ id: databaseId }, function (err, createdDatabase) {
                callback(createdDatabase);
            });
        } else {
            // we found a database
            callback(results[0]);
        }
    });
};

// if the collection does not exist for the database provided, create it, else return the collection object
DocumentDBSessionStore.prototype.readOrCreateCollection = function (database, collectionId, callback) {
    var self = this;

    self.client.queryCollections(database._self, 'SELECT * FROM root r WHERE r.id="' + collectionId + '"').toArray(function (err, results) {
        if (err) {
            // some error occured, rethrow up
            throw (err);
        }           
        if (!err && results.length === 0) {
            // no error occured, but there were no results returned 
            //indicating no collection exists in the provided database matching the query
            self.client.createCollection(database._self, { id: collectionId }, function (err, createdCollection) {
                callback(createdCollection);
            });
        } else {
            // we found a collection
            callback(results[0]);
        }
    });
};