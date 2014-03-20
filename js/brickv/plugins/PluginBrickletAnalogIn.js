function PluginBrickletAnalogIn() {
  this.name = "Analog In Bricklet";
  this.deviceInformation = null; 
  this.running = false;
  this.updatePeriod = 50;
  this.maxPoints = 200;

  this.init = function() {
    this.ai = null;
    this.lastValue = 0;
    
    this.configs = Array();
    this.configs[0] = new BrickGraphConfig();
    this.configs[0].getValueFunc = this.getValue.bind(this);
    this.configs[0].name = 'Voltage';
    this.configs[0].unit = 'mV';
    this.configs[0].id = 'analog-in-bricklet';
    
    this.graph = new BrickGraph(this.updatePeriod, this.maxPoints, this.configs);
  };

  this.setDeviceInformation = function(deviceInformation) {
    this.deviceInformation = deviceInformation;
  };

  this.addDOMElements = function() {
    html = getDeviceInformationDOM(this.deviceInformation);
    $('#dashboard').append(html);
    
    this.graph.addDOMElements($('#dashboard'));
    
    htmlEdgeType = '<div class="col-xs-16 col-sm-4">Range: <select id="analog-in-bricklet-range" class="form-control">' +
      '<option value="0">Automatic</option>' +
      '<option value="5">0V - 3.30V</option>' +
      '<option value="1">0V - 6.05V</option>' +
      '<option value="2">0V - 10.32V</option>' +
      '<option value="3">0V - 36.30V</option>' +
      '<option value="4">0V - 45.00V</option>' +
      '</select></div>';
    $('#dashboard').append(htmlEdgeType);
    
    htmlAverage = '<div class="col-xs-16 col-sm-4">Average Length:<input class="col-md-8 form-control" type="text" id="analog-in-bricklet-averaging"/></div>';
    $('#dashboard').append(htmlAverage);
  };
  
  this.getValue = function() {
    return this.lastValue;
  };
  
  this.writeConfig = function() {
    var range = parseInt($("#analog-in-bricklet-range option:selected").val(), 10);
	  this.ai.setRange(range);
	
    var averaging = parseInt($('#analog-in-bricklet-averaging').val(), 10);
    if(value < 0 || value > 255) {
      return
    }
    
    this.ai.setAveraging(averaging);
  };

  this.start = function() {
    if(!this.running) {
      this.init();
      
      this.addDOMElements();
      this.running = true;
      
      $("#analog-in-bricklet-range").click(this.writeConfig.bind(this));
      $('#analog-in-bricklet-averaging').on('touchspin.on.stopupspin', this.writeConfig.bind(this));
      $('#analog-in-bricklet-averaging').on('touchspin.on.stopdownspin', this.writeConfig.bind(this));
      
      this.ai = new Tinkerforge.BrickletAnalogIn(this.deviceInformation.uid, brickViewer.ipcon);
      this.ai.getVoltage(function(voltage) {
        this.lastValue = voltage
        this.graph.start();
      }.bind(this));
      
      
       this.ai.getRange(function(range) {
        $('#analog-in-bricklet-range option').removeAttr('selected');
        $("#analog-in-bricklet-range option[value='" + range + "']").attr('selected', true);
        });
       this.ai.getAveraging(function(averaging) {
        $('#analog-in-bricklet-averaging').TouchSpin({
          min: 0,
          max: 255,
          stepinterval: 1,
          maxboostedstep: 5,
          initval: averaging,
          postfix: 'ms'
        });
      });
      
      this.ai.on(Tinkerforge.BrickletAnalogIn.CALLBACK_VOLTAGE,
        function(voltage) {
    		  this.lastValue = voltage
      }.bind(this));

      this.ai.setVoltageCallbackPeriod(this.updatePeriod);
    }
  };

  this.stop = function() {
    this.graph.stop();
    
    if(this.ai !== null) {
      this.ai.setVoltageCallbackPeriod(0);
    }
    $('#dashboard').empty();

    this.running = false;
  };
}
