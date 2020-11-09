<template>
	<div id="tasksTable">
		<table class="table">
			<thead>
				<th>Person</th>
				<th>Description</th>
				<th>Due Date</th>
				<th>Priority</th>
				<th>Actions</th>
				<th>
					<select id="filter" class="form-control" v-model="filter">
						<option value="all" selected>All</option>
						<option value="resolved">Resolved</option>
						<option value="declined">Declined</option>
						<option value="processing">In process</option>
						<option value="top">Top priority</option>
						<option value="medium">Medium priority</option>
						<option value="low">Low priority</option>
					</select>
				</th>
			</thead>
			<tbody>
				<tr v-if="!filterByTerm.length">
					<td colspan="6" class="noTasks">No tasks found!</td>
				</tr>
				<tr v-for="task in filterByTerm" :key="task._id">
					<td v-if="editing == task._id"><input type="text" class="form-control" v-model="task.person"/></td>
					<td v-else>{{task.person}}</td>
					<td v-if="editing == task._id"><input type="text" class="form-control" v-model="task.description"/></td>
					<td v-else>{{task.description}}</td>
					<td v-if="editing == task._id" class="padded">{{task.dueDate}}</td>
					<td v-else>{{task.dueDate}}</td>
					<td v-if="editing == task._id">
					<select id="priority" class="form-control" v-model="task.priority">
						<option value="top">Top</option>
						<option value="medium">Medium</option>
						<option value="low">Low</option>
					</select>
					</td>
					<td v-else style="text-transform: capitalize">{{task.priority}}</td>
					<td v-if="editing == task._id" class="padded">
						<i class="far fa-check-circle" @click="editTask(task)"></i>
						<i class="far fa-times-circle" @click="disableEditing(task)"></i>
					</td>
					<td v-else>
						<i class="fas fa-pencil-alt" @click="enableEditing(task)"></i>
						<i class="fas fa-trash" @click="deleteTask(task._id)"></i>
						<i v-if="checkTaskDate(task.dueDate)" class="fas fa-check" :class="{'resolvedTask': isTaskResolved(task.resolved)}" @click="resolveTask(task._id)"></i>
						<i v-if="checkTaskDate(task.dueDate)" class="fas fa-times" :class="{'declinedTask': isTaskDeclined(task.resolved)}" @click="declineTask(task._id)"></i>
					</td>
					<td v-if="editing == task._id" class="padded">
						<i v-if="checkTaskDate(task.dueDate)" class="far fa-clock"></i>
						<i v-if="!checkTaskDate(task.dueDate) && isTaskResolved(task.resolved)" class="fas fa-check resolvedTask"></i>
						<i v-if="!checkTaskDate(task.dueDate) && isTaskDeclined(task.resolved)" class="fas fa-times declinedTask"></i>
					</td>
					<td v-else class="dueDateExpired">
						<i v-if="checkTaskDate(task.dueDate)" class="far fa-clock"></i>
						<i v-if="!checkTaskDate(task.dueDate) && isTaskResolved(task.resolved)" class="fas fa-check resolvedTask"></i>
						<i v-if="!checkTaskDate(task.dueDate) && isTaskDeclined(task.resolved)" class="fas fa-times declinedTask"></i>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script>
	import moment from "moment";

	export default {
		name: "tasks-table",
		data() {
			return {
				editing: null,
				filter: "all"
			}
		},
		props: {
			tasks: Array
		},
		methods: {
			enableEditing(task) { 
				this.cachedTask = Object.assign({}, task);
				this.editing = task._id; 
			},
			disableEditing(task) { 
				Object.assign(task, this.cachedTask);
				this.editing = null; 
			},
			editTask(task) {
				if(this.isValidPerson(task.person) && task.priority != "" && task.description != "") {
					this.$emit("edittask", task);
					this.editing = null;
				} else {
					return;
				}
			},
			deleteTask(taskId) { this.$emit("deletetask", taskId); },
			resolveTask(taskId) { this.$emit("resolvetask", taskId); },
			declineTask(taskId) { this.$emit("declinetask", taskId); },
			isTaskResolved(isResolved) {
				if(isResolved == "yes") return true;
				return false;
			},
			isTaskDeclined(isResolved) {
				if(isResolved == "no") return true;
				return false;
			},
			checkTaskDate(date) {
				var temporaryDateArray = date.split(".");
				var temporaryDate = temporaryDateArray[2] + "-" + temporaryDateArray[1] + "-" + temporaryDateArray[0];
				var dueDate = moment(temporaryDate);
				var today = moment().subtract(1, "days").endOf("day");
				if(dueDate.isAfter(today)) {
					return true;
				} else {
					return false;
				}
			},
			isValidPerson(person) {
				var personFormat = /^[a-zA-Z\s]*$/;
				if(person != "" && personFormat.test(person)) {
					return true;
				} else {
					return false;
				}
			}
		},
		computed: {
			filterByTerm() {
				if(this.filter == "resolved") {
					return this.tasks.filter(task => task.resolved == "yes");
				} else if(this.filter == "declined") {
					return this.tasks.filter(task => task.resolved == "no");
				} else if(this.filter == "processing") {
					return this.tasks.filter(task => task.resolved == "processing");
				} else if(this.filter == "top") {
					return this.tasks.filter(task => task.priority == "top");
				} else if(this.filter == "medium") {
					return this.tasks.filter(task => task.priority == "medium");
				} else if(this.filter == "low") {
					return this.tasks.filter(task => task.priority == "low");
				} else {
					return this.tasks;
				}
			}
		}
	}
</script>

<style scoped>
	#tasksTable {
		max-width: 1200px;
		margin: 0 auto;
	}
	.far:not(.fa-clock), .fas {
		cursor: pointer;
		margin-right: 5px;
	}
	.padded {
		padding-top: 20px;
	}
	.fa-check-circle, .resolvedTask {
		color: #008000;
	}
	.fa-times-circle, .declinedTask {
		color: #ff0000;
	}
	.dueDateExpired .resolvedTask, .dueDateExpired .declinedTask {
		cursor: default;
	}
	.noTasks {
		font-weight: bold;
		text-align: center;
		margin-top: 20px;
	}
	#filter {
		width: 200px;
	}
</style>
