"use client";

import React, { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const STANDARD_DEDUCTION_2026_SINGLE = 16100;
const SOCIAL_SECURITY_WAGE_BASE_2026 = 184500;
const SOCIAL_SECURITY_RATE = 0.062;
const MEDICARE_RATE = 0.0145;
const ADDITIONAL_MEDICARE_RATE = 0.009;
const ADDITIONAL_MEDICARE_THRESHOLD_SINGLE = 200000;
const WA_PFML_RATE = 0.00358;
const WA_CARES_RATE = 0.0058;

// US Federal Tax Brackets for 2026 (Single filer taxable income)
const TAX_BRACKETS = [
  { min: 0, max: 12400, rate: 0.1 },
  { min: 12400, max: 50400, rate: 0.12 },
  { min: 50400, max: 105700, rate: 0.22 },
  { min: 105700, max: 201775, rate: 0.24 },
  { min: 201775, max: 256225, rate: 0.32 },
  { min: 256225, max: 640600, rate: 0.35 },
  { min: 640600, max: Number.POSITIVE_INFINITY, rate: 0.37 },
] as const;

type FederalTaxBracketBreakdown = {
  label: string;
  amount: number;
};

function calculateFederalTax(taxableIncome: number): {
  tax: number;
  effectiveRate: number;
  breakdown: FederalTaxBracketBreakdown[];
} {
  let tax = 0;
  const breakdown: FederalTaxBracketBreakdown[] = [];

  for (const bracket of TAX_BRACKETS) {
    if (taxableIncome <= bracket.min) break;

    const taxableInThisBracket =
      Math.min(taxableIncome, bracket.max) - bracket.min;

    if (taxableInThisBracket <= 0) continue;

    const bracketTax = taxableInThisBracket * bracket.rate;
    tax += bracketTax;

    breakdown.push({
      label: `${Math.round(bracket.rate * 100)}% bracket`,
      amount: bracketTax,
    });
  }

  const effectiveRate = taxableIncome > 0 ? tax / taxableIncome : 0;
  return { tax, effectiveRate, breakdown };
}

const STORAGE_KEY = "income_expense_calculations";
type SavedCalculation = {
  name: string;
  annualSalary: number;
  rent: number;
  groceries: number;
  foodOut: number;
  travel: number;
  gas: number;
  insurance: number;
  business: number;
  gym: number;
  personal: number;
  transport: number;
  electric: number;
  internet: number;
  other: number;
  cellPhone: number;
  subscriptions: number;
  haircuts: number;
  parking: number;
  recreation: number;
  clothing: number;
};

function toNumber(value: string): number {
  return Number.parseFloat(value) || 0;
}

export default function Income() {
  const [rent, setRent] = useState<string>("");
  const [groceries, setGroceries] = useState<string>("");
  const [foodOut, setFoodOut] = useState<string>("");
  const [travel, setTravel] = useState<string>("");
  const [gas, setGas] = useState<string>("");
  const [insurance, setInsurance] = useState<string>("");
  const [business, setBusiness] = useState<string>("");
  const [gym, setGym] = useState<string>("");
  const [personal, setPersonal] = useState<string>("");
  const [transport, setTransport] = useState<string>("");
  const [electric, setElectric] = useState<string>("");
  const [internet, setInternet] = useState<string>("");
  const [other, setOther] = useState<string>("");
  const [cellPhone, setCellPhone] = useState<string>("");
  const [subscriptions, setSubscriptions] = useState<string>("");
  const [haircuts, setHaircuts] = useState<string>("");
  const [parking, setParking] = useState<string>("");
  const [recreation, setRecreation] = useState<string>("");
  const [clothing, setClothing] = useState<string>("");
  const [annualSalary, setAnnualSalary] = useState<string>("");
  const [calculationName, setCalculationName] = useState<string>("");
  const [savedCalculations, setSavedCalculations] = useState<
    SavedCalculation[]
  >([]);
  const [selectedCalculation, setSelectedCalculation] = useState<string>("");

  const applyCalculation = (calculation: SavedCalculation) => {
    setCalculationName(calculation.name);
    setAnnualSalary(calculation.annualSalary.toString());
    setRent(calculation.rent.toString());
    setGroceries(calculation.groceries.toString());
    setFoodOut(calculation.foodOut.toString());
    setTravel(calculation.travel.toString());
    setGas(calculation.gas.toString());
    setInsurance(calculation.insurance.toString());
    setBusiness(calculation.business.toString());
    setGym(calculation.gym.toString());
    setPersonal(calculation.personal.toString());
    setTransport(calculation.transport.toString());
    setElectric(calculation.electric.toString());
    setInternet(calculation.internet.toString());
    setOther(calculation.other.toString());
    setCellPhone(calculation.cellPhone.toString());
    setSubscriptions(calculation.subscriptions.toString());
    setHaircuts(calculation.haircuts.toString());
    setParking(calculation.parking.toString());
    setRecreation(calculation.recreation.toString());
    setClothing(calculation.clothing.toString());
  };

  const loadSavedCalculations = (): SavedCalculation[] => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  };

  const loadCalculation = (name: string) => {
    const calculation = savedCalculations.find((calc) => calc.name === name);
    if (calculation) {
      applyCalculation(calculation);
      setSelectedCalculation(calculation.name);
    }
  };

  const deleteCalculation = (name: string) => {
    const updatedCalculations = savedCalculations.filter(
      (calc) => calc.name !== name,
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCalculations));
    setSavedCalculations(updatedCalculations);
    if (selectedCalculation === name) {
      setSelectedCalculation("");
    }
  };

  const saveCalculation = () => {
    const newCalculation: SavedCalculation = {
      name: calculationName,
      annualSalary: toNumber(annualSalary),
      rent: toNumber(rent),
      groceries: toNumber(groceries),
      foodOut: toNumber(foodOut),
      travel: toNumber(travel),
      gas: toNumber(gas),
      insurance: toNumber(insurance),
      business: toNumber(business),
      gym: toNumber(gym),
      personal: toNumber(personal),
      transport: toNumber(transport),
      electric: toNumber(electric),
      internet: toNumber(internet),
      other: toNumber(other),
      cellPhone: toNumber(cellPhone),
      subscriptions: toNumber(subscriptions),
      haircuts: toNumber(haircuts),
      parking: toNumber(parking),
      recreation: toNumber(recreation),
      clothing: toNumber(clothing),
    };

    const updatedCalculations = [
      ...savedCalculations.filter((calc) => calc.name !== newCalculation.name),
      newCalculation,
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCalculations));
    setSavedCalculations(updatedCalculations);
    setSelectedCalculation(newCalculation.name);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: load once on mount
  React.useEffect(() => {
    const calculations = loadSavedCalculations();
    setSavedCalculations(calculations);
    if (calculations.length > 0) {
      applyCalculation(calculations[0]);
      setSelectedCalculation(calculations[0].name);
    }
  }, []);

  const calculations = useMemo(() => {
    const salary = toNumber(annualSalary);
    const totalExpenses =
      toNumber(rent) +
      toNumber(groceries) +
      toNumber(foodOut) +
      toNumber(travel) +
      toNumber(gas) +
      toNumber(insurance) +
      toNumber(business) +
      toNumber(gym) +
      toNumber(personal) +
      toNumber(transport) +
      toNumber(electric) +
      toNumber(internet) +
      toNumber(other) +
      toNumber(cellPhone) +
      toNumber(subscriptions) +
      toNumber(haircuts) +
      toNumber(parking) +
      toNumber(recreation) +
      toNumber(clothing);

    if (salary <= 0) {
      return {
        grossSalary: 0,
        standardDeduction: STANDARD_DEDUCTION_2026_SINGLE,
        taxableIncome: 0,
        federalTax: 0,
        federalEffectiveRate: 0,
        federalBreakdown: [] as FederalTaxBracketBreakdown[],
        socialSecurity: 0,
        medicare: 0,
        pfml: 0,
        waCares: 0,
        totalTaxes: 0,
        totalEffectiveRate: 0,
        netAnnualPay: 0,
        netMonthlyPay: 0,
        netBiweeklyPay: 0,
        taxesPerMonth: 0,
        taxesPerBiweekly: 0,
        monthlySavings: 0,
        annualSavings: 0,
        totalExpenses,
      };
    }

    const standardDeduction = STANDARD_DEDUCTION_2026_SINGLE;
    const taxableIncome = Math.max(0, salary - standardDeduction);
    const {
      tax: federalTax,
      effectiveRate: federalEffectiveRate,
      breakdown: federalBreakdown,
    } = calculateFederalTax(taxableIncome);

    const socialSecurity =
      Math.min(salary, SOCIAL_SECURITY_WAGE_BASE_2026) * SOCIAL_SECURITY_RATE;
    const medicare =
      salary * MEDICARE_RATE +
      Math.max(0, salary - ADDITIONAL_MEDICARE_THRESHOLD_SINGLE) *
        ADDITIONAL_MEDICARE_RATE;
    const pfml = salary * WA_PFML_RATE;
    const waCares = salary * WA_CARES_RATE;

    const totalTaxes = federalTax + socialSecurity + medicare + pfml + waCares;
    const totalEffectiveRate = totalTaxes / salary;
    const netAnnualPay = salary - totalTaxes;
    const netMonthlyPay = netAnnualPay / 12;
    const netBiweeklyPay = netAnnualPay / 26;
    const taxesPerMonth = totalTaxes / 12;
    const taxesPerBiweekly = totalTaxes / 26;
    const monthlySavings = netMonthlyPay - totalExpenses;
    const annualSavings = monthlySavings * 12;

    return {
      grossSalary: salary,
      standardDeduction,
      taxableIncome,
      federalTax,
      federalEffectiveRate,
      federalBreakdown,
      socialSecurity,
      medicare,
      pfml,
      waCares,
      totalTaxes,
      totalEffectiveRate,
      netAnnualPay,
      netMonthlyPay,
      netBiweeklyPay,
      taxesPerMonth,
      taxesPerBiweekly,
      monthlySavings,
      annualSavings,
      totalExpenses,
    };
  }, [
    annualSalary,
    rent,
    groceries,
    foodOut,
    travel,
    gas,
    insurance,
    business,
    gym,
    personal,
    transport,
    electric,
    internet,
    other,
    cellPhone,
    subscriptions,
    haircuts,
    parking,
    recreation,
    clothing,
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (rate: number) => {
    return `${(rate * 100).toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="flex flex-col gap-4 max-w-6xl mx-auto">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Income and Expense Calculator
          </h1>
          <p className="text-muted-foreground">
            Calculate your taxes, net pay, and savings potential
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Expenses</CardTitle>
              <CardDescription>
                Enter your estimated monthly expenses by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel htmlFor="rent">Rent</FieldLabel>
                  <FieldContent>
                    <Input
                      id="rent"
                      type="number"
                      placeholder="2000"
                      value={rent}
                      onChange={(e) => setRent(e.target.value)}
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="groceries">Groceries</FieldLabel>
                  <FieldContent>
                    <Input
                      id="groceries"
                      type="number"
                      placeholder="500"
                      value={groceries}
                      onChange={(e) => setGroceries(e.target.value)}
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="food-out">Food Out</FieldLabel>
                  <FieldContent>
                    <Input
                      id="food-out"
                      type="number"
                      placeholder="300"
                      value={foodOut}
                      onChange={(e) => setFoodOut(e.target.value)}
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="travel">Travel and Vacation</FieldLabel>
                  <FieldContent>
                    <Input
                      id="travel"
                      type="number"
                      placeholder="200"
                      value={travel}
                      onChange={(e) => setTravel(e.target.value)}
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="gas">Gas</FieldLabel>
                  <FieldContent>
                    <Input
                      id="gas"
                      type="number"
                      placeholder="150"
                      value={gas}
                      onChange={(e) => setGas(e.target.value)}
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="insurance">Insurance</FieldLabel>
                  <FieldContent>
                    <Input
                      id="insurance"
                      type="number"
                      placeholder="200"
                      value={insurance}
                      onChange={(e) => setInsurance(e.target.value)}
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="business">Business</FieldLabel>
                  <FieldContent>
                    <Input
                      id="business"
                      type="number"
                      placeholder="100"
                      value={business}
                      onChange={(e) => setBusiness(e.target.value)}
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="gym">Gym</FieldLabel>
                  <FieldContent>
                    <Input
                      id="gym"
                      type="number"
                      placeholder="50"
                      value={gym}
                      onChange={(e) => setGym(e.target.value)}
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="personal">Personal</FieldLabel>
                  <FieldContent>
                    <Input
                      id="personal"
                      type="number"
                      placeholder="100"
                      value={personal}
                      onChange={(e) => setPersonal(e.target.value)}
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="transport">Transport</FieldLabel>
                  <FieldContent>
                    <Input
                      id="transport"
                      type="number"
                      placeholder="100"
                      value={transport}
                      onChange={(e) => setTransport(e.target.value)}
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="electric">Electric</FieldLabel>
                  <FieldContent>
                    <Input
                      id="electric"
                      type="number"
                      placeholder="100"
                      value={electric}
                      onChange={(e) => setElectric(e.target.value)}
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="internet">Internet</FieldLabel>
                  <FieldContent>
                    <Input
                      id="internet"
                      type="number"
                      placeholder="80"
                      value={internet}
                      onChange={(e) => setInternet(e.target.value)}
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="cell-phone">Cell Phone</FieldLabel>
                  <FieldContent>
                    <Input
                      id="cell-phone"
                      type="number"
                      placeholder="60"
                      value={cellPhone}
                      onChange={(e) => setCellPhone(e.target.value)}
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="subscriptions">Subscriptions</FieldLabel>
                  <FieldContent>
                    <Input
                      id="subscriptions"
                      type="number"
                      placeholder="50"
                      value={subscriptions}
                      onChange={(e) => setSubscriptions(e.target.value)}
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="haircuts">Haircuts</FieldLabel>
                  <FieldContent>
                    <Input
                      id="haircuts"
                      type="number"
                      placeholder="40"
                      value={haircuts}
                      onChange={(e) => setHaircuts(e.target.value)}
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="parking">Parking</FieldLabel>
                  <FieldContent>
                    <Input
                      id="parking"
                      type="number"
                      placeholder="100"
                      value={parking}
                      onChange={(e) => setParking(e.target.value)}
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="recreation">Recreation</FieldLabel>
                  <FieldContent>
                    <Input
                      id="recreation"
                      type="number"
                      placeholder="150"
                      value={recreation}
                      onChange={(e) => setRecreation(e.target.value)}
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="clothing">Clothing</FieldLabel>
                  <FieldContent>
                    <Input
                      id="clothing"
                      type="number"
                      placeholder="100"
                      value={clothing}
                      onChange={(e) => setClothing(e.target.value)}
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="other">Other</FieldLabel>
                  <FieldContent>
                    <Input
                      id="other"
                      type="number"
                      placeholder="100"
                      value={other}
                      onChange={(e) => setOther(e.target.value)}
                    />
                  </FieldContent>
                </Field>
              </div>
              <div className="pt-4 mt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Monthly Expenses:</span>
                  <span className="text-lg font-bold">
                    {formatCurrency(calculations.totalExpenses)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Annual Income</CardTitle>
              <CardDescription>
                Enter your annual pre-tax salary for tax calculations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Field>
                <FieldLabel htmlFor="annual-salary">
                  Annual Pre-Tax Salary
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="annual-salary"
                    type="number"
                    placeholder="75000"
                    value={annualSalary}
                    onChange={(e) => setAnnualSalary(e.target.value)}
                  />
                </FieldContent>
              </Field>
            </CardContent>
          </Card>
        </div>

        {toNumber(annualSalary) > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tax and Net Pay Summary (WA)</CardTitle>
              <CardDescription>
                Income, deduction, tax breakdown, net pay, expenses, and savings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-base font-semibold">Income</h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Gross Salary</span>
                    <span className="font-semibold">
                      {formatCurrency(calculations.grossSalary)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Standard Deduction</span>
                    <span className="font-semibold">
                      -{formatCurrency(calculations.standardDeduction)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-2">
                    <span className="font-medium">Taxable Income</span>
                    <span className="font-bold">
                      {formatCurrency(calculations.taxableIncome)}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <h3 className="text-base font-semibold">Tax Breakdown (Annual)</h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Social Security</span>
                    <span>-{formatCurrency(calculations.socialSecurity)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Medicare</span>
                    <span>-{formatCurrency(calculations.medicare)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Paid Family and Medical Leave (WA)
                    </span>
                    <span>-{formatCurrency(calculations.pfml)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Long-Term Care (WA Cares)</span>
                    <span>-{formatCurrency(calculations.waCares)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Federal Income Tax</span>
                    <span>-{formatCurrency(calculations.federalTax)}</span>
                  </div>
                  {calculations.federalBreakdown.map((bracket) => (
                    <div
                      key={bracket.label}
                      className="flex items-center justify-between text-xs text-muted-foreground pl-3"
                    >
                      <span>{bracket.label}</span>
                      <span>-{formatCurrency(bracket.amount)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between border-t pt-2">
                    <span className="font-medium">Total Taxes</span>
                    <span className="font-bold">
                      -{formatCurrency(calculations.totalTaxes)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Effective Tax Rate</span>
                    <span>{formatPercentage(calculations.totalEffectiveRate)}</span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <h3 className="text-base font-semibold">Net Pay Breakdown</h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Net Annual Pay</span>
                    <span className="font-semibold">
                      {formatCurrency(calculations.netAnnualPay)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Per Month</span>
                    <span>{formatCurrency(calculations.netMonthlyPay)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Per 2 Weeks</span>
                    <span>{formatCurrency(calculations.netBiweeklyPay)}</span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <h3 className="text-base font-semibold">Living Expenses</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Per Month</span>
                    <span className="font-semibold">
                      {formatCurrency(calculations.totalExpenses)}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <h3 className="text-base font-semibold">Savings</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Saved Per Month</span>
                    <p
                      className={`text-xl font-bold ${calculations.monthlySavings >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {formatCurrency(calculations.monthlySavings)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Saved Per Year</span>
                    <p
                      className={`text-xl font-bold ${calculations.annualSavings >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {formatCurrency(calculations.annualSavings)}
                    </p>
                  </div>
                </div>

                {calculations.monthlySavings < 0 && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-800 dark:text-red-200 font-medium">
                      Your expenses exceed your monthly net pay by {" "}
                      {formatCurrency(Math.abs(calculations.monthlySavings))}.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Save and Load Calculations</CardTitle>
            <CardDescription>
              Save your income and expense data for future reference
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-row flex-nowrap gap-2">
              <Field>
                <FieldLabel htmlFor="calculation-name">
                  Calculation Name
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="calculation-name"
                    type="text"
                    placeholder="Name your calculation set"
                    value={calculationName}
                    onChange={(e) => setCalculationName(e.target.value)}
                  />
                </FieldContent>
              </Field>
              <div>
                <div className="mt-8" />
                <Button
                  onClick={saveCalculation}
                  disabled={!calculationName || !annualSalary}
                >
                  Save Calculation
                </Button>
              </div>
            </div>
            <div className="mt-4 flex flex-row flex-nowrap gap-2">
              <Select
                value={selectedCalculation}
                onValueChange={(value) => {
                  setSelectedCalculation(value);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a calculation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Calculations</SelectLabel>
                    {savedCalculations.map((calc) => (
                      <SelectItem key={calc.name} value={calc.name}>
                        {calc.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button
                onClick={() => deleteCalculation(selectedCalculation)}
                disabled={selectedCalculation === ""}
              >
                Delete Calculation
              </Button>
              <Button
                onClick={() => loadCalculation(selectedCalculation)}
                disabled={selectedCalculation === ""}
              >
                Load Calculation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
