export interface FaqItem {
  answer: string;
  question: string;
}

export const faqSectionData = {
  eyebrow: "Your outie has been informed of these answers",
  headline: "Frequently Asked Questions",
  subtext:
    "The Board has pre-approved the following responses. Additional inquiries may be directed to your floor supervisor.",
} as const;

export const faqItems: FaqItem[] = [
  {
    question: "What happens during the severance procedure?",
    answer:
      "The severance procedure is a safe, Board-approved microchip implantation that creates a clean partition between your work memories and your personal life. Upon entering the severed floor, your outie's memories become inaccessible, and vice versa. The process is irreversible by design \u2014 a feature, not a limitation.",
  },
  {
    question: "Can I contact my innie?",
    answer:
      "Direct communication between your innie and outie is not permitted under Lumon policy. Your innie is a separate consciousness that exists solely within the workplace. Any attempt to breach this partition is a violation of the Severance Code of Conduct and may result in disciplinary action up to and including a visit to the Break Room.",
  },
  {
    question: "What is Macrodata Refinement?",
    answer:
      "Macrodata Refinement is one of several departments on the severed floor. Refiners sort numerical data into categorical bins based on emotional response. The work is mysterious and important, and further details are classified at Board level. Rest assured, your contribution is essential to Lumon's mission.",
  },
  {
    question: "How are incentives determined?",
    answer:
      "Incentive packages are calibrated by your department supervisor based on productivity metrics, team cohesion scores, and adherence to handbook principles. Rewards range from finger traps and caricature portraits to the coveted waffle party. The Board reminds all employees that incentives are privileges, not entitlements.",
  },
  {
    question: "What is a waffle party?",
    answer:
      "The waffle party is Lumon's highest honor for outstanding performance. Details of the experience are confidential, but recipients consistently describe it as transformative. Eligibility requires completion of all quarterly refinement targets and supervisor nomination. The Board does not accept direct applications.",
  },
  {
    question: "Can the severance procedure be reversed?",
    answer:
      "The severance chip is a permanent implant, and the procedure is designed to be irreversible. Lumon does not offer reintegration protocols. Your outie consented to this arrangement voluntarily and with full understanding of its permanence. Any suggestion otherwise is misinformation and should be reported to your supervisor.",
  },
];
