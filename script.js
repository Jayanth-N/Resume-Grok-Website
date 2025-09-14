// Black Hole Animation
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let blackHoles = [];
let particles = [];
let mouseX = 0;
let mouseY = 0;

class BlackHole {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 60 + Math.random() * 40;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.rotation = 0;
        this.rotationSpeed = 0.015 + Math.random() * 0.01;
        this.pulseSpeed = 0.02;
        this.pulseOffset = Math.random() * Math.PI * 2;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;
        
        // Bounce off edges
        if (this.x <= this.radius || this.x >= canvas.width - this.radius) {
            this.vx *= -1;
        }
        if (this.y <= this.radius || this.y >= canvas.height - this.radius) {
            this.vy *= -1;
        }
        
        // Keep within bounds
        this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Pulsing effect
        const pulse = Math.sin(Date.now() * this.pulseSpeed + this.pulseOffset) * 0.1 + 1;
        const currentRadius = this.radius * pulse;
        
        // Create radial gradient for black hole effect
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, currentRadius);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
        gradient.addColorStop(0.2, 'rgba(10, 0, 20, 0.9)');
        gradient.addColorStop(0.4, 'rgba(30, 0, 60, 0.7)');
        gradient.addColorStop(0.6, 'rgba(50, 20, 100, 0.5)');
        gradient.addColorStop(0.8, 'rgba(70, 40, 140, 0.3)');
        gradient.addColorStop(1, 'rgba(90, 60, 180, 0.1)');
        
        // Draw the main black hole
        ctx.beginPath();
        ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw swirling accretion disk rings
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.arc(0, 0, currentRadius * (0.8 + i * 0.15), 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${120 + i * 30}, ${60 + i * 20}, ${200 + i * 10}, ${0.4 - i * 0.08})`;
            ctx.lineWidth = 2 - i * 0.3;
            ctx.stroke();
        }
        
        // Draw particle trails around black hole
        const numTrails = 8;
        for (let i = 0; i < numTrails; i++) {
            const angle = (i / numTrails) * Math.PI * 2 + this.rotation * 2;
            const trailRadius = currentRadius * 1.2;
            const x = Math.cos(angle) * trailRadius;
            const y = Math.sin(angle) * trailRadius;
            
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(150, 100, 255, 0.6)`;
            ctx.fill();
        }
        
        ctx.restore();
    }
}

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.size = Math.random() * 2 + 1;
        this.alpha = Math.random() * 0.8 + 0.2;
        this.color = {
            r: 100 + Math.random() * 155,
            g: 150 + Math.random() * 105,
            b: 200 + Math.random() * 55
        };
        this.life = 1;
        this.decay = Math.random() * 0.005 + 0.001;
    }
    
    update() {
        // Apply gravitational pull from black holes
        blackHoles.forEach(hole => {
            const dx = hole.x - this.x;
            const dy = hole.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < hole.radius * 3) {
                const force = (hole.radius * 0.00008) / (distance * distance);
                this.vx += dx * force;
                this.vy += dy * force;
                
                // Add swirling motion
                const perpX = -dy;
                const perpY = dx;
                const swirl = 0.0001;
                this.vx += perpX * swirl;
                this.vy += perpY * swirl;
            }
            
            // Reset particle if it gets absorbed
            if (distance < hole.radius * 0.6) {
                this.respawn();
            }
        });
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Wrap around screen edges
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
        
        // Add friction
        this.vx *= 0.995;
        this.vy *= 0.995;
        
        // Decay and respawn
        this.life -= this.decay;
        if (this.life <= 0) {
            this.respawn();
        }
    }
    
    respawn() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.life = 1;
        this.alpha = Math.random() * 0.8 + 0.2;
    }
    
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.alpha * this.life})`;
        ctx.fill();
        
        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.5)`;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

function init() {
    blackHoles = [];
    particles = [];
    
    // Create black holes
    const numBlackHoles = 2;
    for (let i = 0; i < numBlackHoles; i++) {
        const x = (canvas.width / (numBlackHoles + 1)) * (i + 1);
        const y = canvas.height / 2 + (Math.random() - 0.5) * 200;
        blackHoles.push(new BlackHole(x, y));
    }
    
    // Create particles
    const particleCount = 180;
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    // Create trailing effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw black holes
    blackHoles.forEach(hole => {
        hole.update();
        hole.draw();
    });
    
    // Update and draw particles
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    
    requestAnimationFrame(animate);
}

// Mouse interaction
canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Add slight attraction to mouse
    particles.forEach(particle => {
        const dx = mouseX - particle.x;
        const dy = mouseY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
            const force = 0.0005;
            particle.vx += dx * force;
            particle.vy += dy * force;
        }
    });
});

// Resize handler
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
});

// Initialize
init();
animate();
