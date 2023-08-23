<template>
	<div class="node-expense-container q-pa-md">
		<div class="border-bottom q-pb-md">
			<span class="q-mr-md">{{ node.name }}：</span>
			<span class="text-negative">{{ node.price }}</span>
			<span>元</span>
		</div>

		<div class="q-mt-md text-body2">
			<div class="expense-item row q-mb-sm">
				<span class="expense-title text-grey text-grey">创建时间</span>
				<span class="expense-content col">
					<span class="text-deep-orange-13">{{ date.formatDate(node.created_time, 'YYYY/MM/DD HH:mm:ss') }} </span>
				</span>
			</div>
			<div class="expense-item row q-mb-sm">
				<span class="expense-title text-grey text-grey">更新时间</span>
				<span class="expense-content col text-deep-orange-13">{{ date.formatDate(node.modified_time, 'YYYY/MM/DD HH:mm:ss') }}</span>
			</div>
			<div class="expense-item row q-mb-sm">
				<span class="expense-title text-grey text-grey">核心数</span>
				<span class="expense-content col">
					<span class="text-deep-orange-13">{{ node.cpu }} 个</span>
				</span>
			</div>
			<div class="expense-item row q-mb-sm">
				<span class="expense-title text-grey">墙钟时间</span>
				<span class="expense-content col">
					<span class="text-deep-orange-13">{{ getTime(node.wall_time) }}</span>
				</span>
			</div>
			<div class="expense-item row q-mb-sm">
				<span class="expense-title text-grey">cpu时间</span>
				<span class="expense-content col">
					<span class="text-deep-orange-13">{{ getTime(node.cpu_time) }}</span>
				</span>
			</div>
			<div class="expense-item row q-mb-sm">
				<span class="expense-title text-grey">内存</span>
				<span class="expense-content col">
					<span class="text-deep-orange-13">{{ getSize(node.memory) }}</span>
				</span>
			</div>
			<div class="expense-item row q-mb-sm">
				<span class="expense-title text-grey">存储空间</span>
				<span class="expense-content col">
					<span class="text-deep-orange-13">{{ getSize(node.storage) }}</span>
				</span>
			</div>
		</div>
	</div>
</template>

<script setup>
import { date } from 'quasar';
import { getTime } from 'src/util/time';

defineProps({
	node: {
		type: Object,
		required: true,
	},
});

function getSize(byte) {
	let size = parseFloat(byte);
	var data = '';
	if (size < 1024) {
		//如果小于0.1KB转化成B
		data = size.toFixed(2) + 'B';
	} else if (size < 1024 * 1024) {
		//如果小于0.1MB转化成KB
		data = (size / 1024).toFixed(2) + 'KB';
	} else if (size < 1024 * 1024 * 1024) {
		//如果小于0.1GB转化成MB
		data = (size / (1024 * 1024)).toFixed(2) + 'MB';
	} else {
		//其他转化成GB
		data = (size / (1024 * 1024 * 1024)).toFixed(2) + 'GB';
	}
	var sizestr = data + '';
	var len = sizestr.indexOf('\.');
	var dec = sizestr.substring(len + 1, len + 3);
	if (dec == '00') {
		//当小数点后为00时 去掉小数部分
		return sizestr.substring(0, len) + sizestr.substring(len + 3);
	}
	return sizestr;
}
</script>

<style lang="scss" scoped>
.node-expense-container {
	width: 100%;
	height: auto;
	background: rgba(255, 255, 255, 0.5);
	border-radius: 8px;
	color: #333;
}
.expense-title {
	width: 100px;
}
.border-bottom {
	border-bottom: 1px solid #eee;
}
</style>
