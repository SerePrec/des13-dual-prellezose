if (process.env.NODE_ENV !== "production") {
  const { config } = await import("dotenv");
  config();
}

const config = {
  PORT: process.env.PORT || 8080,
  mongoDb: {
    connectionString: "mongodb://localhost/des13-dual",
    options: {
      //useNewUrlParser: true, //No necesario desde mongoose 6
      //useUnifiedTopology: true, //No necesario desde mongoose 6
      serverSelectionTimeoutMS: 5000
    },
    advancedOptions: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  mongoDbAtlas: {
    connectionString: process.env.MONGODB_ATLAS_URI,
    options: {
      //useNewUrlParser: true, //No necesario desde mongoose 6
      //useUnifiedTopology: true, //No necesario desde mongoose 6
      serverSelectionTimeoutMS: 5000
    },
    advancedOptions: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  }
};

export default config;
