import type { LifeEvent, Service, ServiceCategory } from "@/lib/services";

// Every entry was read from the source on checkedAt. Anything not verified is left out (UI shows "Alamin sa opisina").
const CC = "https://ormindoro.gov.ph/wp-content/uploads/2025/10/PGOM-CC-FINAL-SEPT-03.pdf";
const CC_NOTE = "Citizen's Charter ng Provincial Government of Oriental Mindoro, 2024 (1st Edition), inilathala sa ormindoro.gov.ph";
const D = "2026-11-08";
const CAPITOL = "Provincial Capitol Complex, Camilmil, Calapan City";
const GSMAC = "Galing at Serbisyo para sa Mindoreño Action Center (GSMAC), Governor's Office, " + CAPITOL;
const GSMAC_CONTACT = "GSMAC: 288-7776, 0917 875 2064, gsmac@ormin.gov.ph (ayon sa charter)";
const CE = "Certificate of Eligibility (orihinal) mula sa PSWDO";
const GL_STEPS = (first: string, last: string) => [
  first,
  "Pumunta sa PSWDO desk para sa interview at pagbibigay ng Certificate of Eligibility.",
  "Bumalik sa GSMAC para ihanda ang Guarantee Letter.",
  last,
];
const ONE_PER_MONTH = "Isang assistance lang bawat pasyente kada buwan; puwedeng muling mag-avail pagkatapos ng 31 araw.";

export const CATEGORIES: ServiceCategory[] = [
  { slug: "certificates", name: "Certificates at Vital Records", blurb: "Birth certificate, NBI clearance at iba pang dokumento." },
  { slug: "business", name: "Negosyo at Kalakalan", blurb: "Pagpaparehistro ng pangalan ng negosyo." },
  { slug: "social", name: "Serbisyong Panlipunan", blurb: "Tulong sa burol, senior citizen at pamilyang nangangailangan." },
  { slug: "health", name: "Kalusugan", blurb: "Ambulansya, gamot, hospital bill at bakuna laban sa rabies." },
  { slug: "taxation", name: "Buwis at Bayarin", blurb: "Rehistro at buwis sa BIR." },
  { slug: "agriculture", name: "Agrikultura", blurb: "Beterinaryo at kagamitang pansaka." },
  { slug: "infrastructure", name: "Imprastraktura", blurb: "Paparating pa. Tumulong sa aming volunteers." },
  { slug: "education", name: "Edukasyon", blurb: "Scholarship para sa mahihirap na estudyante." },
  { slug: "public-safety", name: "Kaligtasan ng Publiko", blurb: "Para sa emergency, tingnan ang mga hotline." },
];

export const SERVICES: Service[] = [
  // --- Provincial government, sourced from the Citizen's Charter ---
  {
    id: "gsmac-burial-assistance", category: "social", title: "Burial Assistance (GSMAC)",
    summary: "Tulong ng Provincial Government para sa burol ng namatayan, sa pamamagitan ng Guarantee Letter sa kasaping punerarya.",
    office: GSMAC, hours: "24/7 ayon sa charter", fee: "Libre", processing: "15 minuto (kabuuan ayon sa charter)",
    who: "Pamilya ng namatay; dapat hilingin sa loob ng isang buwan pagkamatay.",
    requirements: ["Death Certificate (1 photocopy), mula sa Municipal/City Civil Registrar", "Funeral Contract (1 photocopy), mula sa punerarya", CE],
    steps: [
      "Ipakita ang Death Certificate at Funeral Contract sa Information Desk ng GSMAC at sagutan ang Information Sheet.",
      "Pumunta sa PSWDO desk para sa interview at Certificate of Eligibility.",
      "Bumalik sa GSMAC para ihanda ang Guarantee Letter.",
      "Kunin ang Guarantee Letter at ipakita sa kasaping punerarya.",
      "Sagutan ang client satisfaction survey.",
    ],
    contact: GSMAC_CONTACT, source: CC, sourceNote: CC_NOTE + ", p. 43", checkedAt: D, draft: true,
  },
  {
    id: "gsmac-ambulance-assistance", category: "health", title: "Ambulance Assistance (GSMAC)",
    summary: "Ambulansya ng Provincial Government para sa mga taga-Oriental Mindoro, sa loob at labas ng lalawigan. Unahin ang emergency; ang hindi gaanong grabe ay karaniwang iniiskedyul.",
    office: GSMAC, hours: "24/7 ayon sa charter", fee: "Libre", processing: "Humigit-kumulang 7 minuto (3 + 3 + 1 minuto bawat hakbang)",
    who: "Lahat", requirements: ["Wala"],
    steps: [
      "Tawagan ang GSMAC Nurse hotline 0917 802 2596 o pumunta sa GSMAC Office sa Provincial Capitol.",
      "Sagutan ang Ambulance Assistance Request Form.",
      "Ipapaliwanag ng GSMAC ang protocol sa paglilipat ng pasyente at ang mga dokumentong kailangan.",
      "Ibibigay ang request form sa nakatalagang driver.",
    ],
    contact: "Nurse hotline: 0917 802 2596. " + GSMAC_CONTACT, source: CC, sourceNote: CC_NOTE + ", p. 40", checkedAt: D, draft: true,
  },
  {
    id: "gsmac-medicine-assistance", category: "health", title: "Medicine Assistance (GSMAC)",
    summary: "Tulong sa pagbili ng gamot sa pamamagitan ng Guarantee Letter sa kasaping botika.",
    office: GSMAC, hours: "24/7 ayon sa charter", fee: "Libre", who: "Lahat; " + ONE_PER_MONTH,
    requirements: ["Orihinal na reseta mula sa ospital/klinika", "2 photocopy ng reseta", CE],
    steps: GL_STEPS(
      "Ibigay ang reseta sa Information Desk ng GSMAC. Titingnan ang eligibility at kung may stock ang kasaping botika.",
      "Kunin ang Guarantee Letter at reseta.",
    ),
    notes: ["Hindi pa namin nakumpirma ang kabuuang oras ng prosesong ito sa charter."],
    contact: GSMAC_CONTACT, source: CC, sourceNote: CC_NOTE + ", pp. 49-50", checkedAt: D, draft: true,
  },
  {
    id: "gsmac-hospital-bill-assistance", category: "health", title: "Hospital Bill Assistance (GSMAC)",
    summary: "Tulong sa hospital bill ng mga taga-Oriental Mindoro sa pamamagitan ng Guarantee Letter sa ospital.",
    office: GSMAC, hours: "24/7 ayon sa charter", fee: "Libre", who: "Lahat; " + ONE_PER_MONTH,
    requirements: ["Hospital Bill (1 orihinal)", "Hospital Medical Certificate (1 orihinal)", CE],
    steps: GL_STEPS(
      "Ibigay ang hospital bill at medical certificate sa Information Desk ng GSMAC.",
      "Kunin ang Guarantee Letter at ipakita sa ospital.",
    ),
    notes: ["Hindi pa namin nakumpirma ang kabuuang oras ng prosesong ito sa charter."],
    contact: GSMAC_CONTACT, source: CC, sourceNote: CC_NOTE + ", pp. 45-46", checkedAt: D, draft: true,
  },
  {
    id: "gsmac-anti-rabies-vaccine", category: "health", title: "Anti-Rabies Vaccine Assistance (GSMAC)",
    summary: "Tulong sa bakuna laban sa rabies (para sa ika-3 o ika-4 dose) sa pamamagitan ng Guarantee Letter sa kasaping botika.",
    office: GSMAC, hours: "24/7 ayon sa charter", fee: "Libre", processing: "16 minuto (kabuuan ayon sa charter)",
    who: "Lahat",
    requirements: ["Reseta at iskedyul ng turok (orihinal at photocopy), mula sa ospital/klinika/Rural Health Unit", CE],
    steps: [
      "Ibigay ang reseta at iskedyul ng turok sa Information Desk. Titingnan kung ika-3 o ika-4 dose at kung may bakuna sa kasaping botika.",
      "Pumunta sa PSWDO desk para sa interview at Certificate of Eligibility.",
      "Bumalik sa GSMAC para ihanda ang Guarantee Letter.",
      "Kunin ang Guarantee Letter at reseta, at kunin ang bakuna sa itinakdang botika.",
      "Sagutan ang client satisfaction survey.",
    ],
    contact: GSMAC_CONTACT, source: CC, sourceNote: CC_NOTE + ", pp. 41-42", checkedAt: D, draft: true,
  },
  {
    id: "peap-scholarship", category: "education", title: "Provincial Education Assistance Program (PEAP)",
    summary: "Scholarship ng Provincial Government para sa mahihirap na estudyante sa kolehiyo.",
    office: "Governor's Office o Education and Employment Services Division (EESD), " + CAPITOL, hours: "Lunes hanggang Biyernes, 8:00 n.u. hanggang 5:00 n.h.",
    fee: "Libre", processing: "1 araw at 10 minuto (ayon sa charter)",
    who: "Mahihirap na estudyante sa kolehiyo na may General Weighted Average (GWA) na 80% at kumukuha ng four-year Bachelor's Degree.",
    requirements: [
      "Nasagutang PEAP Application Form (1 orihinal), mula sa Office of the Governor o EESD",
      "Certificate of Grades, pirmado ng School Registrar (1 orihinal)",
      "Certificate of Enrollment, pirmado ng School Registrar (1 orihinal)",
      "Certificate of Good Moral Character mula sa huling paaralan (1 orihinal)",
      "Certificate of Barangay Indigency (1 orihinal)",
      "Photocopy ng School ID",
      "1 piraso ng 2x2 na litrato",
    ],
    steps: [
      "Sagutan ang PEAP application form; titingnan ng staff kung kumpleto at itatala ang pangalan.",
      "Alamin ang proseso, turnaround time at anumang dagdag na requirements. Ipapadala ng opisina ang mga dokumento sa EESD.",
      "Sagutan ang client satisfaction survey.",
    ],
    source: CC, sourceNote: CC_NOTE + ", pp. 22-24", checkedAt: D, draft: true,
  },
  {
    id: "aics-cash-educational-assistance", category: "social", title: "Assistance to Individuals in Crisis Situation (AICS)",
    summary: "Programa ng DSWD at Provincial Government para sa educational o cash assistance ng mga napiling benepisyaryo.",
    office: "Governor's Office, " + CAPITOL, fee: "Libre", processing: "2 araw at 5 minuto (ayon sa charter)",
    who: "Mga napiling benepisyaryo; ang pangalan ay isinusumite sa barangay.",
    requirements: ["Certificate of Indigency mula sa barangay (1 orihinal)", "Valid ID (1 photocopy)"],
    steps: [
      "Isumite ang pangalan at kinakailangang impormasyon sa barangay leader.",
      "Kokolektahin ng Governor's Office ang mga pangalan at ipapadala sa DSWD para sa cross-matching.",
      "Pumunta sa itinakdang lugar at petsa ng validation. DSWD ang mag-iinterview; dalhin ang mga dokumento.",
      "Pumunta sa itinakdang lugar at petsa ng pay-out.",
    ],
    source: CC, sourceNote: CC_NOTE + ", pp. 29-31", checkedAt: D, draft: true,
  },
  {
    id: "senior-citizen-incentives", category: "social", title: "Incentives para sa Qualified Senior Citizens",
    summary: "Pinansyal na insentibo at pagkilala ng PSWDO sa mga kwalipikadong senior citizen sa buong lalawigan. Multi-stage ang proseso.",
    office: "Family Welfare Division, Provincial Social Welfare and Development Office (PSWDO)", hours: "8:00 n.u. hanggang 5:00 n.h.",
    fee: "Libre", processing: "36 araw at 2 minuto (kabuuan ayon sa charter)", who: "Senior citizens",
    requirements: [
      "Birth Certificate o anumang patunay ng kapanganakan (PSA/Local Civil Registrar)",
      "Barangay Residency (Sangguniang Barangay)",
      "Senior Citizen's ID mula sa Office of the Senior Citizens Affairs",
    ],
    steps: [
      "Pumirma sa client logbook sa lobby ng opisina.",
      "Isumite ang mga dokumento sa Administrative Division para suriin at i-encode sa masterlist.",
      "Hintayin ang validation, pag-apruba at payroll processing ng PSWDO at mga kasangkot na opisina.",
      "Aabisuhan ka at ang MSWDO. Pumunta sa PSWDO para sa release, at kunin ang insentibo sa Provincial Treasurer's Office gamit ang claim stub.",
    ],
    contact: "Feedback: 0936 308-5380 (ayon sa charter)", source: CC, sourceNote: CC_NOTE + ", pp. 562-564", checkedAt: D, draft: true,
  },
  {
    id: "veterinary-health-certificate", category: "agriculture", title: "Veterinary Health Certificate",
    summary: "Ibinibigay sa mga nag-aalaga ng hayop bilang requirement sa pagbiyahe, pagkatay at iba pang transaksyong nangangailangan ng patunay ng kalusugan ng hayop.",
    office: "Provincial Veterinary Office (ProVet) sa Capitol, o Animal Quarantine Office sa mga pantalan",
    hours: "ProVet: Lunes hanggang Biyernes sa oras ng opisina. Quarantine Office sa pantalan: 24/7, Lunes hanggang Linggo.",
    fee: "Bawat ulo: aso at pusa PHP 20; baboy, kambing, tupa PHP 10; baka at kalabaw PHP 20. Para sa manok, gamefowl at itik, tingnan ang charter.",
    processing: "35 minuto (kabuuan ayon sa charter)", who: "Lahat",
    requirements: [
      "Client Request Form (1 orihinal), mula sa ProVet o Quarantine personnel",
      "Aso at pusa: Rabies vaccination certificate mula sa lisensyadong beterinaryo",
      "Livestock at poultry: iba-iba ang dokumento (hal. Animal Inspection Certificate o Veterinary Health Certificate mula sa munisipyo, negative blood test, vaccination certificate, farm accreditation). Tingnan ang charter.",
      "Official Receipt mula sa Provincial Treasurer's Office",
    ],
    steps: [
      "Isumite ang Client Request Form sa front desk ng ProVet o sa Quarantine personnel sa pantalan.",
      "Ipakita ang hayop at mga dokumento sa beterinaryo para sa inspeksyon. Ibibigay ang payment slip kung kumpleto.",
      "Magbayad sa Provincial Treasurer's Office at ibalik ang Official Receipt sa ProVet.",
      "Kunin ang Veterinary Health Certificate.",
    ],
    source: CC, sourceNote: CC_NOTE + ", pp. 698-701", checkedAt: D, draft: true,
  },
  {
    id: "farm-tools-machinery", category: "agriculture", title: "Farm Tools at Makinarya (Logistical Support)",
    summary: "Kagamitang pansaka at makinarya mula sa Provincial Agriculturist's Office para sa mga kwalipikadong samahan ng magsasaka, LGU at paaralan.",
    office: "Agricultural and Biosystems Engineering Services Division, Provincial Agriculturist's Office (PAgO)",
    hours: "Lunes hanggang Biyernes, 8:00 n.u. hanggang 5:00 n.h., maliban kung holiday", fee: "Libre", processing: "Mga 3 buwan, 2 araw at 29 minuto (multi-stage, ayon sa charter)",
    who: "Farmers' Cooperatives/Associations (FCAs), Local Government Units (LGUs) at mga paaralan sa Oriental Mindoro.",
    requirements: [
      "Request Letter/Resolution (1 orihinal, 2 photocopy)",
      "Endorsement Letter para sa FCAs (1 orihinal, 1 photocopy), mula sa Municipal/City Agriculturist o Mayor",
      "Certificate of Registration mula sa SEC/CDA/DOLE para sa FCAs",
      "SP Certificate of Accreditation para sa FCAs",
      "Validation Report (1 orihinal, 1 photocopy), mula sa PAgO",
      "Masterlist ng mga magsasakang benepisyaryo (1 orihinal, 1 photocopy), mula sa PAgO",
    ],
    steps: [
      "Pumirma sa client logbook sa front desk at isumite ang kumpletong dokumento.",
      "Susuriin ang mga dokumento at iiskedyul ang on-site validation (mga 1 araw).",
      "Pag-apruba ng request at pagpoproseso ng procurement (mga 3 buwan).",
      "Tatanggapin ang kagamitan sa itinakdang iskedyul ng distribusyon at pipirmahan ang mga form at survey.",
    ],
    source: CC, sourceNote: CC_NOTE + ", pp. 574-576", checkedAt: D, draft: true,
  },

  // --- National agencies: plain description + link out only (specifics not verified) ---
  {
    id: "psa-birth-certificate", category: "certificates", title: "PSA Birth Certificate",
    summary: "Opisyal na kopya ng birth certificate mula sa Philippine Statistics Authority. Mag-order online sa PSA Serbilis.",
    source: "https://psaserbilis.com.ph", sourceNote: "Hindi namin nabuksan ang psa.gov.ph (naka-block sa awtomatikong pag-access). Ang link ay ang online ordering na may titulong \"PSA Birth Certificates (and more)\". Kumpirmahin ang bayad at oras doon.", checkedAt: D, draft: true,
  },
  {
    id: "nbi-clearance", category: "certificates", title: "NBI Clearance",
    summary: "Clearance mula sa National Bureau of Investigation. May online application at listahan ng mga clearance center sa opisyal na website ng NBI.",
    source: "https://nbi.gov.ph", sourceNote: "Mula sa homepage ng NBI: \"Online NBI Clearance\" (How to Apply, Where to Apply) at Clearance Centers.", checkedAt: D, draft: true,
  },
  {
    id: "dti-business-name-registration", category: "business", title: "Pagpaparehistro ng Business Name (DTI BNRS)",
    summary: "Online na pagpaparehistro, renewal at certification ng business name sa Business Name Registration System ng DTI. Business name ang anumang pangalang iba sa tunay na pangalan ng may-ari na ginagamit sa negosyo.",
    contact: "bnrs.support@dti.gov.ph; Text/Viber 0917 595 3930", source: "https://bnrs.dti.gov.ph", sourceNote: "Mula sa homepage ng BNRS (Search, New Registration, Renewal, Cancellation, Request Certification).", checkedAt: D, draft: true,
  },
  {
    id: "bir-registration", category: "taxation", title: "BIR: Rehistro at Buwis",
    summary: "Ang Bureau of Internal Revenue ang opisyal na tanggapan para sa pagpaparehistro ng buwis at pagbabayad ng buwis ng negosyo at indibidwal.",
    source: "https://www.bir.gov.ph", sourceNote: "Nabuksan ang homepage; walang nakumpirmang detalye ng bayad o proseso.", checkedAt: D, draft: true,
  },
  {
    id: "sss-membership", category: "social", title: "SSS Membership",
    summary: "Social Security System: pagsali bilang miyembro (empleyado, self-employed, OFW, voluntary at iba pa).",
    source: "https://www.sss.gov.ph/become-an-sss-member", sourceNote: "Mula sa menu ng sss.gov.ph (Membership & Coverage, Become an SSS Member).", checkedAt: D, draft: true,
  },
  {
    id: "philhealth-online-services", category: "health", title: "PhilHealth Online Services",
    summary: "Tingnan ang PhilHealth records at kontribusyon, magbayad ng premium online, at hanapin ang pinakamalapit na PhilHealth office.",
    source: "https://www.philhealth.gov.ph", sourceNote: "Mula sa homepage ng PhilHealth (Online Services).", checkedAt: D, draft: true,
  },
];

export const EVENTS: LifeEvent[] = [
  { slug: "magsimula-ng-negosyo", name: "Magsimula ng negosyo", blurb: "Pangalan ng negosyo at buwis.", serviceIds: ["dti-business-name-registration", "bir-registration"] },
  { slug: "pagkakaroon-ng-anak", name: "Pagkakaroon ng anak", blurb: "Birth certificate at PhilHealth.", serviceIds: ["psa-birth-certificate", "philhealth-online-services"] },
  { slug: "pagkakasakit", name: "Pagkakasakit o aksidente", blurb: "Ambulansya, gamot at hospital bill.", serviceIds: ["gsmac-ambulance-assistance", "gsmac-medicine-assistance", "gsmac-hospital-bill-assistance", "gsmac-anti-rabies-vaccine"] },
  { slug: "pagkamatay-ng-mahal-sa-buhay", name: "Pagkamatay ng mahal sa buhay", blurb: "Tulong sa burol.", serviceIds: ["gsmac-burial-assistance"] },
  { slug: "pag-aaral", name: "Pag-aaral sa kolehiyo", blurb: "Scholarship at clearance.", serviceIds: ["peap-scholarship", "nbi-clearance"] },
  { slug: "pagtanda", name: "Pagtanda", blurb: "Insentibo para sa senior citizen.", serviceIds: ["senior-citizen-incentives", "sss-membership"] },
  { slug: "pagsasaka", name: "Pagsasaka at pag-aalaga ng hayop", blurb: "Beterinaryo at kagamitan.", serviceIds: ["veterinary-health-certificate", "farm-tools-machinery"] },
];
