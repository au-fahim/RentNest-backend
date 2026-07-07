import "dotenv/config";
import app from "./app.js";
// import dotenv from "dotenv";

// dotenv.config();

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

bootstrap();
