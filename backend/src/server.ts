import app from './app';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[TransitOps Core Active]: Listening over port connectivity context: ${PORT}`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled System Rejection context detected:', reason);
});