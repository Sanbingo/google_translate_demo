const koa=require("koa")
const Router=require('koa-router')
const koaBody = require('koa-body')
const trans = require('translation.js')

const router=new Router()
const app=new koa()

const googleApi = (value) => {
  return new Promise((resolve, reject) => {
    trans.google.translate(value).then(result => {
      resolve(result)
    }).catch(err => {
      reject(err)
    })
  })
}

//koa-body
app.use(koaBody())


// Post
router.post('/translate',async (ctx,next)=>{
    console.log('translate starting!')
    //ctx.request.body 用于获取post的参数
    const { title, content } =ctx.request.body;
    const titleReq = googleApi(title)
    const contentArr = content.split('\r\n');
    const contentArrReq = contentArr.filter(item => !!item).map(item => googleApi(item))
    const result = await Promise.all([titleReq, ...contentArrReq]).then(([titleRes, ...contentRes]) => {
      return ({
        status: 0,
        data: {
          title: titleRes && titleRes.result && titleRes.result[0],
          content: contentRes && contentRes.map(item => item.result && item.result.join(''))
        }
      })
    }).catch((err) => {
      return ({
        status: 1002,
        data: err
      })
    })
    console.log('result', result)
    ctx.body = result;
})


// GET
router.get('/user',async (ctx,next)=>{
    console.log('user Ok!')
    //crx.query 是用于获取get请求的参数
    ctx.body=ctx.query;
})


//koa-router
app.use(router.routes()).use(router.allowedMethods());

app.listen(3333,function(){
    console.log('启动成功');
})
