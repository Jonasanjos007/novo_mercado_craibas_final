using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mercado.Craibas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FinancasDespesaCusto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Preco_Custo",
                table: "Product",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Custo_Unitario",
                table: "OrderLineItens",
                type: "float",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Despesa",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Descricao = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Valor = table.Column<double>(type: "float", nullable: false),
                    Categoria = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Data = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Id_User_Admin = table.Column<int>(type: "int", nullable: true),
                    InsertDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdateDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Isdelete = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Despesa", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Despesa_Categoria",
                table: "Despesa",
                column: "Categoria");

            migrationBuilder.CreateIndex(
                name: "IX_Despesa_Data",
                table: "Despesa",
                column: "Data");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Despesa");

            migrationBuilder.DropColumn(
                name: "Preco_Custo",
                table: "Product");

            migrationBuilder.DropColumn(
                name: "Custo_Unitario",
                table: "OrderLineItens");
        }
    }
}
