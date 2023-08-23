<template>
	<div style="height: 100%; padding: 20px; display: flex; flex-direction: column">
		<!-- 顶栏 -->
		<q-card square flat>
			<q-card-section class="q-py-sm">
				<div class="row" style="height: 40px; line-height: 40px">
					<q-input rounded outlined dense debounce="300" v-model="filter.q" placeholder="搜索队列名称" style="width: 200px">
						<template v-slot:append>
							<q-icon name="search" />
						</template>
					</q-input>
					<q-space />

					<q-btn label="绑定队列" color="primary" @click="bindQueue.open()" v-if="authStore.providerId"></q-btn>
				</div>
			</q-card-section>
		</q-card>
		<!-- 内容 -->
		<q-table
			style="flex: 1; overflow: auto"
			square
			flat
			:rows="rows"
			:columns="columns"
			row-key="id"
			:loading="loading"
			no-data-label="没有可用数据！"
			no-results-label="找不到匹配结果！"
			loading-label="正在加载..."
			rows-per-page-label="每页行数"
			:filter="filter"
			v-model:pagination="pagination"
			@request="onRequest"
		>
			<template v-slot:body="props">
				<q-tr :props="props">
					<q-td key="name" :props="props">{{ props.row.name || '-' }}</q-td>
					<q-td key="memory" :props="props">{{ props.row.memory ? formatSize(props.row.memory) : '-' }}</q-td>
					<q-td key="memory_alert" :props="props">
						<q-linear-progress stripe rounded size="18px" :value="props.row.memory_alert / 100" color="primary" style="width: 120px" v-if="props.row.memory_alert">
							<div class="absolute-full flex flex-center">
								<q-badge color="white" text-color="primary" :label="props.row.memory_alert + '%'" />
							</div>
						</q-linear-progress>
						<span v-else>-</span>
					</q-td>
					<q-td key="core_number" :props="props">
						{{ props.row.core_number || '-' }}
					</q-td>
					<q-td key="core_number_alert" :props="props">
						<q-linear-progress stripe rounded size="18px" :value="props.row.core_number_alert / 100" color="primary" style="width: 120px" v-if="props.row.core_number_alert">
							<div class="absolute-full flex flex-center">
								<q-badge color="white" text-color="primary" :label="props.row.core_number_alert + '%'" />
							</div>
						</q-linear-progress>
						<span v-else>-</span>
					</q-td>
					<q-td key="storage_capacity" :props="props">
						{{ props.row.storage_capacity ? formatSize(props.row.storage_capacity) : '-' }}
					</q-td>
					<q-td key="storage_capacity_alert" :props="props">
						<q-linear-progress stripe rounded size="18px" :value="props.row.storage_capacity_alert / 100" color="primary" style="width: 120px" v-if="props.row.storage_capacity_alert">
							<div class="absolute-full flex flex-center">
								<q-badge color="white" text-color="primary" :label="props.row.storage_capacity_alert + '%'" />
							</div>
						</q-linear-progress>
						<span v-else>-</span>
					</q-td>
					<q-td key="max_queuing_task_count" :props="props">
						{{ props.row.max_queuing_task_count || '-' }}
					</q-td>
					<q-td key="max_running_task_count" :props="props">
						{{ props.row.max_running_task_count || '-' }}
					</q-td>
					<q-td key="node_count" :props="props">
						{{ props.row.node_count || '-' }}
					</q-td>
					<q-td key="max_node_count" :props="props">
						<q-linear-progress stripe rounded size="18px" :value="props.row.max_node_count / 100" color="primary" style="width: 120px" v-if="props.row.max_node_count">
							<div class="absolute-full flex flex-center">
								<q-badge color="white" text-color="primary" :label="props.row.node_count + '%'" />
							</div>
						</q-linear-progress>
						<span v-else>-</span>
					</q-td>

					<q-td key="enabled" :props="props">
						<span class="text-green" v-if="props.row.enabled">已启用</span>
						<span class="text-red" v-else>已禁用</span>
					</q-td>
					<q-td key="function" :props="props" auto-width class="text-grey">
						<q-btn dense flat color="red" label="禁用" @click="changeQueueState(props.row, false)" v-if="props.row.enabled" />
						<q-btn dense flat color="primary" label="启用" @click="changeQueueState(props.row, true)" v-else />
						|
						<q-btn dense flat color="primary" label="配置" @click="modifyQueue.open(props.row)" />
						|
						<q-btn dense flat color="primary" label="删除">
							<confirm-popup icon="error" label="确定删除这个队列吗？" @onOk="deleteById(props.row.id)" />
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
		<BindQueue ref="bindQueue" @success="onRequest({ pagination, filter })" />
		<ModifyQueue ref="modifyQueue" @success="onRequest({ pagination, filter })" />
	</div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { ClusterService } from 'src/service/cluster';
import { formatSize } from 'src/util/file';
import { useAuthStore } from 'src/stores/auth';
import ConfirmPopup from 'src/components/common/ConfirmPopup.vue';
import BindQueue from 'src/components/cluster/BindQueue.vue';
import ModifyQueue from 'src/components/cluster/ModifyQueue.vue';
const authStore = useAuthStore();
const $q = useQuasar();
const loading = ref(false);
/**
 * 搜索集群名称
 */
const filter = ref({
	region_id: '',
	region_name: '',
	available_zone_id: '',
	available_zone_name: '',
	cluster_id: '',
	cluster_name: '',
	q: '',
});
const columns = [
	{
		name: 'name',
		label: '队列名称',
		field: 'name',
		align: 'left',
	},

	{
		name: 'memory',
		label: '内存',
		field: 'memory',
		align: 'left',
	},
	{
		name: 'memory_alert',
		label: '内存最大可用',
		field: 'memory_alert',
		align: 'left',
	},
	{
		name: 'core_number',
		label: '核心数',
		field: 'core_number',
		align: 'left',
		sortable: true,
	},
	{
		name: 'core_number_alert',
		label: '核心最大可用',
		field: 'core_number_alert',
		align: 'left',
	},
	{
		name: 'storage_capacity',
		label: '存储',
		field: 'storage_capacity',
		align: 'left',
	},
	{
		name: 'storage_capacity_alert',
		label: '存储最大可用',
		field: 'storage_capacity_alert',
		align: 'left',
	},
	{
		name: 'max_queuing_task_count',
		label: '最大挂起作业数',
		field: 'max_queuing_task_count',
		align: 'left',
	},
	{
		name: 'max_running_task_count',
		label: '最大运行作业数',
		field: 'max_running_task_count',
		align: 'left',
	},
	{
		name: 'node_count',
		label: '节点数',
		field: 'node_count',
		align: 'left',
	},
	{
		name: 'max_node_count',
		label: '最大可用节点数',
		field: 'max_node_count',
		align: 'left',
	},
	{
		name: 'enabled',
		label: '状态',
		field: 'enabled',
		align: 'left',
	},
	{ name: 'function', label: '操作', field: 'function', align: 'center' },
];
/**
 * 分页配置
 */
const pagination = ref({
	page: 1,
	rowsPerPage: 10,
	rowsNumber: 0,
});
/**
 * 集群资源列表
 */
const rows = ref([]);
/**
 * 根据id删除数据
 */
const deleteById = async (id) => {
	const result = await ClusterService.delQueue(id);
	if (result) {
		$q.notify({
			type: 'positive',
			message: '删除成功',
		});
		// 如果是当前页最后一条数据，页数-1
		const resultRowsNumber = pagination.value.rowsNumber - 1;
		if (resultRowsNumber > 0 && resultRowsNumber === pagination.value.page * pagination.value.rowsPerPage) {
			pagination.value.page -= 1;
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
async function changeQueueState(row, enabled) {
	const result = await ClusterService.changeQueueState(row.id, enabled);
	if (result) {
		$q.notify({
			type: 'positive',
			message: '修改成功',
		});
		row.enabled = enabled;
	} else {
		$q.notify({
			type: 'negative',
			message: '删除失败',
		});
	}
}

/**
 * 获取列表数据
 */
const onRequest = async (props) => {
	const { page, rowsPerPage } = props.pagination;
	loading.value = true;
	try {
		// 获取列表并更新rows
		const data = await ClusterService.getQueueList(page, rowsPerPage !== 0 ? rowsPerPage : pagination.value.rowsNumber, filter.value);
		rows.value = data.list;
		pagination.value.page = page;
		pagination.value.rowsNumber = data.count;
	} catch (e) {
		$q.notify({
			type: 'negative',
			message: String(e),
		});
	}
	// 切换页码,则重置选择
	if (pagination.value.page !== page) resetSelect();

	// 结束加载
	loading.value = false;
};
const bindQueue = ref();
const modifyQueue = ref();

onMounted(() => {
	onRequest({
		pagination: pagination.value,
	});
});
</script>

<style scoped>
.input-row {
	line-height: 40px;
}
.q-card,
.q-inner-loading {
	background: transparent;
}
</style>
