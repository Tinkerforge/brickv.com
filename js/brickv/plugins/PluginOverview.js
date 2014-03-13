function PluginOverview() {
  this.name = "Overview";
  this.running = false;
  this.device = null; 

  this.setDeviceInformation = function(deviceInformation) {
    this.deviceInformation = deviceInformation;
  };

  this.init = function() {

  };
  
  this.redraw = function() {
    var tbody = $('#brickviewer-overview-tbody');
    tbody.empty();
    if(brickViewer === undefined) {
      return;
    }
    
    var i = 1;

    for(var uid in brickViewer.deviceList) {
      if(brickViewer.deviceList.hasOwnProperty(uid) && uid.substring(0, 3) !== 'III') {
        var device = brickViewer.deviceList[uid];
        var plugin = brickViewer.plugins[device.deviceIdentifier];
        
        var tr = $("<tr>");

        var name;
        if(plugin === undefined) {
          name = 'Unknown (UID: ' + uid + ')';
        } else {
          name = plugin.name;
        }
        
        fw = device.firmwareVersion[0] + '.' + device.firmwareVersion[1] + '.' + device.firmwareVersion[2];
        
        tr.append($("<td>").append(i));
        tr.append($("<td>").append(name));
        tr.append($("<td>").append(uid));
        tr.append($("<td>").append(fw));

        tbody.append(tr);
        
        i++;
      }
    }
  };

  this.addDOMElements = function() {
    html = '<div class="row col-xs-18 col-sm-12"><div class="col-xs-18 col-sm-8">' +
            '<div class="table">' +
             '<table class="table table-striped table-hover">' +
               '<thead>' +
                 '<tr>' +
                   '<th>#</th>' +
                   '<th>Name</th>' +
                   '<th>UID</th>' +
                   '<th>FW Version</th>' +
                 '</tr>' +
               '</thead>' +
               '<tbody id="brickviewer-overview-tbody">' +
               '</tbody>' +
             '</table>' +
           '</div>' +
           '</div></div>';
    $('#dashboard').append(html);
  };

  this.start = function() {
    if(!this.running) {
      this.init();
      this.running = true;
      this.addDOMElements();
      this.redraw();
    }
  };

  this.stop = function() {
    $('#dashboard').empty();
    this.running = false;
  };
}
