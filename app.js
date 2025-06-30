import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Variables principales
let scene, camera, renderer, controls;
let robotArmModel = null;
let mixer = null;
const clock = new THREE.Clock();
let scrollY = 0;
let currentScrollY = 0;

// Configuración de secciones
const sections = ['hero', 'technology', 'precision', 'contact'];
let currentSection = 0;

// Configuración de scroll suave
const lerp = (start, end, factor) => start + (end - start) * factor;

// Inicialización
init();
animate();
setupScrollEffects();
setupNavigation();
setupFormHandling();

function init() {
    // Crear escena
    scene = new THREE.Scene();
    
    // Fondo con colores claros y tecnológicos
    const gradientTexture = createGradientTexture();
    scene.background = gradientTexture;
    scene.fog = new THREE.Fog(0xe3f2fd, 20, 80);

    // Configurar cámara
    camera = new THREE.PerspectiveCamera(
        60, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        1000
    );
    camera.position.set(15, 10, 25);

    // Configurar renderer
    renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xf8fffe, 0.1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    
    document.body.appendChild(renderer.domElement);

    // Configurar controles
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enableZoom = true;
    controls.enablePan = false;
    controls.maxPolarAngle = Math.PI / 1.4;
    controls.minDistance = 20;
    controls.maxDistance = 60;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;

    // Configurar iluminación moderna y clara
    setupModernLighting();

    // Crear escena de respaldo tecnológica
    createTechFallbackScene();

    // Cargar modelo base.fbx (brazo robótico)
    loadRobotArmModel();

    // Event listeners
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('scroll', onScroll);
}

function createGradientTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    
    // Gradiente tecnológico claro
    const gradient = context.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#f8fffe');
    gradient.addColorStop(0.5, '#e3f2fd');
    gradient.addColorStop(1, '#bee9e8');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 512, 512);
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

function setupModernLighting() {
    // Luz ambiental clara
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Luz hemisférica con tonos tecnológicos
    const hemisphereLight = new THREE.HemisphereLight(0xe3f2fd, 0x90e0ef, 0.6);
    hemisphereLight.position.set(0, 20, 0);
    scene.add(hemisphereLight);

    // Luz direccional principal brillante
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(20, 25, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 100;
    scene.add(dirLight);

    // Luces de acento tecnológicas
    const accentLight1 = new THREE.PointLight(0x00b4d8, 1.2, 50);
    accentLight1.position.set(-20, 15, 20);
    scene.add(accentLight1);

    const accentLight2 = new THREE.PointLight(0x90e0ef, 1.0, 45);
    accentLight2.position.set(20, -10, -20);
    scene.add(accentLight2);

    const accentLight3 = new THREE.PointLight(0x06ffa5, 0.8, 40);
    accentLight3.position.set(0, -15, 25);
    scene.add(accentLight3);

    // Spotlight focalizado en el brazo
    const spotLight = new THREE.SpotLight(0xffffff, 2.0);
    spotLight.position.set(0, 30, 30);
    spotLight.target.position.set(0, 0, 0);
    spotLight.angle = Math.PI / 5;
    spotLight.penumbra = 0.2;
    spotLight.decay = 1;
    spotLight.distance = 80;
    spotLight.castShadow = true;
    scene.add(spotLight);
    scene.add(spotLight.target);
}

function createTechFallbackScene() {
    // Crear plataforma tecnológica
    const platformGeometry = new THREE.CylinderGeometry(12, 12, 0.5, 32);
    const platformMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xe3f2fd,
        metalness: 0.1,
        roughness: 0.2,
        transparent: true,
        opacity: 0.3
    });
    
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.set(0, -8, 0);
    platform.receiveShadow = true;
    scene.add(platform);

    // Crear geometría de respaldo del brazo robótico
    const armGeometry = new THREE.BoxGeometry(3, 12, 3);
    const armMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x00b4d8,
        metalness: 0.8,
        roughness: 0.2,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
    });
    
    const armMesh = new THREE.Mesh(armGeometry, armMaterial);
    armMesh.position.set(0, -2, 0);
    armMesh.userData.isFallback = true;
    armMesh.castShadow = true;
    armMesh.receiveShadow = true;
    scene.add(armMesh);

    // Añadir partículas tecnológicas flotantes
    createTechParticles();
    
    console.log('🤖 Escena tecnológica de respaldo creada');
}

function createTechParticles() {
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 150;
    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount * 3; i += 3) {
        // Posiciones aleatorias
        posArray[i] = (Math.random() - 0.5) * 100;
        posArray[i + 1] = (Math.random() - 0.5) * 60;
        posArray[i + 2] = (Math.random() - 0.5) * 100;
        
        // Colores tecnológicos
        const colorChoice = Math.random();
        if (colorChoice < 0.3) {
            colorArray[i] = 0; colorArray[i + 1] = 0.7; colorArray[i + 2] = 0.85; // Azul
        } else if (colorChoice < 0.6) {
            colorArray[i] = 0.56; colorArray[i + 1] = 0.88; colorArray[i + 2] = 0.94; // Cyan
        } else {
            colorArray[i] = 0.02; colorArray[i + 1] = 1; colorArray[i + 2] = 0.65; // Verde tech
        }
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.012,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
}

function loadRobotArmModel() {
    const loader = new FBXLoader();
    
    loader.load(
        'base.fbx',
        (object) => {
            // Remover geometría de respaldo
            const fallbackMesh = scene.children.find(child => child.userData.isFallback);
            if (fallbackMesh) {
                scene.remove(fallbackMesh);
            }

            // Configurar modelo con escala ideal memorizada
            object.scale.setScalar(0.1); // Escala ideal para base.fbx
            object.position.set(0, -8, 0);
            
            console.log('🤖 === BASE.FBX (BRAZO ROBÓTICO) CARGADO ===');
            console.log('📏 Escala aplicada: 0.1 (TAMAÑO IDEAL)');
            console.log('📦 Posición: (0, -8, 0)');
            
            // Calcular bounding box
            const box = new THREE.Box3().setFromObject(object);
            const size = box.getSize(new THREE.Vector3());
            console.log(`📊 Tamaño real: ${size.x.toFixed(2)} x ${size.y.toFixed(2)} x ${size.z.toFixed(2)}`);
            
            // Aplicar materiales tecnológicos y modernos
            object.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    
                    if (child.material) {
                        const materials = Array.isArray(child.material) ? child.material : [child.material];
                        
                        materials.forEach((material) => {
                            // Convertir a material físico moderno
                            if (material.isMeshStandardMaterial || material.isMeshLambertMaterial) {
                                material.metalness = 0.7;
                                material.roughness = 0.3;
                                material.clearcoat = 0.8;
                                material.clearcoatRoughness = 0.2;
                            }
                            
                            material.transparent = false;
                            material.opacity = 1.0;
                            material.needsUpdate = true;
                            
                            // Colores tecnológicos modernos
                            if (material.color) {
                                const originalColor = material.color.getHex();
                                if (originalColor < 0x444444) {
                                    material.color.setHex(0x00b4d8); // Azul tecnológico
                                    material.emissive.setHex(0x001a2e);
                                } else {
                                    material.color.setHex(0x90e0ef); // Cyan claro
                                    material.emissive.setHex(0x023047);
                                }
                            }
                        });
                    }
                }
            });
            
            // Asignar userData
            object.userData.isRobotArm = true;
            object.userData.originalPosition = { x: 0, y: -8, z: 0 };
            
            robotArmModel = object;
            scene.add(object);
            
            // Configurar animaciones si existen
            if (object.animations && object.animations.length > 0) {
                mixer = new THREE.AnimationMixer(object);
                
                object.animations.forEach((clip, index) => {
                    const action = mixer.clipAction(clip);
                    action.setLoop(THREE.LoopRepeat);
                    action.clampWhenFinished = false;
                    action.enabled = true;
                    action.setEffectiveTimeScale(0.8); // Velocidad más lenta y elegante
                    action.setEffectiveWeight(1.0);
                    action.play();
                    console.log(`🎬 Animación ${index + 1} del brazo robótico ACTIVADA`);
                });
                
                console.log(`🎞️ Mixer configurado con ${object.animations.length} animaciones`);
            } else {
                console.log('ℹ️ base.fbx no tiene animaciones incluidas');
            }
            
            console.log('✅ Brazo robótico listo para demostración');
        },
        (progress) => {
            if (progress.total > 0) {
                const percentage = (progress.loaded / progress.total * 100).toFixed(1);
                console.log(`📈 Cargando brazo robótico: ${percentage}%`);
            }
        },
        (error) => {
            console.error('❌ ERROR cargando base.fbx:', error);
            console.log('🔄 Manteniendo geometría de respaldo tecnológica');
        }
    );
}

function onScroll() {
    scrollY = window.pageYOffset;
    updateCurrentSection();
}

function updateCurrentSection() {
    const windowHeight = window.innerHeight;
    const newSection = Math.floor(scrollY / windowHeight);
    
    if (newSection !== currentSection && newSection < sections.length) {
        currentSection = newSection;
        console.log(`📍 Sección actual: ${sections[currentSection]}`);
        updateRobotArmForSection();
    }
}

function updateRobotArmForSection() {
    if (!robotArmModel) return;
    
    // Cambiar autorotación según la sección
    switch (currentSection) {
        case 0: // Hero
            controls.autoRotateSpeed = 0.8;
            break;
        case 1: // Technology
            controls.autoRotateSpeed = 1.2;
            break;
        case 2: // Precision
            controls.autoRotateSpeed = 0.5;
            break;
        case 3: // Contact
            controls.autoRotateSpeed = 1.5;
            break;
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateScrollAnimations() {
    const maxScroll = (sections.length - 1) * window.innerHeight;
    const scrollProgress = Math.min(scrollY / maxScroll, 1);
    
    // Actualizar barra de progreso
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        progressBar.style.transform = `scaleX(${scrollProgress})`;
    }

    // Smooth scroll interpolation
    currentScrollY = lerp(currentScrollY, scrollY, 0.1);
    const smoothProgress = Math.min(currentScrollY / maxScroll, 1);

    // Actualizar animación original del brazo robótico
    if (mixer) {
        const deltaTime = clock.getDelta();
        mixer.update(deltaTime);
        
        // Control de velocidad basado en sección
        if (mixer._actions.length > 0) {
            mixer._actions.forEach((action) => {
                const speedMultiplier = 0.5 + (smoothProgress * 0.8) + (currentSection * 0.2);
                action.setEffectiveTimeScale(speedMultiplier);
            });
        }
    }

    // Animar brazo robótico basado en la sección
    if (robotArmModel) {
        animateRobotArmBySection(smoothProgress);
    }

    // Animar modelo de respaldo si existe
    const fallbackMesh = scene.children.find(child => child.userData.isFallback);
    if (fallbackMesh) {
        animateFallbackRobotArm(fallbackMesh);
    }

    // Animar cámara basada en secciones
    animateCameraBySection(smoothProgress);
    
    // Animar luces tecnológicas
    animateTechLights();
}

function animateRobotArmBySection(progress) {
    const time = clock.getElapsedTime();
    
    // Efectos adicionales por sección (SIN interferir con animación original)
    switch (currentSection) {
        case 0: // Hero - Rotación base suave
            robotArmModel.rotation.y = time * 0.1 + progress * Math.PI;
            break;
            
        case 1: // Technology - Presentación técnica
            robotArmModel.rotation.y = time * 0.15 + progress * Math.PI * 2;
            robotArmModel.position.x = Math.sin(time * 0.3) * 2;
            break;
            
        case 2: // Precision - Movimiento preciso
            robotArmModel.rotation.y = time * 0.2 + progress * Math.PI * 3;
            robotArmModel.position.z = Math.cos(time * 0.2) * 3;
            break;
            
        case 3: // Contact - Demostración activa
            robotArmModel.rotation.y = time * 0.25 + progress * Math.PI * 4;
            robotArmModel.position.x = Math.sin(time * 0.4) * 1.5;
            robotArmModel.position.z = Math.cos(time * 0.3) * 1.5;
            break;
    }
    
    // Efectos de color tecnológicos dinámicos
    robotArmModel.traverse((child) => {
        if (child.isMesh && child.material && child.material.color) {
            const basehue = 0.55; // Azul tecnológico base
            const hueVariation = (time * 0.05 + currentSection * 0.1) % 0.2;
            const finalHue = basehue + hueVariation;
            
            const saturation = 0.8 + Math.sin(time * 0.2) * 0.1;
            const lightness = 0.6 + Math.cos(time * 0.15) * 0.2;
            
            child.material.color.setHSL(finalHue, saturation, lightness);
            
            if (child.material.emissive) {
                child.material.emissive.setHSL(finalHue, saturation * 0.5, lightness * 0.1);
            }
        }
    });
    
    console.log(`🤖 Brazo robótico operando en sección ${sections[currentSection]}`);
}

function animateFallbackRobotArm(fallbackMesh) {
    const time = clock.getElapsedTime();
    
    // Mantener posición base y añadir movimientos robóticos
    fallbackMesh.position.y = -2 + Math.sin(time * 0.8) * 2;
    fallbackMesh.rotation.y = time * 0.3;
    fallbackMesh.rotation.x = Math.sin(time * 0.5) * 0.2;
    fallbackMesh.rotation.z = Math.cos(time * 0.4) * 0.1;
    
    // Colores tecnológicos
    const hue = (time * 0.05) % 1;
    fallbackMesh.material.color.setHSL(0.55 + hue * 0.1, 0.8, 0.6);
}

function animateCameraBySection(progress) {
    const targetPositions = [
        { x: 15, y: 10, z: 25 },  // Hero - Vista general
        { x: -20, y: 15, z: 30 }, // Technology - Vista lateral técnica
        { x: 25, y: 5, z: 20 },   // Precision - Vista de precisión
        { x: 0, y: 20, z: 40 }    // Contact - Vista panorámica
    ];
    
    const currentPos = targetPositions[currentSection] || targetPositions[0];
    
    camera.position.x = lerp(camera.position.x, currentPos.x, 0.03);
    camera.position.y = lerp(camera.position.y, currentPos.y, 0.03);
    camera.position.z = lerp(camera.position.z, currentPos.z, 0.03);
}

function animateTechLights() {
    const time = clock.getElapsedTime();
    
    // Animar luces de acento con patrones tecnológicos
    scene.children.forEach((child) => {
        if (child.isPointLight) {
            // Intensidad pulsante
            child.intensity = 0.8 + Math.sin(time * 0.8 + child.position.x * 0.1) * 0.4;
            
            // Colores tecnológicos cíclicos
            const baseHue = 0.55; // Azul tecnológico
            const hueShift = (time * 0.03 + child.position.x * 0.01) % 0.3;
            child.color.setHSL(baseHue + hueShift, 0.9, 0.7);
        }
        
        if (child.isSpotLight) {
            // Spotlight con intensidad variable
            child.intensity = 1.5 + Math.sin(time * 0.5) * 0.5;
        }
    });
}

function setupScrollEffects() {
    // Intersection Observer para animaciones tecnológicas
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Efectos adicionales para elementos tech
                if (entry.target.classList.contains('tech-card')) {
                    entry.target.style.animationDelay = '0.1s';
                }
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observar elementos animables
    document.querySelectorAll('.tech-card, .feature-item, .metric').forEach((element) => {
        observer.observe(element);
    });
}

function setupNavigation() {
    // Navegación suave mejorada
    document.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Efecto visual en el link activo
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });
    
    // Resaltar enlace activo basado en scroll
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach((section) => {
            const element = document.getElementById(section);
            if (element) {
                const rect = element.getBoundingClientRect();
                if (rect.top <= 150) {
                    current = section;
                }
            }
        });
        
        document.querySelectorAll('.nav-link').forEach((link) => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

function setupFormHandling() {
    const form = document.querySelector('.demo-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Simular envío del formulario
            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            
            submitButton.textContent = 'Enviando...';
            submitButton.disabled = true;
            
            // Simular proceso de envío
            setTimeout(() => {
                submitButton.textContent = '✅ Demo Agendada';
                submitButton.style.background = 'var(--gradient-accent)';
                
                // Mostrar mensaje de éxito
                showSuccessMessage();
                
                setTimeout(() => {
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                    submitButton.style.background = 'var(--gradient-primary)';
                    form.reset();
                }, 3000);
            }, 2000);
        });
    }
}

function showSuccessMessage() {
    // Crear mensaje de éxito temporal
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--gradient-accent);
        color: var(--text-primary);
        padding: 2rem 3rem;
        border-radius: 16px;
        box-shadow: var(--shadow-heavy);
        z-index: 10000;
        text-align: center;
        font-weight: 600;
        animation: successPulse 0.5s ease-out;
    `;
    
    message.innerHTML = `
        <div style="font-size: 3rem; margin-bottom: 1rem;">🤖</div>
        <div style="font-size: 1.2rem; margin-bottom: 0.5rem;">¡Demo Agendada!</div>
        <div style="font-size: 0.9rem; opacity: 0.8;">Te contactaremos pronto</div>
    `;
    
    document.body.appendChild(message);
    
    // Añadir animación CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes successPulse {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
    `;
    document.head.appendChild(style);
    
    // Remover mensaje después de 3 segundos
    setTimeout(() => {
        message.style.transition = 'all 0.3s ease-out';
        message.style.opacity = '0';
        message.style.transform = 'translate(-50%, -50%) scale(0.8)';
        
        setTimeout(() => {
            document.body.removeChild(message);
            document.head.removeChild(style);
        }, 300);
    }, 2700);
}

// Efectos adicionales al cargar la página
window.addEventListener('load', () => {
    // Animación de entrada para elementos hero
    setTimeout(() => {
        document.querySelectorAll('.hero-content > *').forEach((element, index) => {
            element.style.animationDelay = `${index * 0.1}s`;
        });
    }, 100);
    
    console.log('🚀 RoboArm Pro Landing cargada completamente');
});

function animate() {
    requestAnimationFrame(animate);

    // Actualizar animaciones basadas en scroll
    updateScrollAnimations();

    // Actualizar controles
    controls.update();

    // Renderizar escena
    renderer.render(scene, camera);
}