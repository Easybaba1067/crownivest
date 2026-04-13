import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Calculator } from "lucide-react";

interface ROICalculatorProps {
  defaultRoi: number;
  minInvestment: number;
}

const ROICalculator = ({ defaultRoi, minInvestment }: ROICalculatorProps) => {
  const [investAmount, setInvestAmount] = useState([5000]);
  const [rentalYield, setRentalYield] = useState([defaultRoi * 0.6]);
  const [appreciationRate, setAppreciationRate] = useState([defaultRoi * 0.4]);
  const [holdingPeriod, setHoldingPeriod] = useState([3]);

  const years = holdingPeriod[0];
  const amount = investAmount[0];
  const rental = rentalYield[0];
  const appreciation = appreciationRate[0];

  const totalRentalIncome = amount * (rental / 100) * years;
  const appreciatedValue = amount * (1 + appreciation / 100) ** years;
  const capitalGain = appreciatedValue - amount;
  const totalReturn = totalRentalIncome + capitalGain;
  const annualizedReturn = ((totalReturn / amount / years) * 100).toFixed(1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" /> ROI Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Investment Amount</span>
            <span className="font-medium">${amount.toLocaleString()}</span>
          </div>
          <Slider min={minInvestment} max={200000} step={500} value={investAmount} onValueChange={setInvestAmount} />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Rental Yield (annual)</span>
            <span className="font-medium">{rental.toFixed(1)}%</span>
          </div>
          <Slider min={0} max={15} step={0.1} value={rentalYield} onValueChange={setRentalYield} />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Appreciation Rate (annual)</span>
            <span className="font-medium">{appreciation.toFixed(1)}%</span>
          </div>
          <Slider min={0} max={15} step={0.1} value={appreciationRate} onValueChange={setAppreciationRate} />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Holding Period</span>
            <span className="font-medium">{years} year{years > 1 ? "s" : ""}</span>
          </div>
          <Slider min={1} max={10} step={1} value={holdingPeriod} onValueChange={setHoldingPeriod} />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Rental Income</p>
            <p className="font-display font-bold text-sm">${Math.round(totalRentalIncome).toLocaleString()}</p>
          </div>
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Capital Gain</p>
            <p className="font-display font-bold text-sm">${Math.round(capitalGain).toLocaleString()}</p>
          </div>
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Return</p>
            <p className="font-display font-bold text-sm text-primary">${Math.round(totalReturn).toLocaleString()}</p>
          </div>
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Annualized</p>
            <p className="font-display font-bold text-sm text-primary">{annualizedReturn}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ROICalculator;
