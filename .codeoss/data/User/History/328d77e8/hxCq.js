document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const data = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      password: document.getElementById('password').value,
      phone: document.getElementById('phone').value
    };
  
    try {
      const res = await fetch('/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
  
      if (!res.ok) {
        const err = await res.json();
        alert(`❌ Error: ${err.error || 'Unknown error'}`);
        return;
      }
  
      const result = await res.json();
      alert(`✅ ${result.message}`);
    } catch (error) {
      console.error('❌ Fetch failed:', error);
      alert('❌ Failed to connect to the server. Make sure the backend is running.');
    }
  });
  