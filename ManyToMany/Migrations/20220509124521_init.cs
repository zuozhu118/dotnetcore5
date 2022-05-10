using Microsoft.EntityFrameworkCore.Migrations;

namespace ManyToMany.Migrations
{
    public partial class init : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "t_student",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    sname = table.Column<string>(type: "nvarchar(20)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_t_student", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "t_teacher",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    tname = table.Column<string>(type: "nvarchar(20)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_t_teacher", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "t_teacher_student",
                columns: table => new
                {
                    _studentid = table.Column<long>(type: "bigint", nullable: false),
                    _teacherid = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_t_teacher_student", x => new { x._studentid, x._teacherid });
                    table.ForeignKey(
                        name: "FK_t_teacher_student_t_student__studentid",
                        column: x => x._studentid,
                        principalTable: "t_student",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_t_teacher_student_t_teacher__teacherid",
                        column: x => x._teacherid,
                        principalTable: "t_teacher",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_t_teacher_student__teacherid",
                table: "t_teacher_student",
                column: "_teacherid");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "t_teacher_student");

            migrationBuilder.DropTable(
                name: "t_student");

            migrationBuilder.DropTable(
                name: "t_teacher");
        }
    }
}
