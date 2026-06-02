// src/core/intelligence/geo/asia-pacific.ts

export interface GeoCountryContext {
  countryName: string;
  standardCurrency: string;
  currencySymbol: string;
  defaultPricePerSqftUSD: number;
  averageResidentialYield: number;
  validationRegexString: string;
  marketVolatilityIndex: "LOW" | "MEDIUM" | "HIGH";
}

export const APAC_GEO_REGISTRY: Record<string, GeoCountryContext> = {
  // ─── EAST ASIA ───
  CN: {
    countryName: "China",
    standardCurrency: "CNY",
    currencySymbol: "¥",
    defaultPricePerSqftUSD: 85.0,
    averageResidentialYield: 2.10,
    validationRegexString: "^(?:¥|CNY|RMB)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?|\\d+(?:\\.\\d{1,2})?)\\s*(?:万|亿)?\\s*(?:元|人民币)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  JP: {
    countryName: "Japan",
    standardCurrency: "JPY",
    currencySymbol: "¥",
    defaultPricePerSqftUSD: 320.0,
    averageResidentialYield: 3.80,
    validationRegexString: "^(?:¥|JPY|円)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?|\\d+(?:\\.\\d{1,2})?)\\s*(?:万|億)?\\s*(?:円)?$",
    marketVolatilityIndex: "LOW"
  },
  KR: {
    countryName: "South Korea",
    standardCurrency: "KRW",
    currencySymbol: "₩",
    defaultPricePerSqftUSD: 180.0,
    averageResidentialYield: 2.50,
    validationRegexString: "^(?:₩|KRW)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?|\\d+(?:\\.\\d{1,2})?)\\s*(?:만|억)?\\s*(?:원)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  KP: {
    countryName: "North Korea",
    standardCurrency: "KPW",
    currencySymbol: "₩",
    defaultPricePerSqftUSD: 0.0,
    averageResidentialYield: 0.0,
    validationRegexString: "^(?:₩|KPW)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?|\\d+(?:\\.\\d{1,2})?)\\s*(?:원)?$",
    marketVolatilityIndex: "HIGH"
  },
  MN: {
    countryName: "Mongolia",
    standardCurrency: "MNT",
    currencySymbol: "₮",
    defaultPricePerSqftUSD: 45.0,
    averageResidentialYield: 4.50,
    validationRegexString: "^(?:₮|MNT)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?|\\d+(?:\\.\\d{1,2})?)\\s*(?:төгрөг)?$",
    marketVolatilityIndex: "HIGH"
  },
  TW: {
    countryName: "Taiwan",
    standardCurrency: "TWD",
    currencySymbol: "NT$",
    defaultPricePerSqftUSD: 220.0,
    averageResidentialYield: 2.20,
    validationRegexString: "^(?:NT\\$|TWD|NTD)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?|\\d+(?:\\.\\d{1,2})?)\\s*(?:萬|億)?\\s*(?:元)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  HK: {
    countryName: "Hong Kong",
    standardCurrency: "HKD",
    currencySymbol: "HK$",
    defaultPricePerSqftUSD: 850.0,
    averageResidentialYield: 2.00,
    validationRegexString: "^(?:HK\\$|HKD)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?|\\d+(?:\\.\\d{1,2})?)\\s*(?:萬|億)?\\s*(?:元)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  MO: {
    countryName: "Macau",
    standardCurrency: "MOP",
    currencySymbol: "MOP$",
    defaultPricePerSqftUSD: 520.0,
    averageResidentialYield: 2.50,
    validationRegexString: "^(?:MOP\\$|MOP)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?|\\d+(?:\\.\\d{1,2})?)\\s*(?:元)?$",
    marketVolatilityIndex: "MEDIUM"
  },

  // ─── SOUTH ASIA ───
  IN: {
    countryName: "India",
    standardCurrency: "INR",
    currencySymbol: "₹",
    defaultPricePerSqftUSD: 65.0,
    averageResidentialYield: 2.80,
    validationRegexString: "^(?:₹|INR|Rs\\.?)?\\s*(\\d{1,3}(?:,\\d{2,3})*(?:\\.\\d{1,2})?)\\s*(?:Lakh|Lac|Cr|Crore)?\\s*(?:Rs\\.?)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  BD: {
    countryName: "Bangladesh",
    standardCurrency: "BDT",
    currencySymbol: "৳",
    defaultPricePerSqftUSD: 35.0,
    averageResidentialYield: 3.50,
    validationRegexString: "^(?:৳|BDT|Tk\\.?)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:Lakh|Crore)?$",
    marketVolatilityIndex: "HIGH"
  },
  PK: {
    countryName: "Pakistan",
    standardCurrency: "PKR",
    currencySymbol: "₨",
    defaultPricePerSqftUSD: 28.0,
    averageResidentialYield: 4.00,
    validationRegexString: "^(?:₨|PKR|Rs\\.?)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:Lakh|Crore)?$",
    marketVolatilityIndex: "HIGH"
  },
  LK: {
    countryName: "Sri Lanka",
    standardCurrency: "LKR",
    currencySymbol: "Rs",
    defaultPricePerSqftUSD: 32.0,
    averageResidentialYield: 3.80,
    validationRegexString: "^(?:Rs\\.?|LKR|₨)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:Lakh|Crore|Mn)?$",
    marketVolatilityIndex: "HIGH"
  },
  NP: {
    countryName: "Nepal",
    standardCurrency: "NPR",
    currencySymbol: "₨",
    defaultPricePerSqftUSD: 22.0,
    averageResidentialYield: 3.20,
    validationRegexString: "^(?:₨|NPR|Rs\\.?)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:Lakh|Crore)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  BT: {
    countryName: "Bhutan",
    standardCurrency: "BTN",
    currencySymbol: "Nu.",
    defaultPricePerSqftUSD: 18.0,
    averageResidentialYield: 3.00,
    validationRegexString: "^(?:Nu\\.?|BTN|₨)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:Lakh|Crore)?$",
    marketVolatilityIndex: "LOW"
  },
  MV: {
    countryName: "Maldives",
    standardCurrency: "MVR",
    currencySymbol: ".ރ",
    defaultPricePerSqftUSD: 150.0,
    averageResidentialYield: 5.50,
    validationRegexString: "^(?:\\.ރ|MVR|Rf\\.?)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:MVR)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  AF: {
    countryName: "Afghanistan",
    standardCurrency: "AFN",
    currencySymbol: "؋",
    defaultPricePerSqftUSD: 8.0,
    averageResidentialYield: 5.00,
    validationRegexString: "^(?:؋|AFN|Af)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:؋)?$",
    marketVolatilityIndex: "HIGH"
  },

  // ─── SOUTHEAST ASIA ───
  SG: {
    countryName: "Singapore",
    standardCurrency: "SGD",
    currencySymbol: "S$",
    defaultPricePerSqftUSD: 680.0,
    averageResidentialYield: 2.80,
    validationRegexString: "^(?:S\\$|SGD|\\$)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:M|K|Mil)?$",
    marketVolatilityIndex: "LOW"
  },
  MY: {
    countryName: "Malaysia",
    standardCurrency: "MYR",
    currencySymbol: "RM",
    defaultPricePerSqftUSD: 95.0,
    averageResidentialYield: 3.80,
    validationRegexString: "^(?:RM|MYR)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:K|M)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  ID: {
    countryName: "Indonesia",
    standardCurrency: "IDR",
    currencySymbol: "Rp",
    defaultPricePerSqftUSD: 55.0,
    averageResidentialYield: 4.50,
    validationRegexString: "^(?:Rp|IDR)?\\s*(\\d{1,3}(?:[.,]\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:Jt|M|Mil)?\\s*(?:Rp)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  TH: {
    countryName: "Thailand",
    standardCurrency: "THB",
    currencySymbol: "฿",
    defaultPricePerSqftUSD: 75.0,
    averageResidentialYield: 4.20,
    validationRegexString: "^(?:฿|THB|Bt\\.?)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:K|M|Mil)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  PH: {
    countryName: "Philippines",
    standardCurrency: "PHP",
    currencySymbol: "₱",
    defaultPricePerSqftUSD: 48.0,
    averageResidentialYield: 5.00,
    validationRegexString: "^(?:₱|PHP|Php)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:K|M|Mil)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  VN: {
    countryName: "Vietnam",
    standardCurrency: "VND",
    currencySymbol: "₫",
    defaultPricePerSqftUSD: 42.0,
    averageResidentialYield: 4.80,
    validationRegexString: "^(?:₫|VND)?\\s*(\\d{1,3}(?:[.,]\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:K|Tr|Nghìn|Triệu)?\\s*(?:₫)?$",
    marketVolatilityIndex: "HIGH"
  },
  MM: {
    countryName: "Myanmar",
    standardCurrency: "MMK",
    currencySymbol: "K",
    defaultPricePerSqftUSD: 15.0,
    averageResidentialYield: 4.00,
    validationRegexString: "^(?:K|MMK|Ks)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:Lakh)?$",
    marketVolatilityIndex: "HIGH"
  },
  KH: {
    countryName: "Cambodia",
    standardCurrency: "KHR",
    currencySymbol: "៛",
    defaultPricePerSqftUSD: 25.0,
    averageResidentialYield: 5.50,
    validationRegexString: "^(?:៛|KHR|Riel)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:K|Riel)?$",
    marketVolatilityIndex: "HIGH"
  },
  LA: {
    countryName: "Laos",
    standardCurrency: "LAK",
    currencySymbol: "₭",
    defaultPricePerSqftUSD: 18.0,
    averageResidentialYield: 4.20,
    validationRegexString: "^(?:₭|LAK|Kip)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:K|Kip)?$",
    marketVolatilityIndex: "HIGH"
  },
  BN: {
    countryName: "Brunei",
    standardCurrency: "BND",
    currencySymbol: "B$",
    defaultPricePerSqftUSD: 120.0,
    averageResidentialYield: 3.00,
    validationRegexString: "^(?:B\\$|BND|\\$)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:K|M)?$",
    marketVolatilityIndex: "LOW"
  },
  TL: {
    countryName: "Timor-Leste",
    standardCurrency: "USD",
    currencySymbol: "$",
    defaultPricePerSqftUSD: 28.0,
    averageResidentialYield: 4.00,
    validationRegexString: "^(?:\\$|USD)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:K|M)?$",
    marketVolatilityIndex: "HIGH"
  },

  // ─── OCEANIA ───
  AU: {
    countryName: "Australia",
    standardCurrency: "AUD",
    currencySymbol: "A$",
    defaultPricePerSqftUSD: 280.0,
    averageResidentialYield: 3.20,
    validationRegexString: "^(?:A\\$|AUD|\\$)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:K|M|Mil)?$",
    marketVolatilityIndex: "LOW"
  },
  NZ: {
    countryName: "New Zealand",
    standardCurrency: "NZD",
    currencySymbol: "NZ$",
    defaultPricePerSqftUSD: 220.0,
    averageResidentialYield: 3.00,
    validationRegexString: "^(?:NZ\\$|NZD|\\$)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:K|M|Mil)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  PG: {
    countryName: "Papua New Guinea",
    standardCurrency: "PGK",
    currencySymbol: "K",
    defaultPricePerSqftUSD: 35.0,
    averageResidentialYield: 5.00,
    validationRegexString: "^(?:K|PGK|Kina)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:Kina)?$",
    marketVolatilityIndex: "HIGH"
  },
  FJ: {
    countryName: "Fiji",
    standardCurrency: "FJD",
    currencySymbol: "FJ$",
    defaultPricePerSqftUSD: 55.0,
    averageResidentialYield: 4.50,
    validationRegexString: "^(?:FJ\\$|FJD|\\$)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:K|M)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  SB: {
    countryName: "Solomon Islands",
    standardCurrency: "SBD",
    currencySymbol: "SI$",
    defaultPricePerSqftUSD: 22.0,
    averageResidentialYield: 5.00,
    validationRegexString: "^(?:SI\\$|SBD|\\$)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:K|M)?$",
    marketVolatilityIndex: "HIGH"
  },
  VU: {
    countryName: "Vanuatu",
    standardCurrency: "VUV",
    currencySymbol: "Vt",
    defaultPricePerSqftUSD: 30.0,
    averageResidentialYield: 5.50,
    validationRegexString: "^(?:Vt|VUV)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:Vt)?$",
    marketVolatilityIndex: "HIGH"
  },
  WS: {
    countryName: "Samoa",
    standardCurrency: "WST",
    currencySymbol: "T",
    defaultPricePerSqftUSD: 25.0,
    averageResidentialYield: 4.80,
    validationRegexString: "^(?:T|WST|Tala)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:Tala)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  TO: {
    countryName: "Tonga",
    standardCurrency: "TOP",
    currencySymbol: "T$",
    defaultPricePerSqftUSD: 20.0,
    averageResidentialYield: 4.50,
    validationRegexString: "^(?:T\\$|TOP|Pa'anga)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:K|M)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  KI: {
    countryName: "Kiribati",
    standardCurrency: "AUD",
    currencySymbol: "A$",
    defaultPricePerSqftUSD: 15.0,
    averageResidentialYield: 4.00,
    validationRegexString: "^(?:A\\$|AUD|\\$)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:K|M)?$",
    marketVolatilityIndex: "HIGH"
  },
  TV: {
    countryName: "Tuvalu",
    standardCurrency: "AUD",
    currencySymbol: "A$",
    defaultPricePerSqftUSD: 12.0,
    averageResidentialYield: 3.50,
    validationRegexString: "^(?:A\\$|AUD|\\$)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:K|M)?$",
    marketVolatilityIndex: "HIGH"
  },
  NR: {
    countryName: "Nauru",
    standardCurrency: "AUD",
    currencySymbol: "A$",
    defaultPricePerSqftUSD: 18.0,
    averageResidentialYield: 3.80,
    validationRegexString: "^(?:A\\$|AUD|\\$)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:K|M)?$",
    marketVolatilityIndex: "HIGH"
  },
  FM: {
    countryName: "Micronesia",
    standardCurrency: "USD",
    currencySymbol: "$",
    defaultPricePerSqftUSD: 22.0,
    averageResidentialYield: 4.00,
    validationRegexString: "^(?:\\$|USD)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:K|M)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  MH: {
    countryName: "Marshall Islands",
    standardCurrency: "USD",
    currencySymbol: "$",
    defaultPricePerSqftUSD: 20.0,
    averageResidentialYield: 4.20,
    validationRegexString: "^(?:\\$|USD)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:K|M)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  PW: {
    countryName: "Palau",
    standardCurrency: "USD",
    currencySymbol: "$",
    defaultPricePerSqftUSD: 25.0,
    averageResidentialYield: 4.50,
    validationRegexString: "^(?:\\$|USD)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:K|M)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  NC: {
    countryName: "New Caledonia",
    standardCurrency: "XPF",
    currencySymbol: "₣",
    defaultPricePerSqftUSD: 110.0,
    averageResidentialYield: 3.50,
    validationRegexString: "^(?:₣|XPF|CFP)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:₣)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  PF: {
    countryName: "French Polynesia",
    standardCurrency: "XPF",
    currencySymbol: "₣",
    defaultPricePerSqftUSD: 130.0,
    averageResidentialYield: 3.00,
    validationRegexString: "^(?:₣|XPF|CFP)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:₣)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  WF: {
    countryName: "Wallis and Futuna",
    standardCurrency: "XPF",
    currencySymbol: "₣",
    defaultPricePerSqftUSD: 45.0,
    averageResidentialYield: 3.80,
    validationRegexString: "^(?:₣|XPF|CFP)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:₣)?$",
    marketVolatilityIndex: "LOW"
  },
  CK: {
    countryName: "Cook Islands",
    standardCurrency: "NZD",
    currencySymbol: "NZ$",
    defaultPricePerSqftUSD: 35.0,
    averageResidentialYield: 4.00,
    validationRegexString: "^(?:NZ\\$|NZD|\\$)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:K|M)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  NU: {
    countryName: "Niue",
    standardCurrency: "NZD",
    currencySymbol: "NZ$",
    defaultPricePerSqftUSD: 18.0,
    averageResidentialYield: 3.50,
    validationRegexString: "^(?:NZ\\$|NZD|\\$)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:K|M)?$",
    marketVolatilityIndex: "LOW"
  },
  TK: {
    countryName: "Tokelau",
    standardCurrency: "NZD",
    currencySymbol: "NZ$",
    defaultPricePerSqftUSD: 10.0,
    averageResidentialYield: 3.00,
    validationRegexString: "^(?:NZ\\$|NZD|\\$)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:K|M)?$",
    marketVolatilityIndex: "LOW"
  },
  AS: {
    countryName: "American Samoa",
    standardCurrency: "USD",
    currencySymbol: "$",
    defaultPricePerSqftUSD: 35.0,
    averageResidentialYield: 4.00,
    validationRegexString: "^(?:\\$|USD)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:K|M)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  GU: {
    countryName: "Guam",
    standardCurrency: "USD",
    currencySymbol: "$",
    defaultPricePerSqftUSD: 85.0,
    averageResidentialYield: 3.50,
    validationRegexString: "^(?:\\$|USD)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:K|M)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  MP: {
    countryName: "Northern Mariana Islands",
    standardCurrency: "USD",
    currencySymbol: "$",
    defaultPricePerSqftUSD: 55.0,
    averageResidentialYield: 3.80,
    validationRegexString: "^(?:\\$|USD)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:K|M)?$",
    marketVolatilityIndex: "MEDIUM"
  },

  // ─── CENTRAL ASIA ───
  KZ: {
    countryName: "Kazakhstan",
    standardCurrency: "KZT",
    currencySymbol: "₸",
    defaultPricePerSqftUSD: 38.0,
    averageResidentialYield: 5.00,
    validationRegexString: "^(?:₸|KZT|Tenge)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:K|M|Mn)?\\s*(?:₸)?$",
    marketVolatilityIndex: "HIGH"
  },
  UZ: {
    countryName: "Uzbekistan",
    standardCurrency: "UZS",
    currencySymbol: "so'm",
    defaultPricePerSqftUSD: 12.0,
    averageResidentialYield: 5.50,
    validationRegexString: "^(?:so'm|UZS|sum)?\\s*(\\d{1,3}(?:[.,]\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:K|M|Mn)?\\s*(?:so'm)?$",
    marketVolatilityIndex: "HIGH"
  },
  KG: {
    countryName: "Kyrgyzstan",
    standardCurrency: "KGS",
    currencySymbol: "с",
    defaultPricePerSqftUSD: 10.0,
    averageResidentialYield: 5.00,
    validationRegexString: "^(?:с|KGS|som)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:K|M)?\\s*(?:som)?$",
    marketVolatilityIndex: "HIGH"
  },
  TJ: {
    countryName: "Tajikistan",
    standardCurrency: "TJS",
    currencySymbol: "ЅМ",
    defaultPricePerSqftUSD: 8.0,
    averageResidentialYield: 4.50,
    validationRegexString: "^(?:ЅМ|TJS|somoni)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:K|M)?\\s*(?:somoni)?$",
    marketVolatilityIndex: "HIGH"
  },
  TM: {
    countryName: "Turkmenistan",
    standardCurrency: "TMT",
    currencySymbol: "m",
    defaultPricePerSqftUSD: 15.0,
    averageResidentialYield: 4.00,
    validationRegexString: "^(?:m|TMT|manat)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:K|M)?\\s*(?:manat)?$",
    marketVolatilityIndex: "HIGH"
  },
  GE: {
    countryName: "Georgia",
    standardCurrency: "GEL",
    currencySymbol: "₾",
    defaultPricePerSqftUSD: 28.0,
    averageResidentialYield: 5.50,
    validationRegexString: "^(?:₾|GEL|lari)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:K|M)?\\s*(?:lari)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  AM: {
    countryName: "Armenia",
    standardCurrency: "AMD",
    currencySymbol: "֏",
    defaultPricePerSqftUSD: 18.0,
    averageResidentialYield: 5.00,
    validationRegexString: "^(?:֏|AMD|dram)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:K|M)?\\s*(?:dram)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  AZ: {
    countryName: "Azerbaijan",
    standardCurrency: "AZN",
    currencySymbol: "₼",
    defaultPricePerSqftUSD: 22.0,
    averageResidentialYield: 5.00,
    validationRegexString: "^(?:₼|AZN|manat)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:K|M)?\\s*(?:manat)?$",
    marketVolatilityIndex: "MEDIUM"
  },
};