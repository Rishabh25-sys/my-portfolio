const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.04);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Environment
const trackGroup = new THREE.Group();
const gridHelper = new THREE.GridHelper(200, 50, 0x00f2ff, 0x111111);
gridHelper.position.y = -2;
trackGroup.add(gridHelper);
scene.add(trackGroup);

// Hero (Bike & Rider)
function createHero() {
    const group = new THREE.Group();
    const bike = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 1.2), new THREE.MeshStandardMaterial({ color: 0x222222 }));
    bike.position.y = 0.5;
    group.add(bike);
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.5, 0.2), new THREE.MeshStandardMaterial({ color: 0x000000 }));
    torso.position.set(0, 0.9, -0.1); torso.rotation.x = -0.5;
    group.add(torso);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), new THREE.MeshStandardMaterial({ color: 0x000000 }));
    head.position.set(0, 1.2, 0.05);
    group.add(head);
    return group;
}
const hero = createHero();
scene.add(hero);
scene.add(new THREE.AmbientLight(0xffffff, 0.2));
const spot = new THREE.SpotLight(0x00f2ff, 5); spot.position.set(0, 5, 10); scene.add(spot);

let targetScroll = 0, currentScroll = 0, mouseX = 0;
window.addEventListener('wheel', (e) => { targetScroll += e.deltaY * 0.02; });
window.addEventListener('mousemove', (e) => { mouseX = (e.clientX / window.innerWidth - 0.5) * 2; });

document.getElementById('start-btn').addEventListener('click', () => {
    gsap.to('#loader', { opacity: 0, pointerEvents: 'none', duration: 1 });
});

let prog = 0;
const intv = setInterval(() => {
    prog += 5; document.getElementById('progress').style.width = prog + '%';
    if(prog >= 100) { clearInterval(intv); document.getElementById('start-btn').style.display = 'block'; }
}, 30);

function animate() {
    requestAnimationFrame(animate);
    currentScroll += (targetScroll - currentScroll) * 0.05;
    hero.position.x = mouseX * 4;
    hero.rotation.y = -mouseX * 0.3;
    hero.rotation.z = mouseX * 0.4;
    trackGroup.position.z = (currentScroll % 100);
    camera.position.set(mouseX * 2, 2, 5);
    camera.lookAt(hero.position.x, 1, -5);
    renderer.render(scene, camera);
}
animate();

gsap.registerPlugin(ScrollTrigger);
gsap.utils.toArray('.milestone').forEach((m, i) => {
    gsap.to(m, { scrollTrigger: { trigger: document.body, start: `${i * 25}% top`, end: `${(i+1) * 25}% top`, scrub: true,
    onEnter: () => gsap.to(m, { opacity: 1, y: 0 }), onLeave: () => gsap.to(m, { opacity: 0, y: -50 }),
    onEnterBack: () => gsap.to(m, { opacity: 1, y: 0 }), onLeaveBack: () => gsap.to(m, { opacity: 0, y: 50 }) } });
});
