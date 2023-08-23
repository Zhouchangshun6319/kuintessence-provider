<template>
	<keep-alive>
		<div class="q-px-md">
			<!-- 顶栏 -->
			<q-card square flat class="card">
				<q-card-section class="q-py-sm">
					<div class="row" style="height: 40px; line-height: 40px">
						<q-input rounded outlined dense debounce="300" v-model="filter" placeholder="搜索软件源" style="width: 200px">
							<template v-slot:append>
								<q-icon name="search" />
							</template>
						</q-input>
						<q-space />
						<q-btn color="primary" label="添加" @click="editDialog = !editDialog" />
						<q-btn color="primary" label="批量删除" class="q-ml-md" :disable="selected.length === 0 || loadingBatch" :loading="loadingBatch">
							<confirm-popup icon="error" label="确定删除选中的软件源吗？" />
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
						<q-td key="url" :props="props">
							{{ props.row.url }}
						</q-td>
						<q-td key="function" :props="props" auto-width class="text-grey">
							<q-btn dense flat color="primary" label="编辑" @click="editDialog = !editDialog" />
							|
							<q-btn dense flat color="primary" label="删除">
								<confirm-popup icon="error" label="确定删除这个软件源吗？" />
							</q-btn>
							<!-- <q-btn dense flat color="primary" label="禁用">
                <confirm-popup icon="error" label="确定禁用这个软件源吗？" />
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

			<q-dialog v-model="editDialog" persistent>
				<q-card style="min-width: 450px">
					<q-card-section>
						<div class="text-h6">项目名称</div>
					</q-card-section>
					<q-separator />
					<q-card-section>
						<q-form greedy @submit="edit">
							<div class="row input-row">
								<div class="col-3 text-center">网址</div>
								<div class="col-9">
									<q-input
										dense
										color="grey"
										bg-color="white"
										outlined
										v-model="formData.url"
										class="q-pl-md"
										lazy-rules
										:rules="[(val) => !!val || '请输入网址']"
										mask="'alias':'url'"
									/>
								</div>
							</div>
							<div class="row input-row q-pt-xs">
								<div class="col-3 text-center">用户名</div>
								<div class="col-9">
									<q-input dense color="grey" bg-color="white" outlined v-model="formData.username" class="q-pl-md" lazy-rules :rules="[(val) => !!val || '请输入用户名']" />
								</div>
							</div>
							<div class="row input-row q-pt-xs">
								<div class="col-3 text-center">密码</div>
								<div class="col-9">
									<q-input
										dense
										color="grey"
										bg-color="white"
										outlined
										v-model="formData.password"
										class="q-pl-md"
										lazy-rules
										:rules="[(val) => !!val || '请输入密码']"
										:type="isPwd ? 'password' : 'text'"
									>
										<template v-slot:append>
											<q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd = !isPwd" />
										</template>
									</q-input>
								</div>
							</div>
							<q-card-actions align="right" class="text-primary">
								<q-btn flat label="取消" v-close-popup />
								<q-btn flat label="确定" type="submit" />
							</q-card-actions>
						</q-form>
					</q-card-section>
				</q-card>
			</q-dialog>
		</div>
	</keep-alive>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue';
import axios from 'axios';
import { useQuasar } from 'quasar';
import ConfirmPopup from 'src/components/common/ConfirmPopup.vue';

const $q = useQuasar();
const loading = ref(false);
const loadingBatch = ref(false);
const rows = ref([
	{
		id: '1',
		name: '待接 Graphql',
		url: 'http://127.0.0.1',
		username: '张三',
		password: '123',
	},
	{
		id: '2',
		name: '待接 Graphql',
		url: 'http://127.0.0.1',
		username: '张三',
		password: '123',
	},
	{
		id: '3',
		name: '待接 Graphql',
		url: 'http://127.0.0.1',
		username: '张三',
		password: '123',
	},
]);
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
	{ name: 'url', label: '地址', field: 'url', align: 'left' },
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
const editDialog = ref(false);
const formData = reactive({
	url: '',
	username: '',
	password: '',
});
const selected = ref([]);
const isPwd = ref(true);
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

const loadData = () => {
	axios({
		method: 'post',
		url: '',
		headers: {
			Authorization: 'Bearer sdhf743fajfdsofdsf43jfbvkjsad',
			'Content-Type': 'application/json',
		},
		data: JSON.stringify({
			query: '',
			variables: {},
		}),
	})
		.then(function (res) {
			rows.value = (Object.values(res.data)[0] as any).job;
			loading.value = false;
		})
		.catch(function (err) {
			console.log(err);
			loading.value = false;
		});
};

const edit = () => {
	if (true) {
		$q.notify({
			type: 'positive',
			message: '编辑成功',
		});
		formData.url = '';
		formData.username = '';
		formData.password = '';
		editDialog.value = false;
		loading.value = true;
		loadData();
	} else {
		$q.notify({
			type: 'negative',
			message: '编辑成功',
		});
	}
};

onMounted(() => {
	// loading.value = true;
	// loadData();
	loading.value = false;
});
</script>
<style scoped>
.card {
	background: transparent;
}
</style>
