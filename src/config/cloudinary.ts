import cloudinary from "cloudinary";

// Configure cloudinary from CLOUDINARY_URL if provided
const configure = () => {
  const url = process.env.CLOUDINARY_URL;

  if (url) {
    try {
      const parsed = new URL(url);
      const api_key = parsed.username;
      const api_secret = parsed.password;
      const cloud_name = parsed.hostname;

      cloudinary.v2.config({ cloud_name, api_key, api_secret, secure: true });
    } catch (err) {
      // If parsing fails, fall back to env vars if present
      cloudinary.v2.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY || process.env.API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET || process.env.API_SECRET,
        secure: true,
      });
    }
  } else {
    cloudinary.v2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY || process.env.API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET || process.env.API_SECRET,
      secure: true,
    });
  }
};

configure();

export const uploadImageBuffer = async (
  buffer: Buffer,
  mimetype: string,
  folder = "rentnest/properties",
): Promise<string> => {
  // Convert buffer to base64 data URI and upload
  const dataUri = `data:${mimetype};base64,${buffer.toString("base64")}`;

  const result = await cloudinary.v2.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
  });

  return result.secure_url;
};

export default cloudinary.v2;
