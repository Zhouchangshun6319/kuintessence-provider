import * as streamSaver from 'streamsaver';

export function formatSize(size: number | string): string {
	size = Number(size);
	if (!size) return '0B';
	const kb = 1024;
	const unit = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	const i = Math.floor(Math.log(size) / Math.log(kb));
	return (size / Math.pow(kb, i)).toFixed(2) + ' ' + unit[i];
}
// 下载文件并重命名
export function downLoadFile(file: { fileName: string; url: string }) {
	const fileStream = streamSaver.createWriteStream(file.fileName);
	const writer = fileStream.getWriter();
	fetch(file.url, {
		method: 'GET',
		mode: 'cors',
	}).then((res) => {
		const readableStream = res.body;

		const reader = readableStream?.getReader();
		const pump: any = () => reader?.read().then((res) => (res.done ? writer.close() : writer.write(res.value).then(pump)));

		pump();
	});
}
