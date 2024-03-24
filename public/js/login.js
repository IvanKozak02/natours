import { showAlert } from './alerts';

export const login = async (email, password) => {
  try {
    console.log(email, password);
    const res = await fetch('http://localhost:3000/api/v1/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (res.ok) {
      setTimeout(() => {
        showAlert('success', 'You are successfully logged in!')
        location.assign('/')
      }, 1500);
    }
  }catch (err){
    showAlert('error', 'You are not logged in. Please, try again.')
    location.assign('/login')
  }

};

export const logout = async () => {
  try{
    const res = await fetch('http://localhost:3000/api/v1/users/logout');
    if (res.ok){
      location.reload(true)
    }
  }catch (err){
    showAlert('error', 'Logging out. Try again.')
  }
}