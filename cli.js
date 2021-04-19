#! /usr/bin/env node
/**
 * 发布 npm publish --access=public
 */
const fs = require("fs");
const path = require("path");
const colors = require("colors-console");
const util = require("./util");
const inquirer = require('inquirer');

const promptList = [
    {
        type: 'input',
        message: '请输入你的应用名称(name):',
        name: 'name',
        default: "app" // 默认值
    },
    {
        type: 'input',
        message: '请输入你的应用版本(version):',
        name: 'version',
        default: "1.0.0" // 默认值
    },
    {
        type: 'input',
        message: '请输入你的应用描述(description):',
        name: 'description',
        default: "" // 默认值
    }
];

// 基本问询信息搜集
inquirer.prompt(promptList).then((answers) => {
    let source = path.join(__dirname, "./lib");
    let target = process.cwd();

    // 将搜集的信息同步到lib/package.json
    let packageData = JSON.parse(fs.readFileSync(`${source}/package.json`).toString());
    for (let k in answers) {
        packageData[k] = answers[k];
    }
    // 此种写法 可以格式化json，不然writeFile后是一行展示 很丑
    packageData = JSON.stringify(packageData, '', '\t');
    fs.writeFileSync(`${source}/package.json`, packageData, 'utf8');

    // 判断命令行内是否存在create 不存在 则直接报错
    if (process.argv.indexOf("create") == -1) {
        console.error("未检测到create指令");
        process.exit(0);
    }

    let projectName = process.argv[process.argv.length - 1];
    let targetRoot = `${target}/${projectName}`;
    let has = fs.existsSync(targetRoot);
    // 获取lib下所有文件名，并将结果储存到global.allFilesList下面
    util.readDir(source);
    let startCopy = () => {
        // 将lib中的脚手架模板copy至目标文件夹下
        console.log(colors('green', `>>>>>>>>>>>>>>> 开始初始化模板 请稍等 <<<<<<<<<<<<<`));
        util.copyDir(source, targetRoot);
    }

    if (!has) {
        fs.mkdir(targetRoot, (err) => {
            startCopy()
        });
    } else {
        fs.rmdir(targetRoot, () => {
            startCopy();
        });
    }
});