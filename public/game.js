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


const textureLoader = new THREE.TextureLoader();
const objectTexture = textureLoader.load('txture.jpg');
// Add player object (a sphere) to the scene
const playerGeometry = new THREE.SphereGeometry(0.9, 32, 32);
const playerMaterial = new THREE.MeshPhongMaterial({ map: objectTexture });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
scene.add(player);

// Position the player at the bottom of the screen
player.position.y = -4;

// Adjust camera position
camera.position.y = 3;
camera.position.z = 10;
camera.rotation.x = -Math.PI / 8;

// Create a ground plane

const groundGeometry = new THREE.PlaneGeometry(20, 20, 32, 32);
const groundMaterial = new THREE.MeshPhongMaterial({ map: objectTexture });  // Changed material type
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;  // Rotate the plane to be horizontal
ground.position.y = -5;  // Position it a bit lower to be in the camera's view
scene.add(ground);

// Add ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Add point light
const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(10, 15, 5);
scene.add(pointLight);

// Array to hold falling objects
const objects = [];

// Player velocity for X and Z axis
let velocityX = 0;
let velocityZ = 0;

// Player score
let score = 0;

// Create a particle system  
const particlesGeometry = new THREE.BufferGeometry();
const particlesCnt = 5000;

const posArray = new Float32Array(particlesCnt * 3);

for(let i = 0; i < particlesCnt * 3; i++) {
  // particles positions between -10 to 10
  posArray[i] = (Math.random() - 0.5) * 20;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const particlesMaterial = new THREE.PointsMaterial({
  size: 0.1,
  color: 0xffffff
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

// Make particles fall
const particlesSpeed = 0.1; 

const particleAnimate = () => {
  particles.rotation.z += 0.01;
  
  // Lower y position over time
  particlesGeometry.attributes.position.array.forEach((v, i) => {
    if(i % 3 === 1) particlesGeometry.attributes.position.array[i] -= particlesSpeed; 
  });
  
  // Respawn particles that reach the ground
  particlesGeometry.attributes.position.array.forEach((v, i) => {
    if(particlesGeometry.attributes.position.array[i + 1] < -10) {
      particlesGeometry.attributes.position.array[i + 1] = 10;
    }
  });

  particlesGeometry.attributes.position.needsUpdate = true;
}




const objectTypes = [
    { color: 0xff0000, speed: 0.05 },
    { color: 0x00ff00, speed: 0.08 },
    { color: 0x0000ff, speed: 0.02 },
  ];

// Generate random falling objects
// Generate random falling objects with types
const addRandomObject = () => {
    const randomType = objectTypes[Math.floor(Math.random() * objectTypes.length)];
    const geometries = [
      new THREE.BoxGeometry(),
      new THREE.ConeGeometry(0.5, 1, 32),
      new THREE.CylinderGeometry(0.5, 0.5, 1, 32),
    ];
    const material = new THREE.MeshPhongMaterial({ color: randomType.color });
    const mesh = new THREE.Mesh(geometries[Math.floor(Math.random() * geometries.length)], material);
    mesh.userData.speed = randomType.speed; // Attach speed to object
    mesh.position.y = 5;
    mesh.position.z = (Math.random() - 0.5) * 8;
    mesh.position.x = (Math.random() - 0.5) * 8;
    scene.add(mesh);
    objects.push(mesh);
  };


// Array to hold moving obstacles
const movingObstacles = [];

// Function to add moving obstacles
const addMovingObstacle = () => {
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshPhongMaterial({ color: 0xff00ff }); // Purple color
    const obstacle = new THREE.Mesh(geometry, material);
    obstacle.position.y = -4;
    obstacle.position.x = (Math.random() - 0.5) * 8;
    obstacle.position.z = (Math.random() - 0.5) * 8;
    obstacle.userData.directionX = (Math.random() - 0.5) * 0.02; // Random initial direction X
    obstacle.userData.directionZ = (Math.random() - 0.5) * 0.02; // Random initial direction Z
    scene.add(obstacle);
    movingObstacles.push(obstacle);
  };
// Add a moving obstacle every 5 seconds
setInterval(addMovingObstacle, 5000);

// Create a "shield" around the player
const shieldGeometry = new THREE.SphereGeometry(1.6, 32, 32);
const shieldMaterial = new THREE.MeshPhongMaterial({ color: 0xffff00, transparent: true, opacity: 0.5 });
const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
shield.visible = false;  // Initially not visible
player.add(shield);  // Attach to the player

// Shield status
let shieldActive = false;

// Collision detection
const checkCollision = (a, b) => {
  const distance = a.position.distanceTo(b.position);
  return distance < 1;
};

// Keyboard event listener
document.addEventListener('keydown', (event) => {
    switch (event.code) {
      case 'ArrowLeft':
        velocityX = -0.2;
        break;
      case 'ArrowRight':
        velocityX = 0.2;
        break;
      case 'ArrowUp':
        velocityZ = -0.2;
        break;
      case 'ArrowDown':
        velocityZ = 0.2;
        break;
    }
    if (event.code === 'KeyS') {
        shield.visible = true;
        shieldActive = true;
    }

  });
  
  document.addEventListener('keyup', (event) => {
    switch (event.code) {
      case 'ArrowLeft':
      case 'ArrowRight':
        velocityX = 0;
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        velocityZ = 0;
        break;
    }
    if (event.code === 'KeyS') {
        shield.visible = false;
        shieldActive = false;
    }
  });

// Update material to respond to lighting
playerMaterial.color.setHex(0x00ff00);
playerMaterial.needsUpdate = true;  


// Render loop (Game Loop)
const animate = () => {
    particleAnimate();
  if (score < 10) {
    requestAnimationFrame(animate);
  } else {
    scoreElement.innerHTML = `Game Over! Final Score: ${score}`;
    return;
  }

  // Update player position with velocity and boundary checks
  player.position.x += velocityX;
  player.position.x = Math.min(Math.max(player.position.x, -4), 4);
  
  player.position.z += velocityZ;
  player.position.z = Math.min(Math.max(player.position.z, -4), 4);
  

  // Move falling objects and check for collisions
  objects.forEach((object) => {
    object.position.y -= object.userData.speed;  // Use object's speed
    if (checkCollision(player, object)) {
      score++;
      scoreElement.innerHTML = `Score: ${score}`;
    }
    if (object.position.y < -6) {
      // Remove object from scene and array
      scene.remove(object);
      const index = objects.indexOf(object);
      if (index > -1) {
        objects.splice(index, 1);
      }
    }
    // Move the obstacles horizontally
    movingObstacles.forEach((obstacle) => {
        obstacle.position.x += obstacle.userData.directionX;
        obstacle.position.z += obstacle.userData.directionZ;
        
        if (obstacle.position.x >= 4 || obstacle.position.x <= -4) {
          obstacle.userData.directionX *= -1; // Reverse direction at X boundaries
        }
        if (obstacle.position.z >= 4 || obstacle.position.z <= -4) {
          obstacle.userData.directionZ *= -1; // Reverse direction at Z boundaries
        }
      });
    if (shieldActive) {
        objects.forEach((object) => {
          if (checkCollision(shield, object)) {
            scene.remove(object);
            objects.splice(objects.indexOf(object), 1);
            score++;
            scoreElement.innerHTML = `Score: ${score}`;
          }
        });
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
