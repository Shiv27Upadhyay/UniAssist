document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;
        
        // Mock submission
        const submitBtn = loginForm.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = 'Authenticating...';
        submitBtn.style.opacity = '0.8';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            console.log('Login Attempted with:', { username, email, password, remember });
            
            // For hackathon demo, maybe store in localStorage
            localStorage.setItem('uniassist_user', JSON.stringify({ username, email }));
            
            alert(`Welcome back, ${username}! (This is a mock login)`);
            
            submitBtn.textContent = originalText;
            submitBtn.style.opacity = '1';
            submitBtn.disabled = false;
            
            // Optionally redirect
            // window.location.href = '/dashboard.html';
        }, 1500);
    });

    // --- MOCK GOOGLE LOGIN LOGIC FOR HACKATHON DEMO ---
    const googleBtn = document.querySelector('.google-btn');
    const googleModal = document.getElementById('googleModal');
    
    googleBtn.addEventListener('click', () => {
        // Show the mock modal instead of real Google SSO
        googleModal.classList.add('visible');
    });
    
    // Close modal if clicked outside
    googleModal.addEventListener('click', (e) => {
        if (e.target === googleModal) {
            googleModal.classList.remove('visible');
        }
    });
    
    // Handle account selection
    const accountItems = document.querySelectorAll('.account-item:not(.add-account)');
    accountItems.forEach(item => {
        item.addEventListener('click', () => {
            const email = item.getAttribute('data-email');
            const name = item.getAttribute('data-name');
            
            // Hide modal
            googleModal.classList.remove('visible');
            
            // Show success
            alert(`Successfully logged in with Google as ${email}`);
            
            // Store data
            localStorage.setItem('uniassist_user', JSON.stringify({ email, name }));
            
            // Optional: window.location.href = '/dashboard.html';
        });
    });
});
