import { hasuraRequest } from 'src/boot/axios';

/**
 * 本地软件源
 */
export interface LocalStorageSource {
	/**
	 * id
	 */
	id: string;
	/**
	 * 名称
	 */
	name: string;
	/**
	 * 版本
	 */
	version: string;
	/**
	 * 软件安装参数
	 */
	software_install_argument: string;
	/**
	 * 可执行文件路径
	 */
	exe_path: string;
	/**
	 * 集群id
	 */
	cluster_id: string;
}

export class LocalStorageSourceService {
	/**
	 * 获取本地软件源列表
	 */
	static async getList(page: number, rowsPerPage: number, filter: string | undefined, sortBy: string | undefined, descending: boolean) {
		let data;
		if (!filter && !sortBy) {
			// 不筛选且不排序
			data = {
				query: `query GetList($limit: Int!, $offset: Int!) {
          local_software_source(limit: $limit, offset: $offset) {
            id
              name
              version
              software_install_argument
              exe_path
              cluster_id
          }
        }`,
				variables: { limit: rowsPerPage, offset: (page - 1) * rowsPerPage },
			};
		} else if (!sortBy) {
			// 不排序但筛选
			data = {
				query: `query GetList($limit: Int!, $offset: Int!, $filter: String!) {
          local_software_source(
              limit: $limit
              offset: $offset
              where: { name: { _ilike: $filter } }
            ) {
              id
              name
              version
              software_install_argument
              exe_path
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
            $order_by: local_software_source_order_by!
          ) {
            local_software_source(limit: $limit, offset: $offset, order_by: [$order_by]) {
              id
              name
              version
              software_install_argument
              exe_path
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
            $order_by: local_software_source_order_by!
          ) {
            local_software_source(
              limit: $limit
              offset: $offset
              where: { name: { _ilike: $filter } }
              order_by: [$order_by]
            ) {
              id
              name
              version
              software_install_argument
              exe_path
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
		return res.data.local_software_source;
	}
	/**
	 * 获取本地软件源列表大小
	 */
	static async getListNumber(filter: string | undefined) {
		let data;
		if (!filter) {
			data = {
				query: `{
            local_software_source_aggregate {
              aggregate {
                count
              }
            }
          }`,
			};
		} else {
			data = {
				query: `query GetListNumber($filter: String!) {
            local_software_source_aggregate(where: { name: { _ilike: $filter } }) {
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
		return res.data.local_software_source_aggregate.aggregate.count;
	}
	/**
	 * 添加本地软件源
	 */
	static async insert(name: string, version: string, software_install_argument: string, exe_path: string) {
		const data = {
			query: `mutation Insert(
            $name: String!
            $version: String!
            $software_install_argument: json!
            $exe_path: String!
          ) {
            insert_local_software_source_one(
              object: {
                name: $name,
                version: $version,
                software_install_argument: $software_install_argument,
                exe_path: $exe_path
              }
            ) {
              id
            }
          }`,
			variables: {
				name,
				version,
				software_install_argument,
				exe_path,
			},
		};
		const res = await hasuraRequest.post('', data);
		return res.data.insert_local_software_source_one.id;
	}
	/**
	 * 根据id删除本地软件源
	 */
	static async deleteById(id: string) {
		const data = {
			query: `mutation DeleteById ($id: uuid!) {
            delete_local_software_source_by_pk(id: $id) {
              id
            }
          }`,
			variables: {
				id: id,
			},
		};
		const res = await hasuraRequest.post('', data);
		if (res.data && res.data.delete_local_software_source_by_pk) return true;
		else return false;
	}
	/**
	 * 根据id编辑本地软件源
	 */
	static async editById(id: string, name: string, version: string, software_install_argument: string, exe_path: string) {
		const data = {
			query: `mutation EditById(
            $id: uuid!
            $name: String!
            $version: String!
            $software_install_argument: json!
            $exe_path: String!
          ) {
            update_local_software_source_by_pk(
              pk_columns: { id: $id }
              _set: {
                name: $name,
                version: $version,
                software_install_argument: $software_install_argument,
                exe_path: $exe_path
              }
            ) {
              id
            }
          }`,
			variables: {
				id,
				name,
				version,
				software_install_argument,
				exe_path,
			},
		};
		const res = await hasuraRequest.post('', data);
		if (res.data && res.data.update_local_software_source_by_pk) return true;
		else return false;
	}
}
