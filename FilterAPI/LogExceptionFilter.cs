using Microsoft.AspNetCore.Mvc.Filters;

namespace FilterAPI
{
    public class LogExceptionFilter : IAsyncExceptionFilter
    {
        public Task OnExceptionAsync(ExceptionContext context)
        {
            string message = context.Exception.ToString();
            System.IO.File.AppendAllTextAsync("log.txt",message);
            return Task.FromResult(message);
        }
    }
}
