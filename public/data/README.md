# Data Files

This app can use historical annual total returns for the S&P 500 to simulate contributions using real rates.

- Place a JSON file at `public/data/sp500-annual.json`
- Format: an object mapping year to total return (as a decimal). Example:

```
{
  "2019": 0.3149,
  "2020": 0.184,
  "2021": 0.287,
  "2022": -0.181,
  "2023": 0.263
}
```

Notes
- Values should be total return (with dividends), nominal CAGR for the calendar year.
- Months use the year’s monthly-equivalent rate: (1 + r_year)^(1/12) - 1.
- Missing years will fall back to a default 8% nominal assumption.
