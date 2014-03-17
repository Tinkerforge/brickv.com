function PluginBrickletRotaryPoti() {
  this.name = "Rotary Poti Bricklet";
  this.deviceInformation = null; 
  this.running = false;
  this.updatePeriod = 50;
  this.maxPoints = 200;

  this.init = function() {
    this.poti = null;
    this.lastValue = 0;
    this.graph = new BrickGraph(this.updatePeriod, this.maxPoints, this.getValue.bind(this), 'Position', '', 'rotary-poti-bricklet');
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

      this.poti = new Tinkerforge.BrickletRotaryPoti(this.deviceInformation.uid, brickViewer.ipcon);
      this.poti.getPosition(
        function(position) {
          this.lastValue = position;
          this.graph.start();
        }.bind(this)
      );
      
      this.poti.on(Tinkerforge.BrickletRotaryPoti.CALLBACK_POSITION,
        function(position) {
          this.lastValue = position;
        }.bind(this)
      );

      this.poti.setPositionCallbackPeriod(this.updatePeriod);
    }
  };

  this.stop = function() {
    this.graph.stop();
    
    if(this.poti !== null) {
      this.poti.setPositionCallbackPeriod(0);
    }
    $('#dashboard').empty();

    this.running = false;
  };
}
