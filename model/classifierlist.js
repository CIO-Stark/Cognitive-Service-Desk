var classifierslist=[{},{}];

module.exports = function ( ) {
      return {
        "get":function (){
              return classifierslist
        },
        "set":function (index, value) {
               classifierslist [index]=value
        }
      }
}
