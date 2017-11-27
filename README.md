#Mqtt-Example using javascript , nodejs 
This is an example of Mqtt server-client implementation with [`mosca`](https://github.com/mcollina/mosca) and [`mqtt`](https://github.com/mqttjs/MQTT.js) module.

#Introduction
MQTT is a protocol like HTTP or HTTPS, but it is simple, secure, fast and based on TCP/IP . It has two parts broker/server and client. A Client can subscribe to a topic and publish messages, whereas a Broker distributes those messages to the Clients according to their subscription policies.

#Server Configuration

##Install mosca
```node
npm install mosca bunyan -g  //remove -g for local installation , installing bunyan for logger
```
create a file named as`server.js`
##Load mosca
```node
var mosca = require("mosca");
```
##Database settings
Mosca supports Mongo and Redis. Though both have similar kind of configuration, this example demonstrates Mongo only.
```node
var dbSettings = {
    type: 'mongo',                         //it can be mongo / redis
    url: 'mongodb://localhost:27017/mqtt', //default is localhost:27017,mqtt is the db name
    pubsubCollection: 'mosca',             //default collection name is pubsub.
    mongo: {}                              //if any mongo specific options needed.
  }
```
##Server settings
Mosca can create mqtt , mqtts (secure) , http , https (secure) servers . Where http and https is created with mqtt attached.
###Create mqtt server
to create a basic mqtt server use this settings
```node
var serverSettings = {
  port: 1883,                             //default port is 1883 for mqtt
  backend: dbSettings                     //database sttings we have created earlier
}
```
###Create mqtts server
to create a mqtts server use `secure` property with `serverSettings`
```node
secure : {
  port: 8884                             //provide secure port if any (default 8883 ssl) 
  keyPath: {your keypath},               //path of .pem file
  certPath: {your certpath}              //path of .pem file
  }
```
###Create http server
to create a http server use `http` property with `serverSettings`
```node
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
  }
```
###Create https server
to create a https server use `https` and `credentials` properties with `serverSettings`
```node
credentials: {
  keyPath: {your keypath},              //path of .pem file
  certPath: {your certpath}             //path of .pem file
},
https:{
  port : 3030,                          //(optional default 3001)
  bundle : true,
  static : ‘/’, 
}
```
###Create persistence memory
to create a persistence memory / session provide `persistence` property with `serverSettings`
```node
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
  mongo: {}                           //mongo specific options
}
```
###Status
to get the status (subscribed clients , packages etc.) of the server on every 10s set `status` property to `true`.
```node
stats: true,                        //(optional)  default false 
```
##Create server
```node
var server = new mosca.Server(serverSettings);
```
##Mosca events
```node
//on client connected
server.on('clientConnected', function(client) {
  console.log("new client Connected");
});
//on client disconnecting
server.on('clientDisconnecting',function(client){
 console.log("client is disconnectting");
});
//on client disconnected
server.on('clientDisconnected',function(client) {
  console.log("client is disconnected");
});
//on any server error
server.on('error',function(err){
	console.log("error from server : ", err)
});
//on new client subscribtion to a topic
server.on('subscribed',function(topic,client){
	console.log("new client subscribed to --> ",topic);
});
//on unsubscribtion from a topic
server.on('unsubscribed',function(topic,client){
	console.log("client unsubscribed to --> ",topic);
});
//on any new message published
server.on('published', function(packet, client) {
  console.log("published packet : ", packet, "\n");
  //console.log("published client : ", client, "\n");
  console.log("Message received from package : \n", packet.payload.toString("utf-8"));
});
//on server ready
server.on('ready', setup);

function setup() {
  console.log('Mosca server running');
  //  console.log(server);
}
```
`published ` event passes two arguments as parameter to the callback function `packet` and `client`.

`client` is the client object from where the message is published.

`packet` - a sample packet here 
```node
{ 
  topic: 'topic/child',
  payload: <Buffer 7b 22 6e 61 6d 65 22 3a 22 73 61 69 6b 61 74 22 2c 22 74 69 74 6c 65 22 3a 22 68 61 6a 72 61 22 7d>,
  messageId: '4JftrH60W-',
  qos: 0,
  retain: false
}
```
`topic`  - where the message has been published

`payload`- buffer contains the message

`messageId` - a unique id of the message

`qos` - qos is 0 by default ,set it to 1 for guarantee of service.

`retain` - retain is also by default false. But if set to true, this message will be treated a bit differently.In that case message will be stored and will be published by the broker whenever a new client will subscribe to the same topic the retain message has (It’s like an welcome  message ) . Remember only the latest retain message will be stored per topic. 

#Client Configuration
##Install mqtt
```node
npm install mqtt@* 
```
create a file named as client.js
##Load mqtt
```node
var mqtt = require('mqtt');
```
##Connect with server
to connect with server mqtt has `.connect()` method .
```node
var client = mqtt.connect('mqtt://localhost:1883');
```
`connect() ` accepts two arguments `brokerUrl` and `opts`.

`brokerUrl` - is the url of the host. brokerUrl accepts `mqtt` , `mqtts` , `ws` (web socket) , `wss` (secure)  protocols.

`opts` - for secure connections provide options with credentials like this way
###Tls connection
```node
var options = {
  port: PORT,
  host: HOST,
  keyPath: KEY,
  certPath: CERT,
  rejectUnauthorized : true, 
  //The CA list will be used to determine if server is authorized
  ca: TRUSTED_CA_LIST
}
```
###Wss connection
```node
var options = {
    keepalive: 10,
    clientId: client_Id,
    protocolId: 'MQTT',
    protocolVersion: 4,
    clean: true,                  //set to false to receive QoS 1 and 2 messages while offline
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
    will: {                       //in case of any abnormal client close this message will be fired
        topic: 'ErrorMsg',
        payload: 'Connection Closed abnormally..!',
        qos: 0,
        retain: false
    },
    username: 'demo',
    password: 'demo',
    rejectUnauthorized: false,
}
```
use the `option` parameter in this way
```node
var client = mqtt.connect(host,options);
```
##Subscribe to a topic
```node
client.subscribe('topic/client', { qos: 1 }, function(err, granted) {
  if (err)
    console.log(err);
  else
    console.log("client connected : ", granted);
});
```
client can subscribe to more than one topic at a time by providing a object like `{'test1': 0, 'test2': 1}`, where property name is the topic name and value is the qos value.

`subscribe() ` passes `err` and `granted` as parameters to the callback function. `granted` is an array of object like
`{topic, qos}`
##Publish 
```node
//set retain true to deliver a message (like welcome messages) to the newly subscribed client.
//set qos = 1 to guarantee delivery service implement. 
//broker will always store the last retain message per topic if retain is true for messages.
client.publish('topic/client', JSON.stringify({ name: "saikat", title: "hajra" }), { retain: true, qos: 1 },function(){
  console.log("message published");
});
```
`publish() `has the following structure `publish(topic (string) , message (buffer/string) , options (object) , callback (function) )`
##Mqtt events
```node

/*** client on connect ***/
client.on("connect", function() {
  console.log("cleint is connected");
})

/*** client on reconnect ***/
client.on("reconnect", function() {
  console.log("cleint is reconnected");
})

/*** client on error ***/
client.on("error", function(err) {
  console.log("error from client --> ", err);
})

/*** client on close ***/
client.on("close", function() {
    console.log("cleint is closed");
})
  
  /*** client on offline ***/
client.on("offline", function(err) {
  console.log("client is offline");
});
```
##Mqtt message
mqtt has another event `message`.
```node
client.on('message', function(topic, message) {
  console.log(message.toString());                  // message is Buffer
});
```
#Client Configuration from browser
```node
<html>
<head>
  <title>test Ws mqtt.js</title>
</head>
<body>
<script src="./mqtt.js"></script>
<script>
      var client = mqtt.connect(); // you add a ws:// url here
      client.subscribe("mqtt/demo");

      client.on("message", function(topic, payload) {
        alert([topic, payload].join(": "));
        client.end();
      });

      client.publish("mqtt/demo", "hello world!");
    </script>
</body>
</html>
```
#Tips
Before integrating MQTT sever-client with any host, please make sure the server provider supports protocol other than http, https. Otherwise `mqtt` will not work. <b>Ex.</b> modulus does not support but AWS supports.   
#Usage
Mqtt is used for real time communication among machines (machine to machine) . It can be used for realtiime chat application, remote machine status update, realtime message broadcast services and any other fields where realtime communication is the first priority. Facebook messenger and few other real life applications are already supported by the mqtt.

#License
Mqtt-Example is under MIT license so feel free to use it!

#Author
Created by [Saikat Hajra](https://github.com/saikath). Please feel free to drop an email if you have any question at hajrasaikat@gmail.com 
