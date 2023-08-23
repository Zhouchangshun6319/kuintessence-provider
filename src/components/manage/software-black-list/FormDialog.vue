<template>
	<q-dialog v-model="openDialog" persistent>
		<q-card class="form-card">
			<q-card-section>
				<div class="text-h6" v-if="type === 'add'">添加黑名单</div>
				<div class="text-h6" v-else>编辑“{{ titleName }}”黑名单</div>
			</q-card-section>
			<q-separator />
			<q-card-section>
				<q-form greedy @submit="onSubmit">
					<q-list dense>
						<q-item>
							<q-item-section avatar class="q-mr-sm form-title"> 名称 </q-item-section>
							<q-item-section>
								<q-input dense color="grey" bg-color="white" outlined v-model="formData.name" lazy-rules :rules="[(val) => !!val || '']" />
							</q-item-section>
						</q-item>
						<q-item>
							<q-item-section avatar class="q-mr-sm form-title"> 版本 </q-item-section>
							<q-item-section>
								<q-input dense color="grey" bg-color="white" outlined v-model="formData.version" lazy-rules :rules="[(val) => !!val || '']" prefix="v " />
							</q-item-section>
						</q-item>
					</q-list>
					<q-card-actions align="right" class="text-primary">
						<q-btn flat label="取消" v-close-popup />
						<q-btn flat label="确定" type="submit" :disable="!formData.name || !formData.version" />
					</q-card-actions>
				</q-form>
			</q-card-section>
		</q-card>
	</q-dialog>
</template>

<script lang="ts" setup>
import { useQuasar } from 'quasar';
import { SoftwareBlackListService } from 'src/service/software-black-list';
import { ref, watch, toRefs } from 'vue';

const props = defineProps({
	type: {
		type: String,
		default: 'add',
	},
	formData: {
		type: Object,
		default: () => ({}),
	},
});
const { formData } = toRefs(props);
const emit = defineEmits(['reloadData']);

const $q = useQuasar();
const openDialog = ref(false);

const titleName = ref('');

watch(openDialog, (newVal) => {
	if (newVal)
		setTimeout(() => {
			if (props.type === 'edit') titleName.value = props.formData.name;
		}, 0);
});

const onSubmit = () => {
	if (props.type === 'add') insert();
	else editById();
};

/**
 * 添加
 */
const insert = async () => {
	const { name, version } = props.formData;
	const result = await SoftwareBlackListService.insert(name, version);
	if (result) {
		$q.notify({
			type: 'positive',
			message: '添加成功',
		});
		close();
		// 刷新列表数据
		emit('reloadData');
	} else {
		$q.notify({
			type: 'negative',
			message: '添加失败',
		});
	}
};
/**
 * 编辑
 */
const editById = async () => {
	const { id, name, version } = props.formData;
	const result = await SoftwareBlackListService.editById(id, name, version);
	if (result) {
		$q.notify({
			type: 'positive',
			message: '编辑成功',
		});
		close();
		// 刷新列表数据
		emit('reloadData');
	} else {
		$q.notify({
			type: 'negative',
			message: '编辑失败',
		});
	}
};

const open = () => {
	openDialog.value = true;
};
const close = () => {
	openDialog.value = false;
};

defineExpose({
	open,
	close,
});
</script>

<style>
.form-card {
	min-width: 450px;
}
.form-title {
	width: 125px;
	align-items: flex-end;
	height: 40px;
	line-height: 40px;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
	-webkit-appearance: none !important;
}
input[type='number'] {
	-moz-appearance: textfield;
}
</style>
