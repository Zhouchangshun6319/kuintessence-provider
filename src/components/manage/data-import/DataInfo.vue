<template>
	<div>
		<div class="q-mb-sm">
			<span class="name">{{ info.dataName }}</span>
		</div>
		<div class="date q-mb-md">
			文件来自提供者 <span class="primary">{{ info.fromServerName }}</span> 的 <span class="primary">{{ info.fromNodeName }}</span> 节点， 传输给节点
			<span class="primary">{{ info.toNodeName }}</span>
		</div>
		<div class="desc-div">
			<div class="desc-item">
				<div class="title">数据规模</div>
				<div class="content">
					{{ info.dataSize }}
				</div>
			</div>
			<div class="desc-item">
				<div class="title">开始时间</div>
				<div class="content">
					{{ info.createDate }}
				</div>
			</div>
			<div class="desc-item">
				<div class="title">等待时间</div>
				<div class="content">
					{{ info.waitTime }}
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
defineProps<{
	info: any;
}>();
</script>

<style lang="scss" scoped>
.state {
	font-size: 12px;
	border-radius: 5px;
	padding: 3px 5px;
	&.color-0 {
		background: green;
		color: #fff;
	}
	&.color-1 {
		background: blue;
		color: #fff;
	}
	&.color-2 {
		background: orange;
		color: #fff;
	}
	&.color-3,
	&.color-4 {
		background: red;
		color: #fff;
	}
}
.date {
	font-size: 12px;
}
.primary {
	color: $primary-color;
}
.name {
	font-weight: bold;
	font-size: 15px;
}
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
</style>
