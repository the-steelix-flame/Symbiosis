// --- MOCK DATABASE ---
// This is a temporary placeholder.
// Later, this will fetch data from your Firestore database.
const MOCK_USERS_DB = {
    "user_uid_1": { uid: "user_uid_1", email: "researcher@example.com", role: "researcher", name: "Dr. Aris", skills: ["Python", "GIS Mapping"] },
    "user_uid_2": { uid: "user_uid_2", email: "ngo@example.com", role: "ngo", name: "Green Earth NGO", skills: ["Community Mobilization", "Grant Writing"] },
    "user_uid_3": { uid: "user_uid_3", email: "student@example.com", role: "student", name: "Sam", skills: ["React.js", "GIS Mapping"] },
};
// ---------------------

const getUserProfile = (req, res) => {
    const { userId } = req.params;
    const user = MOCK_USERS_DB[userId];

    if (user) {
        res.status(200).json(user);
    } else {
        res.status(404).json({ message: "User not found" });
    }
};

const findUsersBySkill = (req, res) => {
    const { skill } = req.params;
    if (!skill) {
        return res.status(400).json({ message: "Skill parameter is required" });
    }

    const matchedUsers = Object.values(MOCK_USERS_DB).filter(user =>
        user.skills.some(s => s.toLowerCase() === skill.toLowerCase())
    );

    if (matchedUsers.length > 0) {
        res.status(200).json(matchedUsers);
    } else {
        res.status(404).json({ message: `No users found with the skill: ${skill}` });
    }
};

module.exports = {
    getUserProfile,
    findUsersBySkill,
};