function PluginBrickletHallEffect() {
  this.name = "Hall Effect Bricklet";
  this.deviceInformation = null; 
  this.running = false;
  this.updatePeriod = 50;
  this.maxPoints = 200;

  this.init = function() {
    this.he = null;
    this.lastValue = 0;
    this.graph = new BrickGraph(this.updatePeriod, this.maxPoints, this.getValue.bind(this), 'Values', ' ', 'halleffect-bricklet');
  };

  this.setDeviceInformation = function(deviceInformation) {
    this.deviceInformation = deviceInformation;
  };

  this.addDOMElements = function() {
    html = getDeviceInformationDOM(this.deviceInformation);
    $('#dashboard').append(html);
    
    this.graph.addDOMElements($('#dashboard'));
  };
  
  this.getValue = function () {
    return this.lastValue;
  };

  this.start = function() {
    if(!this.running) {
      this.init();
      
      this.addDOMElements();
      this.running = true;

      this.he = new Tinkerforge.BrickletHallEffect(this.deviceInformation.uid, brickViewer.ipcon);
      this.he.getValue(
        function(edge_count, value) {
          if (value == true) {
		    this.lastValue = 1;
		  } else {
		    this.lastValue = 0;
		  }
          this.graph.start();
        }.bind(this)
      );
      
      this.he.on(Tinkerforge.BrickletHallEffect.CALLBACK_EDGE_COUNT,
        function(edge_count, value) {
		  if (value == true) {
		    this.lastValue = 1;
		  } else {
		    this.lastValue = 0;
		  }
        }.bind(this)
      );

      this.he.setEdgeCountCallbackPeriod(this.updatePeriod);
    }
  };

  this.stop = function() {
    this.graph.stop();
    
    if(this.he !== null) {
      this.he.setEdgeCountCallbackPeriod(0);
    }
    $('#dashboard').empty();

    this.running = false;
  };
}
