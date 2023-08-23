import { hasuraRequest } from 'src/boot/axios';
import { useAuthStore } from 'src/stores/auth';

export class ClusterService {
	/**
	 * 获取区域列表
	 */
	static async getRegionList(page: number, rowsPerPage: number, filter?: { q?: string; ids?: string[] }) {
		const authStore = useAuthStore();
		if (!authStore.providerId) return { list: [], count: 0 };
		const search: any = {
			provider_id: { _eq: authStore.providerId },
		};
		if (filter?.q) {
			search.name = { _like: `%${filter.q}%` };
		}

		if (!authStore.isAdmin) {
			search.id = { _in: authStore.manageClusters?.regions || [] };
		} else {
			if (filter?.ids) {
				search.id = { _in: filter.ids };
			}
		}
		const query = {
			query: `query MyQuery($search:region_bool_exp) {
				region(limit: ${rowsPerPage}, offset: ${(page - 1) * rowsPerPage}, where: $search) {
				  id
				  name
				  address
				  location
				  mailing_address
				  postal_code
				}
				region_aggregate( where: $search) {
					aggregate {
					  count
					}
				  }
			  }
			   `,
			variables: {
				search,
			},
		};
		const res = await hasuraRequest.post('', query);
		return {
			list: res.data.region,
			count: res.data.region_aggregate.aggregate.count as number,
		};
	}
	/**
	 * 获取可用区列表
	 */
	static async getZoneList(page: number, rowsPerPage: number, filter?: { region_id?: string; q?: string; ids?: string[] }) {
		const authStore = useAuthStore();
		if (!authStore.providerId) return { list: [], count: 0 };
		const search: any = {
			provider_id: { _eq: authStore.providerId },
		};
		if (filter?.q) {
			search.name = { _like: `%${filter.q}%` };
		}

		if (!authStore.isAdmin) {
			search._or = {
				region_id: { _in: authStore.manageClusters?.regions || [] },
				id: { _in: authStore.manageClusters?.zones || [] },
			};
		} else {
			if (filter?.ids) {
				search.id = { _in: filter.ids };
			}
		}
		if (filter?.region_id) {
			search.region_id = { _eq: filter.region_id };
		}
		const query = {
			query: `query MyQuery($search:available_zone_bool_exp) {
				available_zone(limit: ${rowsPerPage}, offset: ${(page - 1) * rowsPerPage}, where: $search) {
				  id
				  name
				  region{
					id
					name
				  }
				}
				available_zone_aggregate( where: $search) {
					aggregate {
					  count
					}
				  }
			  }
			   `,
			variables: {
				search,
			},
		};
		const res = await hasuraRequest.post('', query);
		return {
			list: res.data.available_zone,
			count: res.data.available_zone_aggregate.aggregate.count as number,
		};
	}
	/**
	 * 获取集群列表
	 */
	static async getClusterList(page: number, rowsPerPage: number, filter?: { region_id?: string; available_zone_id?: string; q?: string; ids?: string[] }) {
		const authStore = useAuthStore();
		if (!authStore.providerId) return { list: [], count: 0 };
		const search: any = {
			provider_id: { _eq: authStore.providerId },
		};
		if (filter?.q) {
			search.name = { _like: `%${filter.q}%` };
		}

		if (!authStore.isAdmin) {
			search._or = {
				available_zone: { region_id: { _in: authStore.manageClusters?.regions || [] } },
				available_zone_id: { _in: authStore.manageClusters?.zones || [] },
				id: { _in: authStore.manageClusters?.clusters || [] },
			};
		} else {
			if (filter?.ids) {
				search.id = { _in: filter.ids };
			}
		}
		if (filter?.available_zone_id) {
			search.available_zone_id = { _eq: filter.available_zone_id };
		} else {
			if (filter?.region_id) {
				search.available_zone = { region_id: { _eq: filter.region_id } };
			}
		}
		const query = {
			query: `query MyQuery($search:cluster_bool_exp) {
				cluster(limit: ${rowsPerPage}, offset: ${(page - 1) * rowsPerPage}, where: $search) {
				  id
				  name
				  available_zone {
					id
					name
					region {
						name
						id
					}
				  }
				}
				cluster_aggregate( where: $search) {
					aggregate {
					  count
					}
				  }
			  }
			   `,
			variables: {
				search,
			},
		};
		const res = await hasuraRequest.post('', query);
		return {
			list: res.data.cluster.map((item: any) => {
				return {
					id: item.id,
					name: item.name,
					available_zone: {
						id: item.available_zone?.id,
						name: item.available_zone?.name,
					},
					region: {
						id: item.available_zone?.region?.id,
						name: item.available_zone?.region?.name,
					},
				};
			}),
			count: res.data.cluster_aggregate.aggregate.count as number,
		};
	}
	/**
	 * 获取队列资源列表
	 */
	static async getQueueList(page: number, rowsPerPage: number, filter?: { region_id?: string; available_zone_id?: string; cluster_id?: string; q?: string; ids?: string[] }) {
		const authStore = useAuthStore();

		if (!authStore.providerId) return { list: [], count: 0 };
		const search: any = {
			provider_id: { _eq: authStore.providerId },
		};
		if (filter?.q) {
			search.name = { _like: `%${filter.q}%` };
		}

		if (!authStore.isAdmin) {
			search._or = {
				cluster: {
					_or: {
						available_zone: { region_id: { _in: authStore.manageClusters?.regions || [] } },
						available_zone_id: { _in: authStore.manageClusters?.zones || [] },
					},
				},
				cluster_id: { _in: authStore.manageClusters?.zones || [] },
				id: { _in: authStore.manageClusters?.queues || [] },
			};
		} else {
			if (filter?.ids) {
				search.id = { _in: filter.ids };
			}
		}
		if (filter?.cluster_id) {
			search.cluster_id = { _eq: filter.cluster_id };
		} else {
			if (filter?.available_zone_id) {
				search.cluster = {
					available_zone_id: { _eq: filter.available_zone_id },
				};
			} else {
				if (filter?.region_id) {
					search.cluster = {
						available_zone: { region_id: { _eq: filter.region_id } },
					};
				}
			}
		}
		const query = {
			query: `query GetList($search: queue_bool_exp) {
				queue(
					limit: ${rowsPerPage}
					offset: ${(page - 1) * rowsPerPage}
					where: $search
				) {
					id
					enabled
					name
					memory
					memory_alert
					core_number
					core_number_alert
					storage_capacity
					storage_capacity_alert
					max_queuing_task_count
					max_running_task_count
					node_count
					max_node_count
					cluster {
						id
						name
						available_zone {
							id
							name
							region {
								name
								id
							}
						}
					}
				}
				queue_aggregate (where:$search){
					aggregate {
					  count
					}
				}
			}`,
			variables: {
				search,
			},
		};

		const res = await hasuraRequest.post('', query);
		return {
			list: res.data.queue.map((item: any) => {
				item.region = {
					id: item.cluster?.available_zone?.region?.id,
					name: item.cluster?.available_zone?.region?.name,
				};
				item.available_zone = {
					id: item.cluster?.available_zone?.id,
					name: item.cluster?.available_zone?.name,
				};
				item.cluster = {
					id: item.cluster?.id,
					name: item.cluster?.name,
				};
				return item;
			}),
			count: res.data.queue_aggregate.aggregate.count as number,
		};
	}

	/**
	 * 新增区域
	 */
	static async addRegion(formData: any) {
		const authStore = useAuthStore();

		const form = {
			location: formData.location,
			address: formData.address,
			mailing_address: formData.mailing_address,
			name: formData.name,
			postal_code: formData.postal_code,
			provider_id: authStore.providerId,
		};

		const query = {
			query: `mutation MyMutation($form:region_insert_input!) {
				insert_region_one(
					object: $form
				) {
					id
				}
			  }`,
			variables: {
				form,
			},
		};
		return await hasuraRequest.post('', query);
	}
	/**
	 * 更新区域
	 */
	static async updateRegion(id: string, formData: any) {
		const form = {
			location: formData.location,
			address: formData.address,
			mailing_address: formData.mailing_address,
			name: formData.name,
			postal_code: formData.postal_code,
		};

		const query = {
			query: `mutation MyMutation($form:region_set_input) {
				update_region_by_pk(
					pk_columns: {id: "${id}"},
					_set: $form
				) {
					id
				}
			  }`,
			variables: {
				form,
			},
		};
		return await hasuraRequest.post('', query);
	}
	/**
	 * 新增可用区
	 */
	static async addZone(formData: any) {
		const authStore = useAuthStore();
		const form = {
			name: formData.name,
			region_id: formData.region.id,
			provider_id: authStore.providerId,
		};
		console.log(form);
		const query = {
			query: `mutation MyMutation($form:available_zone_insert_input!) {
				insert_available_zone_one(
					object: $form
				) {
					id
				}
			  }`,
			variables: {
				form,
			},
		};
		return await hasuraRequest.post('', query);
	}
	/**
	 * 更新区域
	 */
	static async updateZone(id: string, formData: any) {
		const form = {
			name: formData.name,
			region_id: formData.region.id,
		};

		const query = {
			query: `mutation MyMutation($form:available_zone_set_input) {
				update_available_zone_by_pk(
					pk_columns: {id: "${id}"},
					_set: $form
				) {
					id
				}
			  }`,
			variables: {
				form,
			},
		};
		return await hasuraRequest.post('', query);
	}
	/**
	 * 新增可用区
	 */
	static async addCluster(formData: any) {
		const authStore = useAuthStore();
		const form = {
			name: formData.name,
			available_zone_id: formData.available_zone.id,
			provider_id: authStore.providerId,
		};

		const query = {
			query: `mutation MyMutation($form:cluster_insert_input!) {
				insert_cluster_one(
					object: $form
				) {
					id
				}
			  }`,
			variables: {
				form,
			},
		};
		return await hasuraRequest.post('', query);
	}
	/**
	 * 更新区域
	 */
	static async updateCluster(id: string, formData: any) {
		const form = {
			name: formData.name,
			available_zone_id: formData.available_zone.id,
		};

		const query = {
			query: `mutation MyMutation($form:cluster_set_input) {
				update_cluster_by_pk(
					pk_columns: {id: "${id}"},
					_set: $form
				) {
					id
				}
			  }`,
			variables: {
				form,
			},
		};
		return await hasuraRequest.post('', query);
	}
	/**
	 * 删除区域
	 */
	static async delRegion(id: string) {
		const query = {
			query: `mutation MyMutation {
				delete_region_by_pk(id: "${id}") {
				  id
				}
			  }`,
		};
		return await hasuraRequest.post('', query);
	}
	/**
	 * 删除可用区
	 */
	static async delZone(id: string) {
		const query = {
			query: `mutation MyMutation {
				delete_available_zone_by_pk(id: "${id}") {
				  id
				}
			  }`,
		};
		return await hasuraRequest.post('', query);
	}
	/**
	 * 删除集群
	 */
	static async delCluster(id: string) {
		const query = {
			query: `mutation MyMutation {
				delete_cluster_by_pk(id: "${id}") {
				  id
				}
			  }`,
		};
		return await hasuraRequest.post('', query);
	}

	/**
	 * 根据id删除集群资源
	 */
	static async delQueue(id: string) {
		const data = {
			query: `mutation DeleteById ($id: uuid!) {
				delete_queue_by_pk(id: $id) {
				id
				}
			}`,
			variables: {
				id: id,
			},
		};
		const res = await hasuraRequest.post('', data);
		if (res.data?.delete_queue_by_pk) return true;
		else return false;
	}
	static async bindQueue(formData: any) {
		const data = {
			query: `mutation MyMutation {
				update_queue_by_pk(
					pk_columns: {id: "${formData.id}"},
					_set: {provider_id: "${useAuthStore().providerId}",name:"${formData.name}"})
				{
				  id
				}
			  }`,
		};
		const res = await hasuraRequest.post('', data);
		if (res.data?.update_queue_by_pk) return true;
		else return false;
	}
	static async updateQueue(id: string, formData: any) {
		const form = {
			name: formData.name,
			cluster_id: formData.cluster.id,
			memory: formData.memory,
			memory_alert: formData.memory_alert,
			core_number: formData.core_number,
			core_number_alert: formData.core_number_alert,
			storage_capacity: formData.storage_capacity,
			storage_capacity_alert: formData.storage_capacity_alert,
			max_queuing_task_count: formData.max_queuing_task_count,
			max_running_task_count: formData.max_running_task_count,
			node_count: formData.node_count,
			max_node_count: formData.max_node_count,
		};

		const query = {
			query: `mutation MyMutation($form:queue_set_input) {
				update_queue_by_pk(
					pk_columns: {id: "${id}"},
					_set: $form
				) {
					id
				}
			  }`,
			variables: {
				form,
			},
		};
		return await hasuraRequest.post('', query);
	}
	static async changeQueueState(id: string, enabled: boolean) {
		const form = {
			enabled,
		};

		const query = {
			query: `mutation MyMutation($form:queue_set_input) {
				update_queue_by_pk(
					pk_columns: {id: "${id}"},
					_set: $form
				) {
					id
				}
			  }`,
			variables: {
				form,
			},
		};
		return await hasuraRequest.post('', query);
	}
}
