import { hasuraRequest } from 'src/boot/axios';

/**
 * 已安装软件
 */
export interface InstalledSoftware {
	/**
	 * id
	 */
	id: string;
	/**
	 * 软件源id
	 */
	source_id: string;
	/**
	 * 软件源信息
	 */
	software_source: {
		/**
		 * 软件源名称
		 */
		name: string;
	};
	/**
	 * 软件id
	 */
	software_id: string;
	/**
	 * 软件名称
	 */
	software_name: string;
	/**
	 * 安装参数
	 */
	install_argument: string;
	/**
	 * 安装时间
	 */
	installed_time: string;
	/**
	 * 安装用户id
	 */
	installed_user_id: string;
	/**
	 * 集群id
	 */
	cluster_id: string;
}

export class InstalledSoftwareService {
	/**
	 * 获取已安装软件列表
	 */
	static async getList(page: number, rowsPerPage: number, filter: string | undefined, sortBy: string | undefined, descending: boolean) {
		let data;
		if (!filter && !sortBy) {
			// 不筛选且不排序
			data = {
				query: `query GetList($limit: Int!, $offset: Int!) {
          installed_software(limit: $limit, offset: $offset) {
            id
            source_id
            software_source {
              name
            }
            software_id
            software_name
            install_argument
            installed_time
            installed_user_id
            cluster_id
          }
        }`,
				variables: { limit: rowsPerPage, offset: (page - 1) * rowsPerPage },
			};
		} else if (!sortBy) {
			// 不排序但筛选
			data = {
				query: `query GetList($limit: Int!, $offset: Int!, $filter: String!) {
          installed_software(
              limit: $limit
              offset: $offset
              where: { software_name: { _ilike: $filter } }
            ) {
              id
              source_id
              software_source {
                name
              }
              software_id
              software_name
              install_argument
              installed_time
              installed_user_id
              cluster_id
            }
          }`,
				variables: {
					limit: rowsPerPage,
					offset: (page - 1) * rowsPerPage,
					filter: '%' + filter + '%',
				},
			};
		} else if (!filter) {
			// 不筛选但排序
			data = {
				query: `query GetList(
            $limit: Int!
            $offset: Int!
            $order_by: installed_software_order_by!
          ) {
            installed_software(limit: $limit, offset: $offset, order_by: [$order_by]) {
              id
              source_id
              software_source {
                name
              }
              software_id
              software_name
              install_argument
              installed_time
              installed_user_id
              cluster_id
            }
          }`,
				variables: {
					limit: rowsPerPage,
					offset: (page - 1) * rowsPerPage,
					order_by: eval('({ "' + sortBy + '": "' + (descending ? 'desc' : 'asc') + '" })'),
				},
			};
		} else {
			// 筛选且排序
			data = {
				query: `query GetList(
            $limit: Int!
            $offset: Int!
            $filter: String!
            $order_by: installed_software_order_by!
          ) {
            installed_software(
              limit: $limit
              offset: $offset
              where: { software_name: { _ilike: $filter } }
              order_by: [$order_by]
            ) {
              id
              source_id
              software_source {
                name
              }
              software_id
              software_name
              install_argument
              installed_time
              installed_user_id
              cluster_id
            }
          }`,
				variables: {
					limit: rowsPerPage,
					offset: (page - 1) * rowsPerPage,
					filter: '%' + filter + '%',
					order_by: eval('({ "' + sortBy + '": "' + (descending ? 'desc' : 'asc') + '" })'),
				},
			};
		}
		const res = await hasuraRequest.post('', data);
		return res.data.installed_software;
	}
	/**
	 * 获取已安装软件列表大小
	 */
	static async getListNumber(filter: string | undefined) {
		let data;
		if (!filter) {
			data = {
				query: `{
            installed_software_aggregate {
              aggregate {
                count
              }
            }
          }`,
			};
		} else {
			data = {
				query: `query GetListNumber($filter: String!) {
            installed_software_aggregate(where: { software_name: { _ilike: $filter } }) {
              aggregate {
                count
              }
            }
          }`,
				variables: {
					filter: '%' + filter + '%',
				},
			};
		}
		const res = await hasuraRequest.post('', data);
		return res.data.installed_software_aggregate.aggregate.count;
	}
	/**
	 * 根据id删除已安装软件
	 */
	static async deleteById(id: string) {
		const data = {
			query: `mutation DeleteById ($id: uuid!) {
          delete_installed_software_by_pk(id: $id) {
              id
            }
          }`,
			variables: {
				id: id,
			},
		};
		const res = await hasuraRequest.post('', data);
		if (res.data && res.data.delete_installed_software_by_pk) return true;
		else return false;
	}
}
