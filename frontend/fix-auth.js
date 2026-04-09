// Fix user role in localStorage
const userStr = localStorage.getItem('user');
if (userStr) {
  const user = JSON.parse(userStr);
  console.log('Current user role:', user.role);
  
  // Ensure user has talent role
  if (user.role !== 'talent') {
    user.role = 'talent';
    localStorage.setItem('user', JSON.stringify(user));
    console.log('Updated user role to: talent');
    console.log('Please refresh the page and try applying again.');
  } else {
    console.log('User already has talent role');
  }
} else {
  console.log('No user data found in localStorage');
}

// Check token
const token = localStorage.getItem('token');
console.log('Token exists:', !!token);
