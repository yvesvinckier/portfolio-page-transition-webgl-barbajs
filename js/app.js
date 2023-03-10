import * as THREE from "three";
import ASScroll from "@ashthornton/asscroll";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import fragment from "./shaders/fragment.glsl";
import vertex from "./shaders/vertex.glsl";
import * as dat from "dat.gui";
import gsap from "gsap";
// import barba from "@barba/core";

import testTexture from "../img/texture.jpg";

export default class Sketch {
  constructor(options) {
    this.container = options.domElement;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;

    this.camera = new THREE.PerspectiveCamera(
      30,
      this.width / this.height,
      10,
      1000
    );
    this.camera.position.z = 600;

    // * 180/Math.PI is to convert radians to degrees
    // set the fov so the plane fits the size of the plane (350)
    this.camera.fov = (2 * Math.atan(this.height / 2 / 600) * 180) / Math.PI;

    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.container.appendChild(this.renderer.domElement);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.materials = [];

    this.asscroll = new ASScroll({
      disableRaf: true,
    });

    this.asscroll.enable({
      horizontalScroll: true,
    });

    this.time = 0;
    // this.setupSettings();
    this.addObjects();
    this.resize();
    this.render();
    this.setupResize();
  }

  setupSettings() {
    this.settings = {
      progress: 0,
    };
    this.gui = new dat.GUI();
    // want the progress to be between 0 and 1 with a step of 0.001
    this.gui.add(this.settings, "progress", 0, 1, 0.001);
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.camera.fov = (2 * Math.atan(this.height / 2 / 600) * 180) / Math.PI;

    this.materials.forEach((m) => {
      m.uniforms.uResolution.value.x = this.width;
      m.uniforms.uResolution.value.y = this.height;
    });

    this.imageStore.forEach((i) => {
      let bounds = i.img.getBoundingClientRect();
      i.mesh.scale.set(bounds.width, bounds.height, 1);
      i.top = bounds.top;
      i.left = bounds.left + this.asscroll.currentPos;
      i.width = bounds.width;
      i.height = bounds.height;

      i.mesh.material.uniforms.uQuadSize.value.x = bounds.width;
      i.mesh.material.uniforms.uQuadSize.value.y = bounds.height;

      i.mesh.material.uniforms.uTextureSize.value.x = bounds.width;
      i.mesh.material.uniforms.uTextureSize.value.y = bounds.height;
    });
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  addObjects() {
    // 350 is the size of the plane 100 is the number of segments
    this.geometry = new THREE.PlaneBufferGeometry(1, 1, 100, 100);
    // console.log(this.geometry);
    this.material = new THREE.ShaderMaterial({
      // wireframe: true,
      uniforms: {
        time: { value: 1.0 },
        uProgress: { value: 0 },
        uTexture: { value: new THREE.TextureLoader().load(testTexture) },
        // the size of the texture : 100x100 because it's a square
        uTextureSize: { value: new THREE.Vector2(100, 100) },
        // starter point of the corners animation
        uCorners: { value: new THREE.Vector4(0, 0, 0, 0) },
        // the width and the height of the screen => the final size of the plane
        uResolution: { value: new THREE.Vector2(this.width, this.height) },
        // the starter size of the plane
        uQuadSize: { value: new THREE.Vector2(300, 300) },
      },
      vertexShader: vertex,
      fragmentShader: fragment,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.scale.set(300, 300, 1);
    // this.scene.add( this.mesh );
    this.mesh.position.x = 300;

    // select all the images and put them in an array
    this.images = [...document.querySelectorAll(".js-image")];

    this.imageStore = this.images.map((img) => {
      let bounds = img.getBoundingClientRect();
      // clone the default material
      let m = this.material.clone();
      // add the new material to the array
      this.materials.push(m);
      let texture = new THREE.Texture(img);
      texture.needsUpdate = true;

      m.uniforms.uTexture.value = texture;

      img.addEventListener("mouseover", () => {
        this.tl = gsap
          .timeline()
          .to(m.uniforms.uCorners.value, {
            x: 1,
            duration: 0.4,
          })
          .to(
            m.uniforms.uCorners.value,
            {
              y: 1,
              duration: 0.4,
            },
            0.1
          )
          .to(
            m.uniforms.uCorners.value,
            {
              z: 1,
              duration: 0.4,
            },
            0.2
          )
          .to(
            m.uniforms.uCorners.value,
            {
              w: 1,
              duration: 0.4,
            },
            0.3
          );
      });

      img.addEventListener("mouseout", () => {
        this.tl = gsap
          .timeline()
          .to(m.uniforms.uCorners.value, {
            x: 0,
            duration: 0.4,
          })
          .to(
            m.uniforms.uCorners.value,
            {
              y: 0,
              duration: 0.4,
            },
            0.1
          )
          .to(
            m.uniforms.uCorners.value,
            {
              z: 0,
              duration: 0.4,
            },
            0.2
          )
          .to(
            m.uniforms.uCorners.value,
            {
              w: 0,
              duration: 0.4,
            },
            0.3
          );
      });

      // create a new mesh with the geometry and the new material
      let mesh = new THREE.Mesh(this.geometry, m);
      this.scene.add(mesh);
      mesh.scale.set(bounds.width, bounds.height, 1);
      return {
        img: img,
        mesh: mesh,
        width: bounds.width,
        height: bounds.height,
        top: bounds.top,
        left: bounds.left,
      };
    });
  }
  setPosition() {
    // console.log(this.asscroll.currentPos);
    this.imageStore.forEach((o) => {
      o.mesh.position.x =
        -this.asscroll.currentPos + o.left - this.width / 2 + o.width / 2;
      o.mesh.position.y = -o.top + this.height / 2 - o.height / 2;
    });
  }

  render() {
    this.time += 0.05;
    // update the time in the shader
    this.material.uniforms.time.value = this.time;
    this.asscroll.update();
    this.setPosition();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render.bind(this));
  }
}

new Sketch({
  domElement: document.getElementById("container"),
});
