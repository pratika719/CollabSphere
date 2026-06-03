import { v2 as cloudinary } from "cloudinary";

// ---------------------------------------------------------------------------
// Cloudinary SDK Configuration
// ---------------------------------------------------------------------------
// Single source of truth for the Cloudinary connection.
// Uses v2 (current stable API). Reads credentials from environment variables.
//
// If you ever switch cloud providers (e.g. to AWS S3), swap this file only.
// ---------------------------------------------------------------------------

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
console.log(process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_API_SECRET)
export default cloudinary;
