<template>
	<keep-alive>
		<div class="q-px-md">
			<!-- 顶栏 -->
			<q-card square flat>
				<q-card-section class="q-py-sm">
					<div class="row" style="height: 40px; line-height: 40px">
						<q-input rounded outlined dense debounce="300" v-model="filter" placeholder="搜索本地软件源名称" style="width: 200px">
							<template v-slot:append>
								<q-icon name="search" />
							</template>
						</q-input>
						<q-space />
						<q-btn
							color="primary"
							label="添加"
							@click="
								type = 'add';
								formData = {
									name: '',
									version: '',
									software_install_argument: { path: '' },
									exe_path: '',
								};
								formDialog.open();
							"
						/>
						<q-btn color="primary" label="批量删除" class="q-ml-md" :disable="selected.length === 0 || loadingBatch" :loading="loadingBatch">
							<confirm-popup icon="error" label="确定删除选中的软件源吗？" @onOk="deleteBatch" />
						</q-btn>
					</div>
				</q-card-section>
			</q-card>
			<!-- 内容 -->
			<q-table
				square
				flat
				:rows="rows"
				:columns="columns as any"
				row-key="id"
				:loading="loading"
				no-data-label="没有可用数据！"
				no-results-label="找不到匹配结果！"
				loading-label="正在加载..."
				rows-per-page-label="每页行数"
				:filter="filter"
				v-model:pagination="pagination"
				@request="onRequest"
				style="height: calc(100vh - 122px)"
			>
				<template v-slot:header="props">
					<q-tr :props="props">
						<q-th v-for="col in props.cols" :key="col.name" :props="props">
							{{ col.label }}
							<span v-if="col.name === 'radio'">
								<q-checkbox v-model="isSelectedAll" @click="clickSelectedAll" />
							</span>
						</q-th>
					</q-tr>
				</template>
				<template v-slot:body="props">
					<q-tr :props="props">
						<q-td key="radio" :props="props" auto-width>
							<q-checkbox v-model="selected" :val="props.row.id" @click="clickSelected" />
						</q-td>
						<q-td key="name" :props="props">{{ props.row.name }}</q-td>
						<q-td key="version" :props="props"> v {{ props.row.version }} </q-td>
						<q-td key="software_install_argument" :props="props">{{ props.row.software_install_argument }}</q-td>
						<q-td key="exe_path" :props="props">{{ props.row.exe_path }}</q-td>
						<q-td key="function" :props="props" auto-width class="text-grey">
							<q-btn
								dense
								flat
								color="primary"
								label="编辑"
								@click="
									type = 'edit';
									formData = {
										id: props.row.id,
										name: props.row.name,
										version: props.row.version,
										software_install_argument: props.row.software_install_argument,
										exe_path: props.row.exe_path,
									};
									formDialog.open();
								"
							/>
							|
							<q-btn dense flat color="primary" label="删除">
								<confirm-popup icon="error" label="确定删除这个软件源吗？" @onOk="deleteById(props.row.id)" />
							</q-btn>
							<!-- <q-btn dense flat color="primary" label="禁用">
							  <confirm-popup icon="error" label="确定禁用这条记录吗？" />
							</q-btn> -->
						</q-td>
					</q-tr>
				</template>
				<template v-slot:loading>
					<q-inner-loading showing>
						<q-spinner-gears size="50px" color="primary" />
					</q-inner-loading>
				</template>
			</q-table>

			<FormDialog ref="formDialog" :type="type" :formData="formData" @reloadData="reloadData" />
		</div>
	</keep-alive>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { LocalStorageSource, LocalStorageSourceService } from 'src/service/local-storage-source';
import ConfirmPopup from '../../components/common/ConfirmPopup.vue';
import FormDialog from '../../components/manage/local-software-source/FormDialog.vue';

const $q = useQuasar();
const loading = ref(false);
const loadingBatch = ref(false);
/**
 * 搜索本地软件源名称
 */
const filter = ref('');
const columns = [
	{
		name: 'radio',
		field: 'radio',
		label: '',
		align: 'left',
	},
	{
		name: 'name',
		label: '名称',
		field: 'name',
		align: 'left',
		sortable: true,
	},
	{ name: 'version', label: '版本', field: 'version', align: 'left', sortable: true },
	{
		name: 'software_install_argument',
		label: '安装参数',
		field: 'software_install_argument',
		align: 'left',
	},
	{ name: 'exe_path', label: '可执行文件', field: 'exe_path', align: 'left' },
	{ name: 'function', label: '操作', field: 'function', align: 'right' },
];
/**
 * 分页配置
 */
const pagination = ref({
	sortBy: 'name',
	descending: true,
	page: 1,
	rowsPerPage: 10,
	rowsNumber: 0,
});
/**
 * 安装软件列表
 */
const rows = ref<LocalStorageSource[]>([]);
/**
 * 添加&编辑面板
 */
const formDialog = ref();
const type = ref('add');
const formData = ref();
/**
 * 选择框
 */
const selected = ref([]);
const isSelectedAll = ref(false);
let selectedAllResult: string[] = [];

/**
 * 点击选择全部
 */
const clickSelectedAll = () => {
	if (isSelectedAll.value) {
		selected.value = [];
		for (let i = 0; i < rows.value.length; i++) {
			(selected.value as any).push(rows.value[i].id);
		}
	} else {
		selected.value = [];
	}
};
/**
 * 点击选择
 */
const clickSelected = () => {
	if (selectedAllResult.length === 0) {
		for (let i = 0; i < rows.value.length; i++) {
			selectedAllResult.push(rows.value[i].id);
		}
	}
	for (let i = 0; i < selectedAllResult.length; i++) {
		if (!(selected.value as string[]).includes(selectedAllResult[i])) {
			isSelectedAll.value = false;
			return;
		}
	}
	isSelectedAll.value = true;
};
/**
 * 根据id删除数据
 */
const deleteById = async (id: string) => {
	const result = await LocalStorageSourceService.deleteById(id);
	if (result) {
		$q.notify({
			type: 'positive',
			message: '删除成功',
		});
		// 如果是当前页最后一条数据，页数-1
		const resultRowsNumber = pagination.value.rowsNumber - 1;
		if (resultRowsNumber > 0 && resultRowsNumber === pagination.value.page * pagination.value.rowsPerPage) {
			resetSelect(); // 重置选择
			pagination.value.page -= 1;
		} else {
			// 若选择了删除项,则从已选择id中筛选掉其id
			selected.value.filter((item) => item !== id);
		}
		// 刷新列表数据
		onRequest({
			pagination: pagination.value,
			filter: filter.value,
		});
	} else {
		$q.notify({
			type: 'negative',
			message: '删除失败',
		});
	}
};
/**
 * 批量删除
 */
const deleteBatch = async () => {
	loadingBatch.value = true;
	// 执行批量操作
	for (let i = 0; i < selected.value.length; i++) {
		const result = await LocalStorageSourceService.deleteById(selected.value[i]);
		if (!result) {
			// 执行过程中出错
			$q.notify({
				type: 'negative',
				message: '批量删除失败',
			});
			loadingBatch.value = false;
			// 重置选择
			resetSelect();
			// 重置页码并刷新列表
			pagination.value.page = 1;
			reloadData();
			// 结束批量操作
			return;
		}
	}
	// 批量操作成功
	$q.notify({
		type: 'positive',
		message: '批量删除成功',
	});
	loadingBatch.value = false;
	// 重置选择
	resetSelect();
	// 重置页码并刷新列表
	pagination.value.page = 1;
	reloadData();
};
/**
 * 重置选择
 */
const resetSelect = () => {
	selected.value = [];
	isSelectedAll.value = false;
	selectedAllResult = [];
};
/**
 * 刷新列表数据
 */
const reloadData = () => {
	onRequest({
		pagination: pagination.value,
		filter: filter.value,
	});
};
/**
 * 获取列表数据
 */
const onRequest = async (props: any) => {
	const { page, rowsPerPage, sortBy, descending } = props.pagination;
	const filter = props.filter;
	loading.value = true;
	try {
		// 获取列表大小并更新rowsNumber
		pagination.value.rowsNumber = await LocalStorageSourceService.getListNumber(filter);
		// 获取列表并更新rows
		rows.value = await LocalStorageSourceService.getList(page, rowsPerPage !== 0 ? rowsPerPage : pagination.value.rowsNumber, filter, sortBy, descending);
	} catch (e) {
		$q.notify({
			type: 'negative',
			message: String(e),
		});
	}
	// 切换页码,则重置选择
	if (pagination.value.page !== page) resetSelect();
	// 更新本地分页对象
	pagination.value.page = page;
	pagination.value.rowsPerPage = rowsPerPage;
	pagination.value.sortBy = sortBy;
	pagination.value.descending = descending;
	// 结束加载
	loading.value = false;
};

onMounted(() => {
	onRequest({
		pagination: pagination.value,
		filter: undefined,
	});
});
</script>

<style scoped>
.input-row {
	line-height: 40px;
}

.q-card {
	background: transparent;
}
</style>
