import { hasuraRequest } from 'src/boot/axios';

/**
 * 软件安装历史
 */
export interface SoftwareInstallHistory {
	/**
	 * id
	 */
	id: string;
	/**
	 * 名称
	 */
	name: string;
	/**
	 * 状态：0-排队中，1-正在进行，2-完成，3-取消，4-错误
	 */
	status: number;
	/**
	 * 日志
	 */
	log: string;
	/**
	 * 开始时间
	 */
	start_time: string;
	/**
	 * 结束时间
	 */
	end_time: string;
	/**
	 * 请求的用户id
	 */
	request_user_id: string;
	/**
	 * 集群id
	 */
	cluster_id: string;
}

export class SoftwareInstallHistoryService {
	/**
	 * 获取软件安装历史列表
	 */
	static async getList(page: number, rowsPerPage: number, sortBy: string | undefined, descending: boolean) {
		let data;
		if (!sortBy) {
			// 不排序
			data = {
				query: `query GetList($limit: Int!, $offset: Int!) {
          software_install_history(limit: $limit, offset: $offset) {
            id
            name
            status
            log
            start_time
            end_time
            request_user_id
            cluster_id
          }
        }`,
				variables: { limit: rowsPerPage, offset: (page - 1) * rowsPerPage },
			};
		} else {
			// 排序
			data = {
				query: `query GetList(
          $limit: Int!
          $offset: Int!
          $order_by: software_install_history_order_by!
        ) {
          software_install_history(limit: $limit, offset: $offset, order_by: [$order_by]) {
            id
            name
            status
            log
            start_time
            end_time
            request_user_id
            cluster_id
          }
        }`,
				variables: {
					limit: rowsPerPage,
					offset: (page - 1) * rowsPerPage,
					order_by: eval('({ "' + sortBy + '": "' + (descending ? 'desc' : 'asc') + '" })'),
				},
			};
		}
		const res = await hasuraRequest.post('', data);
		return res.data.software_install_history;
	}
	/**
	 * 获取软件安装历史列表大小
	 */
	static async getListNumber() {
		const data = {
			query: `{
        software_install_history_aggregate {
            aggregate {
              count
            }
          }
        }`,
		};
		const res = await hasuraRequest.post('', data);
		return res.data.software_install_history_aggregate.aggregate.count;
	}
	/**
	 * 根据id取消安装队列
	 */
	static async cancelById(id: string) {
		const data = {
			query: `mutation CancelById(
          $id: uuid!
          $end_time: timestamptz!
        ) {
          update_software_install_history_by_pk(
            pk_columns: { id: $id }
            _set: {
              status: 3
              end_time: $end_time
            }
          ) {
            id
          }
        }`,
			variables: {
				id,
				end_time: new Date(),
			},
		};
		const res = await hasuraRequest.post('', data);
		if (res.data && res.data.update_software_install_history_by_pk) return true;
		else return false;
	}
	/**
	 * 根据id删除安装队列
	 */
	static async deleteById(id: string) {
		const data = {
			query: `mutation DeleteById ($id: uuid!) {
        delete_software_install_history_by_pk(id: $id) {
            id
          }
        }`,
			variables: {
				id,
			},
		};
		const res = await hasuraRequest.post('', data);
		if (res.data && res.data.delete_software_install_history_by_pk) return true;
		else return false;
	}
}
