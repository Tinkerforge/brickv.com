function PluginUnknown() {
  this.name = "Unknown Brick or Bricklet";
  this.running = false;
  this.device = null; 

  this.setDeviceInformation = function(deviceInformation) {
    this.deviceInformation = deviceInformation;
  };

  this.init = function() {

  };

  this.addDOMElements = function() {
    html = getDeviceInformationDOM(this.deviceInformation);
    $('#dashboard').append(html);
  };

  this.start = function() {
    if(!this.running) {
      this.init();
      this.running = true;
      this.addDOMElements();
    }
  };

  this.stop = function() {
    $('#dashboard').empty();
    this.running = false;
  };
}
