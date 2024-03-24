import { login, logout } from './login.js';
import { displayMap } from './mapbox.js';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';


const logoutBtn = document.querySelector('.nav__el--logout');
if (logoutBtn) {
  document.querySelector('.nav__el--logout').addEventListener('click', (e) => {
    logout();
  });
}

const mapEl = document.querySelector('#map');
const bookToor = document.querySelector('#book-tour');


if (mapEl) {
  const locations = JSON.parse(mapEl.dataset.location);
  displayMap(locations);
}

//
// document.querySelector('.login-form').addEventListener('submit', (e) => {
//   e.preventDefault();
//   const email = document.querySelector('#email').value;
//   const password = document.querySelector('#password').value;
//   login(email, password);
// });

// document.querySelector('.form-user-data').addEventListener('submit', (e) => {
//   e.preventDefault();
//   console.log(document.querySelector('#name').value);
//   const form = new FormData();    // like multipart/formData
//   form.append('name', document.querySelector('#name').value);
//   form.append('email', document.querySelector('#email').value);
//   form.append('photo', document.querySelector('#photo').files[0]);
//   console.log(document.querySelector('#photo').files);
//
//   updateSettings(form, 'data', 'update-me');
// });

// document.querySelector('.form-user-settings').addEventListener('submit', async (e) => {
//   e.preventDefault();
//   const currentPassword = document.querySelector('#password-current').value;
//   const password = document.querySelector('#password').value;
//   const passwordConfirm = document.querySelector('#password-confirm').value;
//   const saveBtn = document.querySelector('.form-user-settings').querySelector('button')
//   saveBtn.textContent = 'Saving new password...'
//   await updateSettings({ currentPassword, password, passwordConfirm }, 'password', 'update-my-password');
//   document.querySelector('#password-current').value = '';
//   document.querySelector('#password').value = '';
//   document.querySelector('#password-confirm').value = '';
//   saveBtn.textContent = 'Save password'
// });

if(bookToor){
  bookTour.addEventListener('click', (e)=>{
    bookTour(e.target.dataset.tourId);
  })
}

