module.exports = function(mongoose) {
    const taskScheme = new mongoose.Schema({
        person: String,
        dueDate: String,
        priority: String,
        description: String,
        resolved: String
    });
    const models = {
        Task: mongoose.model("Task", taskScheme)
    }
    return models;
}