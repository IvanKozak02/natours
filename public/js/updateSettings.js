import { showAlert } from './alerts';
import axios from 'axios';

export const updateSettings = async (data, type, endpoint) => {
  try{
    const res = await axios({
      method: 'PATCH',
      url: `http://localhost:3000/api/v1/users/${endpoint}`,
      data
    })
    // const res = await fetch(`http://localhost:3000/api/v1/users/${endpoint}`,{
    //   method: 'PATCH',
    //   body: data,
    //   headers:{
    //     'Content-Type': 'multipart/form-data; boundary=<calculated when request is sent>'
    //   }
    // });
    if (res.data.status === 'success'){
      showAlert('success', `${type.toUpperCase()} updated successfully.`)
    }

  }catch (err){
    showAlert('error', 'Cannot update your data. Please, try again later.')
  }
}

export const updatePassword = async (password,passwordConfirm) => {
  try {
    const res = await fetch('http://localhost:3000/api/v1/users/update-my-password',{
      method: 'PATCH',
      body: JSON.stringify({password, passwordConfirm})
    })
    if (res.ok){
      showAlert('success', 'Your password was updated successfully.')
    }

  }catch (err){
    showAlert('error', 'Cannot update your password. Try again later.')
  }
}