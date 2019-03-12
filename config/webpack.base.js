module.exports = {
    entry: '...',
    output: {
      // ...
    },
    resolve: {
      // ...
    },
    module: {
      // 这里是一个简单的例子，后面介绍 API 时会用到
      rules: [
        {
          test: /\.js$/, 
          use: ['babel'],
        },
      ],
      // ...
    },
    plugins: [
      // ...
    ],
}