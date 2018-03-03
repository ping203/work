module.exports = (router)=>{
    router.prefix('/test');

    router.get('/', async (ctx)=>{
		await ctx.render('index', {
			title: 'Hello Koa 2!'
		});
    });

    router.get('/string', async (ctx)=>{
		'Hello Koa 2!';
	});
	
	router.post('/json', async (ctx) => {
		ctx.body = {
			title: 'koa2 json'
		};
	});
};