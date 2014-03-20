function BrickGraphConfig() {
  this.getValueFunc = undefined;
  this.name = '';
  this.unit = '';
  this.id = '';
}

function BrickGraph(updatePeriod, maxPoints, configs) {
  this.updatePeriod = updatePeriod;
  this.maxPoints = maxPoints;
  
  this.plotData = Array();
  for(var i = 0; i < configs.length; i++) {
    this.plotData[i] = [];
  }
  
  this.increment = Array();
  for(var i = 0; i < configs.length; i++) {
    this.increment[i] = 0;
  }
  
  this.configs = configs;
  
  this.plot = null;
  this.timeout = null;
  
  this.start = function() {
    this.plot = $.plot($("#" + this.configs[0].id + '-graph'), [this.plotData], {
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
    html = '';
    for(var i = 0; i < this.configs.length; i++) {
      html += '<div class="col-xs-18 col-sm-12"><h3>' + this.configs[i].name + ': <b id="' + this.configs[i].id + '-value"></b> ' + this.configs[i].unit + '</h3></div>';
    }
    html += '<div class="col-xs-18 col-sm-12"><div id="' + this.configs[0].id + '-graph" style="min-width:200px; height:200px; max-width:800px; width:100%; display: block;"></div></div>';
    dashboard.append(html);
  };
  
  this.graphUpdate = function() {
    for(var i = 0; i < this.configs.length; i++) {
      value = this.configs[i].getValueFunc();
      if(value !== null) {
        divValue = $('#' + this.configs[i].id + '-value');
        divValue.text(value);
        
        this.increment[i]++;
       
        this.plotData[i].push([this.increment[i], value]);
        if(this.plotData[i].length > this.maxPoints) {
          this.plotData[i] = this.plotData[i].slice(1);
        }
      }
    }
    
    var plotDatas = [];
    for(var i = 0; i < this.plotData.length; i++) {
      plotDatas[i] = {data: this.plotData[i], label: this.configs[i].name};
    }
    
    this.plot.setData(plotDatas);
    this.plot.setupGrid();
    this.plot.draw();
    
    this.timeout = setTimeout(this.graphUpdate.bind(this), this.updatePeriod);
  };
}