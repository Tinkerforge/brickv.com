function PluginBrickletTemperature() {
  this.name = "Temperature Bricklet";
  this.deviceInformation = null; 
  this.running = false;
  this.updatePeriod = 50;
  this.maxPoints = 200;

  this.init = function() {
    this.hum = null;
    this.lastValue = 0;
    
    this.configs = Array();
    this.configs[0] = new BrickGraphConfig();
    this.configs[0].getValueFunc = this.getValue.bind(this);
    this.configs[0].name = 'Temperature';
    this.configs[0].unit = '°C';
    this.configs[0].id = 'temperature-bricklet';
    
    this.graph = new BrickGraph(this.updatePeriod, this.maxPoints, this.configs);
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

      this.hum = new Tinkerforge.BrickletTemperature(this.deviceInformation.uid, brickViewer.ipcon);
      this.hum.getTemperature(
        function(temperature) {
          this.lastValue = temperature / 100.0;
          this.graph.start();
        }.bind(this)
      );
      
      this.hum.on(Tinkerforge.BrickletTemperature.CALLBACK_TEMPERATURE,
        function(temperature) {
          this.lastValue = temperature / 100.0;
        }.bind(this)
      );

      this.hum.setTemperatureCallbackPeriod(this.updatePeriod);
    }
  };

  this.stop = function() {
    this.graph.stop();
    
    if(this.hum !== null) {
      this.hum.setTemperatureCallbackPeriod(0);
    }
    $('#dashboard').empty();

    this.running = false;
  };
}
