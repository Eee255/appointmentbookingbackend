const mongoose = require("mongoose");

const connectionDB = async () => {
    await mongoose.connect(
        "mongodb+srv://bhanu171:sZt9FpuOar5azHS7@bhanu.rul9b.mongodb.net/BabySteps"
    );
}

module.exports = connectionDB;
