import axios from 'axios';

export const bookTour = async tourId => {
  // 1) Get session from server
  const session = await axios(`http://localhost:3000/api/v1/bookings/create-checkout-session/${tourId}`)
  // 2) Create checkout form + charge credit card
  if (session){
    window.location.href = session.data.session.url;
  }
}