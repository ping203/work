
const logicResponse = require('../../../common/logicResponse');

// 登录页面
module.exports.pages_signin = async function(data){
    return logicResponse.askEjs('admin/pages-signin', {title: "Admin Signin"});
}
