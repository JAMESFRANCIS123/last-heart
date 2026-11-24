const canvas = document.getElementById("fireworks");
const ctx = canvas.getContext("2d");

let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

window.addEventListener("resize", () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

const rockets = [];
const particles = [];

const palettes = [
  ["#ff1e56", "#ffac41", "#ffffff"], // Ruby & Gold
  ["#00f5d4", "#00bbf9", "#fee440"], // Cyan & Electric Yellow
  ["#f15bb5", "#9b5de5", "#ffffff"], // Neon Magenta & Violet
  ["#ffbe0b", "#fb5607", "#ff006e"], // Sunset Fiesta
  ["#80ffdb", "#64dfdf", "#5e60ce"]  // Aurora
];

function random(min, max) {
  return Math.random() * (max - min) + min;
}

class Rocket {
  constructor(startX, targetX, targetY) {
    this.x = startX;
    this.y = height;
    this.targetX = targetX;
    this.targetY = targetY;

    const angle = Math.atan2(targetY - height, targetX - startX);
    const speed = random(9, 13);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    this.palette = palettes[Math.floor(Math.random() * palettes.length)];
    this.trail = [];
    this.exploded = false;
  }

  update() {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 8) this.trail.shift();

    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.08;

    if (this.y <= this.targetY || this.vy >= -1) {
      this.exploded = true;
      explode(this.x, this.y, this.palette);
    }
  }

  draw() {
    ctx.save();
    for (let i = 0; i < this.trail.length; i++) {
      const point = this.trail[i];
      const alpha = (i + 1) / this.trail.length;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 220, 180, ${alpha * 0.7})`;
      ctx.fill();
    }
    ctx.restore();
  }
}

class Particle {
  constructor(x, y, vx, vy, color, twinkle = false) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.alpha = 1;
    this.decay = random(0.012, 0.022);
    this.gravity = 0.045;
    this.friction = 0.96;
    this.size = random(1.5, 3);
    this.twinkle = twinkle;
  }

  update() {
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.decay;
  }

  draw() {
    if (this.alpha <= 0) return;

    const flicker = this.twinkle && Math.random() < 0.35 ? 0.2 : 1;

    ctx.save();
    ctx.globalAlpha = Math.max(this.alpha * flicker, 0);
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function explode(x, y, palette) {
  const shapes = ["sphere", "ring", "heart"];
  const shape = shapes[Math.floor(Math.random() * shapes.length)];
  const twinkle = Math.random() > 0.4;

  if (shape === "heart") {
    const count = 90;
    const scale = random(0.25, 0.38);
    const color = palette[0];
    for (let i = 0; i < count; i++) {
      const t = (Math.PI * 2 * i) / count;
      const hx = 16 * Math.pow(Math.sin(t), 3);
      const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      particles.push(new Particle(x, y, hx * scale, hy * scale, color, true));
    }
  } else if (shape === "ring") {
    const count = 80;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = i % 2 === 0 ? 5.5 : 3.2;
      const color = palette[i % palette.length];
      particles.push(new Particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, twinkle));
    }
  } else {
    const count = 120;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = random(1, 7.5);
      const color = palette[Math.floor(Math.random() * palette.length)];
      particles.push(new Particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, twinkle));
    }
  }
}

function launchRandomRocket() {
  const startX = random(width * 0.2, width * 0.8);
  const targetX = random(width * 0.15, width * 0.85);
  const targetY = random(height * 0.12, height * 0.45);
  rockets.push(new Rocket(startX, targetX, targetY));
}

function animate() {
  ctx.fillStyle = "rgba(8, 5, 14, 0.2)";
  ctx.fillRect(0, 0, width, height);

  for (let i = rockets.length - 1; i >= 0; i--) {
    rockets[i].update();
    rockets[i].draw();
    if (rockets[i].exploded) {
      rockets.splice(i, 1);
    }
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw();
    if (particles[i].alpha <= 0) {
      particles.splice(i, 1);
    }
  }

  requestAnimationFrame(animate);
}

setInterval(launchRandomRocket, 750);

canvas.addEventListener("click", (e) => {
  rockets.push(new Rocket(width / 2, e.clientX, e.clientY));
});

setTimeout(() => {
  launchRandomRocket();
  launchRandomRocket();
  launchRandomRocket();
}, 200);

animate();