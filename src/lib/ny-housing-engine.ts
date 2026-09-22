/**
 * NYC Housing Law Statutory Rules Engine
 * 
 * Implements deterministic statutory logic for:
 * 1. Housing Stability & Tenant Protection Act of 2019 (HSTPA)
 * 2. NY Real Property Actions and Proceedings Law (RPAPL § 711)
 * 3. NY Real Property Law (RPL § 238-a)
 * 4. NY General Obligations Law (GOL § 7-108)
 */

export interface EvictionNoticeInput {
  tenantName: string;
  tenantAddress: string;
  borough: 'Manhattan' | 'Brooklyn' | 'Queens' | 'Bronx' | 'Staten Island';
  landlordName: string;
  landlordAddress?: string;
  noticeType: '14_day_rent_demand' | 'notice_to_vacate' | 'other';
  dateServed: string;
  daysGiven: number;
  monthlyRent: number;
  baseRentDemanded: number;
  lateFeesIncluded: number;
  otherFeesIncluded: number;
  serviceMethod: 'personal' | 'conspicuous_nail_mail' | 'text_or_email_only' | 'regular_mail';
}

export interface DefectViolation {
  id: string;
  severity: 'critical' | 'high' | 'medium';
  title: string;
  statute: string;
  description: string;
  legalImpact: string;
}

export interface EvictionAnalysisResult {
  hasDefects: boolean;
  totalDemanded: number;
  violations: DefectViolation[];
  defenseScore: number; // 0 to 100
  recommendedAction: string;
  formalDefenseLetter: string;
}

export interface SecurityDepositInput {
  tenantName: string;
  tenantNewAddress: string;
  landlordName: string;
  landlordAddress: string;
  apartmentAddress: string;
  borough: 'Manhattan' | 'Brooklyn' | 'Queens' | 'Bronx' | 'Staten Island';
  moveOutDate: string; // YYYY-MM-DD
  forwardingAddressDate: string; // YYYY-MM-DD
  depositAmount: number;
  hasReceivedItemizedDeduction: boolean;
  itemizedReceivedDate?: string;
}

export interface SecurityDepositResult {
  daysElapsed: number;
  isForfeited: boolean;
  statute: string;
  originalDeposit: number;
  punitiveDamagesMultiplier: number;
  punitiveDamagesAmount: number;
  totalPotentialRecovery: number;
  smallClaimsEligible: boolean;
  smallClaimsBoroughCourt: string;
  formalDemandLetter: string;
  countdownDaysRemaining: number;
}

/**
 * Evaluates an Eviction Notice for NYC Statutory Defects
 */
export function analyzeEvictionNotice(input: EvictionNoticeInput): EvictionAnalysisResult {
  const violations: DefectViolation[] = [];
  const totalDemanded = input.baseRentDemanded + input.lateFeesIncluded + input.otherFeesIncluded;

  // 1. Check Statutory Notice Period (RPAPL § 711(2))
  // Under HSTPA 2019, NY law strictly requires a written 14-day demand for non-payment
  if (input.daysGiven < 14) {
    violations.push({
      id: 'defective_notice_period',
      severity: 'critical',
      title: 'Defective Notice Period (< 14 Days Given)',
      statute: 'NY RPAPL § 711(2)',
      description: `The landlord only provided ${input.daysGiven} days. Under New York Real Property Actions and Proceedings Law § 711(2), as amended by the 2019 HSTPA, a landlord must provide a written demand of at least fourteen (14) full calendar days before initiating a non-payment proceeding.`,
      legalImpact: 'Procedural defect. Grounds for immediate dismissal of any summary non-payment petition in NYC Housing Court.'
    });
  }

  // 2. Check Late Fee Cap (RPL § 238-a)
  // Max late fee is $50 or 5% of monthly rent, whichever is less
  const maxAllowableFee = Math.min(50, input.monthlyRent * 0.05);
  if (input.lateFeesIncluded > maxAllowableFee) {
    violations.push({
      id: 'excessive_late_fee',
      severity: 'high',
      title: `Excessive Late Fee Charged ($${input.lateFeesIncluded})`,
      statute: 'NY Real Property Law § 238-a(2)',
      description: `The notice demands $${input.lateFeesIncluded} in late charges. Under NY RPL § 238-a(2), late fees may not exceed $50 or 5% of monthly rent ($${maxAllowableFee.toFixed(2)}), whichever is less.`,
      legalImpact: 'Unlawful penalty. Landlord cannot recover excessive fees and demand must be amended or voided.'
    });
  }

  // 3. Check Rent Demand Purity (Base Rent Only)
  // HSTPA prohibits non-rent charges (utilities, late fees, legal fees) in statutory rent demands
  if (input.lateFeesIncluded > 0 || input.otherFeesIncluded > 0) {
    violations.push({
      id: 'unlawful_non_rent_charges',
      severity: 'high',
      title: 'Unlawful Non-Rent Charges in Statutory Rent Demand',
      statute: 'NY RPAPL § 702 & RPL § 238-a',
      description: 'Under New York law, a summary proceeding for non-payment can only seek legal base rent. Late fees, legal fees, or utility surcharges cannot be characterized as "added rent" or included in a statutory 14-day demand.',
      legalImpact: 'Substantive defect. Landlords who include non-rent fees risk dismissal of their eviction petition.'
    });
  }

  // 4. Check Service Method (RPAPL § 735)
  if (input.serviceMethod === 'text_or_email_only') {
    violations.push({
      id: 'improper_service_digital',
      severity: 'critical',
      title: 'Improper Service (Text / Email Notice)',
      statute: 'NY RPAPL § 735',
      description: 'The landlord attempted service via text message or email only. New York law requires personal delivery, substitute delivery to a person of suitable age and discretion, or conspicuous affixing ("nail and mail") followed by certified and first-class mailing within one day.',
      legalImpact: 'Fatal jurisdictional defect. Notice is legally void.'
    });
  } else if (input.serviceMethod === 'regular_mail') {
    violations.push({
      id: 'improper_service_mail_only',
      severity: 'medium',
      title: 'Defective Service (Regular Mail Only)',
      statute: 'NY RPAPL § 735',
      description: 'Regular mail without personal attempts or certified mail backup fails the service requirements under RPAPL § 735.',
      legalImpact: 'Jurisdictional challenge in NYC Housing Court.'
    });
  }

  const defenseScore = violations.length === 0 ? 30 : Math.min(100, 50 + violations.length * 20);

  const formalDefenseLetter = generateEvictionDefenseLetter(input, violations);

  return {
    hasDefects: violations.length > 0,
    totalDemanded,
    violations,
    defenseScore,
    recommendedAction: violations.length > 0
      ? 'Serve formal Notice of Statutory Defect to landlord immediately to preempt an unlawful eviction filing.'
      : 'Review lease terms and request rent ledger reconciliation before 14-day statutory expiration.',
    formalDefenseLetter,
  };
}

/**
 * Generates Court-Ready Notice of Statutory Defect Letter
 */
function generateEvictionDefenseLetter(input: EvictionNoticeInput, violations: DefectViolation[]): string {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const violationBullets = violations.map(v => 
    `• ${v.title} (${v.statute}):\n  ${v.description}\n  Legal Impact: ${v.legalImpact}`
  ).join('\n\n');

  return `NOTICE OF STATUTORY DEFECT AND FORMAL ANSWER TO DEFECTIVE RENT DEMAND
PURSUANT TO NEW YORK RPAPL § 711 & RPL § 238-a

DATE: ${today}

TO (LANDLORD / MANAGING AGENT):
${input.landlordName}
${input.landlordAddress || '[Landlord Address on File]'}

FROM (TENANT):
${input.tenantName}
Premises: ${input.tenantAddress}
Borough of ${input.borough}, City of New York, NY

REGARDING: PURPORTED NOTICE / RENT DEMAND DATED ON OR ABOUT ${input.dateServed}

PLEASE BE ADVISED that the undersigned Tenant hereby rejects the purported Notice of Rent Demand served on or about ${input.dateServed}, alleging rent arrears in the amount of $${(input.baseRentDemanded + input.lateFeesIncluded + input.otherFeesIncluded).toFixed(2)}.

Upon detailed examination under the laws of the State of New York and the Housing Stability and Tenant Protection Act of 2019 (HSTPA), the subject notice contains FATAL STATUTORY AND PROCEDURAL DEFECTS, as set forth below:

STATUTORY VIOLATIONS:
${violationBullets}

LEGAL DEMAND:
Pursuant to New York Real Property Actions and Proceedings Law § 711(2) and established appellate authority (including *EOM 106-15 217th Corp. v. Severine*), an invalid or defective predicate rent demand cannot support a summary non-payment proceeding. Any petition commenced on the basis of this defective notice will be subject to immediate motion to dismiss with prejudice, and the Tenant will seek statutory costs, attorney fees, and damages where permitted.

The Landlord is hereby demanded to:
1. Immediately withdraw and rescind the defective notice.
2. Cease and desist from making unlawful demands for non-rent charges or unallowable late fees in violation of RPL § 238-a.
3. Provide an accurate, lawful accounting and rent ledger reflecting only legitimate base rent charges.

Respectfully submitted,

_________________________________________
${input.tenantName}
Tenant of Record
Premises: ${input.tenantAddress}, ${input.borough}, NY

CC: Tenant Case File (TenantGuard NYC Registry Ref #TG-NYC-${Date.now().toString().slice(-6)})`;
}

/**
 * Calculates Security Deposit 14-Day Forfeiture & 2x Punitive Damages (NY GOL § 7-108)
 */
export function calculateSecurityDepositRecovery(input: SecurityDepositInput): SecurityDepositResult {
  const today = new Date();
  const moveOut = new Date(input.moveOutDate);
  const forwarding = new Date(input.forwardingAddressDate);
  
  // The 14-day clock starts on the later of move-out or forwarding address provided
  const clockStart = moveOut > forwarding ? moveOut : forwarding;
  const diffTime = today.getTime() - clockStart.getTime();
  const daysElapsed = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  
  // Did 14 calendar days pass without itemized list?
  const isForfeited = daysElapsed > 14 && (!input.hasReceivedItemizedDeduction);
  const countdownDaysRemaining = Math.max(0, 14 - daysElapsed);

  // Under NY GOL § 7-108(1-a)(g), willful retention triggers punitive damages of up to 2x the deposit
  const punitiveDamagesMultiplier = isForfeited ? 2 : 0;
  const punitiveDamagesAmount = input.depositAmount * punitiveDamagesMultiplier;
  const totalPotentialRecovery = input.depositAmount + punitiveDamagesAmount;

  // NYC Small Claims limit is $10,000 (perfect for deposits up to $3,333 with 2x damages or $10k total)
  const smallClaimsEligible = totalPotentialRecovery <= 10000;

  const boroughCourts: Record<string, string> = {
    'Manhattan': 'New York County Civil Court, 111 Centre Street, New York, NY 10013',
    'Brooklyn': 'Kings County Civil Court, 141 Livingston Street, Brooklyn, NY 11201',
    'Queens': 'Queens County Civil Court, 89-17 Sutphin Blvd, Jamaica, NY 11435',
    'Bronx': 'Bronx County Civil Court, 851 Grand Concourse, Bronx, NY 10451',
    'Staten Island': 'Richmond County Civil Court, 927 Castleton Avenue, Staten Island, NY 10310'
  };

  const formalDemandLetter = generateSecurityDepositDemandLetter(input, daysElapsed, isForfeited, totalPotentialRecovery);

  return {
    daysElapsed,
    isForfeited,
    statute: 'NY General Obligations Law § 7-108(1-a)(e) & § 7-108(1-a)(g)',
    originalDeposit: input.depositAmount,
    punitiveDamagesMultiplier,
    punitiveDamagesAmount,
    totalPotentialRecovery,
    smallClaimsEligible,
    smallClaimsBoroughCourt: boroughCourts[input.borough] || boroughCourts['Manhattan'],
    formalDemandLetter,
    countdownDaysRemaining
  };
}

/**
 * Generates Court-Ready Security Deposit Demand Letter with Statutory Forfeiture Notice
 */
function generateSecurityDepositDemandLetter(
  input: SecurityDepositInput,
  daysElapsed: number,
  isForfeited: boolean,
  totalPotentialRecovery: number
): string {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return `PRE-ACTION DEMAND FOR RETURN OF SECURITY DEPOSIT
NOTICE OF COMPLETE STATUTORY FORFEITURE & INTENT TO SUE FOR 2X PUNITIVE DAMAGES
PURSUANT TO NEW YORK GENERAL OBLIGATIONS LAW § 7-108

DATE: ${today}

VIA CERTIFIED MAIL & DIGITAL RECORD
TO (LANDLORD / PROPERTY MANAGER):
${input.landlordName}
${input.landlordAddress}

FROM (FORMER TENANT):
${input.tenantName}
Forwarding Address: ${input.tenantNewAddress}

RE: LEASE TERMINATION & FULL SECURITY DEPOSIT RETURN
Apartment Premises: ${input.apartmentAddress}, Borough of ${input.borough}, New York
Date Vacated & Keys Surrendered: ${input.moveOutDate}
Date Forwarding Address Formally Provided: ${input.forwardingAddressDate}
Original Security Deposit Entrusted: $${input.depositAmount.toFixed(2)}

DEAR ${input.landlordName.toUpperCase()}:

PLEASE TAKE FORMAL LEGAL NOTICE that as of ${today}, exactly ${daysElapsed} calendar days have elapsed since the surrender of the subject premises and transmission of the Tenant's forwarding address.

1. STATUTORY FORFEITURE OF ENTIRE DEPOSIT (NY GOL § 7-108(1-a)(e))
Under New York General Obligations Law § 7-108(1-a)(e), as amended by the Housing Stability and Tenant Protection Act of 2019:
"Within fourteen days after the tenant has vacated the premises, the landlord shall provide the tenant with an itemized statement indicating the basis for the amount of the deposit retained, if any, and shall return any remaining portion of the deposit to the tenant. If a landlord fails to provide the tenant with the statement and deposit within fourteen days, the landlord shall forfeit any right to retain any portion of the deposit."

Because more than 14 days have passed and you have failed to provide an itemized statement and refund, YOU HAVE LEGALLY FORFEITED ALL RIGHT TO RETAIN ANY PORTION OF THE $${input.depositAmount.toFixed(2)} DEPOSIT, regardless of any alleged damages or wear and tear.

2. STATUTORY 2X PUNITIVE DAMAGES FOR WILLFUL RETENTION (NY GOL § 7-108(1-a)(g))
Under NY GOL § 7-108(1-a)(g), any person who willfully violates this provision shall be liable for actual damages plus punitive damages of up to twice the amount of the deposit.
In this case:
- Base Deposit Owed: $${input.depositAmount.toFixed(2)}
- Statutory 2x Punitive Damages: $${(input.depositAmount * 2).toFixed(2)}
- TOTAL LEGAL CLAIM AMOUNT: $${totalPotentialRecovery.toFixed(2)}

FORMAL DEMAND FOR PAYMENT:
To avoid formal litigation in the New York City Small Claims Court / Civil Court, you are hereby demanded to remit payment of $${input.depositAmount.toFixed(2)} in full within seven (7) business days of receipt of this notice.

Payment may be made via certified check or electronic transfer to the Tenant at the forwarding address above.

If payment is not received within seven (7) business days, an immediate summons and complaint will be filed against you in the NYC Small Claims Court seeking the FULL STATUTORY MAXIMUM OF $${totalPotentialRecovery.toFixed(2)}, plus court filing costs, statutory interest at 9% per annum (CPLR § 5004), and reasonable fees.

GOVERN YOURSELF ACCORDINGLY.

_________________________________________
${input.tenantName}
Former Tenant of Record

CC: New York State Attorney General - Consumer Frauds & Bureau of Housing
TenantGuard Legal Audit Reference: #TG-GOL-${Date.now().toString().slice(-6)}`;
}
