<template>
	<keep-alive>
		<div class="q-px-md">
			<!-- 顶栏 -->
			<q-card square flat>
				<q-card-section class="q-py-sm">
					<div class="row" style="height: 40px; line-height: 40px">
						<q-input rounded outlined dense debounce="300" v-model="filter" placeholder="搜索内容实体名称" style="width: 200px">
							<template v-slot:append>
								<q-icon name="search" />
							</template>
						</q-input>
						<q-space />
						<q-btn color="primary" label="一键安装" :disable="selected.length === 0 || loadingBatch" :loading="loadingBatch">
							<confirm-popup icon="error" label="确定安装选中的软件吗？" @onOk="installBatch" />
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
				row-key="uuid"
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
							<q-checkbox v-model="selected" :val="props.row.uuid" @click="clickSelected" />
						</q-td>
						<q-td key="name" :props="props">{{ props.row.display_name }}</q-td>
						<q-td key="version" :props="props">
							<q-chip dense class="glossy bg-grey-7 text-white" :label="'v' + version.tag" v-for="(version, index) in props.row.content_entity_versions" :key="index" />
						</q-td>
						<q-td key="date_created" :props="props">
							{{ date.formatDate(props.row.date_created, 'YYYY/MM/DD HH:mm:ss') }}
						</q-td>
						<q-td key="status" :props="props">
							<span v-if="props.row.status === 'draft'">
								<q-chip dense color="orange" text-color="white" label="草稿" />
							</span>
							<span v-else-if="props.row.status === 'published'">
								<q-chip dense color="positive" text-color="white" label="已发布" />
							</span>
						</q-td>
						<q-td key="content_repo" :props="props">
							{{ props.row.content_repo ? props.row.content_repo.display_name : '无' }}
						</q-td>
						<q-td key="function" :props="props" auto-width>
							<!-- <q-btn dense flat color="primary" label="编辑" /> -->
							<q-btn dense flat color="primary" label="安装">
								<confirm-popup icon="error" label="确定安装这个软件吗？" @onOk="installSoftware(props.row.uuid)" />
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
import { ContentEntity, ContentEntityService } from 'src/service/content-entity';
import ConfirmPopup from 'src/components/common/ConfirmPopup.vue';

const $q = useQuasar();
const loading = ref(false);
const loadingBatch = ref(false);
/**
 * 搜索内容实体名称
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
		// sortable: true,
	},
	{
		name: 'version',
		label: '版本',
		field: 'version',
		align: 'left',
		// sortable: true
	},
	{
		name: 'date_created',
		label: '安装时间',
		field: 'date_created',
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
	{
		name: 'content_repo',
		label: '仓库',
		field: 'content_repo',
		align: 'left',
		// sortable: true
	},
	{ name: 'function', label: '操作', field: 'function', align: 'right' },
];
/**
 * 分页配置
 */
const pagination = ref({
	sortBy: 'date_created',
	descending: true,
	page: 1,
	rowsPerPage: 10,
	rowsNumber: 0,
});
/**
 * 内容实体列表
 */
const rows = ref<ContentEntity[]>([]);
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
			(selected.value as string[]).push(rows.value[i].uuid);
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
			selectedAllResult.push(rows.value[i].uuid);
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
 * 根据id安装软件
 */
const installSoftware = async (id: string) => {
	const result = await ContentEntityService.installSoftwareById(id);
	if (result) {
		$q.notify({
			type: 'positive',
			message: '安装成功',
		});
	} else {
		$q.notify({
			type: 'negative',
			message: '安装失败',
		});
	}
};
/**
 * 一键安装
 */
const installBatch = async () => {
	loadingBatch.value = true;
	// 执行批量操作
	for (let i = 0; i < selected.value.length; i++) {
		const result = await ContentEntityService.installSoftwareById(selected.value[i]);
		if (!result) {
			// 执行过程中出错
			$q.notify({
				type: 'negative',
				message: '一键安装失败',
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
		message: '一键安装成功',
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
		pagination.value.rowsNumber = await ContentEntityService.getListNumber(filter);
		// 获取列表并更新rows
		rows.value = await ContentEntityService.getList(page, rowsPerPage !== 0 ? rowsPerPage : pagination.value.rowsNumber, filter, sortBy, descending);
		console.log('🚀 ~ file: ContentEntity.vue ~ line 310 ~ onRequest ~ rows.value', rows.value);
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
