<template>
	<keep-alive>
		<div class="q-px-md">
			<!-- 顶栏 -->
			<q-card square flat>
				<q-card-section class="q-py-sm">
					<div class="row" style="height: 40px; line-height: 40px">
						<q-space />
						<!-- <q-btn color="primary" label="批量取消" :disable="selected.length === 0">
              <confirm-popup icon="error" label="确定取消选中的安装队列吗？" />
            </q-btn> -->
						<q-btn color="primary" label="批量删除" :disable="selected.length === 0 || loadingBatch" :loading="loadingBatch">
							<confirm-popup icon="error" label="确定删除选中的安装队列吗？" @onOk="deleteBatch" />
						</q-btn>
						<!-- <q-btn-dropdown
              label="并行安装"
              color="primary"
              class="q-ml-md q-pr-xs"
              :disable="selected.length === 0"
            >
              <q-list>
                <q-item clickable v-close-popup>
                  <q-item-section>
                    <q-item-label>1</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown> -->
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
						<q-td key="status" :props="props">
							<span v-if="props.row.status === 0">
								<q-chip dense color="orange" text-color="white" label="排队中" />
							</span>
							<span v-else-if="props.row.status === 1">
								<q-chip dense color="primary" text-color="white" label="进行中" />
							</span>
							<span v-else-if="props.row.status === 2">
								<q-chip dense color="positive" text-color="white" label="已完成" />
							</span>
							<span v-else-if="props.row.status === 3">
								<q-chip dense color="grey" text-color="white" label="已取消" />
							</span>
							<span v-else-if="props.row.status === 4">
								<q-chip dense color="negative" text-color="white" label="错误" />
							</span>
						</q-td>
						<q-td key="start_time" :props="props">
							{{ date.formatDate(props.row.start_time, 'YYYY/MM/DD HH:mm:ss') }}
						</q-td>
						<q-td key="end_time" :props="props">
							<div v-if="props.row.status !== 0 && props.row.status !== 1">
								{{ date.formatDate(props.row.end_time, 'YYYY/MM/DD HH:mm:ss') }}
							</div>
							<div v-else class="text-grey-7">未结束</div>
						</q-td>
						<q-td key="function" :props="props" auto-width class="text-grey">
							<!-- <q-btn dense flat color="primary" label="编辑" /> -->
							<q-btn dense flat color="primary" label="显示日志" @click="showLog(props.row.name, props.row.log)" />
							|
							<q-btn dense flat color="primary" label="取消" :disable="props.row.status !== 0 && props.row.status !== 1">
								<confirm-popup icon="error" label="确定取消这个安装队列吗？" @onOk="cancelById(props.row.id)" />
							</q-btn>
							|
							<q-btn dense flat color="primary" label="删除">
								<confirm-popup
									icon="error"
									:label="props.row.status !== 0 && props.row.status !== 1 ? '确定删除这个安装队列吗？' : '确定取消并删除这个安装队列吗？'"
									@onOk="deleteById(props.row.id)"
								/>
							</q-btn>
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
import { SoftwareInstallHistory, SoftwareInstallHistoryService } from 'src/service/software-install-history';
import ConfirmPopup from 'src/components/common/ConfirmPopup.vue';

const $q = useQuasar();
const loading = ref(false);
const loadingBatch = ref(false);
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
	{ name: 'status', label: '状态', field: 'status', align: 'left', sortable: true },
	{ name: 'start_time', label: '开始时间', field: 'start_time', align: 'left', sortable: true },
	{ name: 'end_time', label: '结束时间', field: 'end_time', align: 'left', sortable: true },
	{ name: 'function', label: '操作', field: 'function', align: 'right' },
];
/**
 * 分页配置
 */
const pagination = ref({
	sortBy: 'start_time',
	descending: true,
	page: 1,
	rowsPerPage: 10,
	rowsNumber: 0,
});
/**
 * 软件安装历史列表
 */
const rows = ref<SoftwareInstallHistory[]>([]);
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
 * 根据id取消安装队列
 */
const cancelById = async (id: string) => {
	const result = await SoftwareInstallHistoryService.cancelById(id);
	if (result) {
		$q.notify({
			type: 'positive',
			message: '取消成功',
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
		});
	} else {
		$q.notify({
			type: 'negative',
			message: '取消失败',
		});
	}
};
/**
 * 根据id删除安装队列
 */
const deleteById = async (id: string) => {
	const result = await SoftwareInstallHistoryService.deleteById(id);
	if (result) {
		$q.notify({
			type: 'positive',
			message: '删除成功',
		});
		// 如果是当前页最后一条数据，页数-1
		const resultRowsNumber = pagination.value.rowsNumber - 1;
		if (resultRowsNumber > 0 && resultRowsNumber === pagination.value.page * pagination.value.rowsPerPage) pagination.value.page -= 1;
		// 刷新列表数据
		onRequest({
			pagination: pagination.value,
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
		const result = await SoftwareInstallHistoryService.deleteById(selected.value[i]);
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
 * 查看日志
 * @param name 安装队列名称
 * @param log 日志内容
 */
const showLog = (name: string, log: string) => {
	$q.dialog({
		title: '“' + name + '”日志',
		message: '<pre style="margin: 0">' + log + '</pre>',
		html: true,
	});
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
	});
};
/**
 * 获取列表数据
 */
const onRequest = async (props: any) => {
	const { page, rowsPerPage, sortBy, descending } = props.pagination;
	loading.value = true;
	try {
		// 获取列表大小并更新rowsNumber
		pagination.value.rowsNumber = await SoftwareInstallHistoryService.getListNumber();
		// 获取列表并更新rows
		rows.value = await SoftwareInstallHistoryService.getList(page, rowsPerPage !== 0 ? rowsPerPage : pagination.value.rowsNumber, sortBy, descending);
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
	});
});
</script>
<style scoped>
.q-card {
	background: transparent;
}
</style>
