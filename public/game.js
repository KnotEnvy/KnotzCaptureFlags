// Initialize scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Initialize renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Initialize score display
const scoreElement = document.createElement('div');
scoreElement.style.position = 'absolute';
scoreElement.style.top = '20px';
scoreElement.style.left = '20px';
scoreElement.style.fontSize = '24px';
document.body.appendChild(scoreElement);

// Add player object (a sphere) to the scene
const playerGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
scene.add(player);

// Position the player at the bottom of the screen
player.position.y = -4;

// Position the camera
camera.position.z = 10;

// Array to hold falling objects
const objects = [];

// Player velocity
let velocity = 0;

// Player score
let score = 0;

// Generate random falling objects
const addRandomObject = () => {
  const geometries = [
    new THREE.BoxGeometry(),
    new THREE.ConeGeometry(0.5, 1, 32),
    new THREE.CylinderGeometry(0.5, 0.5, 1, 32),
  ];
  const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
  const mesh = new THREE.Mesh(geometries[Math.floor(Math.random() * geometries.length)], material);
  mesh.position.y = 5;
  mesh.position.x = (Math.random() - 0.5) * 8;
  scene.add(mesh);
  objects.push(mesh);
};

// Collision detection
const checkCollision = (a, b) => {
  const distance = a.position.distanceTo(b.position);
  return distance < 1;
};

// Keyboard event listener
document.addEventListener('keydown', (event) => {
  if (event.code === 'ArrowLeft') {
    velocity = -0.2;
  } else if (event.code === 'ArrowRight') {
    velocity = 0.2;
  }
});

document.addEventListener('keyup', () => {
  velocity = 0;
});

// Render loop (Game Loop)
const animate = () => {
  if (score < 10) {
    requestAnimationFrame(animate);
  } else {
    scoreElement.innerHTML = `Game Over! Final Score: ${score}`;
    return;
  }

  // Update player position with velocity and boundary checks
  player.position.x += velocity;
  player.position.x = Math.min(Math.max(player.position.x, -4), 4);

  // Move falling objects and check for collisions
  objects.forEach((object) => {
    object.position.y -= 0.05;
    if (checkCollision(player, object)) {
      score++;
      scoreElement.innerHTML = `Score: ${score}`;
    }
    if (object.position.y < -5) {
      // Remove object from scene and array
      scene.remove(object);
      const index = objects.indexOf(object);
      if (index > -1) {
        objects.splice(index, 1);
      }
    }
  });

  // Add new falling object at random intervals
  if (Math.random() < 0.05) {
    addRandomObject();
  }

  renderer.render(scene, camera);
};

// Start the animation
scoreElement.innerHTML = `Score: ${score}`;
animate();
