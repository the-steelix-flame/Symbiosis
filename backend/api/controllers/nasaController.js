const getGhgData = (req, res) => {
    // The NASA GHG data is loaded as a tile layer directly on the frontend.
    // This backend endpoint simply confirms that the service route is active
    // and can be used for more complex NASA API calls in the future if needed.
    res.status(200).json({ message: "NASA GHG data endpoint is active and configured on the frontend." });
};

module.exports = { getGhgData };