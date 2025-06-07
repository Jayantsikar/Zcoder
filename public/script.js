document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const togglePassword = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');
  const loginForm = document.getElementById('loginForm');
  const errorDisplay = document.getElementById('errorDisplay');
  const loginBtn = document.querySelector('.auth-btn');

  // Password toggle functionality
  togglePassword.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.textContent = type === 'password' ? 'Show' : 'Hide';
  });

  // Form animation on focus
  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      this.parentElement.style.transform = 'scale(1.02)';
    });
    
    input.addEventListener('blur', function() {
      this.parentElement.style.transform = 'scale(1)';
    });
  });

  // Form submission
  loginForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  // Get form values
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Set loading state
  loginBtn.innerHTML = 'Signing in...';
  loginBtn.disabled = true;

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    
    // Store token and user data
    console.log('Token received:', data.token);
    localStorage.setItem('token', data.token);
    console.log('Token stored:', localStorage.getItem('token'));
    
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Redirect
    window.location.href = '/success.html';
    
  } catch (error) {
    errorDisplay.textContent = error.message;
    errorDisplay.style.display = 'block';
  } finally {
    loginBtn.innerHTML = 'Sign In';
    loginBtn.disabled = false;
  }
});
});