function PluginBrickletDistanceUS() {
  this.name = "Distance US Bricklet";
  this.deviceInformation = null; 
  this.running = false;
  this.updatePeriod = 50;
  this.maxPoints = 200;

  this.init = function() {
    this.dist = null;
    this.lastValue = 0;
    
    this.configs = Array();
    this.configs[0] = new BrickGraphConfig();
    this.configs[0].getValueFunc = this.getValue.bind(this);
    this.configs[0].name = 'Distance';
    this.configs[0].unit = '';
    this.configs[0].id = 'distance-us-bricklet';
    
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

      this.dist = new Tinkerforge.BrickletDistanceUS(this.deviceInformation.uid, brickViewer.ipcon);
      this.dist.getDistanceValue(
        function(distance) {
          this.lastValue = distance;
          this.graph.start();
        }.bind(this)
      );
      
      this.dist.on(Tinkerforge.BrickletDistanceUS.CALLBACK_DISTANCE,
        function(distance) {
          this.lastValue = distance;
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
