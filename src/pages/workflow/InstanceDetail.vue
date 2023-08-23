<template>
	<div class="detail-container glass-card">
		<div class="title-container full-height">
			<div class="title">
				{{ info.name }}
				<InstanceStateVue class="state" :state="info.status" />
				<q-btn flat dense color="primary" class="q-ml-sm" v-if="allInputFileList.length">
					查看全部输入文件
					<q-menu>
						<q-list bordered>
							<q-item clickable v-ripple v-for="file in allInputFileList" :key="file.id">
								<q-item-section>{{ file.name }}</q-item-section>
								<q-item-section top side>
									<div class="text-grey-8 q-gutter-xs">
										<q-btn class="gt-xs" size="12px" flat dense round icon="file_download" @click="download(file)">
											<q-tooltip>下载到本地</q-tooltip>
										</q-btn>
									</div>
								</q-item-section>
							</q-item>
						</q-list>
					</q-menu>
				</q-btn>
				<q-btn flat dense color="primary" class="q-ml-sm" v-if="allOutFileList.length">
					查看全部输出结果
					<q-menu>
						<q-list bordered>
							<q-item clickable v-ripple v-for="file in allOutFileList" :key="file.id">
								<q-item-section>{{ file.name }}</q-item-section>
								<q-item-section top side>
									<div class="text-grey-8 q-gutter-xs">
										<q-btn class="gt-xs" size="12px" flat dense round icon="file_download" @click="download(file)">
											<q-tooltip>下载到本地</q-tooltip>
										</q-btn>
									</div>
								</q-item-section>
							</q-item>
						</q-list>
					</q-menu>
				</q-btn>
			</div>
			<div class="btns">
				<q-btn
					unelevated
					color="white"
					text-color="black"
					label="刷新"
					class="q-mr-sm"
					@click="getInfo"
					:disabled="
						info.status === InstanceState.created.value ||
						info.status === InstanceState.paused.value ||
						info.status === InstanceState.finished.value ||
						info.status === InstanceState.error.value ||
						info.status === InstanceState.stopped.value
					"
				/>
			</div>
		</div>
		<q-separator class="q-my-md" />
		<div class="content-container">
			<div class="left">
				<div class="desc-container" v-if="info.description">描述：{{ info.description }}</div>

				<q-table
					flat
					square
					virtual-scroll
					class="quasar-table"
					:rows="nodeList"
					:columns="columns"
					row-key="index"
					:pagination="{ rowsPerPage: 20 }"
					rows-per-page-label="每页数量"
					:pagination-label="
						(firstRowIndex, endRowIndex, totalRowsNumber) => {
							return `共${totalRowsNumber}条数据`;
						}
					"
				>
					<template v-slot:body="props">
						<q-tr :props="props">
							<q-td key="name" :props="props">
								{{ props.row.name }}
							</q-td>
							<q-td key="status" :props="props">
								<NodeState :state="props.row.status" />
								<q-icon
									color="negative"
									name="expand_more"
									@click="!props.row.showLog ? (props.row.showLog = true) : (props.row.showLog = false)"
									size="20px"
									class="cursor-pointer"
									:class="[!props.row.showLog ? 'expand-more' : 'expand-less']"
									v-if="props.row.status === InstanceNodeState.error.value"
								>
									<q-tooltip v-model="props.row.showLog" no-parent-event max-width="500px" class="bg-red-2 text-negative" style="pointer-events: all !important">
										<div class="text-subtitle1 text-weight-medium row" style="user-select: none">
											错误日志
											<q-space />
											<q-icon color="negative" name="content_copy" size="16px" @click="copyText(props.row.log)" class="cursor-pointer q-mr-xs" style="height: 28px" />
											<q-icon color="negative" name="close" size="20px" @click="props.row.showLog = false" class="cursor-pointer" style="height: 28px" />
										</div>
										<div>{{ props.row.log }}</div>
									</q-tooltip>
								</q-icon>
							</q-td>
							<q-td key="cmd" :props="props">
								<span class="row items-center justify-center" v-if="props.row.cmd">
									<span class="text-grey ellipsis" style="display: inline-block; max-width: 74px">{{ props.row.cmd }}</span>
									<q-icon
										color="primary"
										name="expand_more"
										@click="!props.row.showCmd ? (props.row.showCmd = true) : (props.row.showCmd = false)"
										size="20px"
										class="cursor-pointer"
										:class="[!props.row.showCmd ? 'expand-more' : 'expand-less']"
									>
										<q-tooltip v-model="props.row.showCmd" no-parent-event max-width="500px" class="bg-white text-primary" style="pointer-events: all !important">
											<div class="text-subtitle1 text-weight-medium row" style="user-select: none; min-width: 200px">
												运行命令
												<q-space />
												<q-icon color="negative" name="close" size="20px" @click="props.row.showCmd = false" class="cursor-pointer" style="height: 28px" />
											</div>
											<div class="text-grey q-mt-md q-mb-sm">
												{{ props.row.cmd }}
											</div>
										</q-tooltip>
									</q-icon>
								</span>
								<div class="text-grey-7" v-else>-</div>
							</q-td>
							<q-td key="time" :props="props">
								<div class="text-grey-7" v-if="props.row.resource_meter">
									<div>开始：{{ props.row.resource_meter?.start_time ? date.formatDate(props.row.resource_meter.start_time * 1000, 'YYYY/MM/DD HH:mm:ss') : '-' }}</div>
									<div>结束：{{ props.row.resource_meter?.end_time ? date.formatDate(props.row.resource_meter.end_time * 1000, 'YYYY/MM/DD HH:mm:ss') : '-' }}</div>
								</div>
								<div class="text-grey-7" v-else>-</div>
							</q-td>
							<q-td key="expense" :props="props">
								<span class="q-mr-sm" v-if="props.row.expense">
									<span class="text-negative">{{ props.row.expense.price }}</span
									><span>元</span>
								</span>
								<q-icon
									color="primary"
									name="expand_more"
									@click="!props.row.showExpense ? (props.row.showExpense = true) : (props.row.showExpense = false)"
									size="20px"
									class="cursor-pointer"
									:class="[!props.row.showExpense ? 'expand-more' : 'expand-less']"
									v-if="props.row.expense"
								>
									<q-tooltip v-model="props.row.showExpense" no-parent-event max-width="500px" class="bg-white text-primary" style="pointer-events: all !important">
										<div class="text-subtitle1 text-weight-medium row" style="user-select: none">
											费用明细
											<q-space />
											<q-icon color="negative" name="close" size="20px" @click="props.row.showExpense = false" class="cursor-pointer" style="height: 28px" />
										</div>
										<div>
											<node-expense :node="props.row.expense" />
										</div>
									</q-tooltip>
								</q-icon>
								<div class="text-grey-7" v-else>-</div>
							</q-td>
							<q-td key="file" :props="props">
								<div v-if="props.row.inputFileList && props.row.inputFileList.length">
									<q-btn dense flat color="primary">
										查看输入文件
										<q-menu>
											<q-list bordered>
												<q-item clickable v-ripple v-for="file in props.row.inputFileList" :key="file.id">
													<q-item-section>{{ file.name }}</q-item-section>
													<q-item-section top side>
														<div class="text-grey-8 q-gutter-xs">
															<q-btn class="gt-xs" size="12px" flat dense round icon="file_download" @click="download(file)">
																<q-tooltip>下载到本地</q-tooltip>
															</q-btn>
														</div>
													</q-item-section>
												</q-item>
											</q-list>
										</q-menu>
									</q-btn>
								</div>
								<div v-if="props.row.outFileList && props.row.outFileList.length">
									<q-btn dense flat color="primary">
										查看输出结果
										<q-menu>
											<q-list bordered>
												<q-item clickable v-ripple v-for="file in props.row.outFileList" :key="file.id">
													<q-item-section>{{ file.name }}</q-item-section>
													<q-item-section top side>
														<div class="text-grey-8 q-gutter-xs">
															<q-btn class="gt-xs" size="12px" flat dense round icon="file_download" @click="download(file)">
																<q-tooltip>下载到本地</q-tooltip>
															</q-btn>
														</div>
													</q-item-section>
												</q-item>
											</q-list>
										</q-menu>
									</q-btn>
								</div>
							</q-td>
							<q-td key="preview" :props="props">
								<div v-if="props.row.outPreviewList && props.row.outPreviewList.length">
									<q-btn dense flat color="primary">
										预览输出文件
										<q-menu>
											<q-list bordered>
												<q-item clickable v-ripple v-for="file in props.row.outPreviewList" :key="file.id">
													<q-item-section>{{ file.name }}</q-item-section>
													<q-item-section top side>
														<div class="text-grey-8 q-gutter-xs">
															<q-btn class="gt-xs" size="12px" flat dense round icon="open_in_new" @click="preview(file)">
																<q-tooltip>预览文件</q-tooltip>
															</q-btn>
														</div>
													</q-item-section>
												</q-item>
											</q-list>
										</q-menu>
									</q-btn>
								</div>
								<div class="text-grey-7" v-else>-</div>
							</q-td>
						</q-tr>
					</template>
				</q-table>

				<q-card flat class="q-my-md translucent-card shadow" v-if="nodeList.length && nodeList.length > 1">
					<q-card-section class="q-pb-sm">
						<div class="text-subtitle1 text-weight-medium">可视化展示</div>
					</q-card-section>
					<q-card-section class="q-pt-none">
						<InstanceViewer :json="info" :nodeList="nodeList" />
					</q-card-section>
				</q-card>

				<q-card flat class="q-my-md translucent-card shadow" v-if="info.expense">
					<q-card-section class="q-pb-sm">
						<div class="text-subtitle1 text-weight-medium">费用情况展示</div>
					</q-card-section>
					<q-card-section>
						<div style="max-height: 400px; overflow: auto">
							<flow-expense :expense="info.expense" />
						</div>
					</q-card-section>
				</q-card>
			</div>
		</div>
		<q-inner-loading :showing="loading" style="border-radius: 16px">
			<q-spinner-ios size="50px" color="primary" />
		</q-inner-loading>
	</div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { InstanceService, InstanceState, InstanceNodeState } from 'src/service/instance';
import InstanceStateVue from 'components/workflow/InstanceState.vue';
import NodeState from 'components/workflow/InstanceNodeState.vue';
import { useQuasar } from 'quasar';
import InstanceViewer from 'src/components/workflow/instance-viewer/InstanceViewer.vue';
import FlowExpense from 'src/components/workflow/FlowExpense.vue';
import NodeExpense from 'src/components/workflow/NodeExpense.vue';
import { date } from 'quasar';
import { downLoadFile } from 'src/util/file';

const route = useRoute();
const $q = useQuasar();

const loading = ref(false);
//获取详情
let id = route.query.id;
const info = ref({});

//下载输出文件
async function download(file) {
	let url = InstanceService.getDownFileUrl(file.id);
	downLoadFile({ fileName: file.name, url });
}

const nodeList = ref([]);
//获取详情
async function getInfo() {
	if (id) {
		const res = await InstanceService.getDetail(id);
		if (!res) {
			$q.notify({
				message: '任务不存在',
				type: 'warning',
			});
		} else {
			info.value = res;
			getNodeList();
		}
	} else {
		$q.notify({
			message: '缺少参数',
			type: 'warning',
		});
	}
}

//获取任务节点
const columns = ref([
	{ name: 'name', field: 'name', label: '节点', sortable: true, align: 'left' },
	{ name: 'status', label: '状态', field: 'status', sortable: true, align: 'center' },
	{ name: 'cmd', label: '运行命令', field: 'cmd', sortable: false, align: 'center' },
	{ name: 'time', label: '时间', field: 'time', sortable: false, align: 'center' },
	{ name: 'expense', label: '计量计费', field: 'expense', sortable: false, align: 'center' },
	{ name: 'file', label: '文件', field: 'file', sortable: false, align: 'center' },
]);
watch(
	() => info.value?.status,
	(newStatus) => {
		if (!newStatus) return;
		//如果是正在运行和暂停，监听文件状态，实时预览
		if (newStatus == InstanceState.running.value || newStatus == InstanceState.paused.value) {
			let previewColumn = columns.value.find((c) => c.name == 'preview');
			if (!previewColumn) {
				columns.value.push({
					name: 'preview',
					label: '预览文件',
					field: 'preview',
					sortable: false,
					align: 'center',
				});
			}
		}
	},
);

async function getNodeList() {
	let nodes = await InstanceService.getNodesById(id);
	nodeList.value = nodes;
	for (let index = 0; index < nodeList.value.length; index++) {
		const node = nodeList.value[index];

		let inode = info.value.spec?.nodeSpecs?.find((inode) => inode.id == node.id);
		if (inode) {
			//赋值info的node状态
			inode.status = node.status;

			//获取输入文件列表
			let inputFileList = [];
			inode.inputSlots.forEach((inputSlot) => {
				inputSlot.contents.forEach((file) => {
					inputFileList.push({
						id: file.fileMetadataId,
						name: file.fileMetadataName,
					});
				});
			});
			node.inputFileList = inputFileList;

			//如果是正在运行或暂停状态，获取预览ids
			if (node.status == InstanceNodeState.running.value || node.status == InstanceNodeState.paused.value) {
				//获取预备输出文件id
				let outPreviewList = [];
				inode.outputSlots.forEach((outputSlot) => {
					outputSlot.allTasksPreparedContentIds.forEach((id) => {
						outPreviewList.push({
							id,
							name: outputSlot.description,
						});
					});
				});
				node.outPreviewList = outPreviewList;
			}
		}
		//获取已结束输出文件列表
		InstanceService.getNodeFiles(node.id).then((outFileList) => {
			node.outFileList = outFileList;
		});

		//获取node的费用列表
		InstanceService.getNodeExpense(id, node.id).then((nodeExpense) => {
			if (nodeExpense) {
				nodeExpense.name = node.name;
				node.expense = nodeExpense;
			}
		});

		//获取node的运行命令
		InstanceService.getRunCmd(node.id).then((cmd) => {
			node.cmd = cmd;
		});
	}
	//获取工作流费用
	getFlowExpense();
}
//获取工作流费用
async function getFlowExpense() {
	info.value.expense = await InstanceService.getFlowExpense(id);

	if (!info.value.expense) return;
	let nodes = [];
	for (let i = 0; i < nodeList.value.length; i++) {
		nodeList.value[i].expense && nodes.push(nodeList.value[i].expense);
	}
	info.value.expense.nodes = nodes;
}
//预览文件
function preview(file) {
	window.open(`#/file-preview?instanceId=${id}&fileId=${file.id}&fileName=${file.name}`);
}
const allInputFileList = computed(() => {
	let inputFileList = [];
	nodeList.value.forEach((node) => {
		node.inputFileList && inputFileList.push(...node.inputFileList);
	});
	return inputFileList;
});
const allOutFileList = computed(() => {
	let outFileList = [];
	nodeList.value.forEach((node) => {
		node.outFileList && outFileList.push(...node.outFileList);
	});
	return outFileList;
});
onMounted(() => {
	getInfo();
});
</script>

<style lang="scss" scoped>
.detail-container {
	min-height: 100%;
	padding: 16px;
}
.title-container {
	display: flex;
	.title {
		flex: 1;
		font-size: 20px;
		font-weight: bolder;
		line-height: 36px;
		.state {
			margin-left: 10px;
		}
	}
	.btns {
		margin-left: 10px;
	}
}
.content-container {
	display: flex;
	flex-direction: row;
	padding: 0 16px;

	.left {
		flex: 1;
		.desc-container {
			padding: 10px;
			border-radius: 8px;
			background: rgba(255, 255, 255, 0.5);
			margin-bottom: 10px;
		}
	}
	.right {
		width: 300px;
		padding-left: 24px;
	}
	.price-container {
		font-size: 15px;
		margin-bottom: 10px;
		.price {
			font-size: 13px;
			font-weight: bold;
			color: red;
		}
	}
	.template-container {
		.template-title {
			margin-bottom: 20px;
			margin-top: 20px;
			font-weight: bolder;
			font-size: 15px;
		}
		.template-content {
			cursor: pointer;
			background: #fff;
			padding: 10px;
			margin-bottom: 10px;
			border-radius: 4px;
			position: relative;
			padding-right: 20px;
			display: flex;
			align-items: center;
			.img {
				width: 40px;
				height: 40px;
				border-radius: 4px;
				margin-right: 5px;
			}
			.title-box {
				flex: 1;
				width: 0;
			}
			.subtitle {
				font-size: 12px;
				color: #999;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
			.badge {
				margin-left: 5px;
			}
		}
	}
}
.recommend-container {
	.recommend-title {
		margin-bottom: 16px;
		margin-top: 16px;
		font-weight: bolder;
		font-size: 15px;
	}
	.recommend-item {
		padding: 10px;
		margin-bottom: 10px;
		border-radius: 4px;
		position: relative;
		padding-right: 20px;
		.title {
		}
		.subtitle {
			font-size: 12px;
			color: #999;
		}
		.price {
			position: absolute;
			top: 10px;
			right: 10px;
			color: red;
		}
	}
}
.preview-container {
	width: 300px;
	height: 100px;
	background: #fff;
	position: fixed;
	bottom: 0;
	right: 0;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	box-shadow:
		0 1px 3px rgb(0 0 0 / 30%),
		0 1px 1px rgb(0 0 0 / 24%),
		0 2px 1px -1px rgb(0 0 0 / 22%) !important;
	&.max {
		width: 100% !important;
		height: 100% !important;
		left: 0 !important;
		bottom: 0 !important;
	}
	.preview-bar {
	}
	.preview-scroll {
		flex: 1;
		padding: 10px;
		overflow: auto;
	}
}
</style>
