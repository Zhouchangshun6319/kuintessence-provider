export function FormatDate(time: string, format: string = 'YY-MM-DD hh:mm:ss') {
	if (!time) return '';
	const date = new Date(time);
	const year = date.getFullYear(),
		month = date.getMonth() + 1, //月份是从0开始的
		day = date.getDate(),
		hour = date.getHours(),
		min = date.getMinutes(),
		sec = date.getSeconds();
	// eslint-disable-next-line prefer-spread
	const preArr = Array.apply(null, Array(10)).map(function (elem, index) {
		return '0' + index;
	}); ////开个长度为10的数组 格式为 00 01 02 03

	const newTime = format
		.replace(/YY/g, year.toString())
		.replace(/MM/g, preArr[month] || month.toString())
		.replace(/DD/g, preArr[day] || day.toString())
		.replace(/hh/g, preArr[hour] || hour.toString())
		.replace(/mm/g, preArr[min] || min.toString())
		.replace(/ss/g, preArr[sec] || sec.toString());

	return newTime;
}
export function compaireTime(startDate: any, endDate: any = new Date()) {
	const time = new Date(endDate).getTime() - new Date(startDate).getTime();
	//计算出相差天数
	const days = Math.floor(time / (24 * 3600 * 1000));
	//计算出小时数
	const leave1 = time % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
	const hours = Math.floor(leave1 / (3600 * 1000));
	//计算相差分钟数
	const leave2 = leave1 % (3600 * 1000); //计算小时数后剩余的毫秒数
	const minutes = Math.floor(leave2 / (60 * 1000));
	//计算相差秒数
	const leave3 = leave2 % (60 * 1000); //计算分钟数后剩余的毫秒数
	const seconds = Math.round(leave3 / 1000);

	let str = '';
	if (days) {
		str += days + '天 ';
	}
	if (hours) {
		str += hours + '小时 ';
	}
	if (minutes) {
		str += minutes + ' 分钟';
	}
	if (seconds) {
		str += seconds + ' 秒';
	}
	return str;
}
