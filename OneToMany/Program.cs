using System;

/// <summary>
/// 一对多的表关系
/// </summary>
namespace OneToMany
{
    class Program
    {
        static void Main(string[] args)
        {
            using (DataBase db=new DataBase())
            {
                article article = new article();
                article.title = "十万个为什么";
                article.isdisabled = true;
                article.createby = "admin";
                article.createtime = DateTime.Now;

                comment comment1 = new comment();
                comment1.userid = "aaa";
                comment1.user_comments = "什么乱七八糟的";
                comment1.pubdate = DateTime.Now;
                comment1._article = article;
                

                comment comment2 = new comment();
                comment2.userid = "bbb";
                comment2.user_comments = "一般般吧";
                comment2.pubdate = DateTime.Now;
                comment2._article = article;

                db.comment.Add(comment1);
                db.comment.Add(comment2);

                db.SaveChanges();
            }
        }
    }
}
