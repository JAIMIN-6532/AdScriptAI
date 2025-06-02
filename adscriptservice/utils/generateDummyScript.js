/**
 * For now, this function returns a dummy ad script by interpolating the inputs.
 * In production, replace this with an actual AI API call (e.g., via Axios).
 */
export function generateDummyScript(data) {
  // return `
  // ${campaignName.toUpperCase()}
  // =============================
  // Looking for ${productInfo}? We've got you covered!
  // Our product is perfect for ${targetAudience}. ${callToAction}
  // `;

  const generatedAd = {
    generatedAd: `
${data.productName.toUpperCase()}
=============================
Looking for ${data.productInfo}? We've got you covered!
Our product is perfect for ${data.targetAudience}. ${data.tone}
      `,
  };
  return generatedAd.generatedAd.trim(); // Return the ad script without extra whitespace
}
