/* eslint-disable */

import { showAlert } from './alerts.js';

const stripe = Stripe(
  'pk_test_51Rps4zE5wmUrUoH3SE3X68hjOEBkAq16C4QH5sUDPP5XwBthNuasQ04edXcVYK3sSNQ4mEcFXyVXMt0r2phT9mtO00KPwyxvVN'
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await fetch(`/api/v1/bookings/checkout-session/${tourId}`);

    const data = await session.json();

    if (!data.session?.id) {
      throw new Error('Falha ao obter sessão de checkout');
    }

    // 2) Create checkout form + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
