function PluginBrickletTemperatureIR() {
  this.name = "Temperature IR Bricklet";
  this.deviceInformation = null; 
  this.running = false;
  this.updatePeriod = 50;
  this.maxPoints = 200;

  this.init = function() {
    this.temp = null;
    this.lastValue = 0;
    this.graph = new BrickGraph(this.updatePeriod, this.maxPoints, this.getValue.bind(this), 'Object Temperature', '°C', 'temperature-ir-bricklet');
  };

  this.setDeviceInformation = function(deviceInformation) {
    this.deviceInformation = deviceInformation;
  };

  this.addDOMElements = function() {
    html = getDeviceInformationDOM(this.deviceInformation);
    $('#dashboard').append(html);
    
    this.graph.addDOMElements($('#dashboard'));
	
	htmlEmissivity = '<div class="col-xs-16 col-sm-4">Emissivity:<input class="col-md-8 form-control" type="text" id="temperature-irbricklet-emissivity"/></div>';
    $('#dashboard').append(htmlEmissivity);
  };
  
  this.getValue = function () {
    return this.lastValue;
  };

  this.writeConfig = function() {
    var emissivity = parseInt($('#temperature-irbricklet-emissivity').val(), 10);
    if(emissivity < 6553 || emissivity > 65535) {
      return
    }
    this.temp.setEmissivity(emissivity);
  };
  
  this.start = function() {
    if(!this.running) {
      this.init();
      
      this.addDOMElements();
      this.running = true;
	  
	  $('#temperature-irbricklet-emissivity').on('touchspin.on.stopupspin', this.writeConfig.bind(this));
      $('#temperature-irbricklet-emissivity').on('touchspin.on.stopdownspin', this.writeConfig.bind(this));

      this.temp = new Tinkerforge.BrickletTemperatureIR(this.deviceInformation.uid, brickViewer.ipcon);
      this.temp.getObjectTemperature(
        function(temperature) {
          this.lastValueObject = temperature / 10;
          this.graph.start();
        }.bind(this)
      );
	  
	  this.temp.getEmissivity(function(emissivity) {
        $('#temperature-irbricklet-emissivity').TouchSpin({
          min: 6553,
          max: 65535,
          stepinterval: 1,
          maxboostedstep: 100,
          initval: emissivity,
		})
      });
      
      this.temp.on(Tinkerforge.BrickletTemperatureIR.CALLBACK_OBJECT_TEMPERATURE,
        function(temperature) {
          this.lastValue = temperature / 10;
        }.bind(this)
      );

      this.temp.setObjectTemperatureCallbackPeriod(this.updatePeriod);
    }
  };

  this.stop = function() {
    this.graph.stop();
    
    if(this.temp !== null) {
      this.temp.setObjectTemperatureCallbackPeriod(0);
    }
    $('#dashboard').empty();

    this.running = false;
  };
}
