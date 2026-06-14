export interface VietQRConfig {
  bankCode: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  transferContent: string;
}

export function generateVietQRPayment({
  bankCode,
  accountNumber,
  accountName,
  amount,
  transferContent,
}: VietQRConfig): string {
  const encodedName = encodeURIComponent(accountName);
  const encodedContent = encodeURIComponent(transferContent);
  // Using standard public VietQR API endpoint to generate standard payment QR codes.
  return `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact.png?amount=${amount}&addInfo=${encodedContent}&accountName=${encodedName}`;
}
