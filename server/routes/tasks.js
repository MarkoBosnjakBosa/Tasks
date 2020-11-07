module.exports = function(app, models, moment) {
    const Task = models.Task;
    app.get("/getTasks", (request, response) => {
      Task.find({}, function(error, tasks) {
        response.status(200).send(tasks);
        response.end();
      });
    });
    app.post("/createTask", (request, response) => {
      var person = request.body.person;
      if(person) {
        var dueDate = request.body.dueDate;
        if(dueDate && validateDueDate(dueDate) && isAfterToday(dueDate)) {
          var priority = request.body.priority;
          if(priority) {
            var description = request.body.description;
            if(description) {
              var resolved = request.body.resolved;
              var newTask = getTaskScheme(Task, person, dueDate, priority, description, resolved);
              newTask.save(function(error, task) {
                if(!isEmpty(task)) {
                  response.status(200).json({created: true, message: "Task has been successfully saved!", submitted: true, _id: task._id});
                  response.end();
                } else {
                  response.status(200).json({created: false, submitted: true, message: "Task has not been saved!", _id: null});
                  response.end();
                }
              });
            } else {
              response.status(200).json({created: false, submitted: true, message: "Please provide a valid description!", _id: null});
              response.end();
            }
          } else {
            response.status(200).json({created: false, submitted: true, message: "Please provide a valid priority!", _id: null});
            response.end();
          }
        } else {
          response.status(200).json({created: false, submitted: true, message: "Please provide a valid due date!", _id: null});
          response.end();
        }
      } else {
        response.status(200).json({created: false, submitted: true, message: "Please provide a valid person!", _id: null});
        response.end();
      }
    });
    app.put("/editTask", (request, response) => {
      var _id = request.body._id;
      var person = request.body.person;
      var priority = request.body.priority;
      var description = request.body.description;
      if(_id && person && priority && description) {
        var query = {_id: _id};
        var update = {person: person, priority: priority, description: description};
        Task.findOneAndUpdate(query, update, {new: true}, function(error, task) {
          if(!error) {
            response.status(200).json({edited: true});
            response.end();
          }
          else {
            response.status(200).json({edited: false});
            response.end();
          }
        });
      } else {
        response.status(200).json({edited: false});
        response.end();
      }
    });
    app.delete("/deleteTask/:taskId", (request, response) => {
      var _id = request.params.taskId;
      if(_id){
        var query = {_id: _id};
        Task.findOneAndRemove(query, function(error, task) {
          if(!isEmpty(task)){
            response.status(200).json({deleted: true});
            response.end();
          }
          else{
            response.status(200).json({deleted: false});
            response.end();
          }
        });
      }
    });
    app.post("/resolveTask", (request, response) => {
      var _id = request.body._id;
      if(_id){
        var query = {_id: _id};
        var update = {resolved: "yes"};
        Task.findOneAndUpdate(query, update, {new: true}, function(error, task) {
          if(!error) {
            response.status(200).json({resolved: true, task: task});
            response.end();
          }
          else{
            response.status(200).json({resolved: false, task: task});
            response.end();
          }
        });
      }
    });
    app.post("/declineTask", (request, response) => {
      var _id = request.body._id;
      if(_id){
        var query = {_id: _id};
        var update = {resolved: "no"};
        Task.findOneAndUpdate(query, update, {new: true}, function(error, task) {
          if(!error) {
            response.status(200).json({declined: true, task: task});
            response.end();
          }
          else{
            response.status(200).json({declined: false, task: task});
            response.end();
          }
        });
      }
    });
  
    function getTaskScheme(Task, person, dueDate, priority, description, resolved) {
      return new Task({person: person, dueDate: dueDate, priority: priority, description: description, resolved: resolved});
    }
    function validateDueDate(dueDate) {
      var dateFormat = /(?:0[1-9]|[12][0-9]|3[01])\.(?:0[1-9]|1[0-2])\.(?:19|20\d{2})/;
      if(dateFormat.test(dueDate)) {
        return true;
      } else {
        return false;
      }
    }
    function isAfterToday(date) {
      var temporaryDateArray = date.split(".");
      var temporaryDate = temporaryDateArray[2] + "-" + temporaryDateArray[1] + "-" + temporaryDateArray[0];
      var dueDate = moment(temporaryDate);
      var today = moment().subtract(1, "days").endOf("day");
      if(dueDate.isAfter(today)) {
        return true;
      } else {
        return false;
      }
    }
    function isEmpty(object) {
      return !object || Object.keys(object).length === 0;
    }
  }
  