export interface ContentItem {
  id: string;
  name: string;
  modelDataUrl: string; // From File
  audioDataUrl: string; // From File
  qrCodeUrl: string;    // Generated Data URL for the QR code image
}
