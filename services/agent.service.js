const { callOpenAIJSON } = require('../services/openai.service')
const { loadPrompt } = require('../utils/promptLoader')
const { ROUTE_MAP, PRIORITIES, ESCALATION_RULES, } = require('../utils/constants')
const { readJson, writeJson, appendJson } = require('../utils/file')

function decideRoute(category) {
    return ROUTE_MAP[category] || "General Support";
}

function parseDollarAmounts(text) {
    const matches = [...text.matchAll(/\$([\d,]+(?:\.\d{1,2})?)/g)];
    return matches.map((match) => Number(match[1].replace(/,/g, "")));
}

function shouldEscalate(message, classification) {
    const text = message.message.toLowerCase();

    if (classification.confidence < ESCALATION_RULES.CONFIDENCE_THRESHOLD) return true;
    if (ESCALATION_RULES.KEYWORDS.some(keyword => text.includes(keyword))) return true;

    const amounts = parseDollarAmounts(message.message);

    if (amounts.length >= 2) {
        const max = Math.max(...amounts);
        const min = Math.min(...amounts);
        if (max - min > ESCALATION_RULES.BILLING_DIFFERENCE_THRESHOLD) return true;
    }

    return false;
}

async function classifyMessage(message) {
    const prompt = loadPrompt("classification", {
        source: message.source,
        raw_message: message.message,
    });

    // return prompt;
    return await callOpenAIJSON(prompt);
}

async function enrichMessage(message) {
    const prompt = loadPrompt("enrichment", {
        source: message.source,
        raw_message: message.message,
    });

    return await callOpenAIJSON(prompt);
}

async function generateSummary(message, classification, enrichment, destinationQueue, escalationFlag, finalQueue) {
    const prompt = loadPrompt("summary", {
        raw_message: message.message,
        classification,
        enrichment,
        destinationQueue,
        escalationFlag,
        finalQueue,
    });

    const result = await callOpenAIJSON(prompt);
    return result.human_summary;
}

async function processMessage(message) {
    const classification = await classifyMessage(message);
    const enrichment = await enrichMessage(message);

    // return enrichment
    const destinationQueue = decideRoute(classification.category);
    const escalationFlag = shouldEscalate(message, classification);

    const finalQueue = escalationFlag ? "Human Escalation Queue" : destinationQueue;

    const humanSummary = await generateSummary(
        message,
        classification,
        enrichment,
        destinationQueue,
        escalationFlag,
        finalQueue
    );

    appendJson("output/results.json", {
        id: message.id,
        source: message.source,
        raw_message: message.raw_message,
        category: classification.category,
        priority: classification.priority,
        confidence: classification.confidence,
        core_issue: enrichment.core_issue,
        identifiers: enrichment.identifiers || {},
        urgency_signal: enrichment.urgency_signal,
        destination_queue: destinationQueue,
        escalation_flag: escalationFlag,
        final_queue: finalQueue,
        human_summary: humanSummary,
        processed_at: new Date().toISOString(),
    });
}

module.exports = {
    processMessage,
};


