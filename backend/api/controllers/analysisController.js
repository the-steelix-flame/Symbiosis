const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Google Generative AI client with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// The main function to handle the web-based analysis request
const getAnalysis = async (req, res) => {
    try {
        // --- THIS IS THE FIX ---
        // We've updated the model to a newer, more powerful version.
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        // --- END OF FIX ---

        const prompt = `
            **Role:** You are an expert Environmental Data Analyst.

            **Objective:** Generate a comprehensive and detailed analytical report on the current state of the global environment. Your entire analysis MUST be based *exclusively* on the most recent data, reports, and key findings you can find by browsing the live websites of the following three organizations:

            1.  **United Nations Environment Programme (UNEP):** https://www.unep.org
            2.  **Global Forest Watch (GFW):** https://www.globalforestwatch.org
            3.  **Ocean Health Index (OHI):** http://www.oceanhealthindex.org

            **Task & Instructions:**

            1.  **Browse and Extract:**
                * For **UNEP**, find their latest flagship reports or news on topics like pollution, climate change, biodiversity loss, or sustainable development. Focus on quantifiable data and key policy recommendations.
                * For **Global Forest Watch**, access their main dashboard or latest blog posts. Extract key statistics on recent tree cover loss (deforestation), fire alerts, and identify the top 3 most affected countries or regions according to their latest data.
                * For the **Ocean Health Index**, find the most recent global scores and summaries. Identify the highest and lowest scoring regions and explain the key factors contributing to these scores (e.g., biodiversity, coastal protection, clean waters).

            2.  **Synthesize and Analyze:**
                * Do not just list facts. Connect the findings from the different sources. For example, how does deforestation reported by GFW impact biodiversity as discussed by UNEP? How might pollution mentioned by UNEP affect ocean health scores from OHI?
                * Provide deep insights and implications for each section. What are the consequences of the data you've found?

            3.  **Structure the Report:**
                * Your final output MUST be a single block of clean, well-structured HTML.
                * Use a main \`<h1>\` title: "Global Environmental Synthesis Report".
                * Use \`<h2>\` for each of the three main sections (e.g., "United Nations Environment Programme (UNEP) Insights").
                * Use \`<h3>\` for sub-topics within each section (e.g., "Key Findings on Global Deforestation").
                * Use \`<p>\` for all descriptive text and analysis.
                * Use \`<ul>\` and \`<li>\` for lists of statistics or key points.
                * Bold key terms or data points using the \`<strong>\` tag.

            **Constraint:** Do not use any information from your general knowledge. Every point in your analysis must be directly derivable from the content on the three specified websites.
        `;

        // --- 2. Generate the Report with Gemini ---
        const result = await model.generateContent(prompt);
        const analysisHtml = await result.response.text();

        // --- 3. Send the HTML Report to the Frontend ---
        res.status(200).json({ analysis: analysisHtml });

    } catch (error) {
        console.error("Error generating web-based analysis: ", error.response ? error.response.data : error.message);
        res.status(500).json({ message: "Failed to generate AI analysis. The model may be experiencing high traffic." });
    }
};

module.exports = { getAnalysis };