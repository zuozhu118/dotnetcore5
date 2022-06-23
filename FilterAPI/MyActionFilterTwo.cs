using Microsoft.AspNetCore.Mvc.Filters;

namespace FilterAPI
{
    public class MyActionFilterTwo : IAsyncActionFilter
    {
        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            Console.WriteLine("这行代码会在要执行的方法之前执行！222");
            ActionExecutedContext result = await next();
            if (result.Exception != null)
            {
                Console.WriteLine("执行的Action方法发生了异常！");
            }
            else
            {
                Console.WriteLine("这是在Action方法之后执行的代码！222");
            }
        }
    }
}
