
const dat = require("dat-gui");

const $ = sel => document.querySelector(sel);

let hue = 0;

const
    DEG_60 = Math.PI / 3,
    DEG_90 = Math.PI / 2,
    DEG_360 = Math.PI * 2,

    COLOR_RANGE = 60,

    ZOOM_FACTOR = 10,
    RATIO_RADIUS = 16,
    RATIO_THICKNESS = 160,
    RATIO_ASPECT = 25,
    RATIO_LOGO_SIZE = 1000,
    RATIO_SEPARATION = 320,

    FUDGE_TO_CENTER = 0.99, // fudge factor to get the text to center accurately
    CANVAS_BUFFER_SPACE = 1024,

    canvas = $('#cvs'),
    logo = $('#logo'),
    ctx = canvas.getContext('2d'),

    vertices = [
        {c: 3, from: 3, to: 1, os: 1},
        {c: 2, from: 5, to: 3, os: 1},
        {c: 5, from: 4, to: 0, os: -1},
        {c: 0, from: 0, to: 2, os: -1},
    ],

    inputs = {
        zoom: 25,
        thickness: 25,
        aspect: 25,
        textSize: 25,
        separation: 55,
        showLogo: true,
        reset: function(){
            inputs.zoom = 25;
            inputs.thickness = 25;
            inputs.aspect = 25;
            inputs.textSize = 25;
            inputs.separation = 55;
            inputs.showLogo = true;
        }
    }
    ;

window.onload = function() {
    const gui = new dat.GUI();
    gui.add(inputs, 'zoom', 1, 100).listen();
    gui.add(inputs, 'thickness', 1, 100).listen();
    gui.add(inputs, 'aspect', 1, 100).listen();
    gui.add(inputs, 'textSize', 1, 100).listen();
    gui.add(inputs, 'separation', 1, 100).listen();
    gui.add(inputs, 'showLogo').onChange(function(showLogo) {
        logo.style.visibility = showLogo ? 'visible' : 'hidden';
    }).listen();
    gui.add(inputs, 'reset');
};

ctx.lineWidth = 0.1;
ctx.imageSmoothingEnabled = true;

function animLoop() {
    window.requestAnimationFrame(animLoop);

    let
      zoom = inputs.zoom * ZOOM_FACTOR,
      radius = zoom * RATIO_RADIUS,
      thickness = Math.pow(inputs.thickness, 2) / RATIO_THICKNESS * zoom / RATIO_THICKNESS,
      aspect = inputs.aspect / RATIO_ASPECT,
      separation = (inputs.separation - 50) / RATIO_SEPARATION,
      centerX = canvas.width / 2,
      centerY = canvas.height / 2
    ;

    logo.style.height = `${radius * inputs.textSize / RATIO_LOGO_SIZE}px`;
    logo.style.top = `${(window.innerHeight - parseInt(logo.height)) / 2}px`;
    logo.style.left = `${(window.innerWidth - parseInt(logo.width) * FUDGE_TO_CENTER) / 2}px`;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    vertices.forEach(v => {

      const
        offsetY = radius * separation * v.os,

        x1 = centerX + Math.sin(DEG_60 * v.from) * zoom * aspect,
        y1 = centerY + Math.cos(DEG_60 * v.from) * zoom + offsetY,
        x2 = centerX + Math.sin(DEG_60 * v.to) * zoom * aspect,
        y2 = centerY + Math.cos(DEG_60 * v.to) * zoom + offsetY,

        theta = Math.atan((x2 - x1) / (y2 - y1)),

        tx1 = Math.sin(theta + DEG_90) * thickness,
        ty1 = Math.cos(theta + DEG_90) * thickness,
        tx2 = Math.sin(theta - DEG_90) * thickness,
        ty2 = Math.cos(theta - DEG_90) * thickness,

        colorStop0 = hue + v.c * COLOR_RANGE,
        colorStop1 = hue + v.c * COLOR_RANGE + COLOR_RANGE,

        gradient = ctx.createLinearGradient(x1, y1, x2, y2)
      ;

      gradient.addColorStop(0, `hsla(${colorStop0}, 100%, 50%, 1)`);
      gradient.addColorStop(1, `hsla(${colorStop1}, 100%, 50%, 1)`);
      ctx.fillStyle = gradient;

      ctx.beginPath();
      ctx.moveTo(x1 + tx1, y1 + ty1);
      ctx.lineTo(x2 - tx2, y2 - ty2);
      ctx.lineTo(x2 + tx2, y2 + ty2);
      ctx.lineTo(x1 - tx1, y1 - ty1);
      ctx.lineTo(x1 + tx1, y1 + ty1);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x2, y2, thickness, 0, DEG_360);
      ctx.arc(x1, y1, thickness, 0, DEG_360);
      ctx.fill();

    });
    hue++;
    hue %= 360;
}

function resize(){
    canvas.width = window.innerWidth + CANVAS_BUFFER_SPACE * 2;
    canvas.height = window.innerHeight + CANVAS_BUFFER_SPACE * 2;
    canvas.style.left = `-${CANVAS_BUFFER_SPACE}px`;
    canvas.style.top = `-${CANVAS_BUFFER_SPACE}px`;
}

window.onresize = resize;

resize();
animLoop();
