import Status from "../models/Status.js";
import User from "../models/User.js";

// Create status
export async function createStatus(req, res) {
  try {
    const { text, mediaUrl, bgColor } = req.body;
    const status = await Status.create({
      user: req.user._id,
      text: text || "",
      mediaUrl: mediaUrl || "",
      bgColor: bgColor || "#075e54",
    });

    const populated = await Status.findById(status._id).populate("user", "fullName profilePic");
    res.status(201).json(populated);
  } catch (error) {
    console.error("Error creating status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get all status updates (yours and your friends)
export async function getStatuses(req, res) {
  try {
    const friends = req.user.friends || [];
    const userIds = [req.user._id, ...friends];

    const statuses = await Status.find({ user: { $in: userIds } })
      .populate("user", "fullName profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json(statuses);
  } catch (error) {
    console.error("Error getting statuses:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Mark status as viewed
export async function viewStatus(req, res) {
  try {
    const { id } = req.params;
    const status = await Status.findByIdAndUpdate(
      id,
      { $addToSet: { views: req.user._id } },
      { new: true }
    );

    if (!status) {
      return res.status(404).json({ message: "Status not found" });
    }

    res.status(200).json(status);
  } catch (error) {
    console.error("Error viewing status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
