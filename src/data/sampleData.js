/**
 * Illustrative sample data for the Data Explorer.
 *
 * IMPORTANT: these numbers are SYNTHETIC and for layout/demo only. They are
 * shown with a visible "Sample data" banner whenever the live Neon API is not
 * configured, so they are never presented as real disclosure figures. Once the
 * Neon integration is connected and `scripts/ingest.mjs` has loaded real DOL/
 * USCIS files, the API returns live data and this module is not used.
 *
 * Shapes here intentionally mirror the API responses in /api/*.js.
 */

export const SAMPLE = {
  overview: {
    totals: {
      lca: 142853,
      perm: 38211,
      employers: 21940,
      uscisApprovals: 410230,
      uscisDenials: 12740,
      latestLcaFy: 2024,
      latestPermFy: 2024,
    },
    topStates: [
      { state: "CA", count: 31250 },
      { state: "TX", count: 18420 },
      { state: "NY", count: 14110 },
      { state: "NJ", count: 9870 },
      { state: "WA", count: 9210 },
      { state: "MA", count: 6540 },
      { state: "IL", count: 6020 },
      { state: "GA", count: 5110 },
      { state: "VA", count: 4880 },
      { state: "FL", count: 4630 },
    ],
    meta: [{ dataset: "sample", period_label: "Illustrative", ingested_at: null }],
  },

  employers: [
    { id: 1, name: "Globex Technologies Inc", state: "CA", lcaCount: 1240, permCount: 380 },
    { id: 2, name: "Initech Software LLC", state: "TX", lcaCount: 860, permCount: 210 },
    { id: 3, name: "Hooli Inc", state: "CA", lcaCount: 2110, permCount: 540 },
    { id: 4, name: "Stark Industries", state: "NY", lcaCount: 430, permCount: 95 },
    { id: 5, name: "Umbrella Health Systems", state: "MA", lcaCount: 320, permCount: 140 },
  ],

  employerProfile: {
    employer: { id: 3, name: "Hooli Inc", city: "Palo Alto", state: "CA" },
    lcaByYear: [
      { fy: 2021, count: 410, certified: 398 },
      { fy: 2022, count: 520, certified: 505 },
      { fy: 2023, count: 590, certified: 571 },
      { fy: 2024, count: 590, certified: 580 },
    ],
    permByYear: [
      { fy: 2022, count: 140, certified: 131 },
      { fy: 2023, count: 200, certified: 188 },
      { fy: 2024, count: 200, certified: 190 },
    ],
    uscis: [
      { fy: 2023, initialApproval: 320, initialDenial: 12, continuingApproval: 540, continuingDenial: 6 },
      { fy: 2024, initialApproval: 350, initialDenial: 9, continuingApproval: 560, continuingDenial: 5 },
    ],
    topOccupations: [
      { socCode: "15-1252", socTitle: "Software Developers", count: 980, medianWage: 152000 },
      { socCode: "15-1211", socTitle: "Computer Systems Analysts", count: 410, medianWage: 118000 },
      { socCode: "13-2011", socTitle: "Accountants and Auditors", count: 180, medianWage: 96000 },
    ],
    wageStats: { p25: 118000, p50: 142000, p75: 168000 },
  },

  perm: {
    summary: { total: 38211, certified: 35980, medianWage: 132000 },
    byYear: [
      { fy: 2021, count: 8100 },
      { fy: 2022, count: 9450 },
      { fy: 2023, count: 10220 },
      { fy: 2024, count: 10441 },
    ],
    byStatus: [
      { status: "Certified", count: 35980 },
      { status: "Denied", count: 1410 },
      { status: "Withdrawn", count: 821 },
    ],
    topEmployers: [
      { id: 3, name: "Hooli Inc", count: 540 },
      { id: 1, name: "Globex Technologies Inc", count: 380 },
      { id: 2, name: "Initech Software LLC", count: 210 },
    ],
    topOccupations: [
      { socCode: "15-1252", socTitle: "Software Developers", count: 12400, medianWage: 148000 },
      { socCode: "15-1211", socTitle: "Computer Systems Analysts", count: 5200, medianWage: 112000 },
      { socCode: "11-3021", socTitle: "Computer and IS Managers", count: 2100, medianWage: 184000 },
    ],
  },

  wages: {
    distribution: {
      count: 142853, min: 52000, p10: 78000, p25: 98000,
      p50: 128000, p75: 158000, p90: 192000, max: 410000,
    },
    byLevel: [
      { level: "I", count: 28400 },
      { level: "II", count: 51200 },
      { level: "III", count: 39100 },
      { level: "IV", count: 24153 },
    ],
    byState: [
      { state: "CA", medianWage: 152000, count: 31250 },
      { state: "WA", medianWage: 148000, count: 9210 },
      { state: "NY", medianWage: 138000, count: 14110 },
      { state: "MA", medianWage: 136000, count: 6540 },
      { state: "TX", medianWage: 122000, count: 18420 },
    ],
    salaryPercentile: null,
  },

  uscis: {
    totals: {
      initialApproval: 132000, initialDenial: 5400,
      continuingApproval: 278230, continuingDenial: 7340,
      approvals: 410230, denials: 12740, approvalRate: 97.0,
    },
    byYear: [
      { fy: 2022, initialApproval: 120000, initialDenial: 6100, continuingApproval: 260000, continuingDenial: 8200 },
      { fy: 2023, initialApproval: 128000, initialDenial: 5600, continuingApproval: 271000, continuingDenial: 7700 },
      { fy: 2024, initialApproval: 132000, initialDenial: 5400, continuingApproval: 278230, continuingDenial: 7340 },
    ],
    topEmployers: [
      { id: 3, name: "Hooli Inc", approvals: 910, denials: 14 },
      { id: 1, name: "Globex Technologies Inc", approvals: 640, denials: 22 },
      { id: 2, name: "Initech Software LLC", approvals: 410, denials: 18 },
    ],
  },
};
