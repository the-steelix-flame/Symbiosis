const { db } = require('../../config/firebaseAdmin'); // Ensure this path is correct for your project

const getEcoUploads = async (req, res) => {
    try {
        const submissionsRef = db.collection('submissions');
        // Query for documents that have been validated
        const snapshot = await submissionsRef.where('status', '==', 'validated').get();

        if (snapshot.empty) {
            // If no validated uploads are found, return an empty array
            return res.status(200).json([]);
        }

        // Map the documents to a format the frontend can use
        const ecoUploads = snapshot.docs.map(doc => {
            const data = doc.data();
            // Only include uploads that have location data
            if (data.lat && data.lng) {
                return {
                    id: doc.id,
                    title: data.title || 'User Upload',
                    lat: data.lat,
                    lng: data.lng,
                    imageUrl: data.imageUrl, // <-- We've added the imageUrl here
                    type: 'eco_upload'
                };
            }
            return null;
        }).filter(item => item !== null); // Remove any null entries

        res.status(200).json(ecoUploads);
    } catch (error) {
        console.error("Error fetching validated submissions from Firestore: ", error);
        res.status(500).send("Internal Server Error: Could not fetch eco-uploads.");
    }
};

module.exports = { getEcoUploads };