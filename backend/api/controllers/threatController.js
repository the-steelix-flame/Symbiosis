const { db } = require('../../config/firebaseAdmin');

/**
 * @desc    Get all validated submissions to be displayed as threats on the map.
 * @route   GET /api/threats
 */
const getThreats = async (req, res) => {
    try {
        // CORRECTED SYNTAX: Use the Admin SDK's methods: db.collection() and .where()
        const submissionsRef = db.collection('submissions');
        const snapshot = await submissionsRef.where('status', '==', 'validated').get();

        if (snapshot.empty) {
            return res.status(200).json([]);
        }

        const threats = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                lat: data.lat,
                lng: data.lng,
                title: data.title,
                description: data.description,
                type: data.type || 'deforestation',
                severity: data.severity || 'High'
            };
        });

        res.status(200).json(threats);
    } catch (error) {
        console.error("Error fetching validated submissions from Firestore:", error);
        res.status(500).json({ message: "Server error: Failed to fetch threats." });
    }
};

module.exports = {
    getThreats,
};