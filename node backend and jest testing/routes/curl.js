const express = require("express");
const curlconverter = require("curlconverter");

const router = express.Router();

const parseCurl = (curl) => {
  // Try different APIs depending on version
  if (typeof curlconverter.toJSON === "function") {
    return curlconverter.toJSON(curl);
  }

  if (typeof curlconverter.toJsonString === "function") {
    return JSON.parse(curlconverter.toJsonString(curl));
  }

  if (curlconverter.default && typeof curlconverter.default.toJSON === "function") {
    return curlconverter.default.toJSON(curl);
  }

  throw new Error("Unsupported curlconverter API");
};

router.post("/parse-curl", (req, res) => {
  try {
    let { curl } = req.body;

    curl = curl
      .replace(/\\\n/g, " ")
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const parsed = parseCurl(curl);

    res.json({
      method: parsed.method,
      url: parsed.url,
      headers: parsed.headers || {},
      body: parsed.data || ""
    });
  } catch (err) {
    console.error("Curl parse error:", err);
    res.status(400).json({ error: err.message || "Invalid curl command" });
  }
});

module.exports = router;
