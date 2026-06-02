// src/core/intelligence/geo/europe.ts

import { GeoCountryContext } from "./asia-pacific";

export const EUROPE_GEO_REGISTRY: Record<string, GeoCountryContext> = {
  // ─── WESTERN EUROPE ───
  DE: {
    countryName: "Germany",
    standardCurrency: "EUR",
    currencySymbol: "€",
    defaultPricePerSqftUSD: 185.0,
    averageResidentialYield: 3.20,
    validationRegexString: "^(?:€|EUR)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:€)?$",
    marketVolatilityIndex: "LOW"
  },
  FR: {
    countryName: "France",
    standardCurrency: "EUR",
    currencySymbol: "€",
    defaultPricePerSqftUSD: 165.0,
    averageResidentialYield: 2.80,
    validationRegexString: "^(?:€|EUR)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:€)?$",
    marketVolatilityIndex: "LOW"
  },
  GB: {
    countryName: "United Kingdom",
    standardCurrency: "GBP",
    currencySymbol: "£",
    defaultPricePerSqftUSD: 195.0,
    averageResidentialYield: 3.50,
    validationRegexString: "^(?:£|GBP)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:£)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  IT: {
    countryName: "Italy",
    standardCurrency: "EUR",
    currencySymbol: "€",
    defaultPricePerSqftUSD: 140.0,
    averageResidentialYield: 3.80,
    validationRegexString: "^(?:€|EUR)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:€)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  ES: {
    countryName: "Spain",
    standardCurrency: "EUR",
    currencySymbol: "€",
    defaultPricePerSqftUSD: 115.0,
    averageResidentialYield: 4.20,
    validationRegexString: "^(?:€|EUR)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:€)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  NL: {
    countryName: "Netherlands",
    standardCurrency: "EUR",
    currencySymbol: "€",
    defaultPricePerSqftUSD: 175.0,
    averageResidentialYield: 3.00,
    validationRegexString: "^(?:€|EUR)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:€)?$",
    marketVolatilityIndex: "LOW"
  },
  BE: {
    countryName: "Belgium",
    standardCurrency: "EUR",
    currencySymbol: "€",
    defaultPricePerSqftUSD: 155.0,
    averageResidentialYield: 3.30,
    validationRegexString: "^(?:€|EUR)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:€)?$",
    marketVolatilityIndex: "LOW"
  },
  CH: {
    countryName: "Switzerland",
    standardCurrency: "CHF",
    currencySymbol: "Fr",
    defaultPricePerSqftUSD: 320.0,
    averageResidentialYield: 2.10,
    validationRegexString: "^(?:Fr|CHF|Fr\\.?)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:CHF)?$",
    marketVolatilityIndex: "LOW"
  },
  AT: {
    countryName: "Austria",
    standardCurrency: "EUR",
    currencySymbol: "€",
    defaultPricePerSqftUSD: 160.0,
    averageResidentialYield: 3.00,
    validationRegexString: "^(?:€|EUR)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:€)?$",
    marketVolatilityIndex: "LOW"
  },
  IE: {
    countryName: "Ireland",
    standardCurrency: "EUR",
    currencySymbol: "€",
    defaultPricePerSqftUSD: 180.0,
    averageResidentialYield: 3.20,
    validationRegexString: "^(?:€|EUR)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:€)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  LU: {
    countryName: "Luxembourg",
    standardCurrency: "EUR",
    currencySymbol: "€",
    defaultPricePerSqftUSD: 280.0,
    averageResidentialYield: 2.50,
    validationRegexString: "^(?:€|EUR)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:€)?$",
    marketVolatilityIndex: "LOW"
  },
  MC: {
    countryName: "Monaco",
    standardCurrency: "EUR",
    currencySymbol: "€",
    defaultPricePerSqftUSD: 950.0,
    averageResidentialYield: 1.80,
    validationRegexString: "^(?:€|EUR)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:€)?$",
    marketVolatilityIndex: "LOW"
  },
  AD: {
    countryName: "Andorra",
    standardCurrency: "EUR",
    currencySymbol: "€",
    defaultPricePerSqftUSD: 120.0,
    averageResidentialYield: 3.50,
    validationRegexString: "^(?:€|EUR)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:€)?$",
    marketVolatilityIndex: "LOW"
  },
  LI: {
    countryName: "Liechtenstein",
    standardCurrency: "CHF",
    currencySymbol: "Fr",
    defaultPricePerSqftUSD: 290.0,
    averageResidentialYield: 2.20,
    validationRegexString: "^(?:Fr|CHF|Fr\\.?)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:CHF)?$",
    marketVolatilityIndex: "LOW"
  },
  SM: {
    countryName: "San Marino",
    standardCurrency: "EUR",
    currencySymbol: "€",
    defaultPricePerSqftUSD: 135.0,
    averageResidentialYield: 3.00,
    validationRegexString: "^(?:€|EUR)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:€)?$",
    marketVolatilityIndex: "LOW"
  },
  VA: {
    countryName: "Vatican City",
    standardCurrency: "EUR",
    currencySymbol: "€",
    defaultPricePerSqftUSD: 0.0,
    averageResidentialYield: 0.0,
    validationRegexString: "^(?:€|EUR)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:€)?$",
    marketVolatilityIndex: "LOW"
  },
  MT: {
    countryName: "Malta",
    standardCurrency: "EUR",
    currencySymbol: "€",
    defaultPricePerSqftUSD: 125.0,
    averageResidentialYield: 3.80,
    validationRegexString: "^(?:€|EUR)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:€)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  CY: {
    countryName: "Cyprus",
    standardCurrency: "EUR",
    currencySymbol: "€",
    defaultPricePerSqftUSD: 95.0,
    averageResidentialYield: 4.50,
    validationRegexString: "^(?:€|EUR)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:€)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  IS: {
    countryName: "Iceland",
    standardCurrency: "ISK",
    currencySymbol: "kr",
    defaultPricePerSqftUSD: 145.0,
    averageResidentialYield: 3.50,
    validationRegexString: "^(?:kr|ISK|Íkr)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:kr)?$",
    marketVolatilityIndex: "MEDIUM"
  },

  // ─── SCANDINAVIA ───
  SE: {
    countryName: "Sweden",
    standardCurrency: "SEK",
    currencySymbol: "kr",
    defaultPricePerSqftUSD: 155.0,
    averageResidentialYield: 2.80,
    validationRegexString: "^(?:kr|SEK)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:kr)?$",
    marketVolatilityIndex: "LOW"
  },
  NO: {
    countryName: "Norway",
    standardCurrency: "NOK",
    currencySymbol: "kr",
    defaultPricePerSqftUSD: 175.0,
    averageResidentialYield: 2.50,
    validationRegexString: "^(?:kr|NOK)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:kr)?$",
    marketVolatilityIndex: "LOW"
  },
  DK: {
    countryName: "Denmark",
    standardCurrency: "DKK",
    currencySymbol: "kr",
    defaultPricePerSqftUSD: 170.0,
    averageResidentialYield: 2.80,
    validationRegexString: "^(?:kr|DKK)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:kr)?$",
    marketVolatilityIndex: "LOW"
  },
  FI: {
    countryName: "Finland",
    standardCurrency: "EUR",
    currencySymbol: "€",
    defaultPricePerSqftUSD: 140.0,
    averageResidentialYield: 3.00,
    validationRegexString: "^(?:€|EUR)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:€)?$",
    marketVolatilityIndex: "LOW"
  },

  // ─── EASTERN EUROPE ───
  PL: {
    countryName: "Poland",
    standardCurrency: "PLN",
    currencySymbol: "zł",
    defaultPricePerSqftUSD: 72.0,
    averageResidentialYield: 4.50,
    validationRegexString: "^(?:zł|PLN|zl)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:zł)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  CZ: {
    countryName: "Czech Republic",
    standardCurrency: "CZK",
    currencySymbol: "Kč",
    defaultPricePerSqftUSD: 85.0,
    averageResidentialYield: 3.80,
    validationRegexString: "^(?:Kč|CZK|Kc)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:Kč)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  RO: {
    countryName: "Romania",
    standardCurrency: "RON",
    currencySymbol: "lei",
    defaultPricePerSqftUSD: 48.0,
    averageResidentialYield: 5.50,
    validationRegexString: "^(?:lei|RON)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:lei)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  HU: {
    countryName: "Hungary",
    standardCurrency: "HUF",
    currencySymbol: "Ft",
    defaultPricePerSqftUSD: 55.0,
    averageResidentialYield: 4.80,
    validationRegexString: "^(?:Ft|HUF)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:Ft)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  BG: {
    countryName: "Bulgaria",
    standardCurrency: "BGN",
    currencySymbol: "лв",
    defaultPricePerSqftUSD: 35.0,
    averageResidentialYield: 5.00,
    validationRegexString: "^(?:лв|BGN|lv)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:лв)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  HR: {
    countryName: "Croatia",
    standardCurrency: "EUR",
    currencySymbol: "€",
    defaultPricePerSqftUSD: 75.0,
    averageResidentialYield: 4.20,
    validationRegexString: "^(?:€|EUR)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:€)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  SK: {
    countryName: "Slovakia",
    standardCurrency: "EUR",
    currencySymbol: "€",
    defaultPricePerSqftUSD: 65.0,
    averageResidentialYield: 4.50,
    validationRegexString: "^(?:€|EUR)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:€)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  SI: {
    countryName: "Slovenia",
    standardCurrency: "EUR",
    currencySymbol: "€",
    defaultPricePerSqftUSD: 78.0,
    averageResidentialYield: 3.80,
    validationRegexString: "^(?:€|EUR)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:€)?$",
    marketVolatilityIndex: "LOW"
  },
  EE: {
    countryName: "Estonia",
    standardCurrency: "EUR",
    currencySymbol: "€",
    defaultPricePerSqftUSD: 68.0,
    averageResidentialYield: 4.20,
    validationRegexString: "^(?:€|EUR)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:€)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  LV: {
    countryName: "Latvia",
    standardCurrency: "EUR",
    currencySymbol: "€",
    defaultPricePerSqftUSD: 52.0,
    averageResidentialYield: 4.50,
    validationRegexString: "^(?:€|EUR)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:€)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  LT: {
    countryName: "Lithuania",
    standardCurrency: "EUR",
    currencySymbol: "€",
    defaultPricePerSqftUSD: 58.0,
    averageResidentialYield: 4.20,
    validationRegexString: "^(?:€|EUR)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:€)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  RS: {
    countryName: "Serbia",
    standardCurrency: "RSD",
    currencySymbol: "дин.",
    defaultPricePerSqftUSD: 32.0,
    averageResidentialYield: 5.50,
    validationRegexString: "^(?:дин\\.?|RSD|din)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:дин)?$",
    marketVolatilityIndex: "HIGH"
  },
  BA: {
    countryName: "Bosnia and Herzegovina",
    standardCurrency: "BAM",
    currencySymbol: "KM",
    defaultPricePerSqftUSD: 28.0,
    averageResidentialYield: 5.00,
    validationRegexString: "^(?:KM|BAM)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:KM)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  ME: {
    countryName: "Montenegro",
    standardCurrency: "EUR",
    currencySymbol: "€",
    defaultPricePerSqftUSD: 42.0,
    averageResidentialYield: 4.80,
    validationRegexString: "^(?:€|EUR)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:€)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  MK: {
    countryName: "North Macedonia",
    standardCurrency: "MKD",
    currencySymbol: "ден",
    defaultPricePerSqftUSD: 22.0,
    averageResidentialYield: 5.50,
    validationRegexString: "^(?:ден|MKD|den)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:ден)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  AL: {
    countryName: "Albania",
    standardCurrency: "ALL",
    currencySymbol: "L",
    defaultPricePerSqftUSD: 18.0,
    averageResidentialYield: 5.00,
    validationRegexString: "^(?:L|ALL|lek)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:L)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  XK: {
    countryName: "Kosovo",
    standardCurrency: "EUR",
    currencySymbol: "€",
    defaultPricePerSqftUSD: 25.0,
    averageResidentialYield: 5.00,
    validationRegexString: "^(?:€|EUR)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:€)?$",
    marketVolatilityIndex: "HIGH"
  },
  MD: {
    countryName: "Moldova",
    standardCurrency: "MDL",
    currencySymbol: "L",
    defaultPricePerSqftUSD: 15.0,
    averageResidentialYield: 5.50,
    validationRegexString: "^(?:L|MDL|lei)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:L)?$",
    marketVolatilityIndex: "HIGH"
  },
  BY: {
    countryName: "Belarus",
    standardCurrency: "BYN",
    currencySymbol: "Br",
    defaultPricePerSqftUSD: 20.0,
    averageResidentialYield: 5.00,
    validationRegexString: "^(?:Br|BYN|rub)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:Br)?$",
    marketVolatilityIndex: "HIGH"
  },
  UA: {
    countryName: "Ukraine",
    standardCurrency: "UAH",
    currencySymbol: "₴",
    defaultPricePerSqftUSD: 12.0,
    averageResidentialYield: 6.00,
    validationRegexString: "^(?:₴|UAH|hrn)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:₴)?$",
    marketVolatilityIndex: "HIGH"
  },
  RU: {
    countryName: "Russia",
    standardCurrency: "RUB",
    currencySymbol: "₽",
    defaultPricePerSqftUSD: 45.0,
    averageResidentialYield: 5.00,
    validationRegexString: "^(?:₽|RUB|руб)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:₽)?$",
    marketVolatilityIndex: "HIGH"
  },
  GR: {
    countryName: "Greece",
    standardCurrency: "EUR",
    currencySymbol: "€",
    defaultPricePerSqftUSD: 88.0,
    averageResidentialYield: 4.50,
    validationRegexString: "^(?:€|EUR)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:€)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  PT: {
    countryName: "Portugal",
    standardCurrency: "EUR",
    currencySymbol: "€",
    defaultPricePerSqftUSD: 95.0,
    averageResidentialYield: 4.20,
    validationRegexString: "^(?:€|EUR)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:€)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  TR: {
    countryName: "Turkey",
    standardCurrency: "TRY",
    currencySymbol: "₺",
    defaultPricePerSqftUSD: 38.0,
    averageResidentialYield: 5.50,
    validationRegexString: "^(?:₺|TRY|TL)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:₺)?$",
    marketVolatilityIndex: "HIGH"
  },

  // ─── SOUTHERN EUROPE / MEDITERRANEAN ───
  GI: {
    countryName: "Gibraltar",
    standardCurrency: "GIP",
    currencySymbol: "£",
    defaultPricePerSqftUSD: 210.0,
    averageResidentialYield: 3.00,
    validationRegexString: "^(?:£|GIP)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:£)?$",
    marketVolatilityIndex: "LOW"
  },
  FO: {
    countryName: "Faroe Islands",
    standardCurrency: "DKK",
    currencySymbol: "kr",
    defaultPricePerSqftUSD: 95.0,
    averageResidentialYield: 3.50,
    validationRegexString: "^(?:kr|DKK)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:kr)?$",
    marketVolatilityIndex: "LOW"
  },
  GL: {
    countryName: "Greenland",
    standardCurrency: "DKK",
    currencySymbol: "kr",
    defaultPricePerSqftUSD: 55.0,
    averageResidentialYield: 3.00,
    validationRegexString: "^(?:kr|DKK)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:kr)?$",
    marketVolatilityIndex: "LOW"
  },
  AX: {
    countryName: "Aland Islands",
    standardCurrency: "EUR",
    currencySymbol: "€",
    defaultPricePerSqftUSD: 85.0,
    averageResidentialYield: 3.00,
    validationRegexString: "^(?:€|EUR)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:€)?$",
    marketVolatilityIndex: "LOW"
  },
  SJ: {
    countryName: "Svalbard and Jan Mayen",
    standardCurrency: "NOK",
    currencySymbol: "kr",
    defaultPricePerSqftUSD: 0.0,
    averageResidentialYield: 0.0,
    validationRegexString: "^(?:kr|NOK)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:kr)?$",
    marketVolatilityIndex: "LOW"
  },
  GG: {
    countryName: "Guernsey",
    standardCurrency: "GBP",
    currencySymbol: "£",
    defaultPricePerSqftUSD: 185.0,
    averageResidentialYield: 3.20,
    validationRegexString: "^(?:£|GBP)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:£)?$",
    marketVolatilityIndex: "LOW"
  },
  JE: {
    countryName: "Jersey",
    standardCurrency: "GBP",
    currencySymbol: "£",
    defaultPricePerSqftUSD: 195.0,
    averageResidentialYield: 3.00,
    validationRegexString: "^(?:£|GBP)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:£)?$",
    marketVolatilityIndex: "LOW"
  },
  IM: {
    countryName: "Isle of Man",
    standardCurrency: "GBP",
    currencySymbol: "£",
    defaultPricePerSqftUSD: 140.0,
    averageResidentialYield: 3.50,
    validationRegexString: "^(?:£|GBP)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:K|M|Mil|Mn)?\\s*(?:£)?$",
    marketVolatilityIndex: "LOW"
  },
  PM: {
    countryName: "Saint Pierre and Miquelon",
    standardCurrency: "EUR",
    currencySymbol: "€",
    defaultPricePerSqftUSD: 45.0,
    averageResidentialYield: 3.50,
    validationRegexString: "^(?:€|EUR)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:€)?$",
    marketVolatilityIndex: "LOW"
  },
  GP: {
    countryName: "Guadeloupe",
    standardCurrency: "EUR",
    currencySymbol: "€",
    defaultPricePerSqftUSD: 65.0,
    averageResidentialYield: 3.80,
    validationRegexString: "^(?:€|EUR)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:€)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  MQ: {
    countryName: "Martinique",
    standardCurrency: "EUR",
    currencySymbol: "€",
    defaultPricePerSqftUSD: 62.0,
    averageResidentialYield: 3.80,
    validationRegexString: "^(?:€|EUR)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:€)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  RE: {
    countryName: "Reunion",
    standardCurrency: "EUR",
    currencySymbol: "€",
    defaultPricePerSqftUSD: 58.0,
    averageResidentialYield: 4.00,
    validationRegexString: "^(?:€|EUR)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:€)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  YT: {
    countryName: "Mayotte",
    standardCurrency: "EUR",
    currencySymbol: "€",
    defaultPricePerSqftUSD: 42.0,
    averageResidentialYield: 4.20,
    validationRegexString: "^(?:€|EUR)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:€)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  BL: {
    countryName: "Saint Barthelemy",
    standardCurrency: "EUR",
    currencySymbol: "€",
    defaultPricePerSqftUSD: 450.0,
    averageResidentialYield: 2.00,
    validationRegexString: "^(?:€|EUR)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:€)?$",
    marketVolatilityIndex: "LOW"
  },
  MF: {
    countryName: "Saint Martin",
    standardCurrency: "EUR",
    currencySymbol: "€",
    defaultPricePerSqftUSD: 220.0,
    averageResidentialYield: 2.50,
    validationRegexString: "^(?:€|EUR)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:€)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  WF: {
    countryName: "Wallis and Futuna",
    standardCurrency: "XPF",
    currencySymbol: "₣",
    defaultPricePerSqftUSD: 38.0,
    averageResidentialYield: 3.50,
    validationRegexString: "^(?:₣|XPF|CFP)?\\s*(\\d{1,3}(?:,\\d{3})*(?:,\\d{1,2})?)\\s*(?:₣)?$",
    marketVolatilityIndex: "LOW"
  },
  NC: {
    countryName: "New Caledonia",
    standardCurrency: "XPF",
    currencySymbol: "₣",
    defaultPricePerSqftUSD: 75.0,
    averageResidentialYield: 3.20,
    validationRegexString: "^(?:₣|XPF|CFP)?\\s*(\\d{1,3}(?:,\\d{3})*(?:,\\d{1,2})?)\\s*(?:₣)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  PF: {
    countryName: "French Polynesia",
    standardCurrency: "XPF",
    currencySymbol: "₣",
    defaultPricePerSqftUSD: 85.0,
    averageResidentialYield: 3.00,
    validationRegexString: "^(?:₣|XPF|CFP)?\\s*(\\d{1,3}(?:,\\d{3})*(?:,\\d{1,2})?)\\s*(?:₣)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  TF: {
    countryName: "French Southern Territories",
    standardCurrency: "EUR",
    currencySymbol: "€",
    defaultPricePerSqftUSD: 0.0,
    averageResidentialYield: 0.0,
    validationRegexString: "^(?:€|EUR)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:€)?$",
    marketVolatilityIndex: "LOW"
  },
  BV: {
    countryName: "Bouvet Island",
    standardCurrency: "NOK",
    currencySymbol: "kr",
    defaultPricePerSqftUSD: 0.0,
    averageResidentialYield: 0.0,
    validationRegexString: "^(?:kr|NOK)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:kr)?$",
    marketVolatilityIndex: "LOW"
  },
  HM: {
    countryName: "Heard Island and McDonald Islands",
    standardCurrency: "AUD",
    currencySymbol: "A$",
    defaultPricePerSqftUSD: 0.0,
    averageResidentialYield: 0.0,
    validationRegexString: "^(?:A\\$|AUD|\\$)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:A\\$)?$",
    marketVolatilityIndex: "LOW"
  },
  PN: {
    countryName: "Pitcairn",
    standardCurrency: "NZD",
    currencySymbol: "NZ$",
    defaultPricePerSqftUSD: 0.0,
    averageResidentialYield: 0.0,
    validationRegexString: "^(?:NZ\\$|NZD|\\$)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:NZ\\$)?$",
    marketVolatilityIndex: "LOW"
  },
  SH: {
    countryName: "Saint Helena",
    standardCurrency: "SHP",
    currencySymbol: "£",
    defaultPricePerSqftUSD: 35.0,
    averageResidentialYield: 3.50,
    validationRegexString: "^(?:£|SHP)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:£)?$",
    marketVolatilityIndex: "LOW"
  },
  AC: {
    countryName: "Ascension Island",
    standardCurrency: "SHP",
    currencySymbol: "£",
    defaultPricePerSqftUSD: 30.0,
    averageResidentialYield: 3.50,
    validationRegexString: "^(?:£|SHP)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:£)?$",
    marketVolatilityIndex: "LOW"
  },
  TA: {
    countryName: "Tristan da Cunha",
    standardCurrency: "GBP",
    currencySymbol: "£",
    defaultPricePerSqftUSD: 25.0,
    averageResidentialYield: 3.00,
    validationRegexString: "^(?:£|GBP)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:£)?$",
    marketVolatilityIndex: "LOW"
  },
  CP: {
    countryName: "Clipperton Island",
    standardCurrency: "EUR",
    currencySymbol: "€",
    defaultPricePerSqftUSD: 0.0,
    averageResidentialYield: 0.0,
    validationRegexString: "^(?:€|EUR)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:€)?$",
    marketVolatilityIndex: "LOW"
  },
  DG: {
    countryName: "Diego Garcia",
    standardCurrency: "USD",
    currencySymbol: "$",
    defaultPricePerSqftUSD: 0.0,
    averageResidentialYield: 0.0,
    validationRegexString: "^(?:\\$|USD)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:\\$)?$",
    marketVolatilityIndex: "LOW"
  },
  EA: {
    countryName: "Ceuta and Melilla",
    standardCurrency: "EUR",
    currencySymbol: "€",
    defaultPricePerSqftUSD: 55.0,
    averageResidentialYield: 4.00,
    validationRegexString: "^(?:€|EUR)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:€)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  IC: {
    countryName: "Canary Islands",
    standardCurrency: "EUR",
    currencySymbol: "€",
    defaultPricePerSqftUSD: 72.0,
    averageResidentialYield: 4.20,
    validationRegexString: "^(?:€|EUR)?\\s*(\\d{1,3}(?:[.\\s]?\\d{3})*(?:,\\d{1,2})?)\\s*(?:€)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  KY: {
    countryName: "Cayman Islands",
    standardCurrency: "KYD",
    currencySymbol: "CI$",
    defaultPricePerSqftUSD: 180.0,
    averageResidentialYield: 3.00,
    validationRegexString: "^(?:CI\\$|KYD|\\$)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:CI\\$)?$",
    marketVolatilityIndex: "LOW"
  },
  TC: {
    countryName: "Turks and Caicos Islands",
    standardCurrency: "USD",
    currencySymbol: "$",
    defaultPricePerSqftUSD: 165.0,
    averageResidentialYield: 3.50,
    validationRegexString: "^(?:\\$|USD)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:\\$)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  VG: {
    countryName: "British Virgin Islands",
    standardCurrency: "USD",
    currencySymbol: "$",
    defaultPricePerSqftUSD: 195.0,
    averageResidentialYield: 2.80,
    validationRegexString: "^(?:\\$|USD)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:\\$)?$",
    marketVolatilityIndex: "LOW"
  },
  AI: {
    countryName: "Anguilla",
    standardCurrency: "XCD",
    currencySymbol: "$",
    defaultPricePerSqftUSD: 145.0,
    averageResidentialYield: 3.50,
    validationRegexString: "^(?:\\$|XCD)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:\\$)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  MS: {
    countryName: "Montserrat",
    standardCurrency: "XCD",
    currencySymbol: "$",
    defaultPricePerSqftUSD: 55.0,
    averageResidentialYield: 4.00,
    validationRegexString: "^(?:\\$|XCD)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:\\$)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  AW: {
    countryName: "Aruba",
    standardCurrency: "AWG",
    currencySymbol: "Afl.",
    defaultPricePerSqftUSD: 125.0,
    averageResidentialYield: 3.80,
    validationRegexString: "^(?:Afl\\.?|AWG|ƒ)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:Afl)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  CW: {
    countryName: "Curacao",
    standardCurrency: "ANG",
    currencySymbol: "NAf.",
    defaultPricePerSqftUSD: 95.0,
    averageResidentialYield: 4.00,
    validationRegexString: "^(?:NAf\\.?|ANG|ƒ)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:NAf)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  SX: {
    countryName: "Sint Maarten",
    standardCurrency: "ANG",
    currencySymbol: "NAf.",
    defaultPricePerSqftUSD: 110.0,
    averageResidentialYield: 3.80,
    validationRegexString: "^(?:NAf\\.?|ANG|ƒ)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:NAf)?$",
    marketVolatilityIndex: "MEDIUM"
  },
  BQ: {
    countryName: "Bonaire, Sint Eustatius and Saba",
    standardCurrency: "USD",
    currencySymbol: "$",
    defaultPricePerSqftUSD: 85.0,
    averageResidentialYield: 4.00,
    validationRegexString: "^(?:\\$|USD)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:\\$)?$",
    marketVolatilityIndex: "MEDIUM"
  },
};