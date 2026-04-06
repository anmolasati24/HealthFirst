import { User } from "../models/user.js";

const getUserDetails = async (userId) => {
  try {
    if (!userId) {
      return getDefaultUser();
    }

    const user = await User.findById(userId);

    if (!user) {
      return getDefaultUser();
    }

    return {
      age: user.age || null,
      gender: user.gender || "unknown",
      allergies: user.allergies || [],
      diseases: user.diseases || [],
    };

  } catch (error) {
    console.log("❌ Get User Error:", error.message);
    return getDefaultUser();
  }
};

// Default fallback
const getDefaultUser = () => ({
  age: null,
  gender: "unknown",
  allergies: [],
  diseases: [],
});

export { getUserDetails };