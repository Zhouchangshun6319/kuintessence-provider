<template>
	<keep-alive>
		<div class="q-px-md">
			<!-- 顶栏 -->
			<q-card square flat>
				<q-card-section class="q-py-sm">
					<div class="row" style="height: 40px; line-height: 40px">
						<q-input rounded outlined dense debounce="300" v-model="filter" placeholder="搜索软件名称" style="width: 200px">
							<template v-slot:append>
								<q-icon name="search" />
							</template>
						</q-input>
						<q-space />
						<!-- <q-btn color="primary" label="批量编辑" :disable="selected.length === 0" /> -->
						<q-btn color="primary" label="批量卸载" class="q-ml-md" :disable="selected.length === 0 || loadingBatch" :loading="loadingBatch">
							<confirm-popup icon="error" label="确定卸载选中的软件吗？" @onOk="deleteBatch" />
						</q-btn>
						<!-- <q-btn
							color="primary"
							label="批量禁用"
							class="q-ml-md"
							:disable="selected.length === 0"
						>
              <confirm-popup icon="error" label="确定禁用选中的记录吗？" />
						</q-btn> -->
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
						<q-td key="software_name" :props="props">{{ props.row.software_name }}</q-td>
						<q-td key="installed_time" :props="props">
							{{ date.formatDate(props.row.installed_time, 'YYYY/MM/DD HH:mm:ss') }}
						</q-td>
						<q-td key="source_name" :props="props">
							{{ props.row.software_source.name }}
						</q-td>
						<q-td key="install_argument" :props="props">{{ props.row.install_argument }}</q-td>
						<q-td key="function" :props="props" auto-width class="text-grey">
							<!-- <q-btn dense flat color="primary" label="编辑" /> -->
							<!-- | -->
							<q-btn dense flat color="primary" label="卸载">
								<confirm-popup icon="error" label="确定卸载这个软件吗？" @onOk="deleteById(props.row.id)" />
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
		</div>
	</keep-alive>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useQuasar, date } from 'quasar';
import { InstalledSoftware, InstalledSoftwareService } from 'src/service/installed-software';
import ConfirmPopup from 'src/components/common/ConfirmPopup.vue';

const $q = useQuasar();
const loading = ref(false);
const loadingBatch = ref(false);
/**
 * 搜索软件名称
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
		name: 'software_name',
		label: '名称',
		field: 'software_name',
		align: 'left',
	},
	{
		name: 'installed_time',
		label: '安装时间',
		field: 'installed_time',
		align: 'left',
		sortable: true,
	},
	{
		name: 'source_name',
		label: '软件源',
		field: 'source_name',
		align: 'left',
	},
	{
		name: 'install_argument',
		label: '安装参数',
		field: 'install_argument',
		align: 'left',
	},
	{ name: 'function', label: '操作', field: 'function', align: 'right' },
];
/**
 * 分页配置
 */
const pagination = ref({
	sortBy: 'installed_time',
	descending: true,
	page: 1,
	rowsPerPage: 10,
	rowsNumber: 0,
});
/**
 * 安装软件列表
 */
const rows = ref<InstalledSoftware[]>([]);
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
			(selected.value as string[]).push(rows.value[i].id);
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
	const result = await InstalledSoftwareService.deleteById(id);
	if (result) {
		$q.notify({
			type: 'positive',
			message: '卸载成功',
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
			message: '卸载失败',
		});
	}
};
/**
 * 批量卸载
 */
const deleteBatch = async () => {
	loadingBatch.value = true;
	// 执行批量操作
	for (let i = 0; i < selected.value.length; i++) {
		const result = await InstalledSoftwareService.deleteById(selected.value[i]);
		if (!result) {
			// 执行过程中出错
			$q.notify({
				type: 'negative',
				message: '批量卸载失败',
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
		message: '批量卸载成功',
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
		pagination.value.rowsNumber = await InstalledSoftwareService.getListNumber(filter);
		// 获取列表并更新rows
		rows.value = await InstalledSoftwareService.getList(page, rowsPerPage !== 0 ? rowsPerPage : pagination.value.rowsNumber, filter, sortBy, descending);
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
.q-card {
	background: transparent;
}
</style>
