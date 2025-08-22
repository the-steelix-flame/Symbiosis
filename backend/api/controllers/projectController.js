const { spawn } = require('child_process');
const { db } = require('../../config/firebaseAdmin');

// Helper function to get the latest validated report of a specific type
const getLatestValidatedReport = async (reportType) => {
    // CORRECTED SYNTAX: Use .collection().where().orderBy().limit().get()
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

// Helper function to run any Python prediction script (No changes needed here)
const runPredictionScript = (scriptName, data, res) => {
    const pythonProcess = spawn('python', [`./ai/${scriptName}`, JSON.stringify(data)]);
    let result = '';
    pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
    });
    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python script error (${scriptName}): ${data}`);
    });
    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            return res.status(500).json({ message: `Prediction script ${scriptName} failed.` });
        }
        try {
            res.status(200).json(JSON.parse(result));
        } catch (error) {
            res.status(500).json({ message: "Failed to parse prediction data." });
        }
    });
};

const getDeforestationPrediction = async (req, res) => {
    const latestReport = await getLatestValidatedReport("deforestation");
    if (!latestReport) {
        return res.status(404).json({ message: "No validated deforestation reports found." });
    }
    runPredictionScript('predict_deforestation.py', latestReport, res);
};

const getPlasticPrediction = async (req, res) => {
    const latestReport = await getLatestValidatedReport("plastic");
    if (!latestReport) {
        return res.status(404).json({ message: "No validated plastic waste reports found." });
    }
    runPredictionScript('predict_plastic_waste.py', latestReport, res);
};

const getCoralPrediction = async (req, res) => {
    const latestReport = await getLatestValidatedReport("coral");
    if (!latestReport) {
        return res.status(404).json({ message: "No validated coral bleaching reports found." });
    }
    runPredictionScript('predict_coral_bleaching.py', latestReport, res);
};

module.exports = {
    getDeforestationPrediction,
    getPlasticPrediction,
    getCoralPrediction
};