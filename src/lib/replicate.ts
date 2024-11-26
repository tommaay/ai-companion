import Replicate from 'replicate';

if (!process.env.REPLICATE_API_KEY) {
  throw new Error('REPLICATE_API_KEY is not set');
}

export const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
});
