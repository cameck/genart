// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require('three');

const random = require('canvas-sketch-util/random');
// Include any additional ThreeJS examples below
require('three/examples/js/controls/OrbitControls');

const canvasSketch = require('canvas-sketch');
const palettes = require('nice-color-palettes');
const eases = require('eases');
const BezierEasing = require('bezier-easing');
const glslify = require('glslify');
const settings = {
  dimensions: [512, 512],
  fps: 24,
  duration: 4,
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: 'webgl',
  // Turn on MSAA
  attributes: { antialias: true }
};

const sketch = ({ context }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    context
  });

  // WebGL background color
  renderer.setClearColor('hsl(0, 0%, 95%)', 1);

  // Setup a camera
  const camera = new THREE.OrthographicCamera();
  // camera.position.set(2, 2, -4); // useful for perspective camera
  // camera.lookAt(new THREE.Vector3()); // useful for perspective camera

  // Setup camera controller
  // const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();
  const palette = random.pick(palettes);

  const fragmentShader = glslify(/*glsl*/`
    varying vec2 vUv;

    #pragma glslify: noise = require('glsl-noise/simplex/3d');

    uniform vec3 color;
    uniform float playhead;

    void main() {
      float offset = noise(vec3(vUv.xy * 4.0, playhead));
      gl_FragColor = vec4(vec3( color * vUv.x + offset), 1.0);
    }
  `);
  const vertexShader = glslify(/*glsl*/`
    varying vec2 vUv;
    uniform float time;

    #pragma glslify: noise = require('glsl-noise/simplex/4d');
    void main() {
      vUv = uv;
      vec3 pos = position.xyz;
      // pos += noise(vec4(position.xyz, time)) * 0.4;
      pos += 0.05 * normal * noise(vec4(pos.xyz * 10.0, time));
      pos += 0.25 * normal * noise(vec4(pos.xyz * 1.0, time));
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `);
  const box = new THREE.SphereGeometry(1, 32, 32);

  const meshes = [];
  for (let i = 0; i < 1; i++) {
    const mesh = new THREE.Mesh(
      box,
      new THREE.ShaderMaterial({
        fragmentShader,
        vertexShader,
        uniforms: {
          time: {value: 0 },
          color: { value: new THREE.Color(random.pick(palette)) }
        }
      })
    );
    // mesh.position.set(
    //   random.range(-1, 1),
    //   random.range(-1, 1),
    //   random.range(-1, 1)
    // );
    // mesh.scale.set(
    //   random.range(-1, 1),
    //   random.range(-1, 1),
    //   random.range(-1, 1)
    // );
    // mesh.scale.multiplyScalar(0.5);
    scene.add(mesh);
    meshes.push(mesh);
  }

  scene.add(new THREE.AmbientLight('hsl(0, 0%, 20%)'));
  const light = new THREE.DirectionalLight('white', 1);
  light.position.set(2, 2, 4);
  scene.add(light);

  const easeFn = BezierEasing(0.69, 0.05, 0.3, 0.99);

  // // Specify an ambient/unlit colour
  // scene.add(new THREE.AmbientLight('#59314f'));

  // // Add some light
  // const light = new THREE.PointLight('#45caf7', 1, 15.5);
  // light.position.set(2, 2, -4).multiplyScalar(1.5);
  // scene.add(light);

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight);
      // camera.aspect = viewportWidth / viewportHeight;

      const aspect = viewportWidth / viewportHeight;

      // Ortho zoom
      const zoom = 1.7;

      // Bounds
      camera.left = -zoom * aspect;
      camera.right = zoom * aspect;
      camera.top = zoom;
      camera.bottom = -zoom;

      // Near/Far
      camera.near = -100;
      camera.far = 100;

      // Set position & look at world center
      camera.position.set(zoom, zoom, zoom);
      camera.lookAt(new THREE.Vector3());

      // Update the camera
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render({ playhead, time }) {
      // mesh.rotation.y = time * ((10 * Math.PI) / 180);
      // controls.update();
      /// Math.PI * 2 is a very useful equation to have a seamless loop
      // scene.rotation.z = Math.sin(playhead * Math.PI * 2) *2;
      const t = Math.sin(playhead * Math.PI);
      // console.log('t: ', t)
      scene.rotation.z = easeFn(t);
      meshes.forEach(mesh => mesh.material.uniforms.time.value = time);
      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      // controls.dispose();
      renderer.dispose();
    }
  };
};

canvasSketch(sketch, settings);
