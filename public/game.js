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
const playerGeometry = new THREE.SphereGeometry(0.5, 32, 32);
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

// Create an array of URLs for the skybox images
const skyboxImageURLs = [
    'imgs/arid_bk.jpg', 'imgs/arid_dn.jpg',
    'imgs/arid_ft.jpg', 'imgs/arid_lf.jpg',
    'imgs/arid_rt.jpg', 'imgs/arid_up.jpg'
  ];
  
  // Load textures for the skybox
  const skyboxTextures = new THREE.CubeTextureLoader().load(skyboxImageURLs);
  
  // Create the skybox
  const skyboxMaterial = new THREE.MeshBasicMaterial({ 
    map: skyboxTextures, 
    side: THREE.BackSide
  });
  const skyboxGeometry = new THREE.BoxGeometry(100,100,100);
  const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
  scene.add(skybox);

// Array to hold falling objects
const objects = [];

// Player velocity for X and Z axis
let velocityX = 0;
let velocityZ = 0;

// Player score
let score = 0;


// Generate random falling objects
const addRandomObject = () => {
  const geometries = [
    new THREE.BoxGeometry(),
    new THREE.ConeGeometry(0.5, 1, 62),
    new THREE.CylinderGeometry(0.5, 0.5, 1, 62),
  ];
  const material = new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff });
  const mesh = new THREE.Mesh(geometries[Math.floor(Math.random() * geometries.length)], material);
  mesh.position.y = 5;
  mesh.position.z = (Math.random() - 0.5) * 8;
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
  });

// Update material to respond to lighting
playerMaterial.color.setHex(0x00ff00);
playerMaterial.needsUpdate = true;  


// Render loop (Game Loop)
const animate = () => {
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
    object.position.y -= 0.05;
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
