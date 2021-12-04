import React from 'react';
import ParticleField from 'react-particles-webgl';

/**
 * The default configuation for the ParticleField component
 *
 * Any option passed in via props will overwrite the default config
 */
var resizeReload = function(){
  window.location.reload();
}
throttle(resizeReload, 500);

// window.addEventListener('resize', resizeReload);





// config for desktop
if (window.innerWidth > 1700) {
  var config = {
    showCube: false,
    dimension: '3D',
    velocity: 0.3,
    boundaryType: 'bounce',
    antialias: true,
    direction: {
      xMin: -1,
      xMax: 1,
      yMin: -0.5,
      yMax: 0.5,
      zMin: -1,
      zMax: 1
    },
    lines: {
      colorMode: 'solid',
      color: '#ffffff',
      transparency: 0.999,
      limitConnections: true,
      maxConnections: 10,
      minDistance: 90,
      visible: true
    },
    particles: {
      colorMode: 'solid',
      color: '#ffffff',
      transparency: 1,
      shape: 'circle',
      boundingBox: 'canvas',
      count: 500,
      minSize: 18,
      maxSize: 22,
      visible: true
    },
    cameraControls: {
      enabled: true,
      enableDamping: true,
      dampingFactor: 0.01,
      enableZoom: true,
      zoomSpeed: 0.5,
      smoothZoom: true,
      minDistance: 1000,
      maxDistance: 2000,
      // minPolarAngle: Math.PI/3,
      // maxPolarAngle: Math.PI/1.5,
      enablePan: false,
      rotateSpeed: 0.75,
      autoRotate: true,
      autoRotateSpeed: -0.5,
      resetCameraFlag: true
    }
  }
}
else if (window.innerWidth >= 1366) {
  var config = {
    showCube: false,
    dimension: '3D',
    velocity: 0.3,
    boundaryType: 'bounce',
    antialias: true,
    direction: {
      xMin: -1,
      xMax: 1,
      yMin: -0.5,
      yMax: 0.5,
      zMin: -1,
      zMax: 1
    },
    lines: {
      colorMode: 'solid',
      color: '#ffffff',
      transparency: 0.999,
      limitConnections: true,
      maxConnections: 10,
      minDistance: 80,
      visible: true
    },
    particles: {
      colorMode: 'solid',
      color: '#ffffff',
      transparency: 1,
      shape: 'circle',
      boundingBox: 'canvas',
      count: 500,
      minSize: 18,
      maxSize: 20,
      visible: true
    },
    cameraControls: {
      enabled: true,
      enableDamping: true,
      dampingFactor: 0.01,
      enableZoom: true,
      zoomSpeed: 0.5,
      smoothZoom: true,
      minDistance: 1000,
      maxDistance: 2000,
      // minPolarAngle: Math.PI/3,
      // maxPolarAngle: Math.PI/1.5,
      enablePan: false,
      rotateSpeed: 0.75,
      autoRotate: true,
      autoRotateSpeed: -0.5,
      resetCameraFlag: true
    }
  }
}
else if (window.innerWidth >= 1024) {
  var config = {
    showCube: false,
    dimension: '3D',
    velocity: 0.3,
    boundaryType: 'bounce',
    antialias: true,
    direction: {
      xMin: -1,
      xMax: 1,
      yMin: -0.5,
      yMax: 0.5,
      zMin: -1,
      zMax: 1
    },
    lines: {
      colorMode: 'solid',
      color: '#ffffff',
      transparency: 0.999,
      limitConnections: true,
      maxConnections: 10,
      minDistance: 70,
      visible: true
    },
    particles: {
      colorMode: 'solid',
      color: '#ffffff',
      transparency: 1,
      shape: 'circle',
      boundingBox: 'canvas',
      count: 500,
      minSize: 18,
      maxSize: 20,
      visible: true
    },
    cameraControls: {
      enabled: true,
      enableDamping: true,
      dampingFactor: 0.01,
      enableZoom: true,
      zoomSpeed: 0.5,
      smoothZoom: true,
      minDistance: 1000,
      maxDistance: 2000,
      // minPolarAngle: Math.PI/3,
      // maxPolarAngle: Math.PI/1.5,
      enablePan: false,
      rotateSpeed: 0.75,
      autoRotate: true,
      autoRotateSpeed: -0.5,
      resetCameraFlag: true
    }
  }
}
else if (window.innerWidth >= 768) {
  var config = {
    showCube: false,
    dimension: '3D',
    velocity: 0.3,
    boundaryType: 'bounce',
    antialias: true,
    direction: {
      xMin: -1,
      xMax: 1,
      yMin: -0.5,
      yMax: 0.5,
      zMin: -1,
      zMax: 1
    },
    lines: {
      colorMode: 'solid',
      color: '#ffffff',
      transparency: 0.999,
      limitConnections: true,
      maxConnections: 10,
      minDistance: 80,
      visible: true
    },
    particles: {
      colorMode: 'solid',
      color: '#ffffff',
      transparency: 1,
      shape: 'circle',
      boundingBox: 'canvas',
      count: 400,
      minSize: 12,
      maxSize: 18,
      visible: true
    },
    cameraControls: {
      enabled: true,
      enableDamping: true,
      dampingFactor: 0.01,
      enableZoom: true,
      zoomSpeed: 0.5,
      smoothZoom: true,
      minDistance: 1000,
      maxDistance: 2000,
      // minPolarAngle: Math.PI/3,
      // maxPolarAngle: Math.PI/1.5,
      enablePan: false,
      rotateSpeed: 0.75,
      autoRotate: true,
      autoRotateSpeed: -0.5,
      resetCameraFlag: true
    }
  }
} 
else {
  var config = {
    showCube: false,
    dimension: '3D',
    velocity: 0.3,
    boundaryType: 'bounce',
    antialias: true,
    direction: {
      xMin: -1,
      xMax: 1,
      yMin: -0.5,
      yMax: 0.5,
      zMin: -1,
      zMax: 1
    },
    lines: {
      colorMode: 'solid',
      color: '#fffff',
      transparency: 0.999,
      limitConnections: true,
      maxConnections: 10,
      minDistance: 50,
      visible: true
    },
    particles: {
      colorMode: 'solid',
      color: '#fffff',
      transparency: 1,
      shape: 'circle',
      boundingBox: 'canvas',
      count: 350,
      minSize: 10,
      maxSize: 15,
      visible: true
    },
    cameraControls: {
      enabled: true,
      enableDamping: true,
      dampingFactor: 0.01,
      enableZoom: true,
      zoomSpeed: 0.5,
      smoothZoom: true,
      minDistance: 1000,
      maxDistance: 2000,
      minPolarAngle: Math.PI/3,
      maxPolarAngle: Math.PI/1.5,
      enablePan: false,
      rotateSpeed: 1.5,
      autoRotate: true,
      autoRotateSpeed: -0.5,
      resetCameraFlag: true
    }
  }
}


function throttle(func, time) {
  var permision = true;
  var saveArg = null;
  var saveThis = null;
  return function waper(x){
    if (permision){
      func.call(this, x);//тут можна замінити на .apply(this,arguments)
      permision = false;
      setTimeout(function(){
        permision = true;
        if(saveThis){
          waper.apply(saveThis,saveArg);
          saveArg = saveThis = null;
        }
      }, time);
    }else{
      saveArg = arguments;
      saveThis = this;
    }
  }
}


export default () => <ParticleField config={config} />;