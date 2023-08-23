<template>
	<q-dialog v-model="openDialog">
		<q-card class="config-card">
			<q-card-section>
				<div class="text-h6">绑定队列</div>
			</q-card-section>
			<q-separator />
			<q-card-section>
				<q-form greedy @submit="onSubmit">
					<q-input filled clearable v-model="formData.id" label="队列ID *" lazy-rules :rules="[(val) => (val && val.length > 0) || '请填写队列ID']" />
					<q-input filled clearable v-model="formData.name" label="队列名称 *" lazy-rules :rules="[(val) => (val && val.length > 0) || '请填写队列名称']" />
					<q-card-actions align="right" class="text-primary q-pt-lg">
						<q-btn flat label="取消" v-close-popup />
						<q-btn flat label="确定" type="submit" :disable="!formData.id || !formData.name" />
					</q-card-actions>
				</q-form>
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
	await ClusterService.bindQueue(formData.value);
	$q.notify({
		type: 'positive',
		message: '绑定成功',
	});
	close();
	emit('success');
}

function open() {
	formData.value = {
		id: '',
		name: '',
	};
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
