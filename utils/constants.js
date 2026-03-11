const PRIORITIES = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

const ESCALATION_RULES = {
  CONFIDENCE_THRESHOLD: 0.7,
  KEYWORDS: ["outage", "down for all users", "multiple users affected"],
  BILLING_DIFFERENCE_THRESHOLD: 500,
};

const ROUTE_MAP = {
  "Bug Report": "Engineering",  
  "Feature Request": "Product",
  "Billing Issue": "Billing",
  "Technical Question": "IT/Security",
  "Incident/Outage": "Engineering",
};

module.exports = { PRIORITIES, ESCALATION_RULES, ROUTE_MAP };