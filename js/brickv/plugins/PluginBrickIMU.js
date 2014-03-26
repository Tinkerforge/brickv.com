function PluginBrickIMU() {
  this.name = "IMU Brick";
  this.running = false;
  this.updatePeriod = 50;
  this.maxPoints = 200;
  
  this.device = null; 
  this.object3D = null;
  this.scene = null;
  this.camera = null;
  this.renderer = null;
  this.lastX = 0;
  this.lastY = 0;
  this.lastZ = 0;
  this.lastW = 0;
  this.relX = 0;
  this.relY = 0;
  this.relZ = 0;
  this.relW = 0;
  this.lastM = null;

  this.setDeviceInformation = function(deviceInformation) {
    this.deviceInformation = deviceInformation;
  };

  this.init = function() {

  };

  this.addDOMElements = function() {
    html = getDeviceInformationDOM(this.deviceInformation);
    $('#dashboard').append(html);
    
    html = '<div class="col-xs-16 col-sm-8"><button id="brick-imu-save-orientation" type="button" class="btn btn-default">Save Orientation</button></div>' +
           '<div class="col-xs-16 col-sm-8">Position your IMU Brick as shown in the image below, then press "Save Orientation".</div>';
    $('#dashboard').append(html);
    
    html = '<div id="webgl" width="500" height="500"></div>';
    $('#dashboard').append(html);
  };
  
  this.threeInit = function() {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(500, 500);
    this.renderer.setClearColor(0xFFFFFF);
    $('#webgl').append(this.renderer.domElement);
    
    this.camera = new THREE.PerspectiveCamera(45, 1, 1, 10);
    this.camera.position.z = 2.5;

    this.scene = new THREE.Scene();
    this.object3D = new THREE.Object3D();

    // PCB
    var geometry = new THREE.BoxGeometry(1, 1, 0.1);
    var material = new THREE.MeshBasicMaterial({color: 0x000000});
    var mesh = new THREE.Mesh(geometry, material);
    this.object3D.add(mesh);
    
    // USB
    geometry = new THREE.BoxGeometry(0.2, 0.25, 0.1);
    material = new THREE.MeshBasicMaterial({color: 0x7F8294});
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = -0.4;
    mesh.position.z = 0.1;
    this.object3D.add(mesh);
    
    // Board to Board
    geometry = new THREE.BoxGeometry(0.13, 0.5, 0.15);
    material = new THREE.MeshBasicMaterial({color: 0xDDDDDD});
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = -0.375;
    mesh.position.z = 0.125;
    this.object3D.add(mesh);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = 0.375;
    mesh.position.z = 0.125;
    this.object3D.add(mesh);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = -0.375;
    mesh.position.z = -0.125;
    this.object3D.add(mesh);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = 0.375;
    mesh.position.z = -0.125;
    this.object3D.add(mesh);
    
    // Bricklet Port
    geometry = new THREE.BoxGeometry(0.325, 0.1, 0.05);
    material = new THREE.MeshBasicMaterial({color: 0xDDDDDD});
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = -0.2125;
    mesh.position.y = 0.45;
    mesh.position.z = -0.0675;
    this.object3D.add(mesh);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = 0.2125;
    mesh.position.y = 0.45;
    mesh.position.z = -0.0675;
    this.object3D.add(mesh);
    
    // Dimension Arrows
    arrow1 = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 1, 0xFF0000, 0.1, 0.05);
    arrow1.position.set(-0.6, -0.6, 0);
    arrow2 = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 1, 0x00FF000, 0.1, 0.05);
    arrow2.position.set(-0.6, -0.6, 0);
    arrow3 = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 0.2, 0x0000FF, 0.1, 0.05);
    arrow3.position.set(-0.6, -0.6, 0);
    this.object3D.add(arrow1);
    this.object3D.add(arrow2);
    this.object3D.add(arrow3);
    
    this.scene.add(this.object3D);
  };
  
  this.threeAnimate = function() {
    requestAnimationFrame(this.threeAnimate.bind(this));
    
    if(this.lastM !== null) {
      this.object3D.rotation.setFromRotationMatrix(this.lastM);
    }
    
    this.renderer.render(this.scene, this.camera);
  };
  
  this.quaternionToMatrix = function(x, y, z, w) {
    x = -x;
    y = -y;
    z = -z;
    
    var wn = w * this.relW - x * this.relX - y * this.relY - z * this.relZ;
    var xn = w * this.relX + x * this.relW + y * this.relZ - z * this.relY;
    var yn = w * this.relY - x * this.relZ + y * this.relW + z * this.relX;
    var zn = w * this.relZ + x * this.relY - y * this.relX + z * this.relW;

    x = xn;
    y = yn;
    z = zn;
    w = wn;
    
    var xx = x * x;
    var yy = y * y;
    var zz = z * z;
    var xy = x * y;
    var xz = x * z;
    var yz = y * z;
    var wx = w * x;
    var wy = w * y;
    var wz = w * z;
    
    var m = new THREE.Matrix4();
    m.set(1.0 - 2.0*(yy + zz), 2.0*(xy - wz), 2.0*(xz + wy), 0.0,
          2.0*(xy + wz), 1.0 - 2.0*(xx + zz), 2.0*(yz - wx), 0.0,
          2.0*(xz - wy), 2.0*(yz + wx), 1.0 - 2.0*(xx + yy), 0.0,
          0.0, 0.0, 0.0, 1.0);

    this.lastM = new THREE.Matrix4().getInverse(m);
  };

  this.start = function() {
    if(!this.running) {
      this.init();
      this.running = true;
      this.addDOMElements();
      
      this.threeInit();
      this.threeAnimate();
      
      $('#brick-imu-save-orientation').click(function() {
        console.log("XXX");
        this.relX = this.lastX;
        this.relY = this.lastY;
        this.relZ = this.lastZ;
        this.relW = this.lastW;
      }.bind(this));
      
      
      this.imu = new Tinkerforge.BrickIMU(this.deviceInformation.uid, brickViewer.ipcon);
      this.imu.getQuaternion(
        function(x, y, z, w) {
          this.lastX = x;
          this.lastY = y;
          this.lastZ = z;
          this.lastW = w;
        }.bind(this)
      );
      
      this.imu.on(Tinkerforge.BrickIMU.CALLBACK_QUATERNION,
        function(x, y, z, w) {
          this.lastX = x;
          this.lastY = y;
          this.lastZ = z;
          this.lastW = w;
          this.quaternionToMatrix(x, y, z, w);
        }.bind(this)
      );

      this.imu.setQuaternionPeriod(this.updatePeriod);
    }
  };

  this.stop = function() {
    this.relX = 0.0;
    this.relY = 0.0;
    this.relZ = 0.0;
    this.relW = 0.0;
    
    if(this.imu !== null) {
      this.imu.setQuaternionPeriod(0);
    }
    
    $('#dashboard').empty();
    this.running = false;
  };
}
