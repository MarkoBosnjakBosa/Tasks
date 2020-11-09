<template>
	<div id="app" class="container-fluid">
		<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.15.0/css/all.css">
		<h1>Tasks</h1>
		<tasks-form :returnedData="returnedData" @createtask="createTask" @resetdata="resetData"/>
		<tasks-table :tasks="tasks" @edittask="editTask" @deletetask="deleteTask" @resolvetask="resolveTask" @declinetask="declineTask"/>
	</div>
</template>

<script>
	import "bootstrap";
	import "bootstrap/dist/css/bootstrap.min.css";
	import TasksTable from "@/components/TasksTable.vue";
	import TasksForm from "@/components/TasksForm.vue";
	var axios = require("axios");

	export default {
		name: "app",
		components: {
			TasksTable,
			TasksForm
		},
	data() {
		return {
			tasks: [],
			returnedData: {
				created: false,
				errorFields: []
			}
		}
	},
	methods: {
		getTasks() {
			axios.get(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_PORT + "/getTasks").then(response => {
				this.tasks = response.data;
			}).catch(error => console.log(error));
		},
		createTask(task) {
			var body = {person: task.person, dueDate: task.dueDate, priority: task.priority, description: task.description};
			axios.post(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_PORT + "/createTask", body).then(response => {
				var returnedData = {};
				if(response.data.created) {
					var newTask = response.data.task;
					this.tasks = [...this.tasks, newTask];
					returnedData = {created: true, errorFields: []};
					this.returnedData = returnedData;
				} else {
					returnedData = {created: true, errorFields: response.data.errorFields};
					this.returnedData = returnedData;
				}
			}).catch(error => console.log(error));
		},
		editTask(updatedTask) {
			var body = {taskId: updatedTask._id, person: updatedTask.person, priority: updatedTask.priority, description: updatedTask.description};
			axios.put(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_PORT + "/editTask", body).then(response => {
				if(response.data.edited) {
					this.tasks = this.tasks.map(task => task._id == updatedTask._id ? updatedTask : task);
				}
			}).catch(error => console.log(error));
		},
		deleteTask(taskId) {
			axios.delete(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_PORT + "/deleteTask/" + taskId).then(response => {
				if(response.data.deleted) {
					this.tasks = this.tasks.filter(task => task._id != taskId);
				}
			}).catch(error => console.log(error));
		},
		resolveTask(taskId) {
			var body = {taskId: taskId};
			axios.put(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_PORT + "/resolveTask", body).then(response => {
				if(response.data.resolved) {
					this.tasks = this.tasks.map(task => task._id == response.data.task._id ? response.data.task : task);
				}
			}).catch(error => console.log(error));
		},
		declineTask(taskId) {
			var body = {taskId: taskId};
			axios.put(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_PORT + "/declineTask", body).then(response => {
				if(response.data.declined) {
					this.tasks = this.tasks.map(task => task._id == response.data.task._id ? response.data.task : task);
				}
			}).catch(error => console.log(error));
		},
		resetData() {
			var reset = {created: false, errorFields: []};
			this.returnedData = reset;
		}
	},
	created() {
		this.getTasks();
	}
}
</script>

<style>
	h1 {
		text-align: center;
		margin-top: 20px;
		margin-bottom: 20px;
	}
</style>
