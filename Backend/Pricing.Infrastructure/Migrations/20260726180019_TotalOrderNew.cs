using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mercado.Craibas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class TotalOrderNew : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Coupon_Use_Cupom_Id_Cupom",
                table: "Coupon_Use");

            migrationBuilder.AddColumn<double>(
                name: "Total_Value_OrderCupom",
                table: "Orders",
                type: "float",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Id_Cupom",
                table: "Coupon_Use",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddForeignKey(
                name: "FK_Coupon_Use_Cupom_Id_Cupom",
                table: "Coupon_Use",
                column: "Id_Cupom",
                principalTable: "Cupom",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Coupon_Use_Cupom_Id_Cupom",
                table: "Coupon_Use");

            migrationBuilder.DropColumn(
                name: "Total_Value_OrderCupom",
                table: "Orders");

            migrationBuilder.AlterColumn<int>(
                name: "Id_Cupom",
                table: "Coupon_Use",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Coupon_Use_Cupom_Id_Cupom",
                table: "Coupon_Use",
                column: "Id_Cupom",
                principalTable: "Cupom",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
