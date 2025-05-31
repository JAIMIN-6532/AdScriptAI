/**
 * For now, this function returns a dummy ad script by interpolating the inputs.
 * In production, replace this with an actual AI API call (e.g., via Axios).
 */
export function generateDummyScript({ campaignName, productInfo, targetAudience, callToAction }) {
    return `
    ${campaignName.toUpperCase()}
    =============================
    Looking for ${productInfo}? We've got you covered!
    Our product is perfect for ${targetAudience}. ${callToAction}
    `;
  }
  