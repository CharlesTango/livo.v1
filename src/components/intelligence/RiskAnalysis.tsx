"use client";

interface RiskData {
  highRiskByAgreement: {
    name: string;
    provider: string;
    highRiskCount: number;
    totalClauses: number;
  }[];
  highRiskByType: { type: string; count: number }[];
  providerFavorableByAgreement: { name: string; count: number }[];
}

interface RiskAnalysisProps {
  data: RiskData | null;
}

export function RiskAnalysis({ data }: RiskAnalysisProps) {
  if (!data) {
    return (
      <div className="bg-white rounded-card shadow-subtle p-6 border-none">
        <h3 className="text-xl font-heading font-extrabold text-secondary mb-2">
          Risk Analysis
        </h3>
        <p className="text-secondary/50 font-body text-sm">
          Run analysis to see risk distributions.
        </p>
      </div>
    );
  }

  const maxHighRisk = Math.max(
    ...data.highRiskByAgreement.map((a) => a.highRiskCount),
    1
  );
  const maxTypeCount = Math.max(
    ...data.highRiskByType.map((t) => t.count),
    1
  );

  return (
    <div className="bg-white rounded-card shadow-subtle p-6 border-none">
      <div className="mb-6">
        <h3 className="text-xl font-heading font-extrabold text-secondary">
          Risk Analysis
        </h3>
        <p className="text-sm text-secondary/50 font-body mt-1">
          Distribution of high-risk and provider-favorable clauses across
          agreements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* High Risk by Agreement */}
        <div>
          <h4 className="text-sm font-heading font-bold text-secondary mb-4">
            High-Risk Clauses by Agreement
          </h4>
          <div className="space-y-3">
            {data.highRiskByAgreement
              .sort((a, b) => b.highRiskCount - a.highRiskCount)
              .map((item) => (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-body text-secondary/70 truncate max-w-[200px]" title={item.name}>
                      {item.name}
                    </span>
                    <span className="text-xs font-bold text-secondary/50">
                      {item.highRiskCount}/{item.totalClauses}
                    </span>
                  </div>
                  <div className="h-2.5 bg-neutral-light rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(item.highRiskCount / maxHighRisk) * 100}%`,
                        backgroundColor:
                          item.highRiskCount === 0
                            ? "#B6D7C4"
                            : item.highRiskCount <= 2
                              ? "#FFD74D"
                              : "#D47070",
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* High Risk by Clause Type */}
        <div>
          <h4 className="text-sm font-heading font-bold text-secondary mb-4">
            High-Risk Clause Types
          </h4>
          <div className="space-y-3">
            {data.highRiskByType.slice(0, 10).map((item) => (
              <div key={item.type}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-body text-secondary/70">
                    {item.type}
                  </span>
                  <span className="text-xs font-bold text-secondary/50">
                    {item.count}
                  </span>
                </div>
                <div className="h-2.5 bg-neutral-light rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-error/70 rounded-full transition-all"
                    style={{
                      width: `${(item.count / maxTypeCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Provider Favorable Summary */}
      <div className="mt-8 pt-6 border-t border-neutral-light/50">
        <h4 className="text-sm font-heading font-bold text-secondary mb-4">
          Provider-Favorable Clauses by Agreement
        </h4>
        <div className="flex flex-wrap gap-3">
          {data.providerFavorableByAgreement
            .sort((a, b) => b.count - a.count)
            .map((item) => (
              <div
                key={item.name}
                className="bg-neutral/30 rounded-m px-4 py-2.5 text-center"
              >
                <p className="text-lg font-heading font-extrabold text-secondary">
                  {item.count}
                </p>
                <p className="text-[10px] text-secondary/50 font-body truncate max-w-[100px]" title={item.name}>
                  {item.name}
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
