module.exports = function(app, models, moment) {
	const Task = models.Task;
	app.get("/getTasks", (request, response) => {
		var query = {};
		Task.find(query).then(tasks => {
			response.status(200).send(tasks);
			response.end();
		}).catch(error => console.log(error));
	});
	app.post("/createTask", (request, response) => {
		var allowCreation = true;
		var errorFields = [];
		var person = request.body.person;
		if(!person) {
			errorFields.push("person");
			allowCreation = false;
		}
		var dueDate = request.body.dueDate;
		if(!dueDate || invalidDueDate(dueDate) || isNotAfterToday(dueDate)) {
			errorFields.push("dueDate");
			allowCreation = false;
		}
		var priority = request.body.priority;
		if(!priority) {
			errorFields.push("priority");
			allowCreation = false;
		}
		var description = request.body.description;
		if(!description) {
			errorFields.push("description");
			allowCreation = false;
		}
		if(allowCreation) {
			var resolved = "processing";
			var newTask = getTaskScheme(Task, person, dueDate, priority, description, resolved);
			newTask.save().then(task => {
				response.status(200).json({created: true, task: task});
                response.end();
            }).catch(error => console.log(error));
        } else {
            response.status(200).json({created: false, errorFields: errorFields});
            response.end();
        }
	});
	app.put("/editTask", (request, response) => {
		var taskId = request.body.taskId;
		var person = request.body.person;
		var priority = request.body.priority;
		var description = request.body.description;
		if(taskId && person && priority && description) {
			var query = {_id: taskId};
			var update = {person: person, priority: priority, description: description};
			Task.findOneAndUpdate(query, update, {new: true}).then(task => {
				if(!isEmpty(task)) {
                    response.status(200).json({edited: true});
                    response.end();
                } else {
                    response.status(200).json({edited: false});
                    response.end();
                }
            }).catch(error => console.log(error));
		} else {
            response.status(200).json({edited: false});
            response.end();
        }
	});
	app.delete("/deleteTask/:taskId", (request, response) => {
		var taskId = request.params.taskId;
		if(taskId) {
			var query = {_id: taskId};
			Task.findOneAndRemove(query).then(task => {
				if(!isEmpty(task)) {
                    response.status(200).json({deleted: true});
                    response.end();
                } else {
                    response.status(200).json({deleted: false});
                    response.end();
                }
            }).catch(error => console.log(error));
        } else {
            response.status(200).json({deleted: false});
            response.end();
        }
	});
	app.put("/resolveTask", (request, response) => {
		var taskId = request.body.taskId;
		if(taskId) {
			var query = {_id: taskId};
			var update = {resolved: true};
			Task.findOneAndUpdate(query, update, {new: true}).then(task => {
				if(!isEmpty(task)) {
					response.status(200).json({resolved: true, task: task});
					response.end();
				}
				else{
					response.status(200).json({resolved: false});
					response.end();
				}
			});
		} else {
			response.status(200).json({resolved: false});
			response.end();
		}
	});
	app.put("/declineTask", (request, response) => {
		var taskId = request.body.taskId;
		if(taskId) {
			var query = {_id: taskId};
			var update = {resolved: false};
			Task.findOneAndUpdate(query, update, {new: true}).then(task => {
				if(!isEmpty(task)) {
					response.status(200).json({declined: true, task: task});
					response.end();
				}
				else{
					response.status(200).json({declined: false});
					response.end();
				}
			});
		} else {
			response.status(200).json({declined: false});
			response.end();
		}
	});

	function getTaskScheme(Task, person, dueDate, priority, description, resolved) {
		return new Task({person: person, dueDate: dueDate, priority: priority, description: description, resolved: resolved});
	}
	function invalidDueDate(dueDate) {
		var dateFormat = /(?:0[1-9]|[12][0-9]|3[01])\.(?:0[1-9]|1[0-2])\.(?:19|20\d{2})/;
		if(dateFormat.test(dueDate)) {
			return false;
		} else {
			return true;
		}
	}
	function isNotAfterToday(date) {
		var temporaryDateArray = date.split(".");
		var temporaryDate = temporaryDateArray[2] + "-" + temporaryDateArray[1] + "-" + temporaryDateArray[0];
		var dueDate = moment(temporaryDate);
		var today = moment().subtract(1, "days").endOf("day");
		if(dueDate.isAfter(today)) {
			return false;
		} else {
			return true;
		}
	}
	function isEmpty(object) {
		return !object || Object.keys(object).length === 0;
	}
}
