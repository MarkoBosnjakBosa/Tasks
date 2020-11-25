<template>
	<div id="tasksForm">
		<form autocomplete="off" @submit.prevent="createTask()">
			<div class="form-row">
				<div class="form-group col-md-4">
					<input type="text" id="person" class="form-control" :class="{'errorField' : personError && submitting}" placeholder="Person" v-model="task.person" ref="first" @focus="clearPersonStatus()" @keypress="clearPersonStatus()"/>
					<small v-if="(personError && submitting) || (!returnedData.created && returnedData.errorFields.includes('person'))" class="form-text errorInput">Please provide a valid person!</small>
				</div>
				<div class="form-group col-md-4">
					<input type="text" id="dueDate" class="form-control" :class="{'errorField' : dueDateError && submitting}" placeholder="Due Date" v-model="task.dueDate" @focus="clearDueDateStatus()" @keypress="clearDueDateStatus()"/>
					<small v-if="(dueDateError && submitting) || (!returnedData.created && returnedData.errorFields.includes('dueDate'))" class="form-text errorInput">Please provide a valid due date!</small>
				</div>
				<div class="form-group col-md-4">
					<select id="priority" class="form-control" :class="{'errorField' : priorityError && submitting}" v-model="task.priority" @focus="clearPriorityStatus()" @keypress="clearPriorityStatus()">
						<option value="" disabled selected>Select priority...</option>
						<option value="top">Top</option>
						<option value="medium">Medium</option>
						<option value="low">Low</option>
					</select>
					<small v-if="(priorityError && submitting) || (!returnedData.created && returnedData.errorFields.includes('priority'))" class="form-text errorInput">Please provide a valid priority!</small>
				</div>
			</div>
			<div class="form-row">
				<div class="form-group col-md-12">
					<input type="text" id="description" class="form-control" :class="{'errorField' : descriptionError && submitting}" placeholder="Description" v-model="task.description" @focus="clearDescriptionStatus()" @keypress="clearDescriptionStatus()"/>
					<small v-if="(descriptionError && submitting) || (!returnedData.created && returnedData.errorFields.includes('description'))" class="form-text errorInput">Please provide a valid description!</small>
				</div>
			</div>
			<div v-if="returnedData.created" class="form-group creationSuccessful">Your task has been successfully created!</div>
			<div class="form-group">
				<button type="submit" class="btn btn-primary">Create</button>
				<button type="button" class="btn btn-danger resetForm" @click="resetForm()">Reset</button>
			</div>
		</form>
	</div>
</template>

<script>
	import moment from "moment";

	export default {
		name: "tasks-form",
		data() {
			return {
				submitting: false,
				personError: false,
				dueDateError: false,
				priorityError: false,
				descriptionError: false,
				task: {
					person: "",
					dueDate: "",
					priority: "",
					description: ""
				}
			}
		},
		props: {
			returnedData: Object
		},
		methods: {
			createTask() {
				this.submitting = true;
				this.clearPersonStatus();
				this.clearDueDateStatus();
				this.clearPriorityStatus();
				this.clearDescriptionStatus();
				var allowSubmit = true;
				if(this.invalidPerson) {
					this.personError = true;
					allowSubmit = false;
				}
				if(this.invalidDueDate) {
					this.dueDateError = true;
					allowSubmit = false;
				}
				if(this.invalidPriority) {
					this.priorityError = true;
					allowSubmit = false;
				}
				if(this.invalidDescription) {
					this.descriptionError = true;
					allowSubmit = false;
				}
				if(!allowSubmit) {
					this.$emit("resetdata");
					return;
				}
				this.$emit("createtask", this.task);
				this.$refs.first.focus();
				this.task = {person: "", dueDate: "", priority: "", description: ""};
				this.personError = false, this.dueDateError = false, this.priorityError = false, this.descriptionError = false, this.submitting = false;
			},
			clearPersonStatus() { this.personError = false; },
			clearDueDateStatus() { this.dueDateError = false; },
			clearPriorityStatus() { this.priorityError = false; },
			clearDescriptionStatus() { this.descriptionError = false; },
			isAfterToday(date) {
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
			resetForm() {
				this.task = {person: "", dueDate: "", priority: "", description: ""};
				this.personError = false, this.dueDateError = false, this.priorityError = false, this.descriptionError = false, this.submitting = false;
				this.$emit("resetdata");
			}
		},
		computed: {
			invalidPerson() {
				var personFormat = /^[a-zA-Z\s]*$/;
				if(this.task.person != "" && personFormat.test(this.task.person)) {
					return false;
				} else {
					return true;
				}
			},
			invalidDueDate() {
				var dateFormat = /(?:0[1-9]|[12][0-9]|3[01])\.(?:0[1-9]|1[0-2])\.(?:19|20\d{2})/;
				if(this.task.dueDate != "" && dateFormat.test(this.task.dueDate) && this.isAfterToday(this.task.dueDate)) {
					return false;
				} else {
					return true;
				}
			},
			invalidPriority() { return this.task.priority === ""; },
			invalidDescription() { return this.task.description === ""; }
		},
	}
</script>

<style scoped>
	#tasksForm {
		max-width: 800px;
		margin: 0 auto;
		margin-bottom: 20px;
	}
	.resetForm {
		margin-left: 10px;
	}
	.creationSuccessful {
		color: #008000;
		margin-bottom: 10px;
	}
	.errorField {
		border: 1px solid #ff0000;
		box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.1), 0 0 6px #ff8080;
	}
	.errorInput {
		color: #ff0000;
	}
</style>
