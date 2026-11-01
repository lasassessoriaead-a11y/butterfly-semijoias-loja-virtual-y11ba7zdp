declare module 'qrcode' {
  interface QrCodeOptions {
    width?: number
    margin?: number
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
    color?: { dark?: string; light?: string }
  }

  interface QrCodeApi {
    toDataURL(value: string, options?: QrCodeOptions): Promise<string>
  }

  const QRCode: QrCodeApi
  export default QRCode
}
