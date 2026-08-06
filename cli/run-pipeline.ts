import { getDemoInteractionBatch, runPipeline } from "../src/lib/socialPipeline";

const count = Math.max(1, Math.min(50, Number(process.argv[2]) || 12));
const results = getDemoInteractionBatch(count).map(runPipeline);

const symbol = {
  pass: "PASS",
  filter_out: "FILTER",
  flag_review: "FLAG",
};

console.log(`\nSmartLeads BI - Social Ingestion Pipeline (${results.length} interactions)\n`);
console.log(
  "=".repeat(100)
);

for (const r of results) {
  const { interaction, stages, finalDecision, intentSignals, sentimentScore, totalProcessingMs } = r;
  const s = symbol[finalDecision];
  console.log(`\n${interaction.platform}  @${interaction.user}`);
  console.log(`  "${interaction.text}"`);
  console.log(`  Campaign: ${interaction.campaign}`);
  for (const stage of stages) {
    const mark = stage.decision === "pass" ? "  PASS  " : stage.decision === "filter_out" ? " FILTER " : "  FLAG  ";
    console.log(
      `   [${mark}] ${stage.stageName.padEnd(20)} ${stage.reason} (${(stage.confidence * 100).toFixed(0)}%)`
    );
  }
  if (intentSignals.length > 0) {
    console.log(`   Intent signals: ${intentSignals.join(", ")}`);
  }
  console.log(
    `   Sentiment: ${sentimentScore > 0 ? "+" : ""}${sentimentScore.toFixed(2)}  |  Total: ${totalProcessingMs.toFixed(1)}ms`
  );
  console.log(
    `   >>> ${s} (${finalDecision})`
  );
  console.log("-".repeat(100));
}

console.log(
  `\nTotals: ${results.length} processed | ` +
    `${results.filter((r) => r.finalDecision === "pass").length} passed (leads) | ` +
    `${results.filter((r) => r.finalDecision === "filter_out").length} filtered | ` +
    `${results.filter((r) => r.finalDecision === "flag_review").length} flagged for review\n`
);
