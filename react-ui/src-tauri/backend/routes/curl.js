const express = require("express");
const router = express.Router();

let curlconverter = null;

// Lazy-load curlconverter safely (prevents pkg/esm crash)
async function loadCurlConverter() {
  if (curlconverter) return curlconverter;

  try {
    const mod = await import("curlconverter");
    curlconverter = mod.default || mod;
    return curlconverter;
  } catch (err) {
    console.error("Failed to load curlconverter:", err);
    throw new Error("Curl parsing is not available in this build");
  }
}

function normalizeCurl(curl) {
  return curl
    .replace(/\\\n/g, " ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

router.post("/parse-curl", async (req, res) => {
  try {
    let { curl } = req.body;

    if (!curl || typeof curl !== "string") {
      return res.status(400).json({ error: "Missing curl command" });
    }

    curl = normalizeCurl(curl);

    const converter = await loadCurlConverter();

    let parsed;

    if (typeof converter.toJSON === "function") {
      parsed = converter.toJSON(curl);
    } else if (typeof converter.toJsonString === "function") {
      parsed = JSON.parse(converter.toJsonString(curl));
    } else {
      throw new Error("Unsupported curlconverter API");
    }

    res.json({
      method: parsed.method || "GET",
      url: parsed.url || "",
      headers: parsed.headers || {},
      body: parsed.data || ""
    });
  } catch (err) {
    console.error("Curl parse error:", err.message);
    res.status(400).json({
      error: "Failed to parse curl",
      details: err.message
    });
  }
});

module.exports = router;
