using FilterAPI;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);



builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//注入filter：
builder.Services.Configure<MvcOptions>(a =>
{
    //注入ExceptionFilter:
    //ExceptionFilter执行顺序是后注入的先执行，先注入的后执行；
    //filter注入顺序是有关系的，后注入的先执行，LogExceptionFilter放在MyExceptionFilter后面会先于MyExceptionFilter执行；
    a.Filters.Add<MyExceptionFilter>();
    a.Filters.Add<LogExceptionFilter>();

    //注入ActionFilter：ActionFilter是先注入的先执行，后注入的后执行；
    a.Filters.Add<MyActionFilterTwo>();
    a.Filters.Add<MyActionFilter>();
    

});




var app = builder.Build();


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
