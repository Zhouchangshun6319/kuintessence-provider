// src/boot/axios.js

import { boot } from 'quasar/wrappers';
import axios, { AxiosInstance } from 'axios';
import { Notify, LocalStorage } from 'quasar';
import { $mgr } from './oidc';
const env = (window as any).env as any;
//读取域名配置

const Apis = {
	CoRepoUrl: env.CoRepoUrl || '',
	CosApiUrl: env.CosApiUrl || '',
	HasuraUrl: env.HasuraUrl || '',
	OidcUrl: env.OIDC_AUTHORITY,
	oidcClient: env.OIDC_CLIENT || '',
};

function getError(status: number) {
	switch (status) {
		case 400:
			return '错误请求';
		case 401:
			return '未授权，请重新登录';
		case 403:
			return '拒绝访问';
		case 404:
			return '请求错误，未找到该资源';
		case 405:
			return '请求方法未允许';
		case 408:
			return '请求超时';
		case 500:
			return '服务器端出错';
		case 501:
			return '网络未实现';
		case 502:
			return '网络错误';
		case 503:
			return '服务不可用';
		case 504:
			return '网络超时';
		case 505:
			return 'HTTP 版本不支持该请求';
		default:
			return `未知错误${status}`;
	}
}

/**
 * graghql 接口封装
 * 正常返回格式为{data:any}
 * 错误返回格式为{errors:[{extensions:any,message:string}]}
 * 为每次调用添加进度条展示
 */
function graghqlInterceptors(instance: AxiosInstance) {
	instance.interceptors.request.use(
		function (config) {
			return config;
		},
		function (error) {
			// LoadingBar.stop();
			return Promise.reject({ message: '请求错误', errors: error });
		},
	);
	instance.interceptors.response.use(
		function (response) {
			// LoadingBar.stop();
			const data: { data?: any; errors?: any } = response.data;
			if (data.errors) {
				if (data.errors[0]?.extensions?.code === 'invalid-jwt') {
					Notify.create({
						type: 'warning',
						message: '未授权，请重新登录',
					});
					$mgr.signOut();
					return Promise.reject({
						message: '未授权，请重新登录',
						errors: data.errors,
					});
				} else {
					Notify.create({
						type: 'negative',
						message: 'GraphQL 返回错误',
					});
					return Promise.reject({
						message: 'GraphQL 返回错误',
						errors: data.errors,
					});
				}
			}
			return Promise.resolve(data);
		},
		function (error) {
			if (error?.response?.status == 401) {
				Notify.create({
					type: 'warning',
					message: '未授权，请重新登录',
				});
				return $mgr.signOut();
			} else {
				// LoadingBar.stop();
				Notify.create({
					type: 'negative',
					message: error.response && error.response.status ? getError(error.response.status) : error.message ? error.message : error,
				});
				return Promise.reject({ message: '捕获错误', errors: error.response });
			}
		},
	);
}
const request = axios.create({
	baseURL: `${Apis.CoRepoUrl}/graphql`,
	headers: {
		'Content-Type': 'application/json',
	},
	timeout: 1000 * 60 * 2,
});
graghqlInterceptors(request);

const hasuraRequest = axios.create({
	baseURL: `${Apis.HasuraUrl}/graphql`,
	headers: {
		Authorization: 'Bearer ' + LocalStorage.getItem('token'),
		'Content-Type': 'application/json',
	},
	timeout: 1000 * 60 * 2,
});
graghqlInterceptors(hasuraRequest);

/**
 * 普通接口封装
 * 返回格式：{content：any，message：string，status：number}
 * status为200代表正常，status为400代表后端逻辑错误，status为500代表后端报错
 */
const apiRequest = axios;
apiRequest.interceptors.request.use(
	function (config) {
		// LoadingBar.start();
		config.headers.Authorization = 'Bearer ' + LocalStorage.getItem('token');
		return config;
	},
	function (error) {
		// LoadingBar.stop();
		return Promise.reject({ message: '请求错误', errors: error });
	},
);
apiRequest.interceptors.response.use(
	function (response) {
		// LoadingBar.stop();
		const data: { content: any; message: string; status: number } = response.data;
		if (data.status != 200 && data.status) {
			Notify.create({
				type: 'negative',
				message: data.message || '接口错误',
			});
			return Promise.reject({ message: '接口返回错误', errors: data });
		}
		return Promise.resolve(data.content ? data.content : data);
	},
	function (error) {
		if (error?.response?.status == 401) {
			Notify.create({
				type: 'warning',
				message: '未授权，请重新登录',
			});
			return $mgr.signOut();
		} else {
			// LoadingBar.stop();
			Notify.create({
				type: 'negative',
				message: error.response && error.response.status ? getError(error.response.status) : error.message ? error.message : error,
			});
			return Promise.reject(error);
		}
	},
);

export default boot(({ app }) => {
	// 注册全局变量
	app.config.globalProperties.$axios = axios;
});

export { Apis, axios, request, hasuraRequest, apiRequest };
