import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51NZ4bSAcN7x1Z132Eh6S3b4iqF1EfwyF85n6fQZfVglW1fuz9KBckw8IYmKbE4rk3thMiEbfm2qLX7l4ONALP6H800NmqFv70P',
);

export const bookTour = async (tourId) => {
  try {
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`,
    );
    console.log(session);

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
