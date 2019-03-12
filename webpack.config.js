/*
题外：webpack-dev-middleware 的好处是可以在既有的 Express 代码基础上快速添加 webpack-dev-server 的功能，同时利用 Express 来根据需要添加更多的功能，如 mock 服务、代理 API 请求等。
需要 CSS Sprites 的话，可以使用 webpack-spritesmith 或者 sprite-webpack-plugin。
*/
/**
    生产环境可能需要分离 CSS 成单独的文件，以便多个页面共享同一个 CSS 文件
    生产环境需要压缩 HTML/CSS/JS 代码
    生产环境需要压缩图片
    -----------------------------------------
    开发环境需要生成 sourcemap 文件
    开发环境需要打印 debug 信息
    开发环境需要 live reload 或者 hot reload 的功能
 */
/**
 * HMR 提高开发效率(模块热替换)可以理解为增强版的 Hot Reloading
 * 不用整个页面刷新，而是局部替换掉部分模块代码并且使其生效
 * HMR 既避免了频繁手动刷新页面，也减少了页面刷新时的等待，可以极大地提高前端页面开发效率。
 * 
 */
/**
 * 3.x 以前的版本是使用 CommonsChunkPlugin 来做代码分离的,
 * 而 webpack 4.x 则是把相关的功能包到了 optimize.splitChunks 中，直接使用该配置就可以实现代码分离。
 */
const path = require('path');
const cleanWebpack = require('clean-webpack-plugin')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
/*
会在构建的时候创建一个HTML，实际没啥用。自己写个模板比较好
为html文件中引入的外部资源如script、link动态添加每次compile后的hash，防止引用缓存的外部文件问题
以生成创建html入口文件，比如单页面可以生成一个html文件入口，配置N个html-webpack-plugin可以生成N个页面入口
*/
const htmlwebpack = require('html-webpack-plugin')

//经由上述两个style-loader css-loader 的处理后，CSS 代码会转变为 JS，和 index.js 一起打包了。如果需要单独把 CSS 文件分离出来
const extractText = require('extract-text-webpack-plugin')

//webpack4可以定制导出一个函数，webpack4区分环境变量argv.mode
//webpack3 "build": "NODE_ENV=production webpack",process.env.NODE_ENV
module.exports = (env, argv)=> {
    console.log(env,argv)
    return {
    optimization: {
        splitChunks: {
        //chunks: "all", // 所有的 chunks 代码公共的部分分离出来成为一个单独的文件
        cacheGroups: {
         vendor: {
            chunks: "initial",
            test: "vendor",
            name: "vendor", // 使用 vendor 入口作为公共部分
            enforce: true,
            //test: /react|angluar|lodash/, // 直接使用 test 来做路径匹配,就不用再入口文件上加配置
            //test: path.resolve(__dirname, "node_modules") // 路径在 node_modules 目录下的都作为公共部分
          },
        }},
    },
    entry:  {
        main1: './src/index.js',
        vendor: ["react", "lodash", "angular"], // 指定公共使用的第三方类库
        //main2: './src/index2.js'
    },
    output: {
        filename: '[name].js',
        path: __dirname + '/dist',
        //打包的过程中存入临时文件夹，用于热更新还可以处理静态文件的路径如生产环境中css抽离后，css引用的图片路径出错
        publicPath: ''
    },
    resolve: {
        modules: [  //import ‘ad’导入模块的时候先去node_modules下找，找不到去src/components找
            "node_modules",
            path.resolve(__dirname, 'src/components')
        ],  
        extensions: [".wasm", ".mjs", ".js", ".json", ".jsx"],
        alias:{
            //'react$': '/path/to/react.min.js'//以react结尾的,模糊匹配
          },
        //package.json 的话，你也许会发现 browser 或者 module 等字段的声明
        /* 
        解析相对路径:
            查找相对当前模块的路径下是否有对应文件或文件夹
            是文件则直接加载
            是文件夹则继续查找文件夹下的 package.json 文件
            有 package.json 文件则按照文件中 main 字段的文件名来查找文件
            无 package.json 或者无 main 字段则查找 index.js 文件
         */
        mainFields:['browser', 'module', 'main']//在 NPM packages 中,提供了两个实现，分别给浏览器和 Node.js 两个不同的运行时使用
    },
    module: {
        noParse: /jquery|lodash/, // 正则表达式，noParse 进行忽略的模块文件中不能使用 import、require、define 等导入机制。
        rules: [
            /* {
              enforce: "pre",// 指定为前置类型,post为后置类型，eslint-loader 要检查的是人工编写的代码，在babel之前
              test: /\.jsx?/,// 支持 js 和 jsx
              include: [
                path.resolve(__dirname, 'src')
              ],
              use: 'eslint-loader',
            }, */
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader",
            },
            {
                test: /\.less$/,
                include: [
                  path.resolve(__dirname, 'src'),
                ],
                /* use: [
                  'style-loader',//会将 css-loader 解析的结果转变成 JS 代码，运行时动态插入 style 标签来让 CSS 代码生效。
                  'css-loader',//主要是为了处理 CSS 中的依赖，例如 @import 和 url() 等引用外部文件的声明，但是后缀名是处理不了的需要file-loader
                ] */
                use: extractText.extract({
                    fallback: 'style-loader',//编译后用什么loader来提取css文件
                    use: [{
                        loader: 'css-loader',
                       /*  options:{
                            minimize: true, // 使用 css 的压缩功能(cssnano 官方文档)
                        } */
                    }, 'less-loader']//指需要什么样的loader去编译文件(less-loader要附带安装less)
                })
              },
            {
                test: /\.(png|jpg|gif|jpeg)$/,
                use: [
                  {
                    loader: 'file-loader',//主要作用是直接输出文件。把构建后的文件按原路径返回
                    options: {
                        name: '[folder]/[name][hash].[ext]',//[path]是包括src的文件路径folder是image的路径。string/function
                        //outputPath: 'image', //输出到image的文件夹string/function
                    },
                    
                  },
                  {
                    //压缩了，占大头的图片
                    loader: 'image-webpack-loader',
                    options: {
                      mozjpeg: { // 压缩 jpeg 的配置
                        progressive: true,
                        quality: 65
                      },
                      optipng: { // 使用 imagemin-optipng 压缩 png，enable: false 为关闭
                        enabled: false,
                      },
                      pngquant: { // 使用 imagemin-pngquant 压缩 png
                        quality: '65-90',
                        speed: 4
                      },
                      gifsicle: { // 压缩 gif 的配置
                        interlaced: false,
                      },
                      webp: { // 开启 webp，会把 jpg 和 png 图片压缩为 webp 格式
                        quality: 75
                      },
                  }
                    },
                    {
                        loader: 'url-loader',//url-loader 和 file-loader 的功能类似，但是在处理文件的时候，可以通过配置指定一个大小，当文件小于这个配置值时，url-loader 会将其转换为一个 base64 编码的 DataURL
                        options: {
                          limit: 8192, // 单位是 Byte，当文件小于 8KB 时作为 DataURL 处理
                        },
                      }
                ]
            }
          ]
    },
    plugins:[
        new htmlwebpack({
            filename: 'index.html',// 配置输出文件名和路径
            template: 'assets/index.html',// 配置文件模板
            minify: { // 压缩 HTML 的配置,只能移除空格换行等无用字符,(配置项参考 html-minifie)
                minifyCSS: true, // 压缩 HTML 中出现的 CSS 代码
                minifyJS: true // 压缩 HTML 中出现的 JS 代码
              }
        }),
        new extractText('[name][hash].css'),//name是JS的入口名
       // new cleanWebpack()
       new webpack.DefinePlugin({//创建一些在编译时可以配置的全局常量(和window同级)
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        PRODUCTION: JSON.stringify(true), // const PRODUCTION = true
        VERSION: JSON.stringify('5fa3b9'), // const VERSION = '5fa3b9'
        BROWSER_SUPPORTS_HTML5: true, // const BROWSER_SUPPORTS_HTML5 = 'true'
        TWO: '1+1', // const TWO = 1 + 1,
        CONSTANTS: {
          APP_VERSION: JSON.stringify('1.1.2') // const CONSTANTS = { APP_VERSION: '1.1.2' }
        }
      }),
      new CopyWebpackPlugin([
        { from: 'src/lss.text', to: 'build/lss.text', }, // 顾名思义，from 配置来源，to 配置目标路径
        { from: 'src/*.ico', to: 'build/*.ico' }, // 配置项可以使用 glob
        // 可以配置很多项复制规则
      ]),
      //加载模块，而不必到处 import 或 require,
      new webpack.ProvidePlugin({
        react: "react",//任何时候，当 react 被当作未赋值的变量时，react 就会自动被加载
        identifier: ['react', 'Component'] //类似 import { Component as identifier } from 'react'

        // ...
      }),
      //忽略某些特定的模块，让 webpack 不把这些指定的模块打包进去。例如我们使用 moment.js，直接引用后，里边有大量的 i18n 的代码
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),//是匹配引入模块路径的正则表达式，第二个是匹配模块的对应上下文，即所在目录名。
      //new webpack.NamedModulesPlugin(), // 用于启动 HMR 时可以显示模块的相对路径
      //new webpack.HotModuleReplacementPlugin(), // Hot Module Replacement 的插件
      // webpack 3.x 中如何配置代码分离
      new webpack.optimize.CommonsChunkPlugin({
        /* name: "commons", // 公共使用的 chunk 的名称
        filename: "commons.js", // 公共 chunk 的生成文件名
        minChunks: 3, // 公共的部分必须被 3 个 chunk 共享 */
        name: 'vendor', // 使用 vendor 入口作为公共部分
        filename: "vendor.js", 
        //如果这里和之前一样依旧设置为 3，那么被 3 个以上的 chunk 依赖的模块会和 React、React-Redux 一同打包进 vendor,失去显式指定的意义
        minChunks: Infinity, //fn/STRING 无穷大 这个配置会让 webpack 不再自动抽离公共模块
      })
    ],
    devServer: {
        contentBase: path.join(__dirname, 'dist'),//配置提供额外静态文件内容的目录
        hot: true, // dev server 的配置要启动 hot，或者在命令行中带参数开启//启用 HMR 
        compress: true,//gzip压缩
        port: 9000,//默认是 8080
        publicPath:'',//建议将 devServer.publicPath 和 output.publicPath 的值保持一致。
        before: function(app, server) {
            // 做些有趣的事
            app.get('/some/path', function(req, res) { // 当访问 /some/path 路径时，返回自定义的 json 数据
                res.json({ custom: 'response' })
            })
          },
        allowedHosts: ['host.com'],//允许一些开发服务器访问,
        proxy: {
            '/api': {
              target: "http://localhost:3000", // 将 URL 中带有 /api 的请求代理到本地的 3000 端口的服务上
              pathRewrite: { '^/api': '' }, // 把 URL 中 path 部分的 `api` 移除掉
            },
          }
    }
}}