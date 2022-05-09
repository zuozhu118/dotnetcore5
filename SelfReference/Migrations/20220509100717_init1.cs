using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace SelfReference.Migrations
{
    public partial class init1 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "t_province_city",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    name = table.Column<string>(type: "nvarchar(20)", nullable: true),
                    parentid = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_t_province_city", x => x.id);
                    table.ForeignKey(
                        name: "FK_t_province_city_t_province_city_parentid",
                        column: x => x.parentid,
                        principalTable: "t_province_city",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_t_province_city_parentid",
                table: "t_province_city",
                column: "parentid");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "t_province_city");
        }
    }
}
