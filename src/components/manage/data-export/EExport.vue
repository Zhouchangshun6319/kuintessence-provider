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
			<div v-else>
				<q-tabs class="tabs-div" dense align="left" v-model="tabValue">
					<q-tab class="tab-item" :class="{ active: tabValue == tab.value }" :name="tab.value" :label="tab.label" v-for="(tab, index) in tabs" :key="index" />
				</q-tabs>
				<div class="q-mt-md" v-if="tabValue == 'auto'">
					<div class="desc-item center">
						<div class="title">目标路径</div>
						<div class="content">
							<q-input outlined dense style="width: 150px" v-model="path"></q-input>
						</div>
					</div>
				</div>
				<div v-if="tabValue == 'manual'"></div>
			</div>
		</div>
		<div class="component-btns">
			<q-space />
			<q-btn @click="next" color="primary" label="下一步" />
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import DataInfo from './DataInfo.vue';

defineProps<{
	info: any;
}>();
const emit = defineEmits(['next']);
const tabValue = ref('auto');
const tabs = [
	{ value: 'auto', label: '自动处理' },
	{ value: 'manual', label: '手动处理' },
];
const path = ref('');

function submit() {}
function next() {
	submit();
	emit('next', 'export');
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
	&.center {
		align-items: center;
	}
}
.tabs-div {
	.tab-item {
		&.active {
			color: $primary-color;
		}
	}
}
</style>
