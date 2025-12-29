/**
 * FAQ data for the education modal
 */

export const FAQ_CATEGORIES = {
  WAGE_LEVELS: 'Wage Levels',
  H1B_PROCESS: 'H1B Process',
  USING_TOOL: 'Using This Tool',
  DATA_SOURCE: 'Data Source',
  GENERAL: 'General'
};

export const faqData = [
  {
    id: 1,
    question: "What are the four wage levels?",
    answer: "The Department of Labor defines four wage levels for H1B prevailing wage determinations:\n\n• Level I (Entry Level): For workers who have a basic understanding of the occupation and perform routine tasks that require limited, if any, exercise of judgment.\n\n• Level II (Qualified): For workers who have attained a good understanding of the occupation and perform moderately complex tasks that require limited judgment.\n\n• Level III (Experienced): For workers who have a sound understanding of the occupation and perform tasks that require exercising independent judgment and analysis.\n\n• Level IV (Fully Competent): For workers who have a thorough understanding of the occupation and perform tasks that require exercising independent judgment and analysis, and may involve planning, designing, and implementing programs.",
    category: FAQ_CATEGORIES.WAGE_LEVELS,
    tags: ['wage levels', 'levels', 'I', 'II', 'III', 'IV', 'entry', 'qualified', 'experienced', 'fully competent']
  },
  {
    id: 2,
    question: "How is my wage level determined?",
    answer: "Your wage level is determined by the Department of Labor based on your job requirements, including:\n\n• Education level required\n• Years of experience required\n• Complexity of job duties\n• Level of supervision needed\n• Specialized knowledge or skills required\n\nThe employer must accurately describe the position requirements when requesting a prevailing wage determination. The DOL then assigns the appropriate wage level based on these requirements.",
    category: FAQ_CATEGORIES.WAGE_LEVELS,
    tags: ['determine', 'determination', 'how', 'requirements', 'education', 'experience', 'job duties']
  },
  {
    id: 3,
    question: "What is a prevailing wage?",
    answer: "A prevailing wage is the average wage paid to similarly employed workers in a specific occupation in the area of intended employment. For H1B visa purposes, the U.S. Department of Labor determines prevailing wages to ensure that H1B workers are paid at least the same wage as similarly employed U.S. workers, preventing adverse effects on U.S. workers' wages.\n\nThe prevailing wage is specific to:\n• The occupation (SOC code)\n• The geographic area (county)\n• The wage level (I, II, III, or IV)",
    category: FAQ_CATEGORIES.GENERAL,
    tags: ['prevailing wage', 'definition', 'what is', 'dol', 'department of labor']
  },
  {
    id: 4,
    question: "Why do wages vary by county?",
    answer: "Wages vary by county because the cost of living, demand for workers, and local economic conditions differ across geographic areas. The Department of Labor uses county-level data to ensure that prevailing wages reflect local market conditions.\n\nFor example:\n• High-cost areas (like San Francisco, New York) typically have higher prevailing wages\n• Rural areas may have lower prevailing wages\n• Tech hubs may have higher wages for technology occupations\n\nThis ensures that H1B workers are paid appropriately for their local market.",
    category: FAQ_CATEGORIES.GENERAL,
    tags: ['county', 'geographic', 'location', 'vary', 'different', 'areas', 'cost of living']
  },
  {
    id: 5,
    question: "How do I use this tool?",
    answer: "Using this tool is simple:\n\n1. **Select an Occupation**: Use the search box to find your job title or SOC code. The search supports both job titles (e.g., 'Software Developer') and SOC codes (e.g., '15-1132').\n\n2. **Enter Your Salary**: Input your annual base salary in the salary field. The tool automatically calculates the hourly rate (assuming 2080 hours per year).\n\n3. **Explore the Map**: Counties are color-coded based on which wage level your salary falls under. Click on any county to see detailed information.\n\n4. **View Statistics**: The statistics panel shows how many counties match each wage level for your occupation and salary.",
    category: FAQ_CATEGORIES.USING_TOOL,
    tags: ['how to use', 'tutorial', 'guide', 'instructions', 'steps', 'occupation', 'salary', 'map']
  },
  {
    id: 6,
    question: "What is a SOC code?",
    answer: "SOC stands for Standard Occupational Classification. It's a system used by federal statistical agencies to classify workers into occupational categories for the purpose of collecting, calculating, or disseminating data.\n\nSOC codes are formatted as XX-XXXX (e.g., 15-1132 for Software Developers). The first two digits represent the major occupational group, and the full code identifies the specific occupation.\n\nYou can find SOC codes for your occupation using the [O*NET Occupational Keyword Search](https://www.onetonline.org/find/result).",
    category: FAQ_CATEGORIES.GENERAL,
    tags: ['soc', 'soc code', 'standard occupational classification', 'occupation code', 'onet']
  },
  {
    id: 7,
    question: "When is the prevailing wage determined in the H1B process?",
    answer: "The prevailing wage determination happens early in the H1B process:\n\n1. **Before LCA Filing**: The employer must obtain a prevailing wage determination from the Department of Labor before filing a Labor Condition Application (LCA).\n\n2. **LCA Filing**: The LCA must include the prevailing wage and attest that the H1B worker will be paid at least the prevailing wage.\n\n3. **H1B Petition**: The H1B petition filed with USCIS must include the approved LCA with the prevailing wage information.\n\nThis ensures that wage requirements are established before the H1B worker begins employment.",
    category: FAQ_CATEGORIES.H1B_PROCESS,
    tags: ['h1b', 'process', 'timeline', 'lca', 'labor condition application', 'when', 'timing']
  },
  {
    id: 8,
    question: "What is an LCA (Labor Condition Application)?",
    answer: "A Labor Condition Application (LCA) is a form that employers must file with the Department of Labor before filing an H1B petition with USCIS.\n\nThe LCA requires employers to attest that:\n• The H1B worker will be paid at least the prevailing wage\n• Working conditions will not adversely affect U.S. workers\n• There is no strike or lockout at the worksite\n• Notice of the LCA filing has been provided to workers\n\nThe LCA is valid for up to 3 years and is specific to the occupation, wage level, and worksite location.",
    category: FAQ_CATEGORIES.H1B_PROCESS,
    tags: ['lca', 'labor condition application', 'dol', 'attestation', 'requirements']
  },
  {
    id: 9,
    question: "Can I challenge a prevailing wage determination?",
    answer: "Yes, employers can request a review or reconsideration of a prevailing wage determination if they believe it's incorrect. The process involves:\n\n1. **Request for Review**: Submit a request to the Department of Labor within 30 days of the determination\n2. **Provide Evidence**: Submit documentation supporting why the determination should be changed\n3. **DOL Review**: The DOL will review the request and make a decision\n\nCommon reasons for challenges include:\n• Incorrect SOC code assignment\n• Incorrect wage level assignment\n• Missing or incorrect job requirements\n\nIt's important to provide detailed job descriptions and requirements when initially requesting the determination to avoid the need for challenges.",
    category: FAQ_CATEGORIES.H1B_PROCESS,
    tags: ['challenge', 'appeal', 'review', 'reconsideration', 'dispute', 'incorrect']
  },
  {
    id: 10,
    question: "How often is wage data updated?",
    answer: "The Department of Labor updates prevailing wage data periodically, typically:\n\n• **Annual Updates**: Major updates occur annually based on new wage survey data\n• **Quarterly Updates**: Some data may be updated quarterly\n• **As Needed**: Updates may occur when significant changes in local labor markets are identified\n\nThis tool uses the most recent data available from the Office of Foreign Labor Certification (OFLC). For the most current official prevailing wage determinations, always check the [OFLC Wage Data website](https://flag.dol.gov/wage-data/wage-search).",
    category: FAQ_CATEGORIES.DATA_SOURCE,
    tags: ['update', 'updated', 'frequency', 'how often', 'data', 'current', 'latest']
  },
  {
    id: 11,
    question: "What if my occupation isn't in the search results?",
    answer: "If you can't find your exact occupation:\n\n1. **Try Broader Terms**: Search with more general job titles (e.g., 'Engineer' instead of 'Senior Software Engineer')\n\n2. **Search by SOC Code**: If you know your SOC code, search directly using that\n\n3. **Use O*NET**: Visit the [O*NET Occupational Keyword Search](https://www.onetonline.org/find/result) to find the correct SOC code for your occupation\n\n4. **Check Similar Occupations**: Look for similar occupations that might have comparable wage data\n\nNote: Not all occupations have wage data available for all counties. Some specialized occupations may have limited data coverage.",
    category: FAQ_CATEGORIES.USING_TOOL,
    tags: ['occupation', 'not found', 'missing', 'search', 'soc code', 'onet', 'similar']
  },
  {
    id: 12,
    question: "What does it mean if a county is gray on the map?",
    answer: "A gray county on the map indicates one of the following:\n\n• **No Data Available**: The Department of Labor doesn't have prevailing wage data for that occupation in that county\n• **Below Level I**: Your salary is below the Level I (Entry Level) wage requirement for that county\n\nGray counties don't necessarily mean you can't work there—it may simply mean that wage data isn't available for that specific occupation-county combination. In such cases, employers may need to request a prevailing wage determination directly from the DOL.",
    category: FAQ_CATEGORIES.USING_TOOL,
    tags: ['gray', 'no data', 'below level', 'county', 'map', 'color', 'meaning']
  },
  {
    id: 13,
    question: "Can I use this tool for other visa types?",
    answer: "This tool is specifically designed for H1B visa prevailing wage requirements. However, prevailing wage data may also be relevant for:\n\n• **H1B1 (Chile/Singapore)**: Similar prevailing wage requirements\n• **E-3 (Australia)**: Uses similar prevailing wage determinations\n• **PERM Labor Certification**: Uses prevailing wage data, but the process differs\n\nFor other visa types, consult with an immigration attorney or check the specific requirements for that visa category. The wage data itself may be useful, but the application process and requirements differ.",
    category: FAQ_CATEGORIES.GENERAL,
    tags: ['visa', 'other visas', 'h1b1', 'e3', 'perm', 'labor certification', 'immigration']
  },
  {
    id: 14,
    question: "Is this tool official or for informational purposes only?",
    answer: "This tool is **for informational purposes only**. It provides a convenient way to explore prevailing wage data, but:\n\n• **Not Official Determinations**: The wage levels shown are based on publicly available data, but are not official prevailing wage determinations\n• **Consult DOL for Official Data**: For official prevailing wage determinations required for H1B petitions, employers must request determinations directly from the Department of Labor\n• **Not Legal Advice**: This tool does not provide legal advice. Consult with an immigration attorney for guidance on your specific situation\n\nAlways verify wage requirements through official DOL channels before making immigration decisions.",
    category: FAQ_CATEGORIES.DATA_SOURCE,
    tags: ['official', 'informational', 'legal advice', 'disclaimer', 'dol', 'verify']
  },
  {
    id: 15,
    question: "How long does the H1B process take?",
    answer: "The H1B process timeline varies, but typically:\n\n1. **Prevailing Wage Determination**: 1-2 weeks (if using online system)\n2. **LCA Filing and Approval**: 7-10 business days\n3. **H1B Petition Preparation**: 2-4 weeks (varies by employer)\n4. **USCIS Processing**: \n   - Regular processing: 4-6 months\n   - Premium processing: 15 calendar days (additional fee)\n\n**Total Timeline**:\n• With premium processing: 2-3 months\n• Without premium processing: 5-7 months\n\nNote: H1B cap-subject petitions must be filed during the annual filing period (typically April), and processing times can vary based on USCIS workload.",
    category: FAQ_CATEGORIES.H1B_PROCESS,
    tags: ['timeline', 'how long', 'duration', 'processing time', 'uscis', 'lca', 'premium processing']
  },
  {
    id: 16,
    question: "What happens if my salary is below the prevailing wage?",
    answer: "If your salary is below the prevailing wage for your occupation, wage level, and county:\n\n• **H1B Petition Cannot Be Approved**: USCIS requires that H1B workers be paid at least the prevailing wage\n• **Options to Consider**:\n  1. Increase the offered salary to meet or exceed the prevailing wage\n  2. Request a lower wage level determination (if job requirements justify it)\n  3. Consider a different worksite location with lower prevailing wages\n  4. Wait for wage data updates that might change the prevailing wage\n\nEmployers cannot pay H1B workers less than the prevailing wage. This is a legal requirement, not a recommendation. Violations can result in penalties and affect future H1B petitions.",
    category: FAQ_CATEGORIES.H1B_PROCESS,
    tags: ['below wage', 'salary', 'prevailing wage', 'requirement', 'options', 'increase', 'penalties']
  },
  {
    id: 17,
    question: "Can I work in multiple locations with one H1B?",
    answer: "Yes, but with important considerations:\n\n• **Multiple LCAs Required**: If you work in multiple worksite locations, your employer must file separate LCAs for each location (or a single LCA covering all locations)\n• **Different Prevailing Wages**: Each location may have different prevailing wages, and you must be paid at least the prevailing wage for each location\n• **Worksite Changes**: If you move to a new worksite, your employer must file an amended LCA and potentially an amended H1B petition\n• **Telework**: Remote work locations may also require separate LCAs depending on the circumstances\n\nAlways consult with your employer and immigration attorney when considering multiple worksite locations.",
    category: FAQ_CATEGORIES.H1B_PROCESS,
    tags: ['multiple locations', 'worksites', 'lca', 'remote', 'telework', 'amended', 'locations']
  },
  {
    id: 18,
    question: "Where does the wage data come from?",
    answer: "The wage data in this tool comes from the **Office of Foreign Labor Certification (OFLC)**, which is part of the U.S. Department of Labor.\n\nThe OFLC:\n• Collects and maintains prevailing wage data\n• Determines prevailing wages based on wage surveys and statistical data\n• Updates data periodically based on new surveys and market conditions\n• Provides wage data through their [public wage database](https://flag.dol.gov/wage-data/wage-search)\n\nThis tool processes and visualizes that publicly available data to make it easier to explore and understand. For official determinations, always consult the DOL directly.",
    category: FAQ_CATEGORIES.DATA_SOURCE,
    tags: ['data source', 'where', 'dol', 'oflc', 'department of labor', 'wage database', 'source']
  }
];
