const canvasSketch = require('canvas-sketch');
const createShader = require('canvas-sketch-util/shader');
const glsl = require('glslify');

// Setup our sketch
const settings = {
  context: 'webgl',
  dimensions: [512, 512],
  animate: true,
  duration: 4,
  fps: 24
};

// Your glsl code
const frag = glsl(/* glsl */`
  precision highp float;

  uniform float playhead;
  uniform float aspect;
  varying vec2 vUv;

  #pragma glslify: noise = require('glsl-noise/simplex/3d');
  #pragma glslify: hsl2rgb = require('glsl-hsl2rgb');

  // shader has to have main()
  void main () {
    // vec3 colorA = sin(playhead) + vec3(0.8431, 0.4431, 0.5255);
    // vec3 colorB = cos(playhead) + vec3(0.3804, 0.6353, 0.8549);

    //  get center of screen
    vec2 center = vUv - 0.5;
    center.x *= aspect;
    float dist = length(center);


    float alpha = smoothstep(0.25, 0.2475, dist);
    // vec3 color = mix(colorA, colorB, vUv.y + vUv.x * sin(playhead));
    // gl_FragColor = vec4(color, alpha);

    float n = noise(vec3(center, playhead * 0.5));

    vec3 color = hsl2rgb(
      0.8 + n * 0.3,
      0.5,
      0.5
    );
    gl_FragColor = vec4(color, alpha);
  }
`);

// Your sketch, which simply returns the shader
const sketch = ({ gl }) => {
  // Create the shader and return it
  return createShader({
    // clearColor: 'white', // false == transparent
    clearColor: false, // false == transparent
    // Pass along WebGL context
    gl,
    // Specify fragment and/or vertex shader strings
    frag,
    // Specify additional uniforms to pass down to the shaders
    uniforms: {
      // Expose props from canvas-sketch
      playhead: ({ playhead }) => Math.sin(playhead * Math.PI),//  ensures uniformity in gif restarts,
      aspect: ({width, height }) => width / height
    }
  });
};

canvasSketch(sketch, settings);
