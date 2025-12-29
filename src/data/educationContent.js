/**
 * Education content for the education modal
 */

import { WAGE_LEVEL_COLORS, WAGE_LEVEL_NAMES } from '../utils/constants';

export const WAGE_LEVEL_GUIDE = {
  overview: "The Department of Labor uses four wage levels to classify positions based on job requirements, experience, and complexity. Understanding these levels helps you determine which wage level applies to your position.",
  
  levels: [
    {
      level: 1,
      name: WAGE_LEVEL_NAMES[1],
      color: WAGE_LEVEL_COLORS[1],
      description: "Entry-level positions for workers who have a basic understanding of the occupation.",
      qualifications: [
        "Basic understanding of the occupation",
        "Perform routine tasks",
        "Limited exercise of judgment",
        "Close supervision or detailed instructions"
      ],
      experience: "Typically 0-2 years of experience",
      education: "Bachelor's degree or equivalent, or relevant work experience",
      examples: [
        "Junior Software Developer",
        "Entry-level Data Analyst",
        "Associate Engineer",
        "Trainee positions"
      ],
      typicalDuties: [
        "Follow established procedures and guidelines",
        "Perform tasks under close supervision",
        "Use standard tools and methods",
        "Work on well-defined problems"
      ]
    },
    {
      level: 2,
      name: WAGE_LEVEL_NAMES[2],
      color: WAGE_LEVEL_COLORS[2],
      description: "Qualified positions for workers who have attained a good understanding of the occupation.",
      qualifications: [
        "Good understanding of the occupation",
        "Perform moderately complex tasks",
        "Limited judgment required",
        "Some supervision needed"
      ],
      experience: "Typically 2-5 years of experience",
      education: "Bachelor's degree plus relevant experience, or Master's degree",
      examples: [
        "Software Developer",
        "Data Analyst",
        "Engineer",
        "Business Analyst"
      ],
      typicalDuties: [
        "Apply established principles and practices",
        "Work independently on assigned tasks",
        "Solve problems of moderate complexity",
        "May provide guidance to Level I workers"
      ]
    },
    {
      level: 3,
      name: WAGE_LEVEL_NAMES[3],
      color: WAGE_LEVEL_COLORS[3],
      description: "Experienced positions for workers who have a sound understanding of the occupation.",
      qualifications: [
        "Sound understanding of the occupation",
        "Perform complex tasks",
        "Exercise independent judgment",
        "Minimal supervision required"
      ],
      experience: "Typically 5-8 years of experience",
      education: "Bachelor's degree plus significant experience, or Master's degree plus experience",
      examples: [
        "Senior Software Developer",
        "Senior Data Scientist",
        "Senior Engineer",
        "Project Manager"
      ],
      typicalDuties: [
        "Apply advanced principles and practices",
        "Work independently on complex problems",
        "Make decisions affecting project outcomes",
        "Mentor and guide junior staff"
      ]
    },
    {
      level: 4,
      name: WAGE_LEVEL_NAMES[4],
      color: WAGE_LEVEL_COLORS[4],
      description: "Fully competent positions for workers who have a thorough understanding of the occupation.",
      qualifications: [
        "Thorough understanding of the occupation",
        "Perform highly complex tasks",
        "Exercise independent judgment and analysis",
        "Plan, design, and implement programs"
      ],
      experience: "Typically 8+ years of experience",
      education: "Advanced degree (Master's or PhD) plus extensive experience, or equivalent expertise",
      examples: [
        "Principal Software Architect",
        "Lead Data Scientist",
        "Senior Principal Engineer",
        "Director of Engineering"
      ],
      typicalDuties: [
        "Develop new approaches and methodologies",
        "Lead major projects and initiatives",
        "Make strategic decisions",
        "Provide expert guidance and leadership"
      ]
    }
  ],
  
  howToDetermine: {
    title: "How to Determine Your Wage Level",
    steps: [
      {
        step: 1,
        title: "Review Job Requirements",
        description: "Examine the specific requirements of your position, including education, experience, and job duties."
      },
      {
        step: 2,
        title: "Match to Level Criteria",
        description: "Compare your position requirements to the criteria for each wage level (I, II, III, or IV)."
      },
      {
        step: 3,
        title: "Consider Complexity",
        description: "Assess the complexity of tasks, level of judgment required, and supervision needed."
      },
      {
        step: 4,
        title: "Request DOL Determination",
        description: "Your employer must request an official prevailing wage determination from the Department of Labor, which will assign the appropriate wage level."
      }
    ],
    note: "The DOL makes the final determination based on the job requirements submitted by your employer. This tool provides estimates based on typical classifications."
  }
};

export const PREVAILING_WAGE_EXPLAINER = {
  definition: {
    title: "What is a Prevailing Wage?",
    content: "A prevailing wage is the average wage paid to similarly employed workers in a specific occupation in the area of intended employment. For H1B visa purposes, the U.S. Department of Labor determines prevailing wages to ensure that H1B workers are paid at least the same wage as similarly employed U.S. workers."
  },
  
  whyItMatters: {
    title: "Why It Matters for H1B",
    content: "The prevailing wage requirement protects both U.S. workers and H1B workers:\n\n• **Protects U.S. Workers**: Prevents employers from undercutting U.S. worker wages by hiring H1B workers at lower rates\n• **Protects H1B Workers**: Ensures H1B workers receive fair compensation for their work\n• **Legal Requirement**: Employers must pay H1B workers at least the prevailing wage—it's not optional\n• **Enforcement**: The Department of Labor can investigate and penalize employers who violate wage requirements"
  },
  
  howDetermined: {
    title: "How Prevailing Wages Are Determined",
    steps: [
      {
        step: 1,
        title: "Employer Requests Determination",
        description: "The employer submits a request to the Department of Labor with job requirements, occupation (SOC code), and worksite location."
      },
      {
        step: 2,
        title: "DOL Reviews Job Requirements",
        description: "The DOL reviews the job description, required education, experience, and complexity to determine the appropriate wage level (I, II, III, or IV)."
      },
      {
        step: 3,
        title: "DOL Consults Wage Data",
        description: "The DOL uses wage survey data, Bureau of Labor Statistics data, and other sources to find wages for similar workers in the same occupation and geographic area."
      },
      {
        step: 4,
        title: "DOL Issues Determination",
        description: "The DOL issues an official prevailing wage determination specifying the wage level and prevailing wage amount for that occupation, level, and location."
      }
    ]
  },
  
  dolRole: {
    title: "Department of Labor's Role",
    content: "The Office of Foreign Labor Certification (OFLC), part of the U.S. Department of Labor, is responsible for:\n\n• Maintaining wage databases and survey data\n• Processing prevailing wage determination requests\n• Ensuring wage determinations are accurate and current\n• Enforcing wage requirements through investigations\n• Updating wage data based on new surveys and market conditions"
  },
  
  countyVariations: {
    title: "Why Wages Vary by County",
    content: "Prevailing wages vary by county because:\n\n• **Cost of Living**: Higher cost-of-living areas typically have higher wages\n• **Local Labor Markets**: Supply and demand for workers varies by location\n• **Economic Conditions**: Regional economic factors affect wage levels\n• **Industry Concentration**: Areas with high concentrations of certain industries may have higher wages for related occupations\n\nThis ensures that H1B workers are paid appropriately for their local market, whether they work in high-cost areas like San Francisco or lower-cost rural areas."
  },
  
  updateFrequency: {
    title: "How Often Are Wages Updated?",
    content: "Wage data is updated periodically:\n\n• **Annual Updates**: Major updates typically occur annually based on new wage survey data\n• **Quarterly Updates**: Some data may be updated quarterly as new information becomes available\n• **As Needed**: Updates may occur when significant changes in local labor markets are identified\n\nFor the most current official prevailing wage determinations, always check the [OFLC Wage Data website](https://flag.dol.gov/wage-data/wage-search)."
  }
};

export const H1B_PROCESS_EDUCATION = {
  overview: {
    title: "H1B Visa Program Overview",
    content: "The H1B visa program allows U.S. employers to temporarily employ foreign workers in specialty occupations. A specialty occupation requires theoretical and practical application of highly specialized knowledge, typically requiring at least a bachelor's degree or equivalent."
  },
  
  steps: [
    {
      step: 1,
      title: "Prevailing Wage Determination",
      description: "The employer must obtain a prevailing wage determination from the Department of Labor. This determines the minimum wage that must be paid to the H1B worker.",
      duration: "1-2 weeks",
      requirements: [
        "Job description with detailed requirements",
        "SOC code for the occupation",
        "Worksite location (county)"
      ]
    },
    {
      step: 2,
      title: "Labor Condition Application (LCA)",
      description: "The employer files an LCA with the Department of Labor, attesting that the H1B worker will be paid at least the prevailing wage and that working conditions won't adversely affect U.S. workers.",
      duration: "7-10 business days",
      requirements: [
        "Approved prevailing wage determination",
        "Worksite location information",
        "Attestations about wages and working conditions"
      ]
    },
    {
      step: 3,
      title: "H1B Petition Preparation",
      description: "The employer prepares the H1B petition, including forms, supporting documents, and evidence that the position qualifies as a specialty occupation.",
      duration: "2-4 weeks (varies)",
      requirements: [
        "Approved LCA",
        "Educational credentials",
        "Job offer letter",
        "Evidence of specialty occupation"
      ]
    },
    {
      step: 4,
      title: "H1B Petition Filing",
      description: "The employer files the H1B petition with U.S. Citizenship and Immigration Services (USCIS). For cap-subject petitions, this must be done during the annual filing period (typically April).",
      duration: "Filing period: Typically first week of April",
      requirements: [
        "Completed petition forms",
        "Filing fees",
        "All supporting documents",
        "LCA copy"
      ]
    },
    {
      step: 5,
      title: "USCIS Processing",
      description: "USCIS reviews the petition, may request additional evidence (RFE), and makes a decision to approve or deny the petition.",
      duration: "4-6 months (regular) or 15 days (premium processing)",
      requirements: [
        "Response to any RFEs",
        "Additional evidence if requested"
      ]
    },
    {
      step: 6,
      title: "Visa Application (if outside U.S.)",
      description: "If the H1B worker is outside the U.S., they must apply for an H1B visa at a U.S. consulate or embassy after petition approval.",
      duration: "Varies by consulate",
      requirements: [
        "Approved H1B petition",
        "Visa application forms",
        "Interview at consulate",
        "Supporting documents"
      ]
    }
  ],
  
  prevailingWageRole: {
    title: "Role of Prevailing Wage in H1B Process",
    content: "The prevailing wage is critical throughout the H1B process:\n\n• **Early Stage**: Determined before LCA filing—you can't file an LCA without a prevailing wage determination\n• **LCA Requirement**: The LCA must include the prevailing wage and attest that the H1B worker will be paid at least that amount\n• **Petition Requirement**: The H1B petition must include the approved LCA with prevailing wage information\n• **Ongoing Requirement**: The employer must continue to pay at least the prevailing wage throughout the H1B worker's employment\n• **Enforcement**: The DOL can investigate and penalize employers who pay less than the prevailing wage"
  },
  
  timeline: {
    title: "Typical H1B Timeline",
    content: "**With Premium Processing (15-day USCIS processing):**\n• Total: 2-3 months from start to approval\n\n**Without Premium Processing (regular USCIS processing):**\n• Total: 5-7 months from start to approval\n\n**Cap-Subject Petitions:**\n• Must be filed during annual filing period (typically first week of April)\n• If selected in the lottery, processing begins after selection\n• Employment start date: October 1 (beginning of fiscal year)\n\n**Cap-Exempt Petitions:**\n• Can be filed at any time\n• No lottery or cap restrictions\n• Faster processing possible"
  },
  
  commonChallenges: {
    title: "Common Challenges and Solutions",
    challenges: [
      {
        challenge: "Salary Below Prevailing Wage",
        solution: "Options include increasing the offered salary, requesting a lower wage level determination (if justified by job requirements), or considering a different worksite location."
      },
      {
        challenge: "Unclear Wage Level Assignment",
        solution: "Ensure job description accurately reflects requirements. Can request review/reconsideration if wage level seems incorrect."
      },
      {
        challenge: "Missing or Incomplete Data",
        solution: "Some occupation-county combinations may not have data. Employer may need to request a determination directly from DOL."
      },
      {
        challenge: "Processing Delays",
        solution: "Consider premium processing for faster USCIS review. Ensure all documents are complete to avoid RFEs."
      }
    ]
  },
  
  resources: {
    title: "Official Resources",
    links: [
      {
        title: "OFLC Wage Data",
        url: "https://flag.dol.gov/wage-data/wage-search",
        description: "Official Department of Labor wage database"
      },
      {
        title: "USCIS H1B Information",
        url: "https://www.uscis.gov/working-in-the-united-states/temporary-workers/h-1b-specialty-occupations",
        description: "Official USCIS H1B visa information"
      },
      {
        title: "Department of Labor - Foreign Labor Certification",
        url: "https://www.dol.gov/agencies/eta/foreign-labor",
        description: "DOL information on foreign labor certification"
      },
      {
        title: "O*NET Occupational Search",
        url: "https://www.onetonline.org/find/result",
        description: "Find SOC codes for occupations"
      }
    ]
  }
};
