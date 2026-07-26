using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mercado.Craibas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class IdCupomCart : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CupomId",
                table: "Cart",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Id_Cupom",
                table: "Cart",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Cart_CupomId",
                table: "Cart",
                column: "CupomId");

            migrationBuilder.AddForeignKey(
                name: "FK_Cart_Cupom_CupomId",
                table: "Cart",
                column: "CupomId",
                principalTable: "Cupom",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Cart_Cupom_CupomId",
                table: "Cart");

            migrationBuilder.DropIndex(
                name: "IX_Cart_CupomId",
                table: "Cart");

            migrationBuilder.DropColumn(
                name: "CupomId",
                table: "Cart");

            migrationBuilder.DropColumn(
                name: "Id_Cupom",
                table: "Cart");
        }
    }
}
