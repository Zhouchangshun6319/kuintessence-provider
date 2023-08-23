<template>
	<div class="component-inner">
		<div class="component-info">
			<data-info :info="info" />

			<q-separator />
			<div style="text-align: center; margin-top: 20px">
				<div class="q-mb-md">
					<q-icon name="check_circle" color="green" size="40px"></q-icon>
				</div>
				<div class="subtitle">数据正在导入中，请等待对方回执</div>
			</div>
		</div>
		<div class="component-btns">
			<q-btn @click="prev" color="primary" label="上一步" />
			<q-space />
			<q-btn @click="submit" color="primary" label="确定" />
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
