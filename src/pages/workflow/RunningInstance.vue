<template>
	<div class="q-px-md q-py-sm">
		<!-- 顶栏 -->
		<q-card square flat style="background: transparent">
			<q-card-section class="q-px-none q-py-sm">
				<div class="row" style="height: 40px; line-height: 40px">
					<q-select rounded outlined dense debounce="300" emit-value map-options v-model="filter.status" :options="statusOptions" style="width: 200px" class="q-mr-md">
						<template v-slot:append>
							<q-icon name="cancel" v-if="filter.status !== ''" class="cursor-pointer" @click.stop.prevent="filter.status = ''" style="opacity: 0.6"></q-icon>
						</template>
					</q-select>
					<q-input rounded outlined dense clearable debounce="300" v-model="filter.q" placeholder="搜索作业名称" style="width: 200px">
						<template v-slot:append>
							<q-icon name="search" />
						</template>
					</q-input>
					<q-space />

					<q-btn unelevated color="primary" label="刷新列表" class="q-ml-sm" @click="loadData" />
				</div>
			</q-card-section>
		</q-card>

		<!-- 内容 -->
		<q-table
			square
			flat
			:rows="rows"
			:columns="columns"
			row-key="id"
			no-data-label="没有可用数据！"
			no-results-label="找不到匹配结果！"
			rows-per-page-label="每页大小"
			:filter="filter"
			v-model:pagination="pagination"
			@request="onRequest"
			class="my-table"
		>
			<template v-slot:body="props">
				<q-tr :props="props">
					<q-td key="name" :props="props">{{ props.row.name ? props.row.name : '-' }}</q-td>
					<q-td key="created_time" :props="props">
						{{ props.row.created_time }}
					</q-td>
					<q-td key="status" :props="props">
						<state class="state" :state="props.row.status" />
					</q-td>
					<q-td key="function" :props="props" auto-width class="text-grey">
						<q-btn flat color="primary" label="查看" class="q-px-sm" @click="toDetail(props.row.id)" />
					</q-td>
				</q-tr>
			</template>
		</q-table>

		<!-- 加载动画 -->
		<q-inner-loading :showing="loading">
			<q-spinner-ios size="50px" color="primary" />
		</q-inner-loading>
	</div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { InstanceService, InstanceState } from 'src/service/instance';
import State from 'components/workflow/InstanceState.vue';
import { useRouter } from 'vue-router';

const $q = useQuasar();
const router = useRouter();
function toDetail(id) {
	router.push('/instance-detail?id=' + id);
}
const loading = ref(false);
/**
 * 搜索任务名称
 */
const statusOptions = [
	{
		value: '',
		label: '全部实时作业',
	},
	{
		value: InstanceState.created.value,
		label: InstanceState.created.label,
	},
	{
		value: InstanceState.pending.value,
		label: InstanceState.pending.label,
	},
	{
		value: InstanceState.running.value,
		label: InstanceState.running.label,
	},
	{
		value: InstanceState.stopping.value,
		label: InstanceState.stopping.label,
	},
	{
		value: InstanceState.pausing.value,
		label: InstanceState.pausing.label,
	},
	{
		value: InstanceState.recovering.value,
		label: InstanceState.recovering.label,
	},
];
const filter = ref({
	statusArr: [InstanceState.created.value, InstanceState.pending.value, InstanceState.running.value, InstanceState.stopping.value, InstanceState.pausing.value, InstanceState.recovering.value],
	status: '',
	q: '',
});
const columns = [
	{
		name: 'name',
		label: '任务名称',
		field: 'name',
		align: 'left',
		sortable: true,
	},
	{
		name: 'created_time',
		label: '创建时间',
		field: 'created_time',
		align: 'left',
		sortable: true,
	},
	{
		name: 'status',
		label: '状态',
		field: 'status',
		align: 'left',
		sortable: true,
	},
	{ name: 'function', label: '操作', field: 'function', align: 'center' },
];
/**
 * 分页配置
 */
const pagination = ref({
	sortBy: 'created_time',
	descending: true,
	page: 1,
	rowsPerPage: 10,
	rowsNumber: 0,
});
/**
 * 工作流任务列表
 */
const rows = ref([]);

/**
 * 刷新列表数据
 */
const loadData = () => {
	onRequest({
		pagination: pagination.value,
		filter: filter.value,
	});
};
/**
 * 获取列表数据
 */
const onRequest = async (props) => {
	const { page, rowsPerPage, sortBy, descending } = props.pagination;
	loading.value = true;
	try {
		// 获取列表并更新rows
		const data = await InstanceService.getInstanceList(page, rowsPerPage !== 0 ? rowsPerPage : pagination.value.rowsNumber, filter.value, sortBy, descending);
		rows.value = data.list;
		pagination.value.rowsNumber = data.count;
		loading.value = false;
	} catch (e) {
		$q.notify({
			type: 'negative',
			message: String(e),
		});
		loading.value = false;
	}
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

<style lang="scss" scoped>
.q-inner-loading {
	background: transparent;
}
.my-table {
	height: calc(100vh - 160px);
	background: transparent;
}
</style>
