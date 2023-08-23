<template>
	<div class="component-inner">
		<div class="component-info">
			<data-info :info="info" />

			<q-separator />
			<div style="text-align: center; margin-top: 20px" v-if="info.state == 0">
				<div class="q-mb-md">
					<q-spinner-hourglass color="primary" size="2em" />
				</div>
				<div class="subtitle">文件正在导出，请耐心等待...</div>
			</div>
			<div style="text-align: center; margin-top: 20px" v-if="info.state == 1">
				<div class="q-mb-md">
					<q-spinner-clock color="primary" size="2em" />
				</div>
				<div class="subtitle">正在准备寄送快递，请耐心等待</div>
			</div>
			<div v-if="info.state == 2">
				<div style="text-align: center; margin-top: 20px">
					<div class="q-mb-md">
						<q-icon name="check_circle" color="green" size="40px"></q-icon>
					</div>
					<div class="subtitle">快递已经在途中了，请耐心等待...</div>
				</div>
			</div>
			<div v-if="info.state == 3">
				<div class="subtitle q-mt-sm">文件导入后请执行以下操作</div>
				<div class="import-div">
					<div>
						<div class="subtitle q-mb-sm">在服务器让运维人员执行以下操作</div>
						<div class="primary">c/d/c/d</div>
					</div>
					<q-separator vertical inset></q-separator>
					<div class="sep-text">或</div>
					<div>
						<div class="subtitle q-mb-sm">请确认文件已导入指定路径</div>
						<div>
							<q-btn color="primary">确认已导入</q-btn>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="component-btns">
			<q-btn @click="prev" color="primary" label="上一步" />
			<q-space />
			<q-btn @click="submit" color="primary" label="完成" />
		</div>
	</div>
</template>

<script lang="ts" setup>
import DataInfo from './DataInfo.vue';

defineProps<{
	info: any;
}>();
const emit = defineEmits(['prev', 'submit']);
function prev() {
	emit('prev', 'import');
}
function submit() {
	emit('submit');
}
</script>

<style lang="scss" scoped>
.state {
	font-size: 12px;
	border-radius: 5px;
	padding: 3px 5px;
	&.color-0 {
		background: green;
		color: #fff;
	}
	&.color-1 {
		background: blue;
		color: #fff;
	}
	&.color-2 {
		background: orange;
		color: #fff;
	}
	&.color-3,
	&.color-4 {
		background: red;
		color: #fff;
	}
}
.date {
	font-size: 12px;
}
.primary {
	color: $primary-color;
}
.name {
	margin-left: 10px;
	font-weight: bold;
	font-size: 15px;
}
.desc-item {
	display: flex;
	margin-bottom: 20px;
	.title {
		width: 100px;
		color: $font-light-color;
	}
	.content {
		flex: 1;
		word-break: break-all;
		color: #25396f;
	}
}
.tabs-div {
	.tab-item {
		&.active {
			color: $primary-color;
		}
	}
}
.subtitle {
	color: $font-light-color;
}
.import-div {
	margin: 20px 0;
	display: flex;
	justify-content: space-around;
	position: relative;
}
.sep-text {
	position: absolute;
	left: 50%;
	top: 50%;
	margin-left: 14px;
	margin-top: -10px;
}
</style>
