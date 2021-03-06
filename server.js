var express = require('express'),
app 		= express(),
http		= require('http'),
getPuppies	= require('./getPuppies'),
zulip 		= require('zulip-node'),
streams 	= require('./streams.js'),
client		= new zulip(process.env.ZULIP_EMAIL, process.env.ZULIP_API_KEY);

app.server = http.Server(app);

client.registerQueue({
  event_types: ['message']
}, true);

client.on('registered', function() {
  console.log('registered');
  client.updateSubscriptions(streams, function() {
  	console.log('streams updated');
  })
})
.on('message', function(msg) {
  if (msg.sender_email !== process.env.ZULIP_EMAIL)
  handleMsg(msg);
})
.on('error', function(err) {
  console.error(err);
});


function handleMsg(msg) {
  var content = msg.content,
  stream = msg.display_recipient,
  sender = msg.sender_email,
  subject = msg.subject,
  type = msg.type,
  opts = {};

	if (content.indexOf(':dog:') > -1 || 
		content.indexOf(':dog2:') > -1 || 
		content.indexOf(':doge:') > -1 ) {   		
		getPuppies(function(puppy) {
			if (type === 'private') {
			    client.sendPrivateMessage({
			      content: puppy,
			      to: sender
			    });
			} else {
			    client.sendStreamMessage({
			      content: puppy,
			      to: stream,
			      subject: subject
			    });
			}
    	});
  	}
}

app.server.listen(process.env.PORT || 9000);