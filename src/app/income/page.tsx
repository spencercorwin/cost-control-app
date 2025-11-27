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
      rent: Number.parseFloat(rent) || 0,
      groceries: Number.parseFloat(groceries) || 0,
      foodOut: Number.parseFloat(foodOut) || 0,
      travel: Number.parseFloat(travel) || 0,
      gas: Number.parseFloat(gas) || 0,
      insurance: Number.parseFloat(insurance) || 0,
      business: Number.parseFloat(business) || 0,
      gym: Number.parseFloat(gym) || 0,
      personal: Number.parseFloat(personal) || 0,
      transport: Number.parseFloat(transport) || 0,
      electric: Number.parseFloat(electric) || 0,
      internet: Number.parseFloat(internet) || 0,
      other: Number.parseFloat(other) || 0,
      cellPhone: Number.parseFloat(cellPhone) || 0,
      subscriptions: Number.parseFloat(subscriptions) || 0,
      haircuts: Number.parseFloat(haircuts) || 0,
      parking: Number.parseFloat(parking) || 0,
      recreation: Number.parseFloat(recreation) || 0,
      clothing: Number.parseFloat(clothing) || 0,
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
    // Load the first saved calculation if it exists
    if (calculations.length > 0) {
      setCalculationName(calculations[0].name);
      setAnnualSalary(calculations[0].annualSalary.toString());
      setRent(calculations[0].rent.toString());
      setGroceries(calculations[0].groceries.toString());
      setFoodOut(calculations[0].foodOut.toString());
      setTravel(calculations[0].travel.toString());
      setGas(calculations[0].gas.toString());
      setInsurance(calculations[0].insurance.toString());
      setBusiness(calculations[0].business.toString());
      setGym(calculations[0].gym.toString());
      setPersonal(calculations[0].personal.toString());
      setTransport(calculations[0].transport.toString());
      setElectric(calculations[0].electric.toString());
      setInternet(calculations[0].internet.toString());
      setOther(calculations[0].other.toString());
      setCellPhone(calculations[0].cellPhone.toString());
      setSubscriptions(calculations[0].subscriptions.toString());
      setHaircuts(calculations[0].haircuts.toString());
      setParking(calculations[0].parking.toString());
      setRecreation(calculations[0].recreation.toString());
      setClothing(calculations[0].clothing.toString());
      setSelectedCalculation(calculations[0].name);
    }
  }, []);

  const calculations = useMemo(() => {
    const salary = Number.parseFloat(annualSalary) || 0;
    const totalExpenses =
      (Number.parseFloat(rent) || 0) +
      (Number.parseFloat(groceries) || 0) +
      (Number.parseFloat(foodOut) || 0) +
      (Number.parseFloat(travel) || 0) +
      (Number.parseFloat(gas) || 0) +
      (Number.parseFloat(insurance) || 0) +
      (Number.parseFloat(business) || 0) +
      (Number.parseFloat(gym) || 0) +
      (Number.parseFloat(personal) || 0) +
      (Number.parseFloat(transport) || 0) +
      (Number.parseFloat(electric) || 0) +
      (Number.parseFloat(internet) || 0) +
      (Number.parseFloat(other) || 0) +
      (Number.parseFloat(cellPhone) || 0) +
      (Number.parseFloat(subscriptions) || 0) +
      (Number.parseFloat(haircuts) || 0) +
      (Number.parseFloat(parking) || 0) +
      (Number.parseFloat(recreation) || 0) +
      (Number.parseFloat(clothing) || 0);

    if (salary <= 0) {
      return {
        postTaxIncome: 0,
        effectiveRate: 0,
        monthlyTakeHome: 0,
        biweeklyTakeHome: 0,
        monthlyAfterExpenses: 0,
        totalExpenses: 0,
      };
    }

    const { tax, effectiveRate } = calculateFederalTax(salary);
    const postTaxIncome = salary - tax;
    const monthlyTakeHome = postTaxIncome / 12;
    const biweeklyTakeHome = postTaxIncome / 26;
    const monthlyAfterExpenses = monthlyTakeHome - totalExpenses;

    return {
      postTaxIncome,
      effectiveRate,
      monthlyTakeHome,
      biweeklyTakeHome,
      monthlyAfterExpenses,
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
                      placeholder="2,000"
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
                  <FieldLabel htmlFor="travel">Travel/Vacation</FieldLabel>
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
                  disabled={!calculationName || !annualSalary}
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
