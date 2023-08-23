import { date } from 'quasar';
import { apiRequest, hasuraRequest } from 'src/boot/axios';

export const InstanceState: any = {
	created: { name: 'created', value: 0, label: '已创建' },
	pending: { name: 'pending', value: 1, label: '等待中' },
	running: { name: 'running', value: 2, label: '进行中' },
	finished: { name: 'finished', value: 3, label: '已结束' },
	error: { name: 'error', value: 4, label: '出错' },
	stopping: { name: 'stopping', value: 5, label: '正在终止' },
	stopped: { name: 'stopped', value: 6, label: '已终止' },
	pausing: { name: 'pausing', value: 7, label: '正在暂停' },
	paused: { name: 'paused', value: 8, label: '已暂停' },
	recovering: { name: 'recovering', value: 9, label: '正在恢复' },
};

export const InstanceNodeState: any = {
	created: { name: 'created', value: 0, label: '已创建' },
	pending: { name: 'pending', value: 1, label: '等待中' },
	running: { name: 'running', value: 2, label: '进行中' },
	finished: { name: 'finished', value: 3, label: '已结束' },
	error: { name: 'error', value: 4, label: '出错' },
	stopping: { name: 'stopping', value: 5, label: '正在终止' },
	stopped: { name: 'stopped', value: 6, label: '已终止' },
	standby: { name: 'standby', value: 7, label: '待命中' },
	pausing: { name: 'pausing', value: 8, label: '正在暂停' },
	paused: { name: 'pausing', value: 9, label: '已暂停' },
	recovering: { name: 'recovering', value: 10, label: '正在恢复' },
};

export class InstanceService {
	/**
	 * 获取全部实例列表(历史记录)
	 */
	static async getInstanceList(page: number, rowsPerPage: number, filter?: { statusArr: Array<string>; status: string; q: string }, sortBy?: string, descending?: boolean) {
		const where: any = {};
		if (filter?.q) {
			where.name = { _ilike: `%${filter.q}%` };
		}
		if (filter?.status != undefined && filter.status !== '') {
			where.status = { _eq: filter.status };
		} else {
			if (filter?.statusArr?.length) {
				where.status = { _in: filter.statusArr };
			}
		}
		const orderBy = [];
		if (sortBy) orderBy.push({ [sortBy]: descending ? 'desc' : 'asc' });
		const data = {
			query: `query MyQuery($where:flow_instance_bool_exp,$orderBy:[flow_instance_order_by!]) {
				flow_instance(
					limit: ${rowsPerPage}
					offset: ${(page - 1) * rowsPerPage}
					where: $where
					order_by: $orderBy
				) {
					id
					created_time
					description
					logo
					name
					status
					spec
				}
				flow_instance_aggregate(where: $where) {
					aggregate {
						count
					}
				}
			}`,
			variables: {
				where,
				orderBy,
			},
		};
		const res = await hasuraRequest.post('', data);

		return {
			list: res.data?.flow_instance?.map((item: any) => {
				item.created_time = date.formatDate(item.created_time, 'YYYY/MM/DD HH:mm:ss');
				return item;
			}),
			count: res.data?.flow_instance_aggregate?.aggregate?.count as number,
		};
	}
	/**
	 * 根据id获取工作流任务详情
	 */
	static async getDetail(id: string) {
		const data = {
			query: `query MyQuery {
			flow_instance_by_pk(id: "${id}") {
			  created_time
			  description
			  spec
			  id
			  logo
			  name
			  status
			}
		  }
		  `,
		};
		const res = await hasuraRequest.post('', data);
		if (!res.data.flow_instance_by_pk) return false;
		return res.data.flow_instance_by_pk;
	}
	/**
	 * 根据节点id获取上传的文件
	 */
	static async getNodeFiles(nodeId: string) {
		const data = {
			query: `query MyQuery ($spec:jsonb){
			file_system(where: {meta: {_contains: $spec}, is_dict: {_eq: false}}) {
			  file_metadata_id
			  name
			}
		  }
		  `,
			variables: { spec: { nodeInstanceId: nodeId } },
		};
		const res = await hasuraRequest.post('', data);
		return res.data.file_system.map((item: any) => {
			return {
				id: item.file_metadata_id,
				name: item.name,
			};
		});
	}
	/**
	 * 根据id获取工作流任务计费信息
	 */
	static async getFlowExpense(flowId: string) {
		const data = {
			query: `query MyQuery {
			flow_instance_billing(where: {flow_instance_id: {_eq: "${flowId}"}}) {
			  cpu
			  created_time
			  modified_time
			  cpu_time
			  memory
			  storage
			  total_price
			  wall_time
			  user_id
			  flow_instance_id
			}
		  }
		  `,
		};
		const res = await hasuraRequest.post('', data);
		return res.data.flow_instance_billing && res.data.flow_instance_billing[0];
	}
	/**
	 * 根据id获取节点列表
	 */
	static async getNodesById(id: string) {
		const data = {
			query: `query MyQuery {
			node_instance(where: {flow_instance_id: {_eq: "${id}"}}) {
			  id
			  name
			  status
			  log
			  resource_meter
			}
		  }
		  `,
		};
		const res = await hasuraRequest.post('', data);
		return res.data.node_instance.map((item: any) => {
			return {
				id: item.id,
				name: item.name,
				status: item.status,
				log: item.log,
				showLog: false,
				resource_meter: item.resource_meter,
			};
		});
	}
	/**
	 * 根据节点id获取计费信息
	 */
	static async getNodeExpense(flowId: string, nodeId: string) {
		const data = {
			query: `query MyQuery {
			node_instance_billing(where: {flow_instance_id: {_eq: "${flowId}"}, node_instance_id: {_eq: "${nodeId}"}}) {
			  cpu
			  cpu_time
			  created_time
			  memory
			  modified_time
			  price
			  storage
			  wall_time
			  flow_instance_id
			  node_instance_id
			}
		  }

		  `,
		};
		const res = await hasuraRequest.post('', data);
		return res.data.node_instance_billing && res.data.node_instance_billing[0];
	}
	//获取节点运行命令行
	static async getRunCmd(id: string) {
		const res = await apiRequest.get('/workflow-engine/NodeCmd/' + id);
		return res;
	}
	//获取文件下载地址
	static getDownFileUrl(id: string) {
		return `/file-storage/RangelyDownloadFile/${id}`;
	}
}
