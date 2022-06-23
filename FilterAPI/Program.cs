using FilterAPI;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);



builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//ע��filter��
builder.Services.Configure<MvcOptions>(a =>
{
    //ע��ExceptionFilter:
    //filterע��˳�����й�ϵ�ģ���ע�����ִ�У�LogExceptionFilter����MyExceptionFilter���������MyExceptionFilterִ�У�
    a.Filters.Add<MyExceptionFilter>();
    a.Filters.Add<LogExceptionFilter>();

    //ע��ActionFilter��
    a.Filters.Add<MyActionFilter>();
    a.Filters.Add<MyActionFilterTwo>();

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
