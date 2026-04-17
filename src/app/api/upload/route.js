import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const { file } = await request.json(); // Expected base64 string

    if (!file) {
      return NextResponse.json({ error: "No file data provided" }, { status: 400 });
    }

    // Upload to Cloudinary using base64 string
    const uploadResponse = await cloudinary.uploader.upload(file, {
      folder: "crochet_corner_products",
    });

    return NextResponse.json({ url: uploadResponse.secure_url });
  } catch (error) {
    console.log("UPLOAD ERROR DETAILED:", error);
    return NextResponse.json({
      error: "Upload failed",
      details: error.message
    }, { status: 500 });
  }
}
