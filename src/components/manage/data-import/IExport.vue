<template>
	<div class="component-inner">
		<div class="component-info">
			<data-info :info="info" />

			<q-separator />

			<div v-if="info.state >= 1">
				<div style="text-align: center; margin-top: 20px">
					<div class="q-mb-md">
						<q-icon name="check_circle" color="green" size="40px"></q-icon>
					</div>
					<div class="subtitle">数据已导出</div>
				</div>
			</div>
			<div style="text-align: center; margin-top: 20px" v-else>
				<div class="q-mb-md">
					<q-spinner-hourglass color="primary" size="2em" />
				</div>
				<div class="subtitle">文件正在导出，请耐心等待...</div>
			</div>
		</div>
		<div class="component-btns">
			<q-space />
			<q-btn @click="next" color="primary" label="下一步" />
		</div>
	</div>
</template>

<script lang="ts" setup>
import DataInfo from './DataInfo.vue';

defineProps<{
	info: any;
}>();
const emit = defineEmits(['next']);
function next() {
	emit('next', 'export');
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
</style>
