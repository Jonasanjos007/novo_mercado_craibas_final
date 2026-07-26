using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mercado.Craibas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class campoIsDeleteNunique2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Coupon_Product_Id_Cupom_Id_Product",
                table: "Coupon_Product");

            migrationBuilder.CreateIndex(
                name: "IX_Coupon_Product_Id_Cupom",
                table: "Coupon_Product",
                column: "Id_Cupom");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Coupon_Product_Id_Cupom",
                table: "Coupon_Product");

            migrationBuilder.CreateIndex(
                name: "IX_Coupon_Product_Id_Cupom_Id_Product",
                table: "Coupon_Product",
                columns: new[] { "Id_Cupom", "Id_Product" },
                unique: true);
        }
    }
}
