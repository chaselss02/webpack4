import './index.less';
import './image/hello.jpeg';
import './image/hello.1.jpeg';
import printMe from './index2';

import(/* webpackChunkName: "lodash" */ 'lodash').then((_) => { 
  console.log(_.lash([1, 2, 3])) // 打印 3
})
console.log('再度修行')
console.log("Running App version ", VERSION, PRODUCTION, process.env.NODE_ENV);
//webpack4中已经将process.env.NODE_ENV作为全局变量导入
function log(...args) {
    if (process.env.NODE_ENV === 'development' && console && console.log) {
      console.log.apply(console, args)
    }
  }
console.log('成神之路', react, identifier)

//开启HRM以后，会暴露module.hot模块，需要手动去刷新printME()
if (module.hot) {
  module.hot.accept('./index2.js', function() { //告诉 webpack 接受热替换的模块
      console.log('Accepting the updated printMe module!');
      printMe();
  })
}
