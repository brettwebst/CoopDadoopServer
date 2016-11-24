var gpios = require('./nodegpio.js');

/*
 * Pi WebService: TextMessage
 */
var piws_textMessage = function(_server,utf8data){
	var self = this;
	
	self.msg = null;
	self.parseError = null;
	self.server = _server;
	
	self.GPIOPins = [7,11,13,15,19,21,23,29,31,33,37,8,10,12,16,18,22,24,26,32,36,38,40];
	
	
	
	self.handleMessage = function (){
		if(typeof(self.msg) !="object"){
			return;
		}
	
		switch(self.msg.command){
			case "listen":
				console.log("handling listen command");
				self.handleListen();
				break;
			case "writable":
				console.log("handling writable command");
				self.handleWritable();
				break;
			case "write":
				console.log("handling write command");
				self.handleWrite();
				break;
			default:
				throw "Command not supported: " + self.msg.command;
				break;
		}
		
	}
	
	self.handleWrite = function(){
		if(typeof(self.msg.callbackToken) == "string" && self.validListenPin(self.msg.writeOn)){
			
			gpios.write(self.msg.writeOn, self.msg.value, function(){
				self.server.sendUTF(JSON.stringify(new pwis_outputMsg(this.msg.channel,this.msg.value,this.msg.callbackToken)));
			}.bind({msg:self.msg})
			);
			
		}
	}
	
	self.handleWritable = function(){
		if(self.validListenPin(self.msg.writeOn)){
			
			gpios.makeWriteable(self.msg.writeOn);
			
		}
	}
	
	
	
	self.handleListen=function(){
		if(typeof(self.msg.callbackToken) == "string" && self.validListenPin(self.msg.listenOn)){
			
			gpios.makeListenable(self.msg.listenOn, function(channel,value){
				
				console.log("Received " + channel.toString() + ". Value: " + value.toString());
				self.server.sendUTF(JSON.stringify(new pwis_inputMsg(channel,value,this.callbackToken)));
				
			}.bind({callbackToken:self.msg.callbackToken})
			);
			
		}
	}
	
	self.validListenPin = function(pin){
		var valid = true;
		
		if(isNaN(parseInt(pin,10))){
			valid=false;
		}
		
		if(valid&& self.GPIOPins.indexOf(pin) < 0){
			valid=false;
		}
		
		return valid;
	}
	
	
	var parse = function(utf8data){
		try{
			self.msg = JSON.parse(utf8data);
			
			if(typeof(self.msg) != "object"){
				throw "self.msg is of type " + typeof(self.msg) + ". Expected 'object'";
			}
			
			if(!self.msg.command || typeof(self.msg.command)!="string"){
				throw "command is not provided or is the wrong type. Expected 'string'";
			}
		}
		catch(ex){
			self.msg=null;
			self.parseError = ex;
			console.log(ex);
		}
	}
	
	if(typeof utf8data == "string" && utf8data.length > 0){
		parse(utf8data);
	}
	

	
};

var pwis_inputMsg=function(_channel, _value, _callbackToken){
	var self = this;
	self.channel = _channel;
	self.value = _value;
	self.callbackToken = _callbackToken;
}
var pwis_outputMsg=function(_channel, _value, _callbackToken){
	var self = this;
	self.channel = _channel;
	self.value = _value;
	self.callbackToken = _callbackToken;
}


 module.exports = piws_textMessage;
