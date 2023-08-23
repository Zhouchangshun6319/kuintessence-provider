<template>
	<q-dialog v-model="openDialog">
		<q-card :class="column" class="config-card">
			<q-card-section>
				<div class="text-h6">{{ formData.id ? '编辑' : '添加' }}队列</div>
			</q-card-section>
			<q-separator />
			<q-card-section style="height: 500px; overflow: hidden; padding: 0">
				<div style="height: 100%; width: 100%" class="column">
					<div class="col q-pa-md" style="overflow: auto">
						<q-form greedy>
							<q-input filled clearable v-model="formData.name" label="队列名称 *" lazy-rules :rules="[(val) => (val && val.length > 0) || '请填写队列名称']" />
							<q-separator class="q-mb-md" />
							<q-input
								filled
								type="number"
								maxlength="9"
								clearable
								v-model="formData.memory"
								label="内存 *"
								lazy-rules
								:rules="[(val) => (val !== null && val !== '') || '请填写内存', (val) => val > 0 || '请填写大于0的正整数']"
							/>
							<q-input
								filled
								type="number"
								maxlength="9"
								clearable
								v-model="formData.memory_alert"
								label="内存最大可用 *"
								lazy-rules
								:rules="[(val) => (val !== null && val !== '') || '请填写内存最大可用', (val) => val > 0 || '请填写大于0的正整数']"
							/>
							<q-input
								filled
								type="number"
								maxlength="9"
								clearable
								v-model="formData.core_number"
								label="核心数 *"
								lazy-rules
								:rules="[(val) => (val !== null && val !== '') || '请填写核心数', (val) => val > 0 || '请填写大于0正整数']"
							/>
							<q-input
								filled
								type="number"
								maxlength="9"
								clearable
								v-model="formData.core_number_alert"
								label="核心最大可用 *"
								lazy-rules
								:rules="[(val) => (val !== null && val !== '') || '请填写核心最大可用', (val) => val > 0 || '请填写大于0的正整数']"
							/>
							<q-input
								filled
								type="number"
								maxlength="9"
								clearable
								v-model="formData.storage_capacity"
								label="存储 *"
								lazy-rules
								:rules="[(val) => (val !== null && val !== '') || '请填写存储', (val) => val > 0 || '请填写大于0的正整数']"
							/>
							<q-input
								filled
								type="number"
								maxlength="9"
								clearable
								v-model="formData.storage_capacity_alert"
								label="存储最大可用 *"
								lazy-rules
								:rules="[(val) => (val !== null && val !== '') || '请填写存储最大可用', (val) => val > 0 || '请填写大于0的正整数']"
							/>
							<q-input
								filled
								type="number"
								maxlength="9"
								clearable
								v-model="formData.max_queuing_task_count"
								label="最大挂起作业数 *"
								lazy-rules
								:rules="[(val) => (val !== null && val !== '') || '请填写最大挂起作业数', (val) => val > 0 || '请填写大于0的正整数']"
							/>
							<q-input
								filled
								type="number"
								maxlength="9"
								clearable
								v-model="formData.max_running_task_count"
								label="最大运行作业数 *"
								lazy-rules
								:rules="[(val) => (val !== null && val !== '') || '请填写最大运行作业数', (val) => val > 0 || '请填写大于0的正整数']"
							/>
							<q-input
								filled
								type="number"
								maxlength="9"
								clearable
								v-model="formData.node_count"
								label="节点数 *"
								lazy-rules
								:rules="[(val) => (val !== null && val !== '') || '请填写节点数', (val) => val > 0 || '请填写大于0的正整数']"
							/>
							<q-input
								filled
								type="number"
								maxlength="9"
								clearable
								v-model="formData.max_node_count"
								label="最大可用节点数 *"
								lazy-rules
								:rules="[(val) => (val !== null && val !== '') || '请填写最大可用节点数', (val) => val > 0 || '请填写大于0的正整数']"
							/>
						</q-form>
					</div>
					<q-card-actions align="right" class="q-pt-lg">
						<q-btn class="text-grey" flat label="取消" v-close-popup />
						<q-btn
							class="text-primary"
							flat
							label="确定"
							type="submit"
							@click="onSubmit"
							:disable="
								!formData.name ||
								!formData.memory ||
								!formData.memory_alert ||
								!formData.core_number ||
								!formData.core_number_alert ||
								!formData.storage_capacity ||
								!formData.storage_capacity_alert ||
								!formData.max_queuing_task_count ||
								!formData.max_running_task_count ||
								!formData.node_count ||
								!formData.max_node_count
							"
						/>
					</q-card-actions>
				</div>
			</q-card-section>
		</q-card>
	</q-dialog>
</template>

<script setup>
import { useQuasar } from 'quasar';
import { ClusterService } from 'src/service/cluster';
import { ref } from 'vue';
const formData = ref();
const emit = defineEmits(['success']);
const $q = useQuasar();
const openDialog = ref(false);
async function onSubmit() {
	if (formData.value.id) {
		await ClusterService.updateQueue(formData.value.id, formData.value);
		$q.notify({
			type: 'positive',
			message: '修改成功',
		});
		close();
		emit('success');
	}
}

function open(row) {
	if (row) {
		formData.value = JSON.parse(JSON.stringify(row));
	} else {
		formData.value = {
			id: '',
			name: '',
			memory: '',
			memory_alert: '',
			core_number: '',
			core_number_alert: '',
			storage_capacity: '',
			storage_capacity_alert: '',
			max_queuing_task_count: '',
			max_running_task_count: '',
			node_count: '',
			max_node_count: '',
		};
	}
	openDialog.value = true;
}
function close() {
	openDialog.value = false;
}
defineExpose({
	open,
	close,
});
</script>

<style>
.config-card {
	min-width: 450px;
}
.config-title {
	width: 125px;
	align-items: flex-end;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
	-webkit-appearance: none !important;
}
input[type='number'] {
	-moz-appearance: textfield;
}
</style>
