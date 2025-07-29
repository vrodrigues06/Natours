import { showAlert } from './alerts.js';

export const login = async (email, password) => {
  try {
    const res = await fetch('http://127.0.0.1:3333/api/v1/users/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok && data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    } else {
      showAlert('error', data.message || 'Erro ao fazer login');
    }
  } catch (err) {
    showAlert('error', 'Erro na rede. Tente novamente!');
  }
};

export const logout = async () => {
  try {
    const res = await fetch('http://127.0.0.1:3333/api/v1/users/logout', {
      method: 'GET',
    });

    const data = await res.json();

    if (res.ok && data.status === 'success') {
      location.reload(true);
    } else {
      showAlert('error', 'Erro ao sair. Tente novamente.');
    }
  } catch (err) {
    showAlert('error', 'Erro na rede. Tente novamente!');
  }
};
