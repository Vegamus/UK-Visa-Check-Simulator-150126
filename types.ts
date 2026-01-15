
export interface VisaApplicationData {
  personalInfo: {
    givenName: string;
    familyName: string;
    dob: string; // YYYY-MM-DD
    nationality: string;
    otherNationality: string;
    residenceCountry: string;
    yearsAtAddress: number;
    residentialStatus: 'Own' | 'Rent' | 'Family' | 'Other';
    maritalStatus: string;
    gender: string;
    email: string;
    phone: string;
  };
  travelDetails: {
    purpose: string;
    businessDetails?: {
      companyName: string;
      activityReason: string;
      willBePaidInUK: boolean;
    };
    durationDays: number;
    hasSpecificDates: boolean;
    startDate?: string;
    endDate?: string;
    travelCompanions: boolean;
    accommodationType: 'Hotel' | 'Airbnb' | 'Staying with family/friends' | 'Student Accommodation' | 'Hostel' | 'Not Decided' | 'Other';
    accommodationDetails: string;
    hasRelativesInUK: boolean;
    relativeDetails?: {
      relationship: string;
      residencyStatus: string;
    };
  };
  finances: {
    payingParty: 'Self' | 'Employer' | 'Sponsor' | 'Other';
    employmentStatus: string;
    monthlyIncome: number;
    monthlyExpenses: number; // Critical for disposable income calculation
    savingsAmount: number;
    estimatedTripCost: number;
    hasFinancialDependents: boolean;
    financialDependentsCount: number;
    sponsorDetails?: {
      name: string;
      relationship: string;
      reason: string;
      contributionAmount: number;
    };
  };
  history: {
    previousVisits: number;
    hasUKApprovals: boolean;
    hasSchengenTravel: boolean;
    hasUSACanadaTravel: boolean;
    visaRefusals: boolean;
    immigrationBreaches: boolean; // Overstaying, working illegally, etc.
    refusalDetails: string;
    criminalRecord: boolean;
  };
  tiesToHome: {
    ownsProperty: boolean; // Kept for legacy compatibility, though residentialStatus covers this
    propertyDetails: {
      isRented: boolean;
      residenceDurationYears: number;
    };
    hasDependents: boolean;
    dependentDetails: string;
    employmentDetails: {
      isPermanent: boolean;
      tenureMonths: number;
      jobTitle: string;
    };
    hasJobOfferOrCurrentJob: boolean;
  };
}

export interface EligibilityResult {
  score: number; // 0 to 100
  riskLevel: 'Low' | 'Medium' | 'High';
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  guidanceReferences: string[];
  scenarioDeltaExplanation?: string;
}
