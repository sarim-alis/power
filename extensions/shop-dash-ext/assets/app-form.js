console.log("App Registration Form loaded!");

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('registration-form');
  if (!form) {
    console.error('Form not found!');
    return;
  }

  const formMessage = document.getElementById('form-message');

  // Show message function
  function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = 'form-message ' + type;
    formMessage.style.display = 'block';
    
    setTimeout(() => {
      formMessage.style.display = 'none';
    }, 5000);
  }

  // Clear errors
  function clearErrors() {
    const errors = document.querySelectorAll('.error-message');
    errors.forEach(error => {
      error.textContent = '';
      error.style.display = 'none';
    });
  }

  // Form submission
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    console.log('Form submitted!');
    clearErrors();

    // Get form data
    const formData = new FormData(form);
    const data = {
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
      terms: formData.get('terms') ? true : false
    };

    console.log('Submitting data:', { ...data, password: '***', confirmPassword: '***' });

    // Show loading
    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    showMessage('Submitting form...', 'info');

    try {
      // ⭐ SAHI WAY: Simple relative URL (no /api/app-proxy!)
      // Shopify automatically forward karega to backend
      const proxyUrl = '/apps/shop-dash';
      
      console.log('Sending request to:', proxyUrl);
      
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);

      if (response.ok && result.success) {
        // ✅ Success
        showMessage(result.message || 'Registration successful! 🎉', 'success');
        form.reset();
      } else {
        // ❌ Error
        showMessage(result.message || 'Failed to submit form', 'error');
      }

    } catch (error) {
      console.error('Submission error:', error);
      showMessage('Network error. Please try again.', 'error');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
});