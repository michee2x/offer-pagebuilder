"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";

export function ScoreRadarChart({ content }: { content: string }) {
  let data: any[] = [];
  let overall = 0;
  
  try {
    const cleanContent = content.replace(/```json/gi, '').replace(/```/g, '').trim();
    const scores = JSON.parse(cleanContent);
    overall = scores.overall;
    data = [
      { subject: 'Market Viability', A: scores.market_viability, fullMark: 100 },
      { subject: 'Audience Clar.', A: scores.audience_clarity, fullMark: 100 },
      { subject: 'Offer Strength', A: scores.offer_strength, fullMark: 100 },
      { subject: 'Price-Value', A: scores.price_value_alignment, fullMark: 100 },
      { subject: 'Uniqueness', A: scores.uniqueness, fullMark: 100 },
      { subject: 'Proof Strength', A: scores.proof_strength, fullMark: 100 },
      { subject: 'Conv. Ready', A: scores.conversion_readiness, fullMark: 100 },
    ];
  } catch (e) {
    return <div className="text-sm text-muted-foreground p-4">Invalid score data</div>;
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-8 bg-card rounded-xl border p-6 mb-6">
      <div className="flex-1 w-full flex flex-col items-center justify-center text-center">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Overall Score</h3>
        <div className="text-6xl font-black text-primary tracking-tighter">
          {overall}
          <span className="text-2xl text-muted-foreground ml-1">/100</span>
        </div>
      </div>
      
      <div className="flex-1 w-full h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="hsl(var(--border))" className="opacity-50" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
              itemStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Radar
              name="Score"
              dataKey="A"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
