import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
	{
		path: '/',
		component: () => import('layouts/MainLayout.vue'),
		redirect: '/index',
		children: [
			{ name: 'Error404', path: '/404', component: () => import('pages/Error404.vue') },
			{
				path: '/index',
				name: 'IndexPage',
				meta: { keepAlive: true },
				component: () => import('pages/IndexPage.vue'),
			},
			{
				path: '/message',
				name: 'MessagePage',
				meta: { keepAlive: true },
				component: () => import('src/pages/MessagePage.vue'),
			},
			{
				path: '/cluster',
				name: 'ClusterPage',
				meta: { keepAlive: true },
				component: () => import('pages/ClusterPage.vue'),
				redirect: '/cluster/region-list',
				children: [
					{
						path: '/cluster/queue-list',
						name: 'QueueList',
						meta: { keepAlive: true },
						component: () => import('src/pages/cluster/QueueList.vue'),
					},
				],
			},
			{
				path: '/app',
				name: 'AppPage',
				meta: { keepAlive: true },
				component: () => import('pages/AppPage.vue'),
				redirect: '/app/installed-software',
				children: [
					{
						path: '/app/installed-software',
						name: 'InstalledSoftware',
						meta: { keepAlive: true },
						component: () => import('pages/app/InstalledSoftware.vue'),
					},
					{
						path: '/app/content-entity',
						name: 'ContentEntity',
						meta: { keepAlive: true },
						component: () => import('pages/app/ContentEntity.vue'),
					},
					{
						path: '/app/software-install-history',
						name: 'SoftwareInstallHistory',
						meta: { keepAlive: true },
						component: () => import('pages/app/SoftwareInstallHistory.vue'),
					},
					{
						path: '/app/software-source',
						name: 'SoftwareSource',
						meta: { keepAlive: true },
						component: () => import('pages/app/SoftwareSource.vue'),
					},
					{
						path: '/app/local-software-source',
						name: 'LocalSoftwareSource',
						meta: { keepAlive: true },
						component: () => import('pages/app/LocalSoftwareSource.vue'),
					},
					{
						path: '/app/software-black',
						name: 'SoftwareBlackList',
						meta: { keepAlive: true },
						component: () => import('pages/app/SoftwareBlackList.vue'),
					},
				],
			},
			{
				path: '/data',
				name: 'DataPage',
				meta: { keepAlive: true },
				component: () => import('pages/DataPage.vue'),
				redirect: '/data/data-export',
				children: [
					{
						path: '/data/data-import',
						name: 'DataImport',
						meta: { keepAlive: true },
						component: () => import('pages/data/DataImport.vue'),
					},
					{
						path: '/data/data-import-detail/:id',
						name: 'DataImportDetail',
						meta: { keepAlive: true, isMenu: true, title: '导入详情', icon: 'info' },
						component: () => import('pages/data/DataImportDetail.vue'),
					},
					{
						path: '/data/data-export',
						name: 'DataExport',
						meta: { keepAlive: true },
						component: () => import('pages/data/DataExport.vue'),
					},
					{
						path: '/data/data-export-detail/:id',
						name: 'DataExportDetail',
						meta: { keepAlive: true, isMenu: false, title: '导出详情', icon: 'info' },
						component: () => import('pages/data/DataExportDetail.vue'),
					},
					{
						path: '/data/data-transfer',
						name: 'DataTransfer',
						meta: { keepAlive: true },
						component: () => import('pages/data/DataTransfer.vue'),
					},
					{
						path: '/data/storage-space',
						name: 'StorageSpace',
						meta: { keepAlive: true },
						component: () => import('pages/data/StorageSpace.vue'),
					},
				],
			},
			{
				path: '/workflow',
				name: 'WorkflowPage',
				meta: { keepAlive: true },
				component: () => import('pages/WorkflowPage.vue'),
				redirect: '/workflow/running-instance',
				children: [
					{
						path: '/workflow/running-instance',
						name: 'RunningInstance',
						meta: { keepAlive: true },
						component: () => import('pages/workflow/RunningInstance.vue'),
					},
					{
						path: '/workflow/history-instance',
						name: 'HistoryInstance',
						meta: { keepAlive: true },
						component: () => import('pages/workflow/HistoryInstance.vue'),
					},
				],
			},
			{
				path: '/instance-detail',
				name: 'InstanceDetail',
				meta: { keepAlive: false },
				component: () => import('pages/workflow/InstanceDetail.vue'),
			},
		],
	},
	{
		path: '/oidc',
		component: () => import('src/layouts/OidcLayout.vue'),
		children: [
			{
				name: 'call-back',
				path: 'call-back',
				component: () => import('src/pages/oidc/CallBack.vue'),
			},
			{
				name: 'access-denied',
				path: 'access-denied',
				component: () => import('src/pages/oidc/AccessDenied.vue'),
			},
			{
				name: 'silent-renew',
				path: 'silent-renew',
				component: () => import('src/pages/oidc/SilentRenew.vue'),
			},
		],
	},

	// Always leave this as last one,
	// but you can also remove it
	{
		path: '/:catchAll(.*)*',
		redirect: '/404',
	},
];

export default routes;
