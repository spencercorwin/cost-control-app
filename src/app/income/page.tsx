"use client";

import React, { useState, useMemo } from "react";
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

// US Federal Tax Brackets for 2026 (Single Filer)
const TAX_BRACKETS = [
  { min: 0, max: 12400, rate: 0.1 },
  { min: 12401, max: 50400, rate: 0.12 },
  { min: 50401, max: 105700, rate: 0.22 },
  { min: 105701, max: 201775, rate: 0.24 },
  { min: 201776, max: 256225, rate: 0.32 },
  { min: 256226, max: 640600, rate: 0.35 },
  { min: 640601, max: Number.POSITIVE_INFINITY, rate: 0.37 },
];

function calculateFederalTax(income: number): {
  tax: number;
  effectiveRate: number;
} {
  let tax = 0;

  for (const bracket of TAX_BRACKETS) {
    if (income <= bracket.min) break;

    const taxableInThisBracket = Math.min(income, bracket.max) - bracket.min;
    tax += taxableInThisBracket * bracket.rate;
  }

  const effectiveRate = income > 0 ? tax / income : 0;
  return { tax, effectiveRate };
}

const STORAGE_KEY = "income_expense_calculations";
type SavedCalculation = {
  name: string;
  annualSalary: number;
  monthlyExpenses: number;
};

export default function Income() {
  const [monthlyExpenses, setMonthlyExpenses] = useState<string>("");
  const [annualSalary, setAnnualSalary] = useState<string>("");
  const [calculationName, setCalculationName] = useState<string>("");
  const [savedCalculations, setSavedCalculations] = useState<
    SavedCalculation[]
  >([]);
  const [selectedCalculation, setSelectedCalculation] = useState<string>("");

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
      setCalculationName(calculation.name);
      setAnnualSalary(calculation.annualSalary.toString());
      setMonthlyExpenses(calculation.monthlyExpenses.toString());
    }
  };
  const deleteCalculation = (name: string) => {
    const updatedCalculations = savedCalculations.filter(
      (calc) => calc.name !== name,
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCalculations));
    setSavedCalculations(updatedCalculations);
  };
  const saveCalculation = () => {
    const newCalculation: SavedCalculation = {
      name: calculationName,
      annualSalary: Number.parseFloat(annualSalary) || 0,
      monthlyExpenses: Number.parseFloat(monthlyExpenses) || 0,
    };
    const updatedCalculations = [
      ...savedCalculations.filter((calc) => calc.name !== newCalculation.name),
      newCalculation,
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCalculations));
    setSavedCalculations(updatedCalculations);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  React.useEffect(() => {
    const calculations = loadSavedCalculations();
    setSavedCalculations(calculations);
  }, []);

  const calculations = useMemo(() => {
    const salary = Number.parseFloat(annualSalary) || 0;
    const expenses = Number.parseFloat(monthlyExpenses) || 0;

    if (salary <= 0) {
      return {
        postTaxIncome: 0,
        effectiveRate: 0,
        monthlyTakeHome: 0,
        biweeklyTakeHome: 0,
        monthlyAfterExpenses: 0,
      };
    }

    const { tax, effectiveRate } = calculateFederalTax(salary);
    const postTaxIncome = salary - tax;
    const monthlyTakeHome = postTaxIncome / 12;
    const biweeklyTakeHome = postTaxIncome / 26;
    const monthlyAfterExpenses = monthlyTakeHome - expenses;

    return {
      postTaxIncome,
      effectiveRate,
      monthlyTakeHome,
      biweeklyTakeHome,
      monthlyAfterExpenses,
    };
  }, [annualSalary, monthlyExpenses]);

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
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Income & Expense Calculator
          </h1>
          <p className="text-muted-foreground">
            Calculate your take-home pay and savings potential
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Monthly Expenses Section */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Expenses</CardTitle>
              <CardDescription>
                Enter your estimated monthly expenses to calculate savings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Field>
                <FieldLabel htmlFor="monthly-expenses">
                  Monthly Expenses
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="monthly-expenses"
                    type="number"
                    placeholder="5,000"
                    value={monthlyExpenses}
                    onChange={(e) => setMonthlyExpenses(e.target.value)}
                  />
                </FieldContent>
              </Field>
            </CardContent>
          </Card>

          {/* Income Section */}
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
                    placeholder="75,000"
                    value={annualSalary}
                    onChange={(e) => setAnnualSalary(e.target.value)}
                  />
                </FieldContent>
              </Field>
            </CardContent>
          </Card>
        </div>

        {/* Tax Brackets Information */}
        <Card>
          <CardHeader>
            <CardTitle>2026 US Federal Tax Brackets (Single Filer)</CardTitle>
            <CardDescription>
              These are the current federal tax rates used in calculations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {TAX_BRACKETS.map((bracket) => (
                <div key={bracket.min} className="flex justify-between text-sm">
                  <span>
                    {formatCurrency(bracket.min)} -{" "}
                    {bracket.max === Number.POSITIVE_INFINITY
                      ? "∞"
                      : formatCurrency(bracket.max)}
                  </span>
                  <span className="font-medium">
                    {formatPercentage(bracket.rate)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {Number.parseFloat(annualSalary) > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
              <CardDescription>
                Based on your income and expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Post-Tax Income</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(calculations.postTaxIncome)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Annually after federal taxes
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Effective Tax Rate</h3>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatPercentage(calculations.effectiveRate)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Federal taxes only
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Monthly Take-Home</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(calculations.monthlyTakeHome)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Monthly after taxes
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Bi-Weekly Pay</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(calculations.biweeklyTakeHome)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Every two weeks
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Monthly Savings</h3>
                  <p
                    className={`text-2xl font-bold ${calculations.monthlyAfterExpenses >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatCurrency(calculations.monthlyAfterExpenses)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    After expenses each month
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Annual Savings</h3>
                  <p
                    className={`text-2xl font-bold ${calculations.monthlyAfterExpenses >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatCurrency(calculations.monthlyAfterExpenses * 12)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Potential yearly savings
                  </p>
                </div>
              </div>

              {calculations.monthlyAfterExpenses < 0 && (
                <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-800 dark:text-red-200 font-medium">
                    ⚠️ Your expenses exceed your take-home income by{" "}
                    {formatCurrency(
                      Math.abs(calculations.monthlyAfterExpenses),
                    )}{" "}
                    per month.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Save and load section */}
        <Card>
          <CardHeader>
            <CardTitle>Save & Load Calculations</CardTitle>
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
                  disabled={
                    !calculationName || !annualSalary || !monthlyExpenses
                  }
                >
                  Save Calculation
                </Button>
              </div>
            </div>
            <div className="mt-4 flex flex-row flex-nowrap gap-2">
              <Select
                onValueChange={(e) => {
                  setSelectedCalculation(e);
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
