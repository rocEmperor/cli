const fs = require('fs');
const path = require('path');
const colors = require('colors-console');

// 储存从lib已经成功copy的文件储量
let writeCount = 0;

// 储存当前lib下所有文件名
global.allFilesList = [];
const readDir = (entry) => {
	const dirInfo = fs.readdirSync(entry);
	dirInfo.forEach(item=>{
		const location = path.join(entry,item);
		const info = fs.statSync(location);
		if (info.isDirectory()) {
			readDir(location);
		} else {
			global.allFilesList.push(location);
		}
	})
}

/**
 * 允许被复制的文件后缀列表
 * @type {string[]}
 */
const copyExt = ['.html', '.php', '.js', '.scss', '.ts', '.tsx', '.jpg', '.png', '.jpeg'];

/**
 * 在复制目录前需要判断该目录是否存在，
 * 不存在需要先创建目录
 * @param src
 * @param dst
 * @param callback
 */
const exists = function (src, dst, callback) {
    // 如果路径存在，则返回 true，否则返回 false。
    if (fs.existsSync(dst)) {
        callback(src, dst);
    } else {
        fs.mkdir(dst, function () {
            callback(src, dst);
        });
    }
};

/**
 * 判断数组中的元素是否包含此字符串
 * @param arr
 * @param obj
 * @returns {boolean}
 */
const contains = function (arr, obj) {
    let flag = false;
    arr.map((val) => {
        if (obj.includes(val)) {
            flag = true;
        }
    });
    return flag;
};

/**
 * 复制一个文件夹下的文件到另一个文件夹
 * @param src 源文件夹
 * @param dst 目标文件夹
 */
const copyDir = function (src, dst) {
    // 读取目录中的所有文件/目录
    fs.readdir(src, function (err, paths) {
        if (err) {
            throw err;
        }
        paths.forEach(function (path) {
            const _src = `${src}/${path}`;
            const _dst = `${dst}/${path}`;
            let readable;
            let writable;
            fs.stat(_src, function (err, st) {
                if (err) {
                    throw err;
                }
                // 判断是否为文件
                if (st.isFile()) {
                    // 允许的后缀才可以被复制
                    if (contains(copyExt, _src)) {
                        // 创建读取流
                        readable = fs.createReadStream(_src);
                        // 创建写入流
                        writable = fs.createWriteStream(_dst);
                        // 通过管道来传输流
                        readable.pipe(writable);
                        // 终端输出信息
                        console.log(colors('cyan', `create >>>>>>> ${_dst}`));
                        writeCount += 1;
                        if (writeCount == global.allFilesList.length) {
                            writeCount = 1;
                            console.log(colors('green', `>>>>>>>>>>>>>>> 模板初始化完成 请开始你的表演 <<<<<<<<<<<<<`));
                        }
                    } else {
                        // console.log(_src + ' 不允许被复制!!!')
                    }
                }
                // 如果是目录则递归调用自身
                else if (st.isDirectory()) {
                    exists(_src, _dst, copyDir);
                }
            });
        });
    });
};

module.exports = {
    copyDir: copyDir,
    readDir: readDir,
};
