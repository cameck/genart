const canvasSketch = require('canvas-sketch');
const {lerp} = require('canvas-sketch-util/math')
const random= require('canvas-sketch-util/random')
const palettes = require('nice-color-palettes');

const circleSize = [
  0.1,
  0.2,
  0.3,
  0.4,
  0.5,
  0.6,
  0.7,
  0.8,
  0.9,
  1,
  1.5,
   2]
const settings = {
  dimensions: [2048, 2048]
  // dimensions: 'letter',
  // orientation: 'landscape', // or portrait
  // units: 'cm',
  // pixelsPerInch: 300 // for print
};

const sketch = () => {
  const colorCount = random.rangeFloor(1,6);
  // const palette = random.pick(palettes);
  const palette = random.shuffle(random.pick(palettes)).slice(0, colorCount);
  console.log('pallete: ', palette)
  const createGrid = () => {
    const points = [];
    const count = 69;
    for (let x= 0; x < count; x++) {
      for (let y=0; y < count; y++) {
        const u = count <= 1 ? 0.5 : x / (count - 1);
        const v = count <= 1 ? 0.5 : y / (count - 1);
        const noise = random.noise2D(u, v);
        const radius = Math.abs(noise) * 0.7;
        points.push({
          // radius: Math.max(0, random.gaussian()) * 0.01,
          radius,
          position: [u, v],
          rotation: 3 * noise,
          color: random.pick(palette)
        })
      }
    }

    return points;
  }
  // random.setSeed('captainCrunch') // sets
  const points = createGrid().filter(() => random.value() > 0.2);
  const margin = 10;

  return ({ context, width, height }) => {
    // console.log('width: ', width)
    // context.fillStyle = 'lightBlue';
    // context.fillRect(0, 0, width, height);
    // context.beginPath();
    // context.arc(width/2, height/2, width * 0.2, Math.PI * 2, false)
    // context.fillStyle = 'red';
    // context.fill();
    // context.lineWidth = width * 0.3;
    // context.strokeStyle = 'lightGreen';
    // context.stroke();

    context.fillStyle = random.pick(palette)
    context.fillRect(0, 0, width, height)

    points.forEach(({position, radius, color, rotation}) => {
      const [u, v] = position;
      const x = lerp(margin, width - margin, u);
      const y = lerp(margin, height - margin, v);
      // const y = v * width;
      context.beginPath();
      context.arc(
        x,
        y,
        radius * width,
        0,
        // Math.PI * random.pick(circleSize),
        Math.PI * 2,
        false);
      // context.strokeStyle = 'black';
      // context.lineWidth = 20;
      // context.fillStyle = color
      // context.fill();
      context.save();
      context.fillStyle = color;
      context.font = `${radius * width}px "Helvetica"`;
      context.translate(x, y);
      context.rotate(rotation);
      context.fillText('🥺', x, y)
      // context.fillText('🍆', 0, 0)
      // context.fillText(random.pick(nasty), 0, 0)
      // context.fillText(random.pick(words), x, y)
      context.restore()
    })
  };
};

canvasSketch(sketch, settings);
