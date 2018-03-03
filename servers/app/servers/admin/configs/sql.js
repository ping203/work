module.exports =
{
    // 管理员使用用户名登录
    getAccountByUname: "select * from tbl_admin_user where uname=?",
    // 查询特殊角色的管理员
    getAccountByRole: "select * from tbl_admin_user where role=?",
};