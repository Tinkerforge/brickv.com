function BrickGraph(updatePeriod, maxPoints, getValueFunc, name, unit, id) {
  this.plotData = [];
  this.increment = 0;
  this.updatePeriod = updatePeriod;
  this.maxPoints = maxPoints;
  this.getValueFunc = getValueFunc;
  this.name = name;
  this.unit = unit;
  this.id = id;
  
  this.plot = null;
  this.timeout = null;
  
  this.start = function() {
    this.plot = $.plot($("#" + id + '-graph'), [this.plotData], {
      xaxis: {show: false}
    });

    this.graphUpdate();
  };
  
  this.stop = function() {
    if(this.timeout != null) {
      clearTimeout(this.timeout);
    }
  };
  
  this.addDOMElements = function(dashboard) {
    html = '<div class="col-xs-18 col-sm-12"><h3>' + this.name + ': <b id="' + id + '-value"></b> ' + this.unit + '</h3></div>' + 
           '<div class="col-xs-18 col-sm-12"><div id="' + id + '-graph" style="min-width:200px; height:200px; max-width:800px; width:100%; display: block;"></div></div>';
    dashboard.append(html);
  };
  
  this.graphUpdate = function() {
    value = this.getValueFunc();
    if(value !== null) {
      divValue = $('#' + this.id + '-value');
      divValue.text(value);
      
      this.increment++;
     
      this.plotData.push([this.increment, value]);
      if(this.plotData.length > this.maxPoints) {
        this.plotData = this.plotData.slice(1);
      }

      this.plot.setData([{data: this.plotData, label: this.name}]);
      this.plot.setupGrid();
      this.plot.draw();
    }

    this.timeout = setTimeout(this.graphUpdate.bind(this), this.updatePeriod);
  };
}