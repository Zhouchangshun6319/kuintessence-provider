import { Apis, apiRequest, hasuraRequest } from 'src/boot/axios';

export class UserService {
	//获取用户的提供者
	static async getProvider(userId: string) {
		const query = {
			query: `query MyQuery {
				provider_users(where: {user_id: {_eq: "${userId}"}}) {
				  id
				  role
				  enabled
				  provider_list{
					id
					name
				  }
				  manage_cluster
				  use_cluster
				}
			  }

			  `,
		};
		const res = await hasuraRequest.post('', query);
		if (res.data?.provider_users.length) {
			return res.data.provider_users[0];
		} else {
			return undefined;
		}
	}

	// 获取oidc用户自定义信息
	static async getOidcUserInfo() {
		const res: any = await apiRequest.get(`${Apis.OidcUrl}/account`);
		const userInfo: { firstName: string; lastName: string; attributes: { [key: string]: string } } = {
			...res,
			firstName: res.firstName || '',
			lastName: res.lastName || '',
			attributes: {
				nickName: res.attributes?.nickName ? (res.attributes.nickName[0] as string) : '',
				userLogo: res.attributes?.userLogo ? (res.attributes.userLogo[0] as string) : '',
				userPhone: res.attributes?.userPhone ? (res.attributes.userPhone[0] as string) : '',
			},
		};
		return userInfo;
	}
	static async updateOidcUserInfo(infoData: { [key: string]: string }) {
		const userInfo = await this.getOidcUserInfo();
		for (const key in infoData) {
			if (Object.prototype.hasOwnProperty.call(infoData, key)) {
				const value = infoData[key];
				if (key == 'firstName' || key == 'lastName') {
					userInfo[key] = value;
				} else {
					userInfo.attributes[key] = value;
				}
			}
		}
		return await apiRequest.post(`${Apis.OidcUrl}/account`, userInfo);
	}
}
