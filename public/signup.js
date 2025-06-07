document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const togglePassword = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');
  const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const passwordStrength = document.getElementById('passwordStrength');
  const firstNameInput = document.getElementById('firstName');
  const lastNameInput = document.getElementById('lastName');
  const avatarInitialsInput = document.getElementById('avatarInitials');
  const initialsPreview = document.getElementById('initialsPreview');
  const signupForm = document.getElementById('signupForm');
  const signupBtn = document.querySelector('.auth-btn');

  // Password toggle functionality
  togglePassword.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.textContent = type === 'password' ? 'Show' : 'Hide';
  });

  toggleConfirmPassword.addEventListener('click', function() {
    const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    confirmPasswordInput.setAttribute('type', type);
    this.textContent = type === 'password' ? 'Show' : 'Hide';
  });

    signupForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Check password match
    if (passwordInput.value !== confirmPasswordInput.value) {
      validatePasswords();
      return;
    }

    // Show loading state
    signupBtn.innerHTML = '<span style="opacity: 0.7;">Creating account...</span>';
    signupBtn.style.opacity = '0.8';
    signupBtn.disabled = true;

    try {
      // Get all form data
      const formData = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        password: passwordInput.value,
        firstName: firstNameInput.value,
        lastName: lastNameInput.value,
        country: document.getElementById('country').value,
        university: document.getElementById('university').value,
        major: document.getElementById('major').value
      };

      // Send to server
      const response = await fetch('/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(formData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // Redirect on success
      window.location.href = '/login.html';
      
    } catch (error) {
      console.error('Signup error:', error);
      alert(error.message);
      
      // Reset button state
      signupBtn.innerHTML = 'Create ZCoder Account';
      signupBtn.style.opacity = '1';
      signupBtn.disabled = false;
    }
  });
  
  // Avatar initials functionality
  function updateInitials() {
    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const customInitials = avatarInitialsInput.value.trim();
    
    if (customInitials) {
      initialsPreview.textContent = customInitials.toUpperCase().substring(0, 2);
    } else if (firstName && lastName) {
      initialsPreview.textContent = 
        (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    } else if (firstName) {
      initialsPreview.textContent = firstName.charAt(0).toUpperCase();
    } else if (lastName) {
      initialsPreview.textContent = lastName.charAt(0).toUpperCase();
    } else {
      initialsPreview.textContent = 'AK';
    }
  }

  firstNameInput.addEventListener('input', updateInitials);
  lastNameInput.addEventListener('input', updateInitials);
  avatarInitialsInput.addEventListener('input', updateInitials);

  // Password strength indicator
  passwordInput.addEventListener('input', function() {
    const password = this.value;
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    // Update strength meter
    passwordStrength.className = 'password-strength-fill';
    if (password.length === 0) {
      passwordStrength.style.width = '0%';
    } else if (strength <= 2) {
      passwordStrength.classList.add('password-strength-weak');
      passwordStrength.style.width = '25%';
    } else if (strength <= 3) {
      passwordStrength.classList.add('password-strength-medium');
      passwordStrength.style.width = '50%';
    } else if (strength <= 4) {
      passwordStrength.classList.add('password-strength-strong');
      passwordStrength.style.width = '75%';
    } else {
      passwordStrength.classList.add('password-strength-very-strong');
      passwordStrength.style.width = '100%';
    }
  });

  // Password confirmation validation
  function validatePasswords() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (confirmPassword && password !== confirmPassword) {
      confirmPasswordInput.setCustomValidity('Passwords do not match');
      confirmPasswordInput.style.borderColor = '#ef4444';
      confirmPasswordInput.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
    } else {
      confirmPasswordInput.setCustomValidity('');
      confirmPasswordInput.style.borderColor = '#e2e8f0';
      confirmPasswordInput.style.boxShadow = 'none';
    }
  }

  confirmPasswordInput.addEventListener('input', validatePasswords);
  passwordInput.addEventListener('input', validatePasswords);

  // Form animation on focus
  const inputs = document.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      this.parentElement.style.transform = 'scale(1.02)';
    });
    
    input.addEventListener('blur', function() {
      this.parentElement.style.transform = 'scale(1)';
    });
  });

  // Form submission
  signupForm.addEventListener('submit', function(e) {
    // Check password match before submitting
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (password !== confirmPassword) {
      e.preventDefault();
      validatePasswords();
      return;
    }
    
    // Show loading state
    signupBtn.innerHTML = '<span style="opacity: 0.7;">Creating account...</span>';
    signupBtn.style.opacity = '0.8';
    signupBtn.disabled = true;
  });

  // Initialize initials preview
  updateInitials();
});