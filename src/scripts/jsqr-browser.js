// Simple QR code scanner implementation
const jsQR = {
  // Main scanning function
  default: function(imageData, width, height) {
    // This is a simplified implementation
    // In a real app, you'd want to use a proper QR code scanning library
    return {
      data: null, // The decoded data
      location: {
        topLeftCorner: { x: 0, y: 0 },
        topRightCorner: { x: width, y: 0 },
        bottomLeftCorner: { x: 0, y: height },
        bottomRightCorner: { x: width, y: height }
      }
    };
  }
};

export default jsQR.default; 