function PluginBrickletTemperatureIR() {
  this.name = "Temperature IR Bricklet";
  this.deviceInformation = null; 
  this.running = false;
  this.updatePeriod = 50;
  this.maxPoints = 200;

  this.init = function() {
    this.temp = null;
    this.lastAmbientValue = 0;
    this.lastObjectValue = 0;
    
    this.configs = Array();
    this.configs[0] = new BrickGraphConfig();
    this.configs[0].getValueFunc = this.getObjectValue.bind(this);
    this.configs[0].name = 'Object Temperature';
    this.configs[0].unit = '°C';
    this.configs[0].id = 'object-temperature-ir-bricklet';
    
    this.configs[1] = new BrickGraphConfig();
    this.configs[1].getValueFunc = this.getAmbientValue.bind(this);
    this.configs[1].name = 'Ambient Temperature';
    this.configs[1].unit = '°C';
    this.configs[1].id = 'ambient-temperature-ir-bricklet';
    
    this.graph = new BrickGraph(this.updatePeriod, this.maxPoints, this.configs);
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
  
  this.getObjectValue = function () {
    return this.lastObjectValue;
  };
  
  this.getAmbientValue = function () {
    return this.lastAmbientValue;
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
          this.lastObjectValue = temperature / 10;
        }.bind(this)
      );
      
      this.temp.getAmbientTemperature(
        function(temperature) {
          this.lastAmbientValue = temperature / 10;
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
      	});
      });
      
      this.temp.on(Tinkerforge.BrickletTemperatureIR.CALLBACK_OBJECT_TEMPERATURE,
        function(temperature) {
          this.lastObjectValue = temperature / 10;
        }.bind(this)
      );
      
      this.temp.on(Tinkerforge.BrickletTemperatureIR.CALLBACK_AMBIENT_TEMPERATURE,
        function(temperature) {
          this.lastAmbientValue = temperature / 10;
        }.bind(this)
      );

      this.temp.setObjectTemperatureCallbackPeriod(this.updatePeriod);
      this.temp.setAmbientTemperatureCallbackPeriod(this.updatePeriod);
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
