<template>
	<div class="q-px-md table-content">
		<q-card square flat>
			<q-card-section class="q-py-sm">
				<div class="row" style="height: 40px; line-height: 40px">
					<q-input v-model="keywords" rounded outlined dense placeholder="搜索名称" type="search" @blur="getList" @clear="getList" style="width: 200px">
						<template v-slot:append>
							<q-icon v-if="keywords !== ''" name="close" @click="keywords = ''" class="cursor-pointer" />
							<q-icon name="search" />
						</template>
					</q-input>
					<q-space />
					<q-select class="q-mr-md" outlined dense filled v-model="regionValue" :options="reginOptions" style="width: 200px">
						<template v-slot:prepend>
							<span style="font-size: 14px">区域</span>
						</template>
					</q-select>
					<q-select outlined dense filled v-model="areaValue" :options="areaOptions" style="width: 200px">
						<template v-slot:prepend>
							<span style="font-size: 14px">可用区</span>
						</template>
					</q-select>
				</div>
			</q-card-section>
		</q-card>
		<div class="table-tabs q-py-sm">
			<q-tabs dense align="left" v-model="stateValue">
				<q-tab class="tab-item" :class="{ active: stateValue == tab.value }" :name="tab.value" :label="tab.label" v-for="(tab, index) in stateOptions" :key="index" />
			</q-tabs>
		</div>
		<div class="table">
			<q-table
				flat
				square
				virtual-scroll
				class="q-table"
				:rows="rows"
				:columns="columns as any"
				row-key="index"
				:selected-rows-label="
					() => {
						return `已选：${selected.length}条`;
					}
				"
				selection="multiple"
				v-model:selected="selected"
				rows-per-page-label="每页数量"
				:pagination-label="
					(firstRowIndex, endRowIndex, totalRowsNumber) => {
						return `共${totalRowsNumber}条数据`;
					}
				"
				style="height: calc(100vh - 174px)"
			>
				<template v-slot:body="props">
					<q-tr :props="props">
						<q-td align="center">
							<q-checkbox dense v-model="props.selected" />
						</q-td>
						<q-td key="dataName" :props="props">
							{{ props.row.dataName }}
						</q-td>
						<q-td key="fromNodeName" :props="props">
							{{ props.row.fromNodeName }}
						</q-td>
						<q-td key="toNodeName" :props="props">
							{{ props.row.toNodeName }}
						</q-td>
						<q-td key="fromServerName" :props="props">
							{{ props.row.fromServerName }}
						</q-td>
						<q-td key="createDate" :props="props">
							{{ props.row.createDate }}
						</q-td>
						<q-td key="waitTime" :props="props">
							{{ props.row.waitTime }}
						</q-td>
						<q-td key="dataSize" :props="props">
							{{ props.row.dataSize }}
						</q-td>
						<q-td key="state" :props="props">
							{{ getState(props.row.state) }}
						</q-td>
						<q-td key="oprate" :props="props">
							<q-btn class="table-btn" label="去处理" @click="toDetail(props.row)"></q-btn>
						</q-td>
					</q-tr>
				</template>
			</q-table>
		</div>
	</div>
</template>

<script lang="ts">
import { ref, reactive, defineComponent } from 'vue';
import { state, priority, DataImportService } from '../../service/data-import';
import { useRouter } from 'vue-router';

export default defineComponent({
	components: {},
	setup() {
		const router = useRouter();
		//按钮
		function toDetail(row: any) {
			router.push('/data/data-import-detail/' + row.id);
		}
		//列表数据
		const columns = [
			{
				name: 'dataName',
				required: true,
				field: 'dataName',
				label: '名称',
				sortable: true,
				align: 'left',
			},
			{
				name: 'fromNodeName',
				required: true,
				field: 'fromNodeName',
				label: '来自节点',
				sortable: true,
				align: 'left',
			},
			{
				name: 'toNodeName',
				required: true,
				field: 'toNodeName',
				label: '传输给节点',
				sortable: true,
				align: 'left',
			},
			{
				name: 'fromServerName',
				required: true,
				field: 'fromServerName',
				label: '来自提供者',
				sortable: true,
				align: 'left',
			},
			{
				name: 'createDate',
				label: '发起时间',
				field: 'createDate',
				sortable: true,
				align: 'left',
			},
			{
				name: 'waitTime',
				label: '等待时间',
				field: 'waitTime',
				sortable: true,
				align: 'left',
			},
			{
				name: 'dataSize',
				label: '数据规模',
				field: 'dataSize',
				sortable: true,
				align: 'left',
			},
			{
				name: 'state',
				label: '状态',
				field: 'state',
				sortable: true,
				align: 'left',
			},
			{
				name: 'oprate',
				label: '操作',
				field: 'oprate',
				align: 'center',
			},
		];

		//获取列表
		const rows: any = reactive([]);
		const keywords = ref('');

		async function getList() {
			let list = await DataImportService.getList();
			rows.length = 0;
			rows.push(...list);
		}
		getList();
		//搜索条件
		function getPriority(value: number) {
			let _priority = priority.find((_p: any) => _p.value == value);
			return _priority && _priority.label;
		}
		function getState(value: number) {
			let _state = stateOptions.find((_s: any) => _s.value == value);
			return _state && _state.label;
		}
		const selected = ref([]);

		const stateValue = ref(0);
		const stateOptions = state;
		const regionValue = ref('全部');
		const reginOptions = ['全部', '济南超算', '青岛超算中心'];
		const areaValue = ref('全部');
		const areaOptions = ['全部', 'A集群', 'B集群'];
		return {
			keywords,
			selected,
			columns,
			rows,
			getPriority,
			getState,
			stateValue,
			stateOptions,
			regionValue,
			reginOptions,
			areaValue,
			areaOptions,
			toDetail,
			getList,
		};
	},
});
</script>

<style lang="scss" scoped>
.table-content {
	height: 100%;
	position: relative;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	.top {
		height: 50px;
		box-shadow: 0px 15px 15px -15px $border-dark-color;
	}
	.table {
		flex: 1;
		overflow: hidden;
	}
}
.table-btns {
	display: flex;
	height: 100%;
	padding: 5px 10px;
}
.table-tabs {
	.tab-item {
		&.active {
			color: $primary-color;
		}
	}
}
.table {
	.q-table {
		width: 100%;
		max-height: 100%;
		color: $font-color;
	}
	.table-btn {
		background: #0052d9;
		color: #fff;
	}
	.priority-label {
		&.color-0 {
			color: green;
		}
		&.color-1 {
			color: blue;
		}
		&.color-2 {
			color: orange;
		}
		&.color-3,
		&.color-4 {
			color: red;
		}
	}
}
.q-card {
	background: transparent;
}
</style>
