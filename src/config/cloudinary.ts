import cloudinary from "cloudinary";

const sanitizeConfigValue = (value?: string) =>
  value?.trim().replace(/^<|>$/g, "") || "";

// Configure cloudinary from CLOUDINARY_URL if provided
const configure = () => {
  const url = process.env.CLOUDINARY_URL;

  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY || process.env.API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET || process.env.API_SECRET;

  if (url) {
    try {
      const parsed = new URL(url);
      const parsedApiKey = sanitizeConfigValue(parsed.username);
      const parsedApiSecret = sanitizeConfigValue(parsed.password);
      const parsedCloudName = sanitizeConfigValue(parsed.hostname);

      cloudinary.v2.config({
        cloud_name: parsedCloudName || sanitizeConfigValue(cloud_name),
        api_key: parsedApiKey || sanitizeConfigValue(api_key),
        api_secret: parsedApiSecret || sanitizeConfigValue(api_secret),
        secure: true,
      });
      return;
    } catch (err) {
      // fall through to fallback config
    }
  }

  cloudinary.v2.config({
    cloud_name: sanitizeConfigValue(cloud_name),
    api_key: sanitizeConfigValue(api_key),
    api_secret: sanitizeConfigValue(api_secret),
    secure: true,
  });
};

configure();

export type UploadResult = {
  url: string;
  public_id: string;
};

export const uploadImageBuffer = async (
  buffer: Buffer,
  mimetype: string,
  folder = "rentnest/properties",
): Promise<UploadResult> => {
  // Convert buffer to base64 data URI and upload
  const dataUri = `data:${mimetype};base64,${buffer.toString("base64")}`;

  const result = await cloudinary.v2.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
  });

  return { url: result.secure_url, public_id: result.public_id };
};

export const deleteImageByPublicId = async (publicId: string) => {
  if (!publicId) return;
  try {
    await cloudinary.v2.uploader.destroy(publicId, { resource_type: "image" });
  } catch (err) {
    // Log but don't crash — deletion failures shouldn't block DB operations
    // Console used for minimal dependency; a logging system would be better
    // eslint-disable-next-line no-console
    console.error("Cloudinary delete failed for", publicId, err);
  }
};

export default cloudinary.v2;
