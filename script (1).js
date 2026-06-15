// --- ENGINE CONFIG ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
scene.fog = new THREE.FogExp2(0x000000, 0.04);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById('canvas-container').appendChild(renderer.domElement);

// --- GAME OBJECTS ---

// 1. The Track (Procedural infinite path)
const trackGroup = new THREE.Group();
const gridHelper = new THREE.GridHelper(200, 50, 0x00f2ff, 0x111111);
gridHelper.position.y = -2;
trackGroup.add(gridHelper);

// Add "Floating Data Fragments" (Game Environment)
const fragments = [];
for(let i=0; i<100; i++) {
    const geo = new THREE.BoxGeometry(Math.random()*0.5, Math.random()*2, 0.1);
    const mat = new THREE.MeshBasicMaterial({ color: 0x00f2ff, transparent: true, opacity: 0.2 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set((Math.random()-0.5)*40, (Math.random())*10, -Math.random()*200);
    trackGroup.add(mesh);
    fragments.push(mesh);
}
scene.add(trackGroup);

// 2. The Hero (Bike + Rider)
function createHero() {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    
    // Bike Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 1.2), mat);
    body.position.y = 0.5;
    group.add(body);
    
    // Rider
    const riderMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.5, 0.2), riderMat);
    torso.position.set(0, 0.9, -0.1);
    torso.rotation.x = -0.5;
    group.add(torso);
    
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), riderMat);
    head.position.set(0, 1.2, 0.05);
    group.add(head);

    // Glow Trail
    const trailLight = new THREE.PointLight(0x00f2ff, 2, 5);
    trailLight.position.set(0, 0.5, -0.6);
    group.add(trailLight);

    return group;
}

const hero = createHero();
scene.add(hero);

// --- LIGHTING ---
const ambient = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambient);

const frontLight = new THREE.SpotLight(0x00f2ff, 5, 20, 0.5);
frontLight.position.set(0, 5, 10);
scene.add(frontLight);

// --- GAME LOGIC ---
let targetScroll = 0;
let currentScroll = 0;
let mouseX = 0;

window.addEventListener('wheel', (e) => {
    targetScroll += e.deltaY * 0.02;
});

window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
});

// START EVENT
document.getElementById('start-btn').addEventListener('click', () => {
    gsap.to('#loader', { opacity: 0, pointerEvents: 'none', duration: 1.5 });
    gsap.to(camera.position, { z: 5, y: 2, duration: 2, ease: "power3.inOut" });
});

// Progress Bar Mockup
let progress = 0;
const interval = setInterval(() => {
    progress += 5;
    document.getElementById('progress').style.width = progress + '%';
    if(progress >= 100) {
        clearInterval(interval);
        document.getElementById('start-btn').style.display = 'inline-block';
    }
}, 50);

// --- THE RIDE (ANIMATION) ---
function animate() {
    requestAnimationFrame(animate);
    
    // Smooth Lerp for movement
    currentScroll += (targetScroll - currentScroll) * 0.05;
    
    // Hero Controls
    hero.position.x = mouseX * 4;
    hero.rotation.y = -mouseX * 0.3;
    hero.rotation.z = mouseX * 0.4; // Lean

    // Move track instead of camera for infinite feel
    trackGroup.position.z = (currentScroll % 100);
    
    // Environment fragments animation
    fragments.forEach(f => {
        f.position.z += 0.1;
        if(f.position.z > 20) f.position.z = -200;
    });

    // Camera follow behavior
    camera.position.x += (mouseX * 2 - camera.position.x) * 0.05;
    camera.lookAt(hero.position.x, 1, -5);

    renderer.render(scene, camera);
}
animate();

// --- UI TRIGGER LOGIC ---
gsap.registerPlugin(ScrollTrigger);

const milestones = gsap.utils.toArray('.milestone');
milestones.forEach((m, i) => {
    gsap.to(m, {
        scrollTrigger: {
            trigger: document.body,
            start: `${i * 25}% top`,
            end: `${(i+1) * 25}% top`,
            scrub: true,
            onEnter: () => gsap.to(m, { opacity: 1, y: 0 }),
            onLeave: () => gsap.to(m, { opacity: 0, y: -50 }),
            onEnterBack: () => gsap.to(m, { opacity: 1, y: 0 }),
            onLeaveBack: () => gsap.to(m, { opacity: 0, y: 50 }),
        }
    });
});
