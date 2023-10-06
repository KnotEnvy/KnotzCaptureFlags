// Initialize scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Initialize renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Initialize score display
const scoreElement = document.createElement("div");
scoreElement.style.position = "absolute";
scoreElement.style.fontSize = "48px";
document.body.appendChild(scoreElement);

// Initialize ammo display
const ammoElement = document.createElement("div");
ammoElement.style.position = "absolute";
ammoElement.style.top = "60px";
ammoElement.style.left = "20px";
ammoElement.style.fontSize = "24px";
document.body.appendChild(ammoElement);

const textureLoader = new THREE.TextureLoader();
const objectTexture = textureLoader.load("txture.jpg");
// Add player object (a sphere) to the scene
const playerGeometry = new THREE.SphereGeometry(0.7, 32, 32);
const playerMaterial = new THREE.MeshPhongMaterial({ map: objectTexture });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
scene.add(player);

// Update material to respond to lighting
playerMaterial.color.setHex(0x00ff00);
playerMaterial.needsUpdate = true;

// Position the player at the bottom of the screen
player.position.y = -4.5;

// Adjust camera position
camera.position.y = 13;
camera.position.z = 20;
camera.rotation.x = -Math.PI / 8;

// Create a ground plane

const groundGeometry = new THREE.PlaneGeometry(40, 40, 32, 32);
const groundMaterial = new THREE.MeshPhongMaterial({ map: objectTexture }); // Changed material type
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2; // Rotate the plane to be horizontal
ground.position.y = -5; // Position it a bit lower to be in the camera's view
scene.add(ground);

// Add ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Add point light
const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

// Key light
const keyLight = new THREE.DirectionalLight(0xff00ff, 0.5);
keyLight.position.set(2, 8, 10); 
scene.add(keyLight);

// // Fill light 
// const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
// fillLight.position.set(-10, 10, 5);
// scene.add(fillLight);



// Enable shadow mapping in the renderer
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional, for softer shadows

// Enable shadows for the point light
pointLight.castShadow = true;
keyLight.castShadow = true;
// fillLight.castShadow = true;

// Configure the objects to cast and receive shadows
player.castShadow = true;
player.receiveShadow = true;

ground.receiveShadow = true;

// Array to hold falling objects
const objects = [];

// Player velocity for X and Z axis
let velocityX = 0;
let velocityZ = 0;

// Player score
let score = 0;

const objectTypes = [
  { color: 0xff0000, speed: 0.05 },
  { color: 0x00ff00, speed: 0.08 },
  { color: 0x0000ff, speed: 0.02 }
];

// Generate random falling objects with types
const addRandomObject = () => {
  const randomType =
    objectTypes[Math.floor(Math.random() * objectTypes.length)];
  const geometries = [
    new THREE.BoxGeometry(),
    new THREE.ConeGeometry(0.5, 1, 32),
    new THREE.CylinderGeometry(0.5, 0.5, 1, 32)
  ];
  // object.rotation.y = Math.random() * 2 * Math.PI; // Random start rotation
  // object.scale.set(0.5, 1, 0.5); // Scale
  const material = new THREE.MeshPhongMaterial({ color: randomType.color });
  const mesh = new THREE.Mesh(
    geometries[Math.floor(Math.random() * geometries.length)],
    material
  );
  mesh.userData.speed = randomType.speed; // Attach speed to object
  mesh.position.y = 10;
  mesh.position.z = (Math.random() - 0.5) * 18;
  mesh.position.x = (Math.random() - 0.5) * 24;
  mesh.castShadow = true;
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
  obstacle.position.x = (Math.random() - 0.5) * 24;
  obstacle.position.z = (Math.random() - 0.5) * 8;
  obstacle.userData.directionX = (Math.random() - 0.5) * 0.02; // Random initial direction X
  obstacle.userData.directionZ = (Math.random() - 0.5) * 0.02; // Random initial direction Z
  obstacle.castShadow = true;

  scene.add(obstacle);
  movingObstacles.push(obstacle);
};
// Add a moving obstacle every 5 seconds
setInterval(addMovingObstacle, 5000);

// Create a "shield" around the player
const shieldGeometry = new THREE.SphereGeometry(1.25, 32, 32);
const shieldMaterial = new THREE.MeshPhongMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.5
});
const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
shield.visible = false; // Initially not visible
player.add(shield); // Attach to the player

// Shield status
let shieldActive = false;

// Array to hold projectiles
const projectiles = [];

// Function to fire a projectile
const fireProjectile = () => {
  const geometry = new THREE.SphereGeometry(0.1, 32, 32);
  const material = new THREE.MeshPhongMaterial({ color: 0xffffff }); 
  const projectile = new THREE.Mesh(geometry, material);
  projectile.position.set(
    player.position.x,
    player.position.y,
    player.position.z
  );
  projectile.userData.speed = 0.2;
  projectile.castShadow = true;
  scene.add(projectile);
  projectiles.push(projectile);
};

// Function to create shattered pieces
const createShatteredPieces = (object) => {
  const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  const material = new THREE.MeshPhongMaterial({
    color: object.material.color
  });
  const pieces = [];

  for (let i = 0; i < 10; i++) {
    const piece = new THREE.Mesh(geometry, material);
    piece.position.set(object.position.x, object.position.y, object.position.z);
    piece.userData.speed = Math.random() * 0.1 + 0.05;
    piece.userData.direction = new THREE.Vector3(
      Math.random() - 0.5,
      Math.random(),
      Math.random() - 0.5
    ).normalize();

    piece.userData.explodeTime = 0.2; // Time to explode outward
    piece.userData.gravityTime = 0; // Time under gravity
    piece.castShadow = true;
    scene.add(piece);
    pieces.push(piece);
  }

  return pieces;
};

// Initialize ammo count
let ammo = 10;
let canShoot = true; // Flag to check if player can shoot

// Function to handle cooldown
const startCooldown = () => {
  canShoot = false;
  setTimeout(() => {
    canShoot = true;
  }, 1500);
};

const shatteredPieces = [];
// Function to handle projectiles
const handleProjectiles = () => {
  projectiles.forEach((projectile) => {
    projectile.position.y += projectile.userData.speed;

    objects.forEach((object) => {
      if (checkCollision(projectile, object)) {
        const pieces = createShatteredPieces(object);
        shatteredPieces.push(...pieces);
        scene.remove(object);
        objects.splice(objects.indexOf(object), 1);

        // Remove the projectile
        scene.remove(projectile);
        projectiles.splice(projectiles.indexOf(projectile), 1);

        // Increase the score
        score += 5;
        scoreElement.innerHTML = `Score: ${score}`;
      }
    });

    if (projectile.position.y > 6) {
      // Remove the projectile if it goes out of bounds
      scene.remove(projectile);
      projectiles.splice(projectiles.indexOf(projectile), 1);
    }
  });
};

// Function to handle shattered pieces
const handleShatteredPieces = () => {
  shatteredPieces.forEach((piece) => {
    if (piece.userData.explodeTime > 0) {
      // Explode outward
      piece.position.addScaledVector(piece.userData.direction, 0.05);
      piece.userData.explodeTime -= 0.01;
    } else {
      // Simulate gravity
      piece.userData.gravityTime += 0.01;
      piece.position.y -= piece.userData.gravityTime;
    }

    if (piece.position.y < -6) {
      // Remove piece from scene and array
      scene.remove(piece);
      shatteredPieces.splice(shatteredPieces.indexOf(piece), 1);
    }
  });
};

// Collision detection
const checkCollision = (a, b) => {
  const distance = a.position.distanceTo(b.position);
  return distance < 1;
};

// Keyboard event listener
document.addEventListener("keydown", (event) => {
  switch (event.code) {
    case "ArrowLeft":
      velocityX = -0.2;
      break;
    case "ArrowRight":
      velocityX = 0.2;
      break;
    case "ArrowUp":
      velocityZ = -0.2;
      break;
    case "ArrowDown":
      velocityZ = 0.2;
      break;
  }
  if (event.code === "KeyS") {
    shield.visible = true;
    shieldActive = true;
  }
  if (event.code === "Space") {
    // Check if player can shoot
    if (canShoot) {
      if (ammo > 0) {
        fireProjectile();
        ammo--; // Decrease ammo
        ammoElement.innerHTML = `Ammo: ${ammo}`;
      } else {
        startCooldown(); // Start cooldown if out of bullets
      }
    }
  }
});

document.addEventListener("keyup", (event) => {
  switch (event.code) {
    case "ArrowLeft":
    case "ArrowRight":
      velocityX = 0;
      break;
    case "ArrowUp":
    case "ArrowDown":
      velocityZ = 0;
      break;
  }
  if (event.code === "KeyS") {
    shield.visible = false;
    shieldActive = false;
  }
});

// Create the flag
const flagGeometry = new THREE.BoxGeometry(1, 1, 0.5);
const flagMaterial = new THREE.MeshPhongMaterial({ color: 0xffff00 }); // Yellow color
const flag = new THREE.Mesh(flagGeometry, flagMaterial);
flag.castShadow = true;
flag.receiveShadow = true;


flag.position.y = -4.5; // Close to the ground
scene.add(flag);

// Function to respawn the flag at a random location
const respawnFlag = () => {
  flag.position.x = (Math.random() - 0.5) * 20;
  flag.position.z = (Math.random() - 0.5) * 10;
};

// Initialize flag for the first time
respawnFlag();

// Update function to include flag collision
const handlePlayerAndFlag = () => {
  if (checkCollision(player, flag)) {
    score += 10;
    scoreElement.innerHTML = `Score: ${score}`;
    ammo = Math.min(ammo + 10, 30); // Increase ammo, up to a max of 30
    ammoElement.innerHTML = `Ammo: ${ammo}`;
    respawnFlag();
  }
};

let gameOver = false;
// Render loop (Game Loop)
const animate = () => {
  // particleAnimate();
  if (gameOver) {
    return;
  }

  // Update player position with velocity and boundary checks
  player.position.x += velocityX;
  player.position.x = Math.min(Math.max(player.position.x, -15), 15);

  player.position.z += velocityZ;
  player.position.z = Math.min(Math.max(player.position.z, -15), 5);

  // Move falling objects and check for collisions
  objects.forEach((object) => {
    object.position.y -= object.userData.speed; // Use object's speed
    if (checkCollision(player, object)) {
      gameOver = true;
      scoreElement.innerHTML = `Game Over! Final Score: ${score}`;
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

      if (obstacle.position.x >= 12 || obstacle.position.x <= -12) {
        obstacle.userData.directionX *= -1; // Reverse direction at X boundaries
      }
      if (obstacle.position.z >= 4 || obstacle.position.z <= -14) {
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
  // Handle projectiles
  handleProjectiles();
  handleShatteredPieces();
  handlePlayerAndFlag();

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

// Start the animation
scoreElement.innerHTML = `Score: ${score}`;
ammoElement.innerHTML = `Ammo: ${ammo}`;
animate();
