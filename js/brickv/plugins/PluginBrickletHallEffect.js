function PluginBrickletHallEffect() {
  this.name = "Hall Effect Bricklet";
  this.deviceInformation = null; 
  this.running = false;
  this.updatePeriod = 50;
  this.maxPoints = 200;

  this.init = function() {
    this.he = null;
    this.lastValue = 0;
    this.graph = new BrickGraph(this.updatePeriod, this.maxPoints, this.getValue.bind(this), 'Value', ' ', 'hall-effect-bricklet');
  };

  this.setDeviceInformation = function(deviceInformation) {
    this.deviceInformation = deviceInformation;
  };

  this.addDOMElements = function() {
    html = getDeviceInformationDOM(this.deviceInformation);
    $('#dashboard').append(html);
    
    this.graph.addDOMElements($('#dashboard'));
    
    htmlEdgeCount = '<div class="col-xs-16 col-sm-12"><h3>Edge Count: <b id="hall-effect-bricklet-edge-count"></b></h3></div>'; 
    $('#dashboard').append(htmlEdgeCount);
    
    htmlEdgeType = '<div class="col-xs-8 col-sm-4">Edge detection type: <select id="hall-effect-bricklet-edge-type" class="form-control">' +
      '<option value="0">Rising Edge</option>' +
      '<option value="1">Falling Edge</option>' +
      '<option value="2">Both</option>' +
      '</select></div>';
    $('#dashboard').append(htmlEdgeType);
    
    htmlDebounce = '<div class="col-xs-8 col-sm-4">Debounce:<input class="col-md-8 form-control" type="text" id="hall-effect-bricklet-debounce"/></div>';
    $('#dashboard').append(htmlDebounce);
  };
  
  this.getValue = function() {
    return this.lastValue;
  };
  
  this.writeConfig = function() {
    var edgeTypeValue = parseInt($("#hall-effect-bricklet-edge-type option:selected").val(), 10);
    if(edgeTypeValue !== 0 && edgeTypeValue !== 1 && edgeTypeValue !== 2) {
      return;
    }
    
    var debounce = parseInt($('#hall-effect-bricklet-debounce').val(), 10);
    if(value < 0 || value > 255) {
      return
    }
    
    this.he.setEdgeCountConfig(edgeTypeValue, debounce);
  };

  this.start = function() {
    if(!this.running) {
      this.init();
      
      this.addDOMElements();
      this.running = true;
      
      $("#hall-effect-bricklet-edge-type").click(this.writeConfig.bind(this));
      $('#hall-effect-bricklet-debounce').on('touchspin.on.stopupspin', this.writeConfig.bind(this));
      $('#hall-effect-bricklet-debounce').on('touchspin.on.stopdownspin', this.writeConfig.bind(this));
      
      this.he = new Tinkerforge.BrickletHallEffect(this.deviceInformation.uid, brickViewer.ipcon);
      this.he.getValue(function(value) {
        if (value === true) {
  		    this.lastValue = 1;
  		  } else {
  		    this.lastValue = 0;
  		  }
        this.graph.start();
      }.bind(this));
      
      this.he.getEdgeCount(false, function(edgeCount) {
        $('#hall-effect-bricklet-edge-count').text(edgeCount);
      });
      
      this.he.getEdgeCountConfig(function(edgeType, debounce) {
        $('#hall-effect-bricklet-edge-type option').removeAttr('selected');
        switch(edgeType) {
          case Tinkerforge.BrickletHallEffect.EDGE_TYPE_RISING:
            $("#hall-effect-bricklet-edge-type option[value='0']").attr('selected', true);
            break;
          case Tinkerforge.BrickletHallEffect.EDGE_TYPE_FALLING:
            $("#hall-effect-bricklet-edge-type option[value='1']").attr('selected', true);
            break;
          case Tinkerforge.BrickletHallEffect.EDGE_TYPE_BOTH:
            $("#hall-effect-bricklet-edge-type option[value='2']").attr('selected', true);
            break;
        }
        
        $('#hall-effect-bricklet-debounce').TouchSpin({
          min: 0,
          max: 255,
          stepinterval: 1,
          maxboostedstep: 5,
          initval: debounce,
          postfix: 'ms'
        });
      });
      
      this.he.on(Tinkerforge.BrickletHallEffect.CALLBACK_EDGE_COUNT,
        function(edgeCount, value) {
    		  if (value === true) {
    		    this.lastValue = 1;
    		  } else {
    		    this.lastValue = 0;
    		  }
        $('#hall-effect-bricklet-edge-count').text(edgeCount);
      }.bind(this));

      this.he.setEdgeCountCallbackPeriod(this.updatePeriod);
    }
  };

  this.stop = function() {
    this.graph.stop();
    
    if(this.he !== null) {
      this.he.setEdgeCountCallbackPeriod(0);
    }
    $('#dashboard').empty();

    this.running = false;
  };
}
