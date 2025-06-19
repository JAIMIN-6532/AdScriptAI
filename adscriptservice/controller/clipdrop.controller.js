import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

export default class ClipDropController {
  async generateImage(prompt) {
    const apiKey = process.env.CLIPDROP_API_KEY;
    if (!apiKey) {
      console.error("❌ Missing CLIPDROP_API_KEY in your environment");
      process.exit(1);
    }

    // Build multipart/form-data body
    const form = new FormData();
    form.append("prompt", prompt);
    // (Optionally you can append width/height etc. if the API supports it:
    // form.append("width", "512");
    // form.append("height", "512");
    // )

    try {
      const response = await axios.post(
        "https://clipdrop-api.co/text-to-image/v1",
        form,
        {
          responseType: "arraybuffer", // we expect a binary PNG back
          headers: {
            "x-api-key": apiKey,
          },
        }
      );

      const base64Image = Buffer.from(response.data, "binary").toString(
        "base64"
      );
      const resultImage = `data:image/png;base64,${base64Image}`;

      const outPath = path.resolve("./output.png");
      fs.writeFileSync(outPath, response.data);
      console.log("✅ Image saved to", outPath);
      return resultImage; // return the base64 image string
    } catch (err) {
      if (err.response) {
        console.error(
          "❌ API error:",
          err.response.status,
          err.response.data.toString()
        );
      } else {
        console.error("❌ Request error:", err.message);
      }
    }
  }
}
