<template>
	<div class="component-inner">
		<div class="component-info">
			<data-info :info="info" />

			<q-separator />

			<div v-if="info.state >= 2">
				<div class="desc-item q-mt-md">
					<div class="title">运输方式</div>
					<div class="content">快递运输</div>
				</div>
				<div style="text-align: center; margin-top: 20px">
					<div class="q-mb-md">
						<q-icon name="check_circle" color="green" size="40px"></q-icon>
					</div>
					<div class="subtitle">数据运输中，已通知接收方</div>
				</div>
			</div>
			<div v-else>
				<q-tabs class="tabs-div" dense align="left" v-model="tabValue">
					<q-tab class="tab-item" :class="{ active: tabValue == tab.value }" :name="tab.value" :label="tab.label" v-for="(tab, index) in tabs" :key="index" />
				</q-tabs>
				<div class="q-mt-md" v-if="tabValue == 'post'">
					<div class="desc-item center">
						<div class="title">姓名</div>
						<div class="content">
							<q-input outlined dense style="width: 150px" v-model="postName"></q-input>
						</div>
					</div>
					<div class="desc-item center">
						<div class="title">地址</div>
						<div class="content">
							<q-input outlined dense style="width: 150px" v-model="postAddress"></q-input>
						</div>
					</div>
					<div class="desc-item center">
						<div class="title">电话</div>
						<div class="content">
							<q-input outlined dense style="width: 150px" v-model="postPhone"></q-input>
						</div>
					</div>
				</div>
				<div class="q-mt-md" v-if="tabValue == 'inner'">
					<div class="desc-item center">
						<div class="title">硬盘数量</div>
						<div class="content">
							<q-input outlined dense style="width: 150px" v-model="innerNumbers"></q-input>
						</div>
					</div>
					<div class="desc-item center">
						<div class="title">负责人</div>
						<div class="content">
							<q-input outlined dense style="width: 150px" v-model="innerName"></q-input>
						</div>
					</div>
					<div class="desc-item center">
						<div class="title">负责人电话</div>
						<div class="content">
							<q-input outlined dense style="width: 150px" v-model="innerPhone"></q-input>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="component-btns">
			<q-btn @click="prev" color="primary" label="上一步" />
			<q-space />
			<q-btn @click="next" color="primary" label="下一步" />
		</div>
	</div>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue';
import DataInfo from './DataInfo.vue';

export default defineComponent({
	props: {
		info: {
			type: Object,
		},
	},
	components: { DataInfo },
	setup(props, context) {
		const tabValue = ref('post');
		const tabs = [
			{ value: 'post', label: '快递运输' },
			{ value: 'inner', label: '内部配送' },
		];

		const postName = ref('');
		const postAddress = ref('');
		const postPhone = ref('');
		const innerName = ref('');
		const innerNumbers = ref('');
		const innerPhone = ref('');

		function prev() {
			context.emit('prev', 'transfer');
		}
		function next() {
			context.emit('next', 'transfer');
		}
		return {
			tabValue,
			tabs,
			prev,
			next,
			postName,
			postAddress,
			postPhone,
			innerName,
			innerNumbers,
			innerPhone,
		};
	},
});
</script>

<style lang="scss" scoped>
.desc-item {
	display: flex;
	margin-bottom: 20px;
	.title {
		width: 100px;
		color: $font-light-color;
	}
	.content {
		flex: 1;
		word-break: break-all;
		color: #25396f;
	}
	&.center {
		align-items: center;
	}
}
.tabs-div {
	.tab-item {
		&.active {
			color: $primary-color;
		}
	}
}
.subtitle {
	color: $font-light-color;
}
</style>
