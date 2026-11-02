using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mercado.Craibas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class VarianteAtributosCombinacao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Needs_Variant_Review",
                table: "Product",
                type: "bit",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Variante_Atributos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Id_Variante = table.Column<int>(type: "int", nullable: false),
                    Eixo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Valor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    InsertDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdateDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Isdelete = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Variante_Atributos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Variante_Atributos_Variante_Products_Id_Variante",
                        column: x => x.Id_Variante,
                        principalTable: "Variante_Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Variante_Atributos_Id_Variante",
                table: "Variante_Atributos",
                column: "Id_Variante");

            // Backfill: cada variação atual vira um SKU de 1 eixo (atributo Eixo=Name, Valor=Value).
            migrationBuilder.Sql(@"
                INSERT INTO Variante_Atributos (Id_Variante, Eixo, Valor, InsertDate, Isdelete)
                SELECT v.Id, v.Name, v.Value, GETDATE(), 0
                FROM Variante_Products v
                WHERE (v.Isdelete IS NULL OR v.Isdelete = 0);");

            // Produtos com mais de um eixo (Name distinto) no modelo antigo:
            // marca para o admin recadastrar as combinações corretas.
            migrationBuilder.Sql(@"
                UPDATE p SET Needs_Variant_Review = 1
                FROM Product p
                WHERE (
                    SELECT COUNT(DISTINCT v.Name)
                    FROM Variante_Products v
                    WHERE v.Id_Product = p.Id AND (v.Isdelete IS NULL OR v.Isdelete = 0)
                ) > 1;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Variante_Atributos");

            migrationBuilder.DropColumn(
                name: "Needs_Variant_Review",
                table: "Product");
        }
    }
}
