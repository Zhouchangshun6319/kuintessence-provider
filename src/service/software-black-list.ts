import { hasuraRequest } from 'src/boot/axios';

/**
 * 软件黑名单
 */
export interface SoftwareBlackList {
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
	 * 创建的用户id
	 */
	created_user_id: string;
	/**
	 * 创建时间
	 */
	created_time: string;
	/**
	 * 上次编辑时间
	 */
	last_modified_time: string;
	/**
	 * 集群id
	 */
	cluster_id: string;
}

export class SoftwareBlackListService {
	/**
	 * 获取软件黑名单列表
	 */
	static async getList(page: number, rowsPerPage: number, filter: string | undefined, sortBy: string | undefined, descending: boolean) {
		let data;
		if (!filter && !sortBy) {
			// 不筛选且不排序
			data = {
				query: `query GetList($limit: Int!, $offset: Int!) {
          software_block_list(limit: $limit, offset: $offset) {
            id
            name
            version
            created_user_id
            created_time
            last_modified_time
            cluster_id
          }
        }`,
				variables: { limit: rowsPerPage, offset: (page - 1) * rowsPerPage },
			};
		} else if (!sortBy) {
			// 不排序但筛选
			data = {
				query: `query GetList($limit: Int!, $offset: Int!, $filter: String!) {
          software_block_list(
              limit: $limit
              offset: $offset
              where: { name: { _ilike: $filter } }
            ) {
              id
              name
              version
              created_user_id
              created_time
              last_modified_time
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
            $order_by: software_block_list_order_by!
          ) {
            software_block_list(limit: $limit, offset: $offset, order_by: [$order_by]) {
              id
              name
              version
              created_user_id
              created_time
              last_modified_time
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
            $order_by: software_block_list_order_by!
          ) {
            software_block_list(
              limit: $limit
              offset: $offset
              where: { name: { _ilike: $filter } }
              order_by: [$order_by]
            ) {
              id
              name
              version
              created_user_id
              created_time
              last_modified_time
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
		return res.data.software_block_list;
	}
	/**
	 * 获取软件黑名单列表大小
	 */
	static async getListNumber(filter: string | undefined) {
		let data;
		if (!filter) {
			data = {
				query: `{
            software_block_list_aggregate {
              aggregate {
                count
              }
            }
          }`,
			};
		} else {
			data = {
				query: `query GetListNumber($filter: String!) {
            software_block_list_aggregate(where: { name: { _ilike: $filter } }) {
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
		return res.data.software_block_list_aggregate.aggregate.count;
	}
	/**
	 * 添加软件黑名单
	 */
	static async insert(name: string, version: string) {
		const data = {
			query: `mutation Insert(
            $name: String!
            $version: String!
            $created_user_id: uuid! 
            $created_time: timestamptz!
            $last_modified_time: timestamptz!
          ) {
            insert_software_block_list_one(
              object: {
                name: $name,
                version: $version,
                created_user_id: $created_user_id,
                created_time: $created_time,
                last_modified_time: $last_modified_time
              }
            ) {
              id
            }
          }`,
			variables: {
				name,
				version,
				created_user_id: '493edd1b-5b38-4c3d-8e1c-519e450b17b9', // TODO
				created_time: new Date(),
				last_modified_time: new Date(),
			},
		};
		const res = await hasuraRequest.post('', data);
		return res.data.insert_software_block_list_one.id;
	}
	/**
	 * 根据id删除软件黑名单
	 */
	static async deleteById(id: string) {
		const data = {
			query: `mutation DeleteById ($id: uuid!) {
            delete_software_block_list_by_pk(id: $id) {
              id
            }
          }`,
			variables: {
				id: id,
			},
		};
		const res = await hasuraRequest.post('', data);
		if (res.data && res.data.delete_software_block_list_by_pk) return true;
		else return false;
	}
	/**
	 * 根据id编辑软件黑名单
	 */
	static async editById(id: string, name: string, version: string) {
		const data = {
			query: `mutation EditById(
            $id: uuid!
            $name: String!
            $version: String!
            $last_modified_time: timestamptz!
          ) {
            update_software_block_list_by_pk(
              pk_columns: { id: $id }
              _set: {
                name: $name,
                version: $version,
                last_modified_time: $last_modified_time
              }
            ) {
              id
            }
          }`,
			variables: {
				id,
				name,
				version,
				last_modified_time: new Date(),
			},
		};
		const res = await hasuraRequest.post('', data);
		if (res.data && res.data.update_software_block_list_by_pk) return true;
		else return false;
	}
}
