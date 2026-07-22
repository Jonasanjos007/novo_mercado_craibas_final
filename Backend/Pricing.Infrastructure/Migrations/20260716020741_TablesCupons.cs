using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mercado.Craibas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class TablesCupons : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Discont",
                table: "Cupom");

            migrationBuilder.RenameColumn(
                name: "Date_end",
                table: "Cupom",
                newName: "Date_End");

            migrationBuilder.RenameColumn(
                name: "Descriotion",
                table: "Cupom",
                newName: "Description");

            migrationBuilder.AlterColumn<bool>(
                name: "Ativo",
                table: "Product",
                type: "bit",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<decimal>(
                name: "Minimum_Value",
                table: "Cupom",
                type: "decimal(18,2)",
                nullable: true,
                oldClrType: typeof(double),
                oldType: "float",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date_End",
                table: "Cupom",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date_Start",
                table: "Cupom",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Cod_Cupom",
                table: "Cupom",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<decimal>(
                name: "Discount",
                table: "Cupom",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "Discount_Type",
                table: "Cupom",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "First_Order_Only",
                table: "Cupom",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "Maximum_Discount",
                table: "Cupom",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Per_User_Limit",
                table: "Cupom",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Quantity_Used",
                table: "Cupom",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Quantity_Uses",
                table: "Cupom",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Coupon_Category",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Id_Cupom = table.Column<int>(type: "int", nullable: false),
                    Id_Category = table.Column<int>(type: "int", nullable: false),
                    InsertDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdateDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Coupon_Category", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Coupon_Category_Cupom_Id_Cupom",
                        column: x => x.Id_Cupom,
                        principalTable: "Cupom",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Coupon_Category_Product_Category_Id_Category",
                        column: x => x.Id_Category,
                        principalTable: "Product_Category",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Coupon_Product",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Id_Cupom = table.Column<int>(type: "int", nullable: false),
                    Id_Product = table.Column<int>(type: "int", nullable: false),
                    InsertDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdateDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Coupon_Product", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Coupon_Product_Cupom_Id_Cupom",
                        column: x => x.Id_Cupom,
                        principalTable: "Cupom",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Coupon_Product_Product_Id_Product",
                        column: x => x.Id_Product,
                        principalTable: "Product",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Coupon_Use",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Id_Cupom = table.Column<int>(type: "int", nullable: false),
                    Id_Order = table.Column<int>(type: "int", nullable: false),
                    Id_User = table.Column<int>(type: "int", nullable: false),
                    Discount_Value = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    InsertDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdateDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Coupon_Use", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Coupon_Use_Cupom_Id_Cupom",
                        column: x => x.Id_Cupom,
                        principalTable: "Cupom",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Coupon_Use_Orders_Id_Order",
                        column: x => x.Id_Order,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Coupon_Use_User_Customer_Id_User",
                        column: x => x.Id_User,
                        principalTable: "User_Customer",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Cupom_Cod_Cupom",
                table: "Cupom",
                column: "Cod_Cupom",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Coupon_Category_Id_Category",
                table: "Coupon_Category",
                column: "Id_Category");

            migrationBuilder.CreateIndex(
                name: "IX_Coupon_Category_Id_Cupom_Id_Category",
                table: "Coupon_Category",
                columns: new[] { "Id_Cupom", "Id_Category" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Coupon_Product_Id_Cupom_Id_Product",
                table: "Coupon_Product",
                columns: new[] { "Id_Cupom", "Id_Product" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Coupon_Product_Id_Product",
                table: "Coupon_Product",
                column: "Id_Product");

            migrationBuilder.CreateIndex(
                name: "IX_Coupon_Use_Id_Cupom",
                table: "Coupon_Use",
                column: "Id_Cupom");

            migrationBuilder.CreateIndex(
                name: "IX_Coupon_Use_Id_Order",
                table: "Coupon_Use",
                column: "Id_Order");

            migrationBuilder.CreateIndex(
                name: "IX_Coupon_Use_Id_User",
                table: "Coupon_Use",
                column: "Id_User");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Coupon_Category");

            migrationBuilder.DropTable(
                name: "Coupon_Product");

            migrationBuilder.DropTable(
                name: "Coupon_Use");

            migrationBuilder.DropIndex(
                name: "IX_Cupom_Cod_Cupom",
                table: "Cupom");

            migrationBuilder.DropColumn(
                name: "Discount",
                table: "Cupom");

            migrationBuilder.DropColumn(
                name: "Discount_Type",
                table: "Cupom");

            migrationBuilder.DropColumn(
                name: "First_Order_Only",
                table: "Cupom");

            migrationBuilder.DropColumn(
                name: "Maximum_Discount",
                table: "Cupom");

            migrationBuilder.DropColumn(
                name: "Per_User_Limit",
                table: "Cupom");

            migrationBuilder.DropColumn(
                name: "Quantity_Used",
                table: "Cupom");

            migrationBuilder.DropColumn(
                name: "Quantity_Uses",
                table: "Cupom");

            migrationBuilder.RenameColumn(
                name: "Date_End",
                table: "Cupom",
                newName: "Date_end");

            migrationBuilder.RenameColumn(
                name: "Description",
                table: "Cupom",
                newName: "Descriotion");

            migrationBuilder.AlterColumn<bool>(
                name: "Ativo",
                table: "Product",
                type: "bit",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldNullable: true);

            migrationBuilder.AlterColumn<double>(
                name: "Minimum_Value",
                table: "Cupom",
                type: "float",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Date_Start",
                table: "Cupom",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Date_end",
                table: "Cupom",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Cod_Cupom",
                table: "Cupom",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AddColumn<double>(
                name: "Discont",
                table: "Cupom",
                type: "float",
                nullable: false,
                defaultValue: 0.0);
        }
    }
}
