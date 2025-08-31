const { GoogleGenerativeAI } = require('@google/generative-ai');
const { db } = require('../../config/firebaseAdmin');

// Initialize the Google Generative AI client with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to get the latest validated report of a specific type
const getLatestValidatedReport = async (reportType) => {
    const submissionsRef = db.collection('submissions');
    const snapshot = await submissionsRef
        .where("status", "==", "validated")
        .where("type", "==", reportType)
        .orderBy("createdAt", "desc")
        .limit(1)
        .get();
        
    if (snapshot.empty) {
        return null;
    }
    return snapshot.docs[0].data();
};

// --- This is the new, AI-powered prediction function ---
const getAIPrediction = async (req, res, threatType, context) => {
    const latestReport = await getLatestValidatedReport(threatType);

    if (!latestReport || !latestReport.lat || !latestReport.lng) {
        return res.status(404).json({ message: `No validated ${threatType} reports found to base a prediction on.` });
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        const prompt = `
            You are an expert geospatial and environmental analyst for India. Your task is to predict the next likely hotspot for a specific environmental problem based on the location of the most recent event.

            **Current Event Data:**
            - **Problem Type:** ${threatType}
            - **Location (Latitude, Longitude):** ${latestReport.lat}, ${latestReport.lng}
            - **Context:** ${context}

            **Your Task:**
            1.  Analyze the provided coordinates and the environmental context.
            2.  Predict the single most likely nearby location (latitude and longitude) where this problem could occur next. Consider factors like proximity to forests, rivers, urban areas, or industrial zones relevant to the problem.
            3.  Generate a concise, actionable warning message (max 25 words) that can be displayed on a public dashboard to alert authorities and communities.

            **Your response MUST be only a valid JSON object in the following format. Do not include any other text, explanation, or markdown.**

            {
              "predicted_lat": <latitude_number>,
              "predicted_lng": <longitude_number>,
              "warning_message": "<your_concise_warning_message>"
            }
        `;

        const result = await model.generateContent(prompt);
        const responseText = await result.response.text();
        const aiResponse = JSON.parse(responseText.replace(/```json/g, '').replace(/```/g, '').trim());

        // Format the response to match the frontend's expectation
        const formattedResponse = {
            id: `pred_${Date.now()}`,
            title: `AI Prediction: ${threatType}`,
            lat: aiResponse.predicted_lat,
            lng: aiResponse.predicted_lng,
            type: `predicted_${threatType}`,
            message: aiResponse.warning_message // Send the warning message
        };

        res.status(200).json([formattedResponse]); // Send as an array

    } catch (error) {
        console.error(`Error generating AI prediction for ${threatType}:`, error);
        res.status(500).json({ message: "Failed to generate AI prediction." });
    }
};

// --- Updated Route Handlers ---
const getDeforestationPrediction = async (req, res) => {
    getAIPrediction(req, res, "deforestation", "Consider proximity to existing forests, national parks, and access roads.");
};

const getPlasticPrediction = async (req, res) => {
    getAIPrediction(req, res, "plastic", "Consider proximity to rivers, coastlines, and urban centers.");
};

const getCoralPrediction = async (req, res) => {
    getAIPrediction(req, res, "coral", "Consider proximity to sensitive marine ecosystems and industrial coastlines.");
};


module.exports = {
    getDeforestationPrediction,
    getPlasticPrediction,
    getCoralPrediction
};