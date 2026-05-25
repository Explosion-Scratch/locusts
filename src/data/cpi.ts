export const CPI_SOURCE_LABEL =
  'MeasuringWorth historical CPI before 1913; BLS CPI-U annual averages from 1913 onward.';

export const CPI_TABLE: Record<number, number> = {
  1874: 12.1,
  1875: 11.5,
  1877: 11.0,
  1902: 8.8,
  1904: 8.8,
  1937: 14.4,
  1963: 30.6,
  1966: 32.4,
  2008: 215.303,
  2021: 270.970,
  2024: 313.689,
  2025: 322.180,
};

export const LATEST_CPI_YEAR = 2025;

export function getCpi(year: number) {
  return CPI_TABLE[year];
}

export function convertDollars(amount: number, fromYear: number, toYear = LATEST_CPI_YEAR) {
  const fromCpi = getCpi(fromYear);
  const toCpi = getCpi(toYear);

  if (!fromCpi || !toCpi) {
    return null;
  }

  return {
    amount: amount * (toCpi / fromCpi),
    fromCpi,
    toCpi,
    toYear,
  };
}
