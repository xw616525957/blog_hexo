(function () {
  var canvas = document.getElementById('tech-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var particles = [];
  var w, h;
  var PARTICLE_COUNT = 40;
  var MAX_DIST = 120;

  function resize() {
    var banner = canvas.parentElement;
    w = canvas.width = banner.offsetWidth;
    h = canvas.height = banner.offsetHeight;
  }

  function Particle() {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.4;
    this.r = Math.random() * 1.5 + 0.5;
  }

  function init() {
    resize();
    particles = [];
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 212, 255, 0.5)';
      ctx.fill();

      for (var j = i + 1; j < particles.length; j++) {
        var p2 = particles[j];
        var dx = p.x - p2.x;
        var dy = p.y - p2.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = 'rgba(0, 212, 255, ' + (1 - dist / MAX_DIST) * 0.15 + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  init();
  draw();
  window.addEventListener('resize', function () {
    resize();
  });
})();
