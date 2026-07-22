using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mercado.Craibas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class campoIsDeleteNunique : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Coupon_Category_Id_Cupom_Id_Category",
                table: "Coupon_Category");

            migrationBuilder.CreateIndex(
                name: "IX_Coupon_Category_Id_Cupom",
                table: "Coupon_Category",
                column: "Id_Cupom");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Coupon_Category_Id_Cupom",
                table: "Coupon_Category");

            migrationBuilder.CreateIndex(
                name: "IX_Coupon_Category_Id_Cupom_Id_Category",
                table: "Coupon_Category",
                columns: new[] { "Id_Cupom", "Id_Category" },
                unique: true);
        }
    }
}
