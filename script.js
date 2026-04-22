// Check saved theme immediately to prevent FOUC
if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.classList.add('dark');
}

// Force scroll to top on page refresh
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}

// If the URL has a hash (e.g. #projects), remove it so the browser doesn't jump
if (window.location.hash) {
    history.replaceState(null, null, window.location.pathname + window.location.search);
}

// Scroll to top immediately
window.scrollTo(0, 0);

// Also enforce it when the page fully loads just in case
window.addEventListener('load', () => {
    window.scrollTo(0, 0);
    
    // Init Dotted Surface
    const cleanupSurface = initDottedSurface();
    
    // Splash Screen Logic
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen) {
        splashScreen.addEventListener('click', () => {
            splashScreen.classList.add('slide-up');
            document.body.classList.remove('no-scroll');
            
            // Remove from DOM after animation completes
            setTimeout(() => {
                splashScreen.style.display = 'none';
                if (cleanupSurface) cleanupSurface();
            }, 800);
        });
    }
});

// Dotted Surface Three.js Background
function initDottedSurface() {
    const container = document.getElementById('dotted-surface-container');
    if (!container || typeof THREE === 'undefined') return null;

    const SEPARATION = 150;
    const AMOUNTX = 40;
    const AMOUNTY = 60;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xffffff, 2000, 10000);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, 355, 1220);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(scene.fog.color, 0);

    container.appendChild(renderer.domElement);

    const positions = [];
    const colors = [];
    const geometry = new THREE.BufferGeometry();

    for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
            const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
            const y = 0;
            const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;

            positions.push(x, y, z);
            // Match dots to the new Amber primary theme color (#f59e0b -> 0.96, 0.62, 0.04)
            colors.push(0.96, 0.62, 0.04);
        }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 8,
        vertexColors: true,
        transparent: true,
        opacity: 0.5,
        sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let count = 0;
    let animationId;

    const animate = () => {
        animationId = requestAnimationFrame(animate);

        const positionAttribute = geometry.attributes.position;
        const posArray = positionAttribute.array;

        let i = 0;
        for (let ix = 0; ix < AMOUNTX; ix++) {
            for (let iy = 0; iy < AMOUNTY; iy++) {
                const index = i * 3;
                posArray[index + 1] = Math.sin((ix + count) * 0.3) * 50 + Math.sin((iy + count) * 0.5) * 50;
                i++;
            }
        }

        positionAttribute.needsUpdate = true;
        renderer.render(scene, camera);
        count += 0.1;
    };

    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    animate();

    // Cleanup function
    return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationId);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
    };
}

// Initialize Interactive 3D Skill Globe
const myTags = [
    'IT Support', 'Networking', 'Hardware Diagnostics',
    'WordPress', 'Badminton', 'Bouldering', 'Photography',
    'Active Lifestyle', 'Troubleshooting', 'Agile',
    'Problem Solving', 'Teamwork', 'Communication',
    'macOS', 'Windows', 'cPanel', 'Responsive Design'
];

if (document.querySelector('.tagcloud')) {
    var tagCloud = TagCloud('.tagcloud', myTags, {
      radius: window.innerWidth < 768 ? 130 : 400,
      maxSpeed: 'normal',
      initSpeed: 'normal',
      direction: 135,
      keep: true
    });
}

// Set current year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// ── Google Apps Script config ─────────────────────────────────────────────
// Paste your deployed Apps Script URL below (see setup instructions).
// Leave as-is until you have the URL — form will show a friendly error.
const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL';

// Contact form — sends directly via Gmail (Google Apps Script, no mail app)
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const submitBtn    = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        if (APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_URL') {
            submitBtn.textContent = '⚠ Not configured yet';
            submitBtn.style.background = '#f59e0b';
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.style.background = '';
            }, 3000);
            return;
        }

        // Loading state
        submitBtn.textContent = 'Sending…';
        submitBtn.disabled = true;

        const payload = {
            from_name:  document.getElementById('name').value.trim(),
            from_email: document.getElementById('email').value.trim(),
            message:    document.getElementById('message').value.trim(),
        };

        fetch(APPS_SCRIPT_URL, {
            method:  'POST',
            // Apps Script requires text/plain to avoid preflight CORS issues
            headers: { 'Content-Type': 'text/plain' },
            body:    JSON.stringify(payload),
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    submitBtn.textContent = '✓ Message Sent!';
                    submitBtn.style.background = '#10b981';
                    contactForm.reset();
                } else {
                    throw new Error(data.error || 'Unknown error');
                }
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                }, 3500);
            })
            .catch(err => {
                console.error('Send error:', err);
                submitBtn.textContent = '✕ Failed — try again';
                submitBtn.style.background = '#ef4444';
                submitBtn.disabled = false;
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.style.background = '';
                }, 3500);
            });
    });
}



// Hamburger Menu Logic
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when a link is clicked
    document.querySelectorAll('.nav-links a').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }));
}

// Theme Toggle Logic
const themeToggle = document.getElementById('theme-toggle');

if (themeToggle) {
    // Set initial icon based on current theme before Lucide initializes
    if (document.documentElement.classList.contains('dark')) {
        themeToggle.innerHTML = '<i data-lucide="sun"></i>';
    } else {
        themeToggle.innerHTML = '<i data-lucide="moon"></i>';
    }

    themeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        
        if (document.documentElement.classList.contains('dark')) {
            localStorage.setItem('theme', 'dark');
            themeToggle.innerHTML = '<i data-lucide="sun"></i>';
        } else {
            localStorage.setItem('theme', 'light');
            themeToggle.innerHTML = '<i data-lucide="moon"></i>';
        }
        
        // Re-render the new icon
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    });
}

// Initialize Lucide Icons
if (typeof lucide !== 'undefined') {
    lucide.createIcons();
}
