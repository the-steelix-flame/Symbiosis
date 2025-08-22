const { db } = require('../../config/firebaseAdmin');

/**
 * @desc    Get a specific user's profile from the 'users' collection in Firestore.
 * @route   GET /api/users/:userId
 */
const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        // CORRECTED SYNTAX: Use .collection().doc()
        const userDocRef = db.collection('users').doc(userId);
        const userDoc = await userDocRef.get();

        if (userDoc.exists) {
            res.status(200).json({ uid: userDoc.id, ...userDoc.data() });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error)        {
        console.error("Error fetching user profile from Firestore:", error);
        res.status(500).json({ message: "Server error: Failed to fetch user profile." });
    }
};

/**
 * @desc    Find users who have a specific skill in their profile.
 * @route   GET /api/users/match/:skill
 */
const findUsersBySkill = async (req, res) => {
    try {
        const { skill } = req.params;
        if (!skill) {
            return res.status(400).json({ message: "A skill parameter is required for matching." });
        }
        // CORRECTED SYNTAX: Use .collection().where()
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('skills', 'array-contains', skill.toLowerCase()).get();

        if (snapshot.empty) {
            return res.status(404).json({ message: `No users found with the skill: ${skill}` });
        }

        const matchedUsers = snapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data()
        }));

        res.status(200).json(matchedUsers);

    } catch (error) {
        console.error("Error finding users by skill in Firestore:", error);
        res.status(500).json({ message: "Server error: Failed to find users by skill." });
    }
};

module.exports = {
    getUserProfile,
    findUsersBySkill,
};