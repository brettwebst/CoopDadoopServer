var gpio = require('rpi-gpio');

var NodeGPIO = function(){
	var self = this;

	// setup channels
	self.gpio17 = 11;
	self.gpio27 = 13;


	self.channelRegistrations=[];
	self.onChangeCallbacks=[];

	self.makeListenable = function (channel,callback){
		console.log("makeListenable. Channel: " + channel.toString());
		if(self.channelRegistrations.indexOf(channel)==-1 && !self.callbackExists(channel)){
			gpio.setup(channel, gpio.DIR_IN, gpio.EDGE_BOTH);
			
			self.onChangeCallbacks.push({Channel:channel,Callback:callback});
			
			self.channelRegistrations.push(channel);
		}
	}
	
	self.callbackExists=function(channel){
		console.log("callbackExists. Channel: " + channel.toString());
		for(var i = 0; i< self.onChangeCallbacks.length; i++){
			if(self.onChangeCallbacks[i].Channel == channel){
				return true;
			}
		}
		
		return false;
	}
	
	self.getCallback=function(channel){
		console.log("getCallback. Channel: " + channel.toString());
		for(var i = 0; i< self.onChangeCallbacks.length; i++){
			if(self.onChangeCallbacks[i].Channel == channel){
				return self.onChangeCallbacks[i].Callback;
			}
		}
		
		return null;
	}
	
	
	self.makeWriteable=function(channel){
		console.log("makeWriteable. Channel: " + channel.toString());
		if(self.channelRegistrations.indexOf(channel)==-1){
			gpio.setup(channel, gpio.DIR_OUT);
			
			self.channelRegistrations.push(channel);
		}
	}
	
	self.write=function(channel,value,callback){
		console.log("write");
		if(self.channelRegistrations.indexOf(channel) > -1){
			gpio.write(channel,value,callback);
		}
	}
	
	self.initialize=function(){
		gpio.on('change', function(channel, value) {
			console.log("onChange");
			var cback = self.getCallback(channel);
			if(typeof(cback) == "function"){
				cback.apply(self,[channel,value]);
			}
		});
	}
	
	self.dispose=function(){
		gpio.destroy(function() {
			console.log('Closed pins, now exit');
		});
	}
	
	self.initialize();
}
 
var doExport=true;
if(doExport){

	module.exports = new NodeGPIO();
}

else{

	var coop = new NodeGPIO();
	coop.makeWriteable(coop.gpio17);
	coop.makeListenable(coop.gpio27, function(channel,value){
		console.log("Received " + channel.toString() + ". Value: " + value.toString());
		this.write(coop.gpio17,value);
	});

	mainLoop = function(){
		setTimeout(mainLoop,1000);
	}

	mainLoop();
}
