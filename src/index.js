import './index.less';
import './image/hello.jpeg';
console.log('再度修e行')
console.log("Running App version ", VERSION, PRODUCTION, process.env.NODE_ENV);
//webpack4中已经将process.env.NODE_ENV作为全局变量导入
function log(...args) {
    if (process.env.NODE_ENV === 'development' && console && console.log) {
      console.log.apply(console, args)
    }
  }
console.log('成神之路', react, identifier)