using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace FilterAPI
{
    public class MyExceptionFilter : IAsyncExceptionFilter
    {
        public Task OnExceptionAsync(ExceptionContext context)
        {
            //context.Result的值会被输出到客户端；
            //context.Exception表示报错的异常信息对象；
            //如果给context.ExceptionHandled赋值为true,则定义的其他ExceptionFilter不会再执行异常捕获；

            string strmsg=context.Exception.ToString();
            ObjectResult obj = new ObjectResult(new {code=500,mymessage="服务器异常！！！" }) ;
            context.Result = obj;
            //context.ExceptionHandled = true;
            return Task.CompletedTask;
        }
    }
}
