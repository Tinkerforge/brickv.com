function PluginBrickletAmbientLight() {
  this.name = "Ambient Light Bricklet";
  this.deviceInformation = null; 
  this.running = false;
  this.updatePeriod = 50;
  this.maxPoints = 200;

  this.init = function() {
    this.al = null;
    this.lastValue = 0;
    this.graph = new BrickGraph(this.updatePeriod, this.maxPoints, this.getValue.bind(this), 'Illuminance', 'Lux', 'ambient-light-bricklet');
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

      this.al = new Tinkerforge.BrickletAmbientLight(this.deviceInformation.uid, brickViewer.ipcon);
      this.al.getIlluminance(
        function(illuminance) {
          this.lastValue = illuminance / 10.0;
          this.graph.start();
        }.bind(this)
      );
      
      this.al.on(Tinkerforge.BrickletAmbientLight.CALLBACK_ILLUMINANCE,
        function(illuminance) {
          this.lastValue = illuminance / 10.0;
        }.bind(this)
      );

      this.al.setIlluminanceCallbackPeriod(this.updatePeriod);
    }
  };

  this.stop = function() {
    this.graph.stop();
    
    if(this.al !== null) {
      this.al.setIlluminanceCallbackPeriod(0);
    }
    $('#dashboard').empty();

    this.running = false;
  };
}
