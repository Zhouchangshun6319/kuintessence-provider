import { hasuraRequest, request, Apis } from 'src/boot/axios';

/**
 * 内容实体
 */
export interface ContentEntity {
	/**
	 * id
	 */
	uuid: string;
	/**
	 * 名称
	 */
	display_name: string;
	/**
	 * 版本
	 */
	content_entity_versions: {
		/**
		 * 版本id
		 */
		uuid: string;
		/**
		 * 版本tag
		 */
		tag: string;
	};
	/**
	 * 创建时间
	 */
	date_created: string;
	/**
	 * 更新时间
	 */
	date_updated: string;
	/**
	 * 状态
	 */
	status: string;
	/**
	 * 内容仓库
	 */
	content_repo: {
		/**
		 * 内容仓库id
		 */
		uuid: string;
		/**
		 * 内容仓库名称
		 */
		display_name: string;
	};
	/**
	 * 是否重点推荐
	 */
	is_featured: boolean;
	/**
	 * 是否官方直营
	 */
	is_official: boolean;
}

export class ContentEntityService {
	/**
	 * 获取内容实体列表
	 */
	static async getList(page: number, rowsPerPage: number, filter: string | undefined, sortBy: string | undefined, descending: boolean) {
		let data;
		if (!filter && !sortBy) {
			// 不筛选且不排序
			data = {
				query: `query GetList($limit: Int!, $offset: Int!) {
          content_entities(limit: $limit, offset: $offset) {
            uuid
            display_name
            content_entity_versions {
              uuid
              tag
            }
            date_created
            date_updated
            status
            content_repo {
              uuid
              display_name
            }
            is_featured
            is_official
          }
        }`,
				variables: { limit: rowsPerPage, offset: (page - 1) * rowsPerPage },
			};
		} else if (!sortBy) {
			// 不排序但筛选
			data = {
				query: `query GetList($limit: Int!, $offset: Int!, $filter: String!) {
            content_entities(
              limit: $limit
              offset: $offset
              filter: { display_name: { _contains: $filter } }
            ) {
              uuid
              display_name
              content_entity_versions {
                uuid
                tag
              }
              date_created
              date_updated
              status
              content_repo {
                uuid
                display_name
              }
              is_featured
              is_official
            }
          }`,
				variables: {
					limit: rowsPerPage,
					offset: (page - 1) * rowsPerPage,
					filter: filter,
				},
			};
		} else if (!filter) {
			// 不筛选但排序
			data = {
				query: `query GetList(
            $limit: Int!
            $offset: Int!
            $sort: [String!]
          ) {
            content_entities(limit: $limit, offset: $offset, sort: $sort) {
              uuid
              display_name
              content_entity_versions {
                uuid
                tag
              }
              date_created
              date_updated
              status
              content_repo {
                uuid
                display_name
              }
              is_featured
              is_official
            }
          }`,
				variables: {
					limit: rowsPerPage,
					offset: (page - 1) * rowsPerPage,
					sort: [(descending ? '-' : '') + sortBy],
				},
			};
		} else {
			// 筛选且排序
			data = {
				query: `query GetList(
            $limit: Int!
            $offset: Int!
            $filter: String!
            $sort: [String!]
          ) {
            content_entities(
              limit: $limit
              offset: $offset
              filter: { display_name: { _contains: $filter } }
              sort: $sort
            ) {
              uuid
              display_name
              content_entity_versions {
                uuid
                tag
              }
              date_created
              date_updated
              status
              content_repo {
                uuid
                display_name
              }
              is_featured
              is_official
            }
          }`,
				variables: {
					limit: rowsPerPage,
					offset: (page - 1) * rowsPerPage,
					filter: '%' + filter + '%',
					sort: [(descending ? '-' : '') + sortBy],
				},
			};
		}
		const res = await request.post(Apis.CoRepoUrl + '/graphql', data);
		return res.data.content_entities;
	}
	/**
	 * 获取内容实体列表大小
	 */
	static async getListNumber(filter: string | undefined) {
		let data;
		if (!filter) {
			data = {
				query: `{
            content_entities_aggregate {
              aggregate {
                count
              }
            }
          }`,
			};
		} else {
			data = {
				query: `query GetListNumber($filter: String!) {
            content_entities_aggregate(where: { display_name: { _ilike: $filter } }) {
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
		return res.data.content_entities_aggregate.aggregate.count;
	}
	/**
	 * 根据id安装软件
	 */
	static async installSoftwareById(id: string) {
		const data = {
			query: `query InstallSoftware ($id: uuid!) {
          install_software(id: $id) {
            id
          }
        }`,
			variables: {
				id,
			},
		};
		const res = await hasuraRequest.post('', data);
		if (res.data && res.data.install_software) return true;
		else return false;
	}
}
