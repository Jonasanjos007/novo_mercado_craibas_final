using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mercado.Craibas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class BannerSite : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Banner",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Imagem = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Link = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Ordem = table.Column<int>(type: "int", nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false),
                    Data_Inicio = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Data_Fim = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Id_User_Admin = table.Column<int>(type: "int", nullable: true),
                    InsertDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdateDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Isdelete = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Banner", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Banner_Ativo",
                table: "Banner",
                column: "Ativo");

            migrationBuilder.CreateIndex(
                name: "IX_Banner_Ordem",
                table: "Banner",
                column: "Ordem");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Banner");
        }
    }
}
