const shutdown = (server, mongoose) => {
  return async (signal) => {
    console.log(`\nReceived ${signal}. Closing server gracefully...`);
    try {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) return reject(err);
          resolve();
        });
      });
      await mongoose.connection.close(false);
      console.log("MongoDB connection closed.");
      process.exit(0);
    } catch (err) {
      console.error("Error during shutdown", err);
      process.exit(1);
    }
  };
};

module.exports = { shutdown };
