const { db } = require('../../config/firebaseAdmin');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { point, polygon, booleanPointInPolygon } = require('@turf/turf');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Load the GeoJSON data
const geoJsonPath = path.join(__dirname, '..', '..', 'data', 'india-states.geojson');
const indiaStatesGeoJSON = JSON.parse(fs.readFileSync(geoJsonPath, 'utf-8'));

const findStateForPoint = (lat, lng) => {
    try {
        const pt = point([lng, lat]);
        for (const feature of indiaStatesGeoJSON.features) {
            try {
                const poly = polygon(feature.geometry.coordinates);
                if (booleanPointInPolygon(pt, poly)) {
                    return feature.properties.ST_NM;
                }
            } catch (e) { continue; }
        }
    } catch (e) { console.error("Error in findStateForPoint:", e.message); }
    return null;
};

const getEcoScores = async (req, res) => {
    try {
        // --- 1. Fetch and Aggregate Data ---
        const projectsPromise = db.collection('projects').get();
        const submissionsPromise = db.collection('submissions').where('status', '==', 'validated').get();
        const [projectsSnapshot, submissionsSnapshot] = await Promise.all([projectsPromise, submissionsPromise]);

        const stateData = {};
        indiaStatesGeoJSON.features.forEach(f => {
            if (f.properties.ST_NM) stateData[f.properties.ST_NM] = { projects: 0, deforestation: 0, plastic: 0, coral: 0 };
        });

        projectsSnapshot.forEach(doc => {
            const project = doc.data();
            if (project.lat && project.lng) {
                const state = findStateForPoint(project.lat, project.lng);
                if (state && stateData[state]) stateData[state].projects++;
            }
        });

        submissionsSnapshot.forEach(doc => {
            const submission = doc.data();
            if (submission.lat && submission.lng) {
                const state = findStateForPoint(submission.lat, submission.lng);
                if (state && stateData[state]) {
                    const type = (submission.type || '').toLowerCase();
                    if (stateData[state][type] !== undefined) stateData[state][type]++;
                }
            }
        });

        // --- 2. Create the AI Prompt ---
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const prompt = `
            You are an expert environmental data scientist. Your task is to calculate an "Eco-Score" for each Indian state on a scale of 0 (critically poor) to 100 (excellent).
            
            Base your entire analysis on the following data, which represents positive and negative environmental activities:
            - "projects": Number of active environmental projects (a positive factor).
            - "deforestation": Number of validated deforestation reports (a strong negative factor).
            - "plastic": Number of plastic pollution reports (a negative factor).
            - "coral": Number of coral bleaching reports (a negative factor).

            Analyze the data for each state in india(don't forget any state at anycost) and generate a score. States with many projects and few negative reports should score high. States with many negative reports, especially deforestation, should score low.

            DATA:
            ${JSON.stringify(stateData, null, 2)}

            Your response MUST be only a valid JSON object, with each state name as the key and its calculated Eco-Score (an integer from 0 to 100) as the value. Do not include any other text, explanation, or markdown.

            Example format: { "Maharashtra": 75, "Kerala": 82, "Bihar": 45 }
        `;

        // --- 3. Call Gemini API and Parse the Response ---
        const result = await model.generateContent(prompt);
        const responseText = await result.response.text();
        const aiScores = JSON.parse(responseText.replace(/```json/g, '').replace(/```/g, '').trim());

        // --- 4. Merge AI Scores into GeoJSON ---
        const updatedFeatures = indiaStatesGeoJSON.features.map(feature => {
            const stateName = feature.properties.ST_NM;
            const ecoScore = aiScores[stateName] !== undefined ? aiScores[stateName] : 50; // Default to 50 if AI fails for a state

            return {
                ...feature,
                properties: {
                    ...feature.properties,
                    ecoScore: ecoScore,
                    // You can add the raw data back in if you want it in the popup
                    positiveActions: stateData[stateName]?.projects || 0,
                    negativeReports: (stateData[stateName]?.deforestation || 0) + (stateData[stateName]?.plastic || 0) + (stateData[stateName]?.coral || 0)
                }
            };
        });

        const finalGeoJSON = { type: "FeatureCollection", features: updatedFeatures };
        res.status(200).json(finalGeoJSON);

    } catch (error) {
        console.error("Error generating AI-powered Eco-Scores: ", error);
        res.status(500).json({ message: "Failed to generate AI analysis." });
    }
};

module.exports = { getEcoScores };