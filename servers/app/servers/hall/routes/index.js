module.exports = (router) => {
    router.get('/', async (ctx) => {
		ctx.redirect('admin/pages-signin.html');
    });
};