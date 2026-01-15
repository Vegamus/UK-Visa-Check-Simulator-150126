
import { GoogleGenAI, Type } from "@google/genai";
import { VisaApplicationData, EligibilityResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const assessVisaEligibility = async (
  data: VisaApplicationData, 
  baseline?: EligibilityResult
): Promise<EligibilityResult> => {
  let prompt = "";
  
  // Helper to calculate disposable income for the prompt
  const disposableIncome = data.finances.monthlyIncome - data.finances.monthlyExpenses;
  const affordabilityStatus = disposableIncome * 3 > data.finances.estimatedTripCost 
    ? "High (Disposable income > Trip Cost / 3)" 
    : "Low - Risk of using savings without replenishment";

  const enrichedData = {
    ...data,
    calculatedMetrics: {
      disposableIncome,
      affordabilityStatus,
      age: new Date().getFullYear() - new Date(data.personalInfo.dob).getFullYear()
    }
  };

  if (baseline) {
    prompt = `
      As an expert UK Immigration Consultant, perform a "What If" analysis.
      
      BASELINE RESULT:
      - Previous Score: ${baseline.score}
      - Previous Risk: ${baseline.riskLevel}
      
      NEW MODIFIED DATA:
      ${JSON.stringify(enrichedData, null, 2)}

      Tasks:
      1. Re-calculate the score (0-100) and risk level.
      2. Provide a "scenarioDeltaExplanation" explaining WHY the score changed (or stayed the same).
      3. Focus on Disposable Income (Income - Expenses). If Expenses are high, risk increases.
      4. If Business Visitor: Check if they are being paid in UK (V 4.7). Being paid in UK is generally prohibited unless Permitted Paid Engagement.
    `;
  } else {
    prompt = `
      As an expert UK Immigration Consultant, analyze this UK Standard Visitor Visa application simulation data against the Home Office "Visit Caseworker Guidance".
      
      Application Data (Enriched):
      ${JSON.stringify(enrichedData, null, 2)}

      Critical Assessment Criteria:
      1. **Affordability (V 4.2 e)**: Look at 'monthlyExpenses' vs 'monthlyIncome'. Is there strictly *disposable* income to save for this trip? If they spend all they earn, the 'savingsAmount' might be considered "parked funds" (suspicious).
      2. **Genuine Visitor (V 4.2 a)**: Check 'yearsAtAddress' and 'employmentDetails'. Long tenure = ties to home.
      3. **Business Rules**: If purpose is Business, check 'willBePaidInUK'. Generally, visitors cannot be paid in UK sources.
      4. **Immigration History**: 'immigrationBreaches' is a severe negative factor (suitability grounds).

      Provide: Score (0-100), Risk Level, Summary, Strengths, Weaknesses, Recommendations, and Guidance References.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            riskLevel: { type: Type.STRING },
            summary: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            guidanceReferences: { type: Type.ARRAY, items: { type: Type.STRING } },
            scenarioDeltaExplanation: { type: Type.STRING },
          },
          required: ["score", "riskLevel", "summary", "strengths", "weaknesses", "recommendations", "guidanceReferences"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result as EligibilityResult;
  } catch (error) {
    console.error("AI Assessment failed:", error);
    throw new Error("Could not complete visa assessment.");
  }
};
