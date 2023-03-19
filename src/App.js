import './App.css';
//import {Map, InfoWindow, Marker, GoogleApiWrapper} from 'google-maps-react';
import { Component } from 'react';
import html2canvas from 'html2canvas';
import { useEffect, useRef } from "react";
import { Engine, Scene, baby } from "@babylonjs/core";
import * as BABYLON from "@babylonjs/core"



function App() {

  async function screenshot() {
    console.log("called");
    const iframe = document.getElementById('iframe');
    const screen = iframe.contentDocument?.body;
    console.log(screen, iframe);

    const mapPic = await html2canvas(iframe)
      .then((canvas) => {
        const base64image = canvas.toDataURL('image/png');
        console.log("calles in", base64image)
        return base64image;
        // Do something with the image
      });
    console.log(mapPic);
    run(mapPic);
  }

  var canvas = document.getElementById("renderCanvas");

  var startRenderLoop = function (engine, canvas) {
    engine.runRenderLoop(function () {
      if (sceneToRender && sceneToRender.activeCamera) {
        sceneToRender.render();
      }
    });
  }

  var engine = null;
  var scene = null;
  var sceneToRender = null;
  var createDefaultEngine = function () { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, disableWebGL2Support: false }); };
  var createScene = function () {
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(.5, .5, .5);

    // camera
    var camera = new BABYLON.ArcRotateCamera("camera1", -Math.PI / 2, Math.PI / 2.2, 5, new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);

    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, -1, 0), scene);
    light1.intensity = 0.5;

    var pl = new BABYLON.PointLight("pl", BABYLON.Vector3.Zero(), scene);
    pl.intensity = 0.5;

    var mat = new BABYLON.StandardMaterial("mat", scene);
    var texture = new BABYLON.Texture("https://th.bing.com/th/id/OIP.y0Cpdd-GE9Rod7pkWBrA0QHaEo?w=255&h=180&c=7&r=0&o=5&dpr=1.8&pid=1.7", scene);
    mat.diffuseTexture = texture;

    var columns = 6;  // 6 columns
    var rows = 1;  // 1 row

    //alien sprite
    var faceUV = new Array(6);

    //set all faces to same
    for (var i = 0; i < 6; i++) {
      faceUV[i] = new BABYLON.Vector4(i / columns, 0, (i + 1) / columns, 1 / rows);
    }
    //wrap set
    var options = {
      faceUV: faceUV,
      wrap: true
    };


    var box = BABYLON.MeshBuilder.CreateBox('box', options, scene);
    box.material = mat;

    //box.parent = 
    showAxis(1);


    // show axis
    function showAxis(size) {
      var makeTextPlane = function (text, color, size) {
        var dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 50, scene, true);
        dynamicTexture.hasAlpha = true;
        dynamicTexture.drawText(text, 5, 40, "bold 36px Arial", color, "transparent", true);
        var plane = new BABYLON.Mesh.CreatePlane("TextPlane", size, scene, true);
        plane.material = new BABYLON.StandardMaterial("TextPlaneMaterial", scene);
        plane.material.backFaceCulling = false;
        plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
        plane.material.diffuseTexture = dynamicTexture;
        return plane;
      };

      var axisX = BABYLON.Mesh.CreateLines("axisX", [
        new BABYLON.Vector3.Zero(), new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
        new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
      ], scene);
      axisX.color = new BABYLON.Color3(1, 0, 0);
      var xChar = makeTextPlane("X", "red", size / 10);
      xChar.position = new BABYLON.Vector3(0.9 * size, -0.05 * size, 0);
      var axisY = BABYLON.Mesh.CreateLines("axisY", [
        new BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(-0.05 * size, size * 0.95, 0),
        new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(0.05 * size, size * 0.95, 0)
      ], scene);
      axisY.color = new BABYLON.Color3(0, 1, 0);
      var yChar = makeTextPlane("Y", "green", size / 10);
      yChar.position = new BABYLON.Vector3(0, 0.9 * size, -0.05 * size);
      var axisZ = BABYLON.Mesh.CreateLines("axisZ", [
        new BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, -0.05 * size, size * 0.95),
        new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, 0.05 * size, size * 0.95)
      ], scene);
      axisZ.color = new BABYLON.Color3(0, 0, 1);
      var zChar = makeTextPlane("Z", "blue", size / 10);
      zChar.position = new BABYLON.Vector3(0, 0.05 * size, 0.9 * size);

    };

    return scene;
  };
  var run = async function (mapPic) {


    var asyncEngineCreation =  function () {
      try {
        return createDefaultEngine();
      } catch (e) {
        console.log("the available createEngine function failed. Creating the default engine instead");
        return createDefaultEngine();
      }
    }

    window.engine =  asyncEngineCreation();
    if (!engine) throw 'engine should not be null.';
    startRenderLoop(engine, canvas);
    sceneToRender = scene
    window.scene = createScene(mapPic);
  }; 
 // Resize
  window.addEventListener("resize", function () {
    engine.resize();
  });

  return (
    <div>
      <iframe id='iframe' src="https://maps.google.com/maps?q=Tangesir%20Dates%20Products&amp;t=&amp;z=13&amp;ie=UTF8&amp;iwloc=&amp;output=embed" ></iframe>
      <button onClick={screenshot}>click to create</button>
      <canvas id="renderCanvas" width="500px" height="500px" background='blue'></canvas>
    </div>
  );

}
export default App;
// export default GoogleApiWrapper({
//   apiKey: ('AlzaSyCZQdWZWsNyakL30EbvVherjO4c9HcqFc8')
// })(MapContainer)
