module.exports = function(mongoose) {
    var taskScheme = new mongoose.Schema({
        person: String,
        dueDate: String,
        priority: String,
        description: String,
        resolved: String
    });
    var models = {
        Task: mongoose.model("Task", taskScheme)
    }
    return models;
}