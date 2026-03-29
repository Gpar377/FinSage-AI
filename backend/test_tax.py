import sys
import os

# Ensure the backend directory is in the path
sys.path.append(os.path.curdir)

from engines.tax_engine import TaxInput, calculate_both_regimes

inp = TaxInput(
    gross_salary=1800000,
    hra_received=360000,
    basic_salary=900000,
    rent_paid_monthly=20000,
    city_type="metro",
    sec_80c=150000,
    sec_80d_self=0,
    sec_80ccd_1b=50000,
    sec_24b=40000
)

res = calculate_both_regimes(inp)
print(f"Old Regime Tax: {res['old'].total_tax:,.0f}")
print(f"New Regime Tax: {res['new'].total_tax:,.0f}")
print("-" * 20)
print("Old Regime Steps:")
for step in res['old'].steps:
    print(step)
print("-" * 20)
print("New Regime Steps:")
for step in res['new'].steps:
    print(step)
