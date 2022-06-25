using WebApi0517;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddControllers();

//����ע�룺
builder.Services.AddScoped<TestService>();



builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//-----------�����������---��ʼ   115��--------------��

//http://loaclhost:3000 ������������������Ǻ�˷������ĵ�ַ����������ʵİ�������
string[] urls = { "http://loaclhost:3000" };


builder.Services.AddCors(a => 
     a.AddDefaultPolicy(b =>

        b.WithOrigins(urls).
        AllowAnyMethod().//�����������͵�����ʽ��get,post;
        AllowAnyHeader().
        AllowCredentials()


));


//-----------�����������---����--------------��



var app = builder.Build();


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//�������������app.UseHttpsRedirectionǰ�ټ���app.UseCors()�����룺
app.UseCors();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
