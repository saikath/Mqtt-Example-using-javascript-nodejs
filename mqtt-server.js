/*
The MIT License (MIT)

Copyright (c) 2016 saikath

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/


/*** loading mosca server ***/

var mosca = require("mosca");

/*###########################*/

/*** database settings for mongodb***/
var dbSettings = {
    type: 'mongo', // it can be mongo / redis
    url: 'mongodb://localhost:27017/mqtt', //default is localhost:27017,mqtt is the db name
    pubsubCollection: 'mosca', //default collection name is pubsub.I prefer naming mosca
    mongo: {} // if any mongo specific options needed. I don't have any
  }
  /*##########################*/

/**** server settings ****/

var serverSettings = {
  port: 1883, // default port is 1883 for mqtt

  //======== use these options for mqtts =======//
  /*
  secure : {
  	 port: 8884               //provide secure port if any (default 8883 ssl) 
	 keyPath: {your keypath}, //path of .pem file
     certPath: {your certpath} //path of .pem file
  }
   */
  //============= end =================//

  /*
   - this option will create a http server with mqtt attached. 
     - `port`   (optional)   the http port to listen. default 3000
     - `bundle` (optional)   if set to true then mqtt.js file will be served,so 
                             no need to download it.default is false.
     - `static` (optional)   provide your static files path.
    ** to access the mqtt.js or your static files put {yourhost}:{port}/staticfilename
   */
  http: {
    port: 3000,
    bundle: true,
    static: './public'
  },

  //======== use these options for https =======//
  /*
  credentials: {
	keyPath: {your keypath}, //path of .pem file
     certPath: {your certpath} //path of .pem file
  },*/
  /* https:{
  port : 3030, //(optional default 3001)
  bundle : true,
  static : ‘/’, 
  },*/
  //============= end =================//

  /*
   - this option will create a session over subscription and packets
     - `factory`       the persistence factory you want to choose from Mongo,Redis,LevelUp,Memory
     - `url`           the url of your persistence db
     - `ttl`(optional) the expiration of session
        - `subscriptions`  time period for subscriptions in ms (default 1 hour)
        - `packets`        time period for packets ini ms (default 1 hour)
     - `mongo`         the mongo specific options if any otherwise null object
     ** this module is specially used for retain messages
   */
  persistence: {
    factory: mosca.persistence.Mongo,
    url: 'mongodb://localhost:27017/mqtt',
    ttl: {
      subscriptions: 60 * 60 * 1000,
      packets: 60 * 60 * 1000,
    },
    mongo: {}
  },

  stats: false, //(optional) if set to true mosca keep informing about the server status
  //           on every 10s (default false) 
  backend: dbSettings
}

/*#########################*/

/** creating the mqtt server **/

var server = new mosca.Server(serverSettings);

/*##########################*/

/****** event listeners *********/

server.on('clientConnected', function(client) {
  console.log("client Connected");
});

server.on('published', function(packet, client) {
  console.log("published packet : ", packet, "\n");
  //console.log("published client : ", client, "\n");
  console.log("Message received from package : \n", packet.payload.toString("utf-8"));
});

server.on('ready', setup);

function setup() {
  console.log('Mosca server running');
  //  console.log(server);
}

/*#############################*/
