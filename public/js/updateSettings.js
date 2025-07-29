import { showAlert } from './alerts.js';

// type é 'password' ou 'data'
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://127.0.0.1:3333/api/v1/users/update-password'
        : 'http://127.0.0.1:3333/api/v1/users/update-me';

    const options = {
      method: 'PATCH',
      body: data,
    };

    if (!(data instanceof FormData)) {
      options.headers = {
        'Content-Type': 'application/json',
      };
      options.body = JSON.stringify(data);
    }

    const res = await fetch(url, options);

    const resData = await res.json();

    if (res.ok && resData.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
    } else {
      showAlert('error', resData.message || 'Erro ao atualizar');
    }
  } catch (err) {
    showAlert('error', 'Erro na rede. Tente novamente!');
  }
};
