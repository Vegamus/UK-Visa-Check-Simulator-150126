
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { VisaApplicationData, EligibilityResult } from './types';
import { assessVisaEligibility } from './services/visaAlgorithm';
import toast from 'react-hot-toast';
import LoadingSpinner from './src/components/LoadingSpinner';
import { exportResultToPDF } from './src/utils/pdfExport';
import { 
  ClipboardDocumentCheckIcon, 
  UserIcon, 
  MapIcon, 
  BanknotesIcon, 
  ShieldCheckIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  SparklesIcon,
  HomeModernIcon,
  ExclamationCircleIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  ShieldCheckIcon as ShieldIcon,
  GlobeAltIcon,
  CurrencyPoundIcon,
  HeartIcon,
  ArrowPathIcon,
  BeakerIcon,
  CalendarIcon,
  BriefcaseIcon,
  UsersIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkiye", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const MARITAL_STATUSES = ["Single", "Married", "Civil Partnership", "Divorced", "Widowed", "Separated"];
const ACCOMMODATION_TYPES = ["Hotel", "Airbnb", "Staying with family/friends", "Student Accommodation", "Hostel", "Not Decided", "Other"];
const RESIDENTIAL_STATUSES = ["Own", "Rent", "Family", "Other"];

const App: React.FC = () => {
  const [step, setStep] = useState(1);
  const formTopRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<VisaApplicationData>({
    personalInfo: { 
      givenName: '', familyName: '', dob: '1990-01-01', 
      nationality: '', otherNationality: '', residenceCountry: '', 
      yearsAtAddress: 0, residentialStatus: 'Rent',
      maritalStatus: 'Single', gender: 'Male', email: '', phone: '' 
    },
    travelDetails: { 
      purpose: 'Tourism', 
      businessDetails: { companyName: '', activityReason: '', willBePaidInUK: false },
      durationDays: 14, hasSpecificDates: false, 
      startDate: '', endDate: '', travelCompanions: false,
      accommodationType: 'Hotel', accommodationDetails: '', hasRelativesInUK: false,
      relativeDetails: { relationship: '', residencyStatus: '' }
    },
    finances: { 
      payingParty: 'Self', employmentStatus: 'Employed', 
      monthlyIncome: 2000, monthlyExpenses: 800, 
      savingsAmount: 5000, estimatedTripCost: 1500, 
      hasFinancialDependents: false, financialDependentsCount: 0,
      sponsorDetails: { name: '', relationship: '', reason: '', contributionAmount: 0 }
    },
    history: { 
      previousVisits: 0, hasUKApprovals: false, hasSchengenTravel: false, 
      hasUSACanadaTravel: false, visaRefusals: false, 
      immigrationBreaches: false, refusalDetails: '', 
      criminalRecord: false 
    },
    tiesToHome: { 
      ownsProperty: false, propertyDetails: { isRented: false, residenceDurationYears: 0 },
      hasDependents: false, dependentDetails: '',
      employmentDetails: { isPermanent: true, tenureMonths: 0, jobTitle: '' },
      hasJobOfferOrCurrentJob: true 
    }
  });

  const [loading, setLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<EligibilityResult | null>(null);
  const [baselineResult, setBaselineResult] = useState<EligibilityResult | null>(null);
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  const [userInputCode, setUserInputCode] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    if (formTopRef.current) {
      formTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [step]);

  useEffect(() => {
    if (formData.travelDetails.hasSpecificDates && formData.travelDetails.startDate && formData.travelDetails.endDate) {
      const start = new Date(formData.travelDetails.startDate);
      const end = new Date(formData.travelDetails.endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        setFormData(prev => ({
          ...prev,
          travelDetails: { ...prev.travelDetails, durationDays: diffDays }
        }));
      }
    }
  }, [formData.travelDetails.hasSpecificDates, formData.travelDetails.startDate, formData.travelDetails.endDate]);

  const errors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (step === 1) {
      if (!formData.personalInfo.nationality) errs.nationality = "Nationality is required";
      if (!formData.personalInfo.givenName) errs.givenName = "Given name is required";
      if (!formData.personalInfo.familyName) errs.familyName = "Family name is required";
      if (!formData.personalInfo.email.includes('@')) errs.email = "Valid email is required";
    }
    if (step === 2) {
      if (formData.travelDetails.durationDays <= 0) errs.duration = "Duration must be positive";
      if (formData.travelDetails.hasSpecificDates) {
        if (!formData.travelDetails.startDate) errs.startDate = "Start date required";
        if (!formData.travelDetails.endDate) errs.endDate = "End date required";
      }
    }
    if (step === 3) {
      if (formData.finances.estimatedTripCost <= 0) errs.cost = "Estimated cost required";
      if (formData.finances.monthlyExpenses < 0) errs.expenses = "Expenses cannot be negative";
    }
    return errs;
  }, [formData, step]);

  const isValidStep = Object.keys(errors).length === 0;

  const updateNestedData = (section: keyof VisaApplicationData, field: string, value: any) => {
    setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  const updateDeepData = (section: keyof VisaApplicationData, subField: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subField]: {
          ...(prev[section] as any)[subField],
          [field]: value
        }
      }
    }));
  };

  const sendCode = () => {
    if (!formData.personalInfo.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);
    setIsEmailSent(true);
    toast.success(`Verification code sent: ${code}`, { duration: 6000 });
  };

  const verifyCode = () => {
    if (userInputCode === verificationCode) {
      setIsEmailVerified(true);
      toast.success('Email verified successfully!');
    } else {
      toast.error('Invalid verification code. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!isEmailVerified) {
      toast.error('Please verify your email first');
      return;
    }
    setLoading(true);
    try {
      const assessment = await assessVisaEligibility(formData, isSimulationMode ? baselineResult || undefined : undefined);
      setCurrentResult(assessment);
      if (!baselineResult) setBaselineResult(assessment);
      toast.success('Assessment completed successfully!');
      setStep(6);
    } catch (err) {
      toast.error('Assessment failed. Please check your API key and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (currentResult) {
      try {
        exportResultToPDF(formData, currentResult);
        toast.success('PDF downloaded successfully!');
      } catch (err) {
        toast.error('Failed to generate PDF');
        console.error(err);
      }
    }
  };

  const toggleSimulation = () => {
    setIsSimulationMode(true);
    setStep(1);
  };

  if (loading) {
    return <LoadingSpinner message="Analyzing your visa eligibility with AI..." />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full mb-4">
          <ClipboardDocumentCheckIcon className="w-5 h-5" />
          <span className="font-semibold uppercase tracking-widest text-xs">UK Visa Simulator</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Standard Visitor Visa Eligibility</h1>
        <p className="text-slate-500 text-sm">Official Caseworker Guidance Compliance Check (v2.0)</p>
        
        {isSimulationMode && (
          <div className="mt-4 flex items-center justify-center space-x-2 text-amber-600 font-bold bg-amber-50 py-2 px-4 rounded-lg border border-amber-200 w-max mx-auto animate-pulse">
            <BeakerIcon className="w-5 h-5" />
            <span>"What If" Scenario Mode Active</span>
          </div>
        )}
      </header>

      <div ref={formTopRef} className="sr-only" aria-hidden="true" />

      <main className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden min-h-[600px] flex flex-col transition-all duration-500">
        {step < 6 && (
          <div className="p-8 md:p-12 flex-1">
            <div className="mb-10 flex justify-between gap-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className="flex-1">
                  <div className={`h-2 rounded-full transition-all duration-700 ${step >= s ? 'bg-indigo-600' : 'bg-slate-100'}`} />
                  <p className={`text-[10px] mt-2 font-bold uppercase ${step === s ? 'text-indigo-600' : 'text-slate-300'}`}>Step {s}</p>
                </div>
              ))}
            </div>

            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold flex items-center text-slate-800"><UserIcon className="w-6 h-6 mr-2 text-indigo-600" /> Personal Identity</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Given Name(s)</label>
                      <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200" value={formData.personalInfo.givenName} onChange={(e) => updateNestedData('personalInfo', 'givenName', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Family Name</label>
                      <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200" value={formData.personalInfo.familyName} onChange={(e) => updateNestedData('personalInfo', 'familyName', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Date of Birth</label>
                      <input type="date" className="w-full px-4 py-3 rounded-xl border border-slate-200" value={formData.personalInfo.dob} onChange={(e) => updateNestedData('personalInfo', 'dob', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Nationality</label>
                      <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={formData.personalInfo.nationality} onChange={(e) => updateNestedData('personalInfo', 'nationality', e.target.value)}>
                        <option value="">Select Country</option>
                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                     <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Marital Status</label>
                      <select className="w-full px-4 py-3 rounded-xl border border-slate-200" value={formData.personalInfo.maritalStatus} onChange={(e) => updateNestedData('personalInfo', 'maritalStatus', e.target.value)}>
                        {MARITAL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                      <input type="email" readOnly={isSimulationMode} className={`w-full px-4 py-3 rounded-xl border border-slate-200 outline-none ${isSimulationMode ? 'bg-slate-50 text-slate-400' : ''}`} value={formData.personalInfo.email} onChange={(e) => updateNestedData('personalInfo', 'email', e.target.value)} />
                    </div>
                    <div className="md:col-span-2 pt-4 border-t border-slate-100">
                       <label className="block text-sm font-semibold text-slate-700 mb-2">How long have you lived at your current address (Years)?</label>
                       <input type="number" className="w-full md:w-1/2 px-4 py-3 rounded-xl border border-slate-200" value={formData.personalInfo.yearsAtAddress} onChange={(e) => updateNestedData('personalInfo', 'yearsAtAddress', parseInt(e.target.value) || 0)} />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold flex items-center text-slate-800"><MapIcon className="w-6 h-6 mr-2 text-indigo-600" /> Travel & Accommodation</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Main Purpose of Visit</label>
                      <select className="w-full px-4 py-3 rounded-xl border border-slate-200" value={formData.travelDetails.purpose} onChange={(e) => updateNestedData('travelDetails', 'purpose', e.target.value)}>
                        <option value="Tourism">Tourism</option>
                        <option value="Business">Business (inc. sports/entertainment)</option>
                        <option value="Family">Visiting Family</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {formData.travelDetails.purpose === 'Business' && (
                       <div className="md:col-span-2 p-6 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-4">
                          <h3 className="font-bold text-indigo-800 flex items-center"><BriefcaseIcon className="w-5 h-5 mr-2"/> Business Details</h3>
                          <div className="grid md:grid-cols-2 gap-4">
                             <div>
                               <label className="block text-sm font-semibold text-slate-700 mb-2">Company/Organisation Name</label>
                               <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200" placeholder="e.g. ILES FCA LTD" value={formData.travelDetails.businessDetails?.companyName || ''} onChange={(e) => updateDeepData('travelDetails', 'businessDetails', 'companyName', e.target.value)} />
                             </div>
                             <div>
                               <label className="block text-sm font-semibold text-slate-700 mb-2">Activity (e.g. Meetings, Conference)</label>
                               <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200" value={formData.travelDetails.businessDetails?.activityReason || ''} onChange={(e) => updateDeepData('travelDetails', 'businessDetails', 'activityReason', e.target.value)} />
                             </div>
                             <div className="flex items-center space-x-3 md:col-span-2">
                               <input type="checkbox" id="paid" className="w-5 h-5 rounded text-indigo-600" checked={formData.travelDetails.businessDetails?.willBePaidInUK || false} onChange={(e) => updateDeepData('travelDetails', 'businessDetails', 'willBePaidInUK', e.target.checked)} />
                               <div>
                                 <label htmlFor="paid" className="text-sm font-semibold text-slate-700">Will you be paid for any activities in the UK?</label>
                                 <p className="text-xs text-slate-500">Normally prohibited for visitors (V 4.7).</p>
                               </div>
                             </div>
                          </div>
                       </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Planned Duration (Days)</label>
                      <input 
                        type="number" 
                        readOnly={formData.travelDetails.hasSpecificDates} 
                        className={`w-full px-4 py-3 rounded-xl border border-slate-200 ${formData.travelDetails.hasSpecificDates ? 'bg-slate-100 text-slate-500' : ''}`}
                        value={formData.travelDetails.durationDays} 
                        onChange={(e) => updateNestedData('travelDetails', 'durationDays', parseInt(e.target.value) || 0)} 
                      />
                    </div>
                    
                    <div className="md:col-span-2 space-y-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                          <label className="text-sm font-semibold text-slate-700 flex items-center"><CalendarIcon className="w-5 h-5 mr-2 text-indigo-500"/> Do you have specific travel dates?</label>
                          <input 
                              type="checkbox" 
                              className="w-6 h-6 rounded text-indigo-600 transition-all"
                              checked={formData.travelDetails.hasSpecificDates}
                              onChange={(e) => updateNestedData('travelDetails', 'hasSpecificDates', e.target.checked)}
                          />
                      </div>

                      {formData.travelDetails.hasSpecificDates && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
                              <div>
                                  <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date</label>
                                  <input type="date" className="w-full px-4 py-3 rounded-xl border border-slate-200" value={formData.travelDetails.startDate || ''} onChange={(e) => updateNestedData('travelDetails', 'startDate', e.target.value)} />
                                  {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
                              </div>
                              <div>
                                  <label className="block text-sm font-semibold text-slate-700 mb-2">End Date</label>
                                  <input type="date" className="w-full px-4 py-3 rounded-xl border border-slate-200" value={formData.travelDetails.endDate || ''} onChange={(e) => updateNestedData('travelDetails', 'endDate', e.target.value)} />
                                  {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
                              </div>
                          </div>
                      )}
                    </div>
                    
                     <div className="flex items-center space-x-3 md:col-span-2 pt-4">
                        <UsersIcon className="w-6 h-6 text-slate-400" />
                        <div className="flex-1">
                          <label className="text-sm font-semibold text-slate-700">Are you travelling with anyone?</label>
                          <p className="text-xs text-slate-500">Partner, spouse, or dependents.</p>
                        </div>
                        <input type="checkbox" className="w-6 h-6 rounded text-indigo-600" checked={formData.travelDetails.travelCompanions} onChange={(e) => updateNestedData('travelDetails', 'travelCompanions', e.target.checked)} />
                      </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold flex items-center text-slate-800"><CurrencyPoundIcon className="w-6 h-6 mr-2 text-indigo-600" /> Finances (in GBP £)</h2>
                  
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-sm text-amber-800 mb-6">
                    <span className="font-bold">Affordability Check:</span> The Home Office calculates your <strong>Disposable Income</strong> (Income minus Expenses). Your trip cost must be proportionate to your disposable income and savings.
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="md:col-span-2">
                       <label className="block text-sm font-semibold text-slate-700 mb-2">Who is paying for this trip?</label>
                       <select className="w-full px-4 py-3 rounded-xl border border-slate-200" value={formData.finances.payingParty} onChange={(e) => updateNestedData('finances', 'payingParty', e.target.value)}>
                         <option value="Self">I am paying for myself</option>
                         <option value="Employer">My employer or company</option>
                         <option value="Sponsor">Family member or friend in UK</option>
                         <option value="Other">Other</option>
                       </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Monthly Net Income (£)</label>
                      <input type="number" className="w-full px-4 py-3 rounded-xl border border-slate-200" value={formData.finances.monthlyIncome} onChange={(e) => updateNestedData('finances', 'monthlyIncome', parseInt(e.target.value) || 0)} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2 text-red-600">Total Monthly Expenses (£)</label>
                      <input type="number" placeholder="Rent, food, bills..." className="w-full px-4 py-3 rounded-xl border border-red-100 bg-red-50 focus:ring-red-200" value={formData.finances.monthlyExpenses} onChange={(e) => updateNestedData('finances', 'monthlyExpenses', parseInt(e.target.value) || 0)} />
                      <p className="text-xs text-slate-500 mt-1">Total amount you spend each month.</p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 md:col-span-2 grid md:grid-cols-2 gap-6">
                        <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Estimated Trip Cost (£)</label>
                        <input type="number" className="w-full px-4 py-3 rounded-xl border border-slate-200" value={formData.finances.estimatedTripCost} onChange={(e) => updateNestedData('finances', 'estimatedTripCost', parseInt(e.target.value) || 0)} />
                        </div>
                        <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 text-indigo-600 font-bold underline cursor-help" title="Home Office check for 'genuine ties' often relies on substantial personal savings compared to trip cost.">Total Savings (£)</label>
                        <input type="number" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500" value={formData.finances.savingsAmount} onChange={(e) => updateNestedData('finances', 'savingsAmount', parseInt(e.target.value) || 0)} />
                        </div>
                    </div>

                    <div className="flex flex-col space-y-4 md:col-span-2">
                      <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <input type="checkbox" id="dependents" className="w-5 h-5 rounded text-indigo-600" checked={formData.finances.hasFinancialDependents} onChange={(e) => updateNestedData('finances', 'hasFinancialDependents', e.target.checked)} />
                        <label htmlFor="dependents" className="text-sm font-semibold text-slate-700">Do you have financial dependents?</label>
                      </div>
                      {formData.finances.hasFinancialDependents && (
                          <div className="pl-4">
                              <label className="block text-sm font-semibold text-slate-700 mb-2">How many people rely on you?</label>
                              <input type="number" className="w-32 px-4 py-2 rounded-lg border border-slate-200" value={formData.finances.financialDependentsCount} onChange={(e) => updateNestedData('finances', 'financialDependentsCount', parseInt(e.target.value) || 0)} />
                          </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold flex items-center text-slate-800"><BuildingOfficeIcon className="w-6 h-6 mr-2 text-indigo-600" /> Strong Ties to Home</h2>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                        <label className="block text-sm font-semibold text-slate-700">What is the ownership status of your home?</label>
                        <select className="w-full px-4 py-3 rounded-xl border border-slate-200" value={formData.personalInfo.residentialStatus} onChange={(e) => updateNestedData('personalInfo', 'residentialStatus', e.target.value)}>
                            {RESIDENTIAL_STATUSES.map(s => <option key={s} value={s}>{s === 'Own' ? 'I own it' : s === 'Rent' ? 'I rent it' : s === 'Family' ? 'I live with family' : 'Other'}</option>)}
                        </select>
                    </div>
                    
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                      <h3 className="font-bold text-slate-800 flex items-center">
                        <BuildingOfficeIcon className="w-5 h-5 mr-2 text-indigo-500"/> Employment Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Job Title</label>
                          <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Software Engineer" value={formData.tiesToHome.employmentDetails.jobTitle} onChange={(e) => updateDeepData('tiesToHome', 'employmentDetails', 'jobTitle', e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Time in Role (Months)</label>
                          <input type="number" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.tiesToHome.employmentDetails.tenureMonths} onChange={(e) => updateDeepData('tiesToHome', 'employmentDetails', 'tenureMonths', parseInt(e.target.value) || 0)} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200 mt-2">
                        <div>
                          <p className="font-semibold text-slate-700">Is this a permanent position?</p>
                          <p className="text-xs text-slate-500">Temporary contracts carry higher risk.</p>
                        </div>
                        <input type="checkbox" className="w-6 h-6 rounded text-indigo-600" checked={formData.tiesToHome.employmentDetails.isPermanent} onChange={(e) => updateDeepData('tiesToHome', 'employmentDetails', 'isPermanent', e.target.checked)} />
                      </div>
                    </div>

                    <div className="p-6 bg-red-50 rounded-2xl border border-red-100 space-y-4">
                       <h3 className="font-bold text-red-800 flex items-center"><ExclamationCircleIcon className="w-5 h-5 mr-2"/> Adverse History Check</h3>
                       <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-red-900 font-medium">Have you ever been refused a visa for any country?</span>
                                <input type="checkbox" className="w-5 h-5 rounded text-red-600" checked={formData.history.visaRefusals} onChange={(e) => updateNestedData('history', 'visaRefusals', e.target.checked)} />
                            </div>
                             <div className="flex items-center justify-between">
                                <span className="text-sm text-red-900 font-medium">Have you ever breached immigration laws? (Overstayed, worked illegally)</span>
                                <input type="checkbox" className="w-5 h-5 rounded text-red-600" checked={formData.history.immigrationBreaches} onChange={(e) => updateNestedData('history', 'immigrationBreaches', e.target.checked)} />
                            </div>
                             <div className="flex items-center justify-between">
                                <span className="text-sm text-red-900 font-medium">Do you have a criminal record?</span>
                                <input type="checkbox" className="w-5 h-5 rounded text-red-600" checked={formData.history.criminalRecord} onChange={(e) => updateNestedData('history', 'criminalRecord', e.target.checked)} />
                            </div>
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-8 text-center">
                  <h2 className="text-2xl font-bold flex items-center justify-center text-slate-800"><ShieldIcon className="w-6 h-6 mr-2 text-indigo-600" /> Final Review</h2>
                  <div className="p-8 bg-indigo-50 rounded-3xl border border-indigo-100">
                    <p className="text-slate-700 mb-6">
                      {isSimulationMode 
                        ? "Simulation mode: We will compare your new data against your baseline score."
                        : "Ready to analyze your eligibility profile against UK Caseworker Guidance."}
                    </p>
                    
                    {!isEmailVerified && !isSimulationMode ? (
                       <button onClick={sendCode} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg">Verify Email to Continue</button>
                    ) : (
                       <div className="space-y-4">
                         <div className="text-green-600 font-bold">Verification Cleared</div>
                         <button onClick={handleSubmit} disabled={loading} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xl hover:bg-indigo-700 shadow-2xl transition-all active:scale-95 disabled:opacity-50">
                           {loading ? 'CALCULATING IMPACT...' : isSimulationMode ? 'SIMULATE IMPACT' : 'GET FINAL SCORE'}
                         </button>
                       </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {step < 6 && (
          <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} className="px-8 py-3 text-slate-600 font-bold disabled:opacity-30 hover:bg-slate-200 rounded-2xl transition-all">Previous</button>
            {step < 5 && (
              <button onClick={() => isValidStep && setStep(s => s + 1)} className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl transition-all hover:bg-indigo-700 active:scale-95">Next Step</button>
            )}
          </div>
        )}

        {step === 6 && currentResult && (
          <div className="p-10 md:p-16 animate-in fade-in zoom-in-95 duration-1000 overflow-y-auto max-h-[80vh]">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center space-x-12 mb-8">
                 {isSimulationMode && baselineResult && (
                   <div className="text-center opacity-50 grayscale scale-90">
                     <div className="p-8 rounded-full border-4 border-slate-300 mb-2">
                       <span className="text-3xl font-bold text-slate-500">{baselineResult.score}%</span>
                     </div>
                     <p className="text-xs font-bold text-slate-400">BASELINE</p>
                   </div>
                 )}
                 
                 <div className="relative">
                    {isSimulationMode && baselineResult && (
                      <div className={`absolute -top-10 left-1/2 -translate-x-1/2 font-black text-lg px-3 py-1 rounded-lg ${currentResult.score > baselineResult.score ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                        {currentResult.score > baselineResult.score ? '▲' : '▼'} {Math.abs(currentResult.score - baselineResult.score)}%
                      </div>
                    )}
                    <div className={`p-14 rounded-full border-[12px] bg-slate-50 shadow-xl ${
                      currentResult.score > 75 ? 'border-green-400' : currentResult.score > 50 ? 'border-amber-400' : 'border-red-400'
                    }`}>
                      <span className={`text-7xl font-black ${
                        currentResult.score > 75 ? 'text-green-600' : currentResult.score > 50 ? 'text-amber-600' : 'text-red-600'
                      }`}>{currentResult.score}%</span>
                    </div>
                 </div>
              </div>
              
              <h2 className="text-4xl font-black text-slate-900">Application Rating</h2>
              <div className={`inline-block mt-4 px-6 py-2 rounded-full font-black text-sm tracking-widest uppercase ${
                 currentResult.riskLevel === 'Low' ? 'bg-green-100 text-green-700' : 
                 currentResult.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
              }`}>
                {currentResult.riskLevel} RISK PROFILE
              </div>
            </div>

            {currentResult.scenarioDeltaExplanation && (
              <div className="mb-12 p-8 bg-amber-50 rounded-3xl border border-amber-200 border-dashed animate-in slide-in-from-top-4 duration-500">
                 <h3 className="font-black text-amber-800 mb-4 flex items-center uppercase text-sm tracking-widest">
                   <ArrowPathIcon className="w-5 h-5 mr-2" /> Simulation Analysis
                 </h3>
                 <p className="text-amber-900 leading-relaxed font-medium italic">"{currentResult.scenarioDeltaExplanation}"</p>
              </div>
            )}
            
            <div className="grid gap-8 md:grid-cols-2">
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 md:col-span-2">
                <h3 className="font-black text-xl mb-4 flex items-center text-slate-800"><SparklesIcon className="w-6 h-6 mr-2 text-indigo-500" /> AI Agent Summary</h3>
                <p className="text-slate-600 leading-relaxed text-lg">"{currentResult.summary}"</p>
              </div>

              <div className="p-6 bg-green-50 rounded-3xl border border-green-100">
                 <h4 className="font-bold text-green-800 mb-3">Strongest Points</h4>
                 <ul className="space-y-2">
                   {currentResult.strengths.slice(0, 3).map((s, i) => <li key={i} className="text-sm text-green-700 flex items-start"><span className="mr-2">✓</span> {s}</li>)}
                 </ul>
              </div>

              <div className="p-6 bg-red-50 rounded-3xl border border-red-100">
                 <h4 className="font-bold text-red-800 mb-3">Refusal Triggers</h4>
                 <ul className="space-y-2">
                   {currentResult.weaknesses.slice(0, 3).map((w, i) => <li key={i} className="text-sm text-red-700 flex items-start"><span className="mr-2">⚠</span> {w}</li>)}
                 </ul>
              </div>
            </div>

            <div className="mt-12 space-y-4">
              <button 
                onClick={handleExportPDF}
                className="w-full py-5 bg-primary-600 text-white font-black text-xl rounded-2xl hover:bg-primary-700 shadow-xl flex items-center justify-center transition-all active:scale-95"
              >
                <ArrowDownTrayIcon className="w-6 h-6 mr-2" /> DOWNLOAD PDF REPORT
              </button>
              
              <div className="flex flex-col md:flex-row gap-4">
                <button 
                  onClick={toggleSimulation} 
                  className="flex-1 py-5 bg-amber-600 text-white font-black text-xl rounded-2xl hover:bg-amber-700 shadow-xl flex items-center justify-center transition-all active:scale-95"
                >
                  <BeakerIcon className="w-6 h-6 mr-2" /> RUN "WHAT IF" SCENARIO
                </button>
              <button 
                onClick={() => {
                  setStep(1);
                  setIsEmailVerified(false);
                  setIsEmailSent(false);
                  setUserInputCode('');
                  setIsSimulationMode(false);
                  setBaselineResult(null);
                }} 
                className="flex-1 py-5 border-4 border-indigo-600 text-indigo-600 font-black text-xl rounded-2xl hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
              >
                NEW APPLICATION
              </button>
            </div>
          </div>
        )}
      </main>
      <footer className="mt-16 text-center text-slate-400 text-sm max-w-2xl mx-auto space-y-4">
        <p>Simulation parameters based on Appendix V: Visitor rules. Calculations provided by Gemini 3 reasoning models.</p>
        <div className="h-px bg-slate-200 w-24 mx-auto" />
        <p>© {new Date().getFullYear()} UK Visa Simulator. Non-Governmental Educational Tool.</p>
      </footer>
    </div>
  );
};

export default App;
