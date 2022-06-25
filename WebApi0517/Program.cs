using WebApi0517;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddControllers();

//依赖注入：
builder.Services.AddScoped<TestService>();



builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//-----------解决跨域请求---开始   115讲--------------：

//http://loaclhost:3000 是允许跨域来访问我们后端服务器的地址，即允许访问的白名单；
string[] urls = { "http://loaclhost:3000" };


builder.Services.AddCors(a => 
     a.AddDefaultPolicy(b =>

        b.WithOrigins(urls).
        AllowAnyMethod().//允许任意类型的请求方式，get,post;
        AllowAnyHeader().
        AllowCredentials()


));


//-----------解决跨域请求---结束--------------：



var app = builder.Build();


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//解决跨域请求，在app.UseHttpsRedirection前再加上app.UseCors()这句代码：
app.UseCors();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
