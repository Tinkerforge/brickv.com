function DeviceInformation(uid, connectedUid, position, hardwareVersion, firmwareVersion, deviceIdentifier) {
  this.uid = uid;
  this.connectedUid = connectedUid;
  this.position = position;
  this.hardwareVersion = hardwareVersion;
  this.firmwareVersion = firmwareVersion;
  this.deviceIdentifier = deviceIdentifier;
}

function BrickViewer() {
  this.plugins = {};
  this.plugins[13] = new PluginBrickMaster();
  this.plugins[16] = new PluginBrickIMU();
  this.plugins[21] = new PluginBrickletAmbientLight();
  this.plugins[25] = new PluginBrickletDistanceIR();
  this.plugins[27] = new PluginBrickletHumidity();
  this.plugins[213] = new PluginBrickletLinearPoti();
  this.plugins[215] = new PluginBrickletRotaryPoti();
  this.plugins[216] = new PluginBrickletTemperature();
  this.plugins[217] = new PluginBrickletTemperatureIR();
  this.plugins[219] = new PluginBrickletAnalogIn();
  this.plugins[221] = new PluginBrickletBarometer();
  this.plugins[229] = new PluginBrickletDistanceUS();
  this.plugins[240] = new PluginBrickletHallEffect();
  this.plugins[10001] = new PluginOverview();
  this.plugins[10002] = new PluginAbout();
  this.plugins[10003] = new PluginLegalInfo();

  this.deviceList = {};
  this.deviceList['III_OVERVIEW'] = new DeviceInformation('III_OVERVIEW', 0, 0, 0, 0, 10001);
  this.deviceList['III_ABOUT'] = new DeviceInformation('III_ABOUT', 0, 0, 0, 0, 10002);
  this.deviceList['III_LEGAL_INFO'] = new DeviceInformation('III_LEGAL_INFO', 0, 0, 0, 0, 10003);

  this.HOST = null;
  this.PORT = null;
  this.KEY = null;
  this.ipcon = null;
  this.currentPlugin = this.plugins[10001];
  this.currentPlugin.setDeviceInformation(this.deviceList['III_OVERVIEW']);
  this.currentPlugin.start();
  
  this.disconnect = function() {
    this.ipcon.disconnect();
    
    for(var uid in this.deviceList) {
      if(this.deviceList.hasOwnProperty(uid) && uid.substring(0, 3) !== 'III') {
        if(brickViewer.deviceList[uid] !== undefined) {
          delete brickViewer.deviceList[uid];
          if(this.currentPlugin === undefined || this.currentPlugin.deviceInformation === undefined || this.currentPlugin.deviceInformation.uid === uid) {
            $('#brick-uid-III_OVERVIEW').click();
          }
        }
      }
    }
    
    this.updateMenu(this.deviceList);
    
    $('#brickv-connect').fadeOut(function() {
      $('#brickv-connect').unbind();
      $('#brickv-connect').click(this.connect.bind(this));
      $('#brickv-connect').text('Connect');
      $('#brickv-connect').fadeIn();
      $('#brickv-connect-info-form').fadeIn();
    }.bind(this));
  };

  this.connect = function() {
    $('#brickv-connect-info-form').fadeOut();
    $('#brickv-connect').fadeOut(function() {
      $('#brickv-connect').unbind();
      $('#brickv-connect').click(this.disconnect.bind(this));
      $('#brickv-connect').text('Disconnect from ' + $('#brickv-host').val() + ':' + $('#brickv-port').val());
      $('#brickv-connect').fadeIn();
    }.bind(this));
    
    this.HOST = $('#brickv-host').val();
    this.PORT = parseInt($('#brickv-port').val());
    this.ipcon = new Tinkerforge.IPConnection();
    this.ipcon.connect(this.HOST, this.PORT,
      function(error) {
        this.disconnect();
        var alert_msg = 'Connection Error ' + error + '.';
        var alert = '<div class="row col-xs-18 col-sm-12"><div class="col-sm-6 alert alert-error"><a href="#" class="close" data-dismiss="alert">&times;</a><strong>Error:</strong> ' + alert_msg + '</div></div></div>';
        $('div.main').prepend(alert);
      }.bind(this)
    );

    this.ipcon.on(Tinkerforge.IPConnection.CALLBACK_CONNECTED,
      function(connectReason) {
        brickViewer.ipcon.enumerate();
      }
    );

    this.ipcon.on(Tinkerforge.IPConnection.CALLBACK_ENUMERATE,
      function(uid, connectedUid, position, hardwareVersion, firmwareVersion, deviceIdentifier, enumerationType) {
        if(enumerationType === Tinkerforge.IPConnection.ENUMERATION_TYPE_DISCONNECTED) {
        	if(brickViewer.deviceList[uid] !== undefined) {
        		delete brickViewer.deviceList[uid];
        		if(this.currentPlugin === undefined || this.currentPlugin.deviceInformation === undefined || this.currentPlugin.deviceInformation.uid === uid) {
        			$('#brick-uid-III_OVERVIEW').click();
        		}
        	}
        } else {
          if(brickViewer.deviceList[uid] === undefined) {
            var deviceInformation = new DeviceInformation(uid, connectedUid, position, hardwareVersion, firmwareVersion, deviceIdentifier);
            brickViewer.deviceList[uid] = deviceInformation;
          }
        }
        brickViewer.updateMenu(brickViewer.deviceList);
      } 
    );
  };

  
  this.brickMenuClick = function(deviceInformation, ev) {
    if(this.currentPlugin !== undefined) {
      $('#brick-uid-' + this.currentPlugin.deviceInformation.uid).parent().removeClass('active');
      this.currentPlugin.stop();
    }

    if(this.plugins[deviceInformation.deviceIdentifier] === undefined) {
      this.plugins[deviceInformation.deviceIdentifier] = new PluginUnknown();
    }

    this.currentPlugin = this.plugins[deviceInformation.deviceIdentifier];
    $('#dashboard-header').text(this.currentPlugin.name);

    $('#brick-uid-' + deviceInformation.uid).parent().addClass('active');
    this.currentPlugin.setDeviceInformation(deviceInformation);
    this.currentPlugin.start();
  };

  this.updateMenu = function(deviceList) {
    var ul = $('#sidebar-bricks');
    ul.empty();

    for(var uid in this.deviceList) {
      if(this.deviceList.hasOwnProperty(uid) && uid.substring(0, 3) !== 'III') {
        var device = deviceList[uid];
        var li = $("<li>");
        var plugin = this.plugins[device.deviceIdentifier];

        var name;
        if(plugin === undefined) {
          name = 'Unknown (UID: ' + uid + ')';
        } else {
          name = plugin.name;
        }

        var a = $("<a>", {
          'text': name,
          'href': '#dashboard-header',
          'id': 'brick-uid-' + uid,
          'click': this.brickMenuClick.bind(this, device)
        });

        li.append(a);
        ul.append(li);
      }
    }
    
    if(this.plugins[10001] !== undefined) {
      this.plugins[10001].redraw();
    }
  };
  
  $("#brickv-host").popover({ 
    title: 'Host', 
    content: 'Enter the <b>IP or Hostname</b> of the Brick Daemon or Ethernet Extension you want to connect to.', 
    html: true, 
    placement: 'bottom',
    trigger: 'hover'
  });
  
  $("#brickv-port").popover({ 
    title: 'Port', 
    content: 'Enter the <b>WebSocket Port</b>. The default port is 4280.', 
    html: true, 
    placement: 'bottom',
    trigger: 'hover'
  });

  $('#brick-uid-III_OVERVIEW').click(this.brickMenuClick.bind(this, this.deviceList['III_OVERVIEW']));
  $('#brick-uid-III_ABOUT').click(this.brickMenuClick.bind(this, this.deviceList['III_ABOUT']));
  $('#brick-uid-III_LEGAL_INFO').click(this.brickMenuClick.bind(this, this.deviceList['III_LEGAL_INFO']));
  $('#brickv-connect').click(this.connect.bind(this));
  $('#dashboard-header').text(this.currentPlugin.name);
}

var brickViewer =  new BrickViewer();
