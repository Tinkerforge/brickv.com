function PluginBrickletHumidity() {
  this.name = "Humidity Bricklet";
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
    this.configs[0].name = 'Relative Humidity';
    this.configs[0].unit = '%RH';
    this.configs[0].id = 'humidity-bricklet';
    
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

      this.hum = new Tinkerforge.BrickletHumidity(this.deviceInformation.uid, brickViewer.ipcon);
      this.hum.getHumidity(
        function(humidity) {
          this.lastValue = humidity / 10.0;
          this.graph.start();
        }.bind(this)
      );
      
      this.hum.on(Tinkerforge.BrickletHumidity.CALLBACK_HUMIDITY,
        function(humidity) {
          this.lastValue = humidity / 10.0;
        }.bind(this)
      );

      this.hum.setHumidityCallbackPeriod(this.updatePeriod);
    }
  };

  this.stop = function() {
    this.graph.stop();
    
    if(this.hum !== null) {
      this.hum.setHumidityCallbackPeriod(0);
    }
    $('#dashboard').empty();

    this.running = false;
  };
}
