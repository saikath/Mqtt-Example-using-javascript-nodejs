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

/********** this is listener client for testing *****/

/** loading mqtt */

var mqtt = require("mqtt");

/*###############*/

/*** connect to the server *****/

var client = mqtt.connect('mqtt://localhost:1883');

/*##########################*/

/** subscribe to a topic */

//you can set the { qos : 1 } to explicitly subscribe for qos messages
client.subscribe('topic/client');

/*#####################*/

/**** listen for a message ******/


client.on('message', function(topic, message) {
  console.log(message.toString()); // message is Buffer
  //console.log(message);
});

/*##########################*/
