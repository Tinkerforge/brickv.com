function PluginBrickletDistanceIR() {
  this.name = "Distance IR Bricklet";
  this.deviceInformation = null; 
  this.running = false;
  this.updatePeriod = 50;
  this.maxPoints = 200;

  this.init = function() {
    this.dist = null;
    this.lastValue = 0;
    this.graph = new BrickGraph(this.updatePeriod, this.maxPoints, this.getValue.bind(this), 'Distance', 'cm', 'distance-ir-bricklet');
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

      this.dist = new Tinkerforge.BrickletDistanceIR(this.deviceInformation.uid, brickViewer.ipcon);
      this.dist.getDistance(
        function(distance) {
          this.lastValue = distance / 10;
          this.graph.start();
        }.bind(this)
      );
      
      this.dist.on(Tinkerforge.BrickletDistanceIR.CALLBACK_DISTANCE,
        function(distance) {
          this.lastValue = distance / 10;
        }.bind(this)
      );

      this.dist.setDistanceCallbackPeriod(this.updatePeriod);
    }
  };

  this.stop = function() {
    this.graph.stop();
    
    if(this.dist !== null) {
      this.dist.setDistanceCallbackPeriod(0);
    }
    $('#dashboard').empty();

    this.running = false;
  };
}
