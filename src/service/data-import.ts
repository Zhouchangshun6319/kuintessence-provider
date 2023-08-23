import { hasuraRequest } from 'src/boot/axios';
import { compaireTime, FormatDate } from '../util/date';
import { formatSize } from '../util/file';

export const state: any = [
	{ value: 0, label: '待处理' },
	{ value: 1, label: '已完成' },
];

export const priority: any = [
	{ value: 0, label: '低' },
	{ value: 1, label: '中' },
	{ value: 2, label: '高' },
	{ value: 3, label: '紧急' },
	{ value: 4, label: '立刻' },
];

export class DataImportService {
	static async getList() {
		const data = {
			query: `query MyQuery {
        file_transmit(where: {to_storage_server_id: {_eq: "4f600062-0105-40a4-aa7d-6f373cc51358"}}) {
          comment
          end_time
          id
          status
          start_time
          from_node_instance_id
          to_node_instance_id
          file_metadatum {
            id
            name
            size
          }
          node_instance {
            id
            is_parent
            kind
            business_data
          }
          nodeInstanceByToNodeInstanceId {
            id
            business_data
          }
          storage_server {
            name
            id
          }
          storageServerByToStorageServerId {
            id
            name
          }
        }
      }
      `,
		};
		const res = await hasuraRequest.post('', data);
		const list: any = [];
		if (res?.data?.file_transmit) {
			res.data.file_transmit.forEach((row: any) => {
				list.push({
					id: row.id,
					dataName: row.file_metadatum.name,
					fromNodeName: row.node_instance.business_data.name,
					fromNodeId: row.node_instance.id,
					toNodeName: row.nodeInstanceByToNodeInstanceId.business_data.name,
					toNodeId: row.nodeInstanceByToNodeInstanceId.id,
					fromServerName: row.storage_server.name,
					fromServerId: row.storage_server.id,
					toServerName: row.storageServerByToStorageServerId.name,
					toServerId: row.storageServerByToStorageServerId.id,
					dataId: row.file_metadatum.id,
					dataSize: formatSize(row.file_metadatum.size),
					state: row.status,
					createDate: FormatDate(row.start_time),
					waitTime: compaireTime(row.start_time),
				});
			});
		}
		return list;
	}
	static async getDetail(id: string) {
		const data = {
			query: `query MyQuery {
        file_transmit_by_pk(id: "${id}") {
          comment
          end_time
          id
          status
          start_time
          from_node_instance_id
          to_node_instance_id
          file_metadatum {
            id
            name
            size
          }
          node_instance {
            id
            is_parent
            kind
            business_data
          }
          nodeInstanceByToNodeInstanceId {
            id
            business_data
          }
          storage_server {
            name
            id
          }
          storageServerByToStorageServerId {
            id
            name
          }
        }
      }
      `,
		};
		const res = await hasuraRequest.post('', data);
		if (!res.data.file_transmit_by_pk) {
			return;
		}
		const row = res.data.file_transmit_by_pk;
		return {
			id: row.id,
			dataName: row.file_metadatum.name,
			fromNodeName: row.node_instance.business_data.name,
			fromNodeId: row.node_instance.id,
			toNodeName: row.nodeInstanceByToNodeInstanceId.business_data.name,
			toNodeId: row.nodeInstanceByToNodeInstanceId.id,
			fromServerName: row.storage_server.name,
			fromServerId: row.storage_server.id,
			toServerName: row.storageServerByToStorageServerId.name,
			toServerId: row.storageServerByToStorageServerId.id,
			dataId: row.file_metadatum.id,
			dataSize: formatSize(row.file_metadatum.size),
			state: row.status,
			createDate: FormatDate(row.start_time),
			waitTime: compaireTime(row.start_time),
		};
	}
}
