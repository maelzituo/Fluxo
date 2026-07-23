/**
 * Utility for generating authentic Brazilian Pix (BR Code / EMV QRCPS) copy-and-paste codes
 * and computing the exact CRC16 CCITT checksum.
 */

// Format length helper (adds leading zeros if < 10)
function formatTag(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

// CRC16 CCITT (0x1021, init 0xFFFF) calculation according to EMV standard
export function calculateCRC16(str: string): string {
  let crc = 0xffff;
  const polynomial = 0x1021;

  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    for (let bit = 0; bit < 8; bit++) {
      const bit1 = ((crc >> 15) ^ (code >> (7 - bit))) & 1;
      crc = (crc << 1) & 0xffff;
      if (bit1 === 1) {
        crc = (crc ^ polynomial) & 0xffff;
      }
    }
  }

  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, "0");
}

export interface PixPayloadParams {
  key: string;            // E.g. "+5551998320968" or "51998320968"
  merchantName: string;   // E.g. "ISMAEL DUARTE ORRICO"
  merchantCity: string;   // E.g. "PORTO ALEGRE"
  amount: number;         // E.g. 12.90
  txId?: string;          // Default "***"
}

export function generatePixPayload({
  key,
  merchantName,
  merchantCity,
  amount,
  txId = "***",
}: PixPayloadParams): string {
  // Clean key and normalize format
  let cleanKey = key.trim();
  // For phone keys without +, prepend +55 if numeric only and 10-11 digits
  if (/^\d{10,11}$/.test(cleanKey)) {
    cleanKey = `+55${cleanKey}`;
  }

  // Tag 26: Merchant Account Information
  const guiTag = formatTag("00", "br.gov.bcb.pix");
  const keyTag = formatTag("01", cleanKey);
  const tag26 = formatTag("26", `${guiTag}${keyTag}`);

  // Tag 52: Merchant Category Code
  const tag52 = formatTag("52", "0000");

  // Tag 53: Transaction Currency (986 = BRL)
  const tag53 = formatTag("53", "986");

  // Tag 54: Transaction Amount
  const formattedAmount = amount.toFixed(2);
  const tag54 = formatTag("54", formattedAmount);

  // Tag 58: Country Code
  const tag58 = formatTag("58", "BR");

  // Tag 59: Merchant Name (Clean accents, uppercase, max 25 chars)
  const cleanName = merchantName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .slice(0, 25);
  const tag59 = formatTag("59", cleanName);

  // Tag 60: Merchant City (Clean accents, uppercase, max 15 chars)
  const cleanCity = merchantCity
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .slice(0, 15);
  const tag60 = formatTag("60", cleanCity);

  // Tag 62: Additional Data Field Template (TxID)
  const tag05 = formatTag("05", txId);
  const tag62 = formatTag("62", tag05);

  // Concatenate up to Tag 63
  const rawPayload = `000201${tag26}${tag52}${tag53}${tag54}${tag58}${tag59}${tag60}${tag62}6304`;

  // Calculate CRC16
  const checksum = calculateCRC16(rawPayload);

  return `${rawPayload}${checksum}`;
}
