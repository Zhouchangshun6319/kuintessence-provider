<template>
	<div>
		<div class="flow-expense-container q-pa-md">
			<div class="border-bottom row q-pb-md">
				<span class="q-mr-md">当前流程共计：</span>
				<span class="text-negative q-mr-sm">{{ expense.total_price }}</span>
				<span>元</span>
			</div>
			<div class="q-mt-md text-body2">
				<div class="expense-item row q-mb-sm">
					<span class="expense-title text-grey text-grey">创建时间</span>
					<span class="expense-content col">
						<span class="text-deep-orange-13">{{ date.formatDate(expense.created_time, 'YYYY/MM/DD HH:mm:ss') }} </span>
					</span>
				</div>
				<div class="expense-item row q-mb-sm">
					<span class="expense-title text-grey text-grey">更新时间</span>
					<span class="expense-content col text-deep-orange-13">{{ date.formatDate(expense.modified_time, 'YYYY/MM/DD HH:mm:ss') }}</span>
				</div>
				<div class="expense-item row q-mb-sm">
					<span class="expense-title text-grey text-grey">核心数</span>
					<span class="expense-content col">
						<span class="text-deep-orange-13">{{ expense.cpu }} 个</span>
					</span>
				</div>
				<div class="expense-item row q-mb-sm">
					<span class="expense-title text-grey">墙钟时间</span>
					<span class="expense-content col">
						<span class="text-deep-orange-13">{{ getTime(expense.wall_time) }}</span>
					</span>
				</div>
				<div class="expense-item row q-mb-sm">
					<span class="expense-title text-grey">cpu时间</span>
					<span class="expense-content col">
						<span class="text-deep-orange-13">{{ getTime(expense.cpu_time) }}</span>
					</span>
				</div>
				<div class="expense-item row q-mb-sm">
					<span class="expense-title text-grey">内存</span>
					<span class="expense-content col">
						<span class="text-deep-orange-13">{{ getSize(expense.memory) }}</span>
					</span>
				</div>
				<div class="expense-item row q-mb-sm">
					<span class="expense-title text-grey">存储空间</span>
					<span class="expense-content col">
						<span class="text-deep-orange-13">{{ getSize(expense.storage) }}</span>
					</span>
				</div>
			</div>
		</div>
		<div class="nodes-content q-mt-md q-pa-md" v-if="expense.nodes?.length > 1">
			<q-expansion-item v-model="expanded" icon="list" label="各节点详细费用如下：">
				<div class="node-item" v-for="(node, i) in expense.nodes" :key="i">
					<node-expense :node="node"></node-expense>
				</div>
			</q-expansion-item>
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue';
import NodeExpense from './NodeExpense.vue';
import { date } from 'quasar';

defineProps({
	expense: {
		type: Object,
		required: true,
	},
});
function getTime(time) {
	let second = parseInt(time);
	//  分
	let minute = 0;
	//  小时
	let hour = 0;
	//天
	let day = 0;
	// 转换为式分秒
	if (second > 60) {
		//  获取分钟，除以60取整数，得到整数分钟
		minute = Math.floor(second / 60);
		//  获取秒数，秒数取佘，得到整数秒数
		second = second % 60;
		//  如果分钟大于60，将分钟转换成小时
		if (minute > 60) {
			//  获取小时，获取分钟除以60，得到整数小时
			hour = Math.floor(minute / 60);
			//  获取小时后取佘的分，获取分钟除以60取佘的分
			minute = minute % 60;
			//  如果小时大于24，将小时转换成天
			if (hour > 23) {
				//  获取天数，获取小时除以24，得到整天数
				day = Math.floor(hour / 24);
				//  获取天数后取余的小时，获取小时除以24取余的小时
				hour = hour % 24;
			}
		}
	}

	let result = `${second}秒`;
	if (minute > 0) {
		result = `${minute}分${result}`;
	}
	if (hour > 0) {
		result = `${hour}小时${result}`;
	}
	if (day > 0) {
		result = `${day}天${result}`;
	}
	return result;
}

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
const expanded = ref(false);
</script>

<style lang="scss" scoped>
.flow-expense-container {
	background: rgba(255, 255, 255, 0.5);
	border-radius: 8px;
}
.nodes-desc {
	color: #999;
	font-size: 12px;
	padding-bottom: 10px;
	margin-bottom: 10px;
}
.expense-title {
	width: 100px;
}
.border-bottom {
	border-bottom: 1px solid #eee;
}
.nodes-content {
	background: rgba(255, 255, 255, 0.5);
	border-radius: 8px;
	.node-item {
		&:not(:last-child) {
			margin-bottom: 20px;
		}
		.node-title {
			font-size: 15px;
		}
	}
}
</style>
