// Three.js Journey Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById('canvas-container').appendChild(renderer.domElement);

// 1. Create a Path (The Road)
const pathPoints = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(5, 2, -10),
    new THREE.Vector3(-5, -2, -20),
    new THREE.Vector3(2, 5, -30),
    new THREE.Vector3(0, 0, -50)
];
const curve = new THREE.CatmullRomCurve3(pathPoints);

// 2. The Rider (Modern Bike with Stylized Boy Rider)
function createRiderAndBike() {
    const group = new THREE.Group();

    // --- MATERIALS ---
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.7, metalness: 0.3 });
    const engineMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8 });
    const riderMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 }); // Matte black suit
    const helmetMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.5 });

    // --- BIKE CONSTRUCTION ---
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 0.8), bodyMat);
    frame.position.y = 0.4;
    group.add(frame);

    const tankGeo = new THREE.SphereGeometry(0.25, 16, 16);
    tankGeo.scale(1, 1.2, 1.5);
    const tank = new THREE.Mesh(tankGeo, bodyMat);
    tank.position.set(0, 0.65, 0.1);
    group.add(tank);

    const engine = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.4), engineMat);
    engine.position.y = 0.35;
    group.add(engine);

    const wheelGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.15, 24);
    wheelGeo.rotateZ(Math.PI / 2);
    const frontWheel = new THREE.Mesh(wheelGeo, engineMat);
    frontWheel.position.set(0, 0.25, 0.6);
    group.add(frontWheel);

    const backWheel = new THREE.Mesh(wheelGeo, engineMat);
    backWheel.position.set(0, 0.25, -0.7);
    group.add(backWheel);

    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5), engineMat);
    bar.rotateZ(Math.PI / 2);
    bar.position.set(0, 0.8, 0.4);
    group.add(bar);

    // --- BOY RIDER CONSTRUCTION ---
    const rider = new THREE.Group();
    
    // Torso (Slightly broader shoulders for a masculine silhouette)
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.45, 0.18), riderMat); 
    torso.position.set(0, 0.9, -0.15);
    torso.rotation.x = -Math.PI / 5; // Leaned more aggressively
    rider.add(torso);

    // Head / Helmet
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), helmetMat);
    helmet.position.set(0, 1.15, 0.05);
    rider.add(helmet);

    // Arms (Stronger build)
    const armGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.5);
    const leftArm = new THREE.Mesh(armGeo, riderMat);
    leftArm.position.set(-0.22, 1.0, 0.15);
    leftArm.rotation.set(Math.PI / 2.5, 0, -Math.PI / 6);
    rider.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, riderMat);
    rightArm.position.set(0.22, 1.0, 0.15);
    rightArm.rotation.set(Math.PI / 2.5, 0, Math.PI / 6);
    rider.add(rightArm);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.45);
    const leftLeg = new THREE.Mesh(legGeo, riderMat);
    leftLeg.position.set(-0.15, 0.6, -0.1);
    leftLeg.rotation.set(Math.PI / 3.5, 0, 0);
    rider.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, riderMat);
    rightLeg.position.set(0.15, 0.6, -0.1);
    rightLeg.rotation.set(Math.PI / 3.5, 0, 0);
    rider.add(rightLeg);

    group.add(rider);

    return group;
}

const riderGroup = createRiderAndBike();
const riderGlow = new THREE.PointLight(0x00f2ff, 1.5, 6); // Subtle cyan path-lighting
riderGlow.position.set(0, 0.6, 1);
riderGroup.add(riderGlow);
scene.add(riderGroup);

// 3. The Environment (A Tunnel of Light)
const tubeGeometry = new THREE.TubeGeometry(curve, 100, 3, 8, false);
const tubeMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x111111, 
    wireframe: true, 
    transparent: true, 
    opacity: 0.1 
});
const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
scene.add(tube);

// Add stars/particles along the way
const starsGeo = new THREE.BufferGeometry();
const starsCount = 5000;
const starsPos = new Float32Array(starsCount * 3);
for(let i=0; i<starsCount*3; i++) {
    starsPos[i] = (Math.random() - 0.5) * 100;
}
starsGeo.setAttribute('position', new THREE.BufferAttribute(starsPos, 3));
const stars = new THREE.Points(starsGeo, new THREE.PointsMaterial({color: 0xffffff, size: 0.05}));
scene.add(stars);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// 4. Scroll Control
let scrollPercent = 0;
document.body.onscroll = () => {
    scrollPercent = ( (document.documentElement.scrollTop || document.body.scrollTop) / 
    ((document.documentElement.scrollHeight || document.body.scrollHeight) - document.documentElement.clientHeight) );
};

// Animation Loop
const animate = () => {
    // Get position on curve based on scroll
    const targetPos = curve.getPointAt(scrollPercent);
    const lookAtPos = curve.getPointAt(Math.min(scrollPercent + 0.01, 1));

    // Move Rider
    riderGroup.position.copy(targetPos);
    riderGroup.lookAt(lookAtPos);
    // Remove rotation for vehicle - it should face forward
    // riderCore.rotation.z += 0.05; 

    // Move Camera (slightly behind the rider for a "follow" feel)
    const camPos = curve.getPointAt(Math.max(scrollPercent - 0.03, 0));
    camera.position.copy(camPos);
    camera.position.y += 0.5; // Lift camera slightly
    camera.lookAt(targetPos);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
};

animate();

// GSAP Content Reveal (Synced with Sections)
gsap.registerPlugin(ScrollTrigger);

gsap.utils.toArray("section").forEach((section, i) => {
    gsap.from(section, {
        scrollTrigger: {
            trigger: section,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play reverse play reverse",
        },
        opacity: 0,
        y: 50,
        duration: 1
    });
});
