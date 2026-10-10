// All knobs in one place. Override any of them with environment variables (see .env.example).
export function loadConfig(env = process.env) {
  return {
    extractModel: env.EXTRACT_MODEL || "claude-haiku-5-5",
    editorialModel: env.EDITORIAL_MODEL || "claude-sonnet-5-5",
    dailyCallCap: Number(env.DAILY_CALL_CAP) || 40,
    minConfidence: Number(env.MIN_CONFIDENCE) || 0.75,
    sheetCsvUrl:
      "https://docs.google.com/spreadsheets/d/1fBi6Mxz0pY8IFCP9hhLWB_R_i9J7obMEA5YoA6PkpDg/gviz/tq?tqx=out:csv&sheet=Tournaments",
  };
}

// Malaysia time (UTC+8), same convention as the website.
export function todayMYT(now = Date.now()) {
  return new Date(now + 8 * 3600 * 1000).toISOString().slice(0, 10);
}
