function PluginBrickletBarometer() {
  this.name = "Barometer Bricklet";
  this.deviceInformation = null; 
  this.running = false;
  this.updatePeriod = 50;
  this.maxPoints = 200;

  this.init = function() {
    this.baro = null;
    this.lastValue = 0;
    this.graph = new BrickGraph(this.updatePeriod, this.maxPoints, this.getValue.bind(this), 'Air Pressure', 'mbar', 'barometer-bricklet');
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

      this.baro = new Tinkerforge.BrickletBarometer(this.deviceInformation.uid, brickViewer.ipcon);
      this.baro.getAirPressure(
        function(ap) {
          this.lastValue = ap / 1000.0;
          this.graph.start();
        }.bind(this)
      );
      
      this.baro.on(Tinkerforge.BrickletBarometer.CALLBACK_AIR_PRESSURE,
        function(ap) {
          this.lastValue = ap / 1000.0;
        }.bind(this)
      );

      this.baro.setAirPressureCallbackPeriod(this.updatePeriod);
    }
  };

  this.stop = function() {
    this.graph.stop();
    
    if(this.baro !== null) {
      this.baro.setAirPressureCallbackPeriod(0);
    }
    $('#dashboard').empty();

    this.running = false;
  };
}
