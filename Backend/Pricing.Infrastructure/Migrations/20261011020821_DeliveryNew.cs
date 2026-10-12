using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mercado.Craibas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class DeliveryNew : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "DailyRate",
                table: "User_Delivery",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "Delivery_AssignedAt",
                table: "Orders",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "Delivery_DispatchedAt",
                table: "Orders",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Id_User_Admin_Delivery",
                table: "Orders",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "DeliveryPayouts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Id_User_Delivery = table.Column<int>(type: "int", nullable: false),
                    Mode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    PeriodStart = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PeriodEnd = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Total = table.Column<double>(type: "float", nullable: false),
                    PaidAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PaidById = table.Column<int>(type: "int", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ReversedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReversedById = table.Column<int>(type: "int", nullable: true),
                    ReversedReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    InsertDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdateDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Isdelete = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeliveryPayouts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DeliveryPayouts_User_Delivery_Id_User_Delivery",
                        column: x => x.Id_User_Delivery,
                        principalTable: "User_Delivery",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DeliverySettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TipEnabled = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    Mode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    OrderValueType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    OrderValue = table.Column<double>(type: "float", nullable: false),
                    DailyValue = table.Column<double>(type: "float", nullable: false),
                    CountFrom = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedById = table.Column<int>(type: "int", nullable: true),
                    InsertDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdateDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Isdelete = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeliverySettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DeliveryPayoutItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Id_DeliveryPayout = table.Column<int>(type: "int", nullable: false),
                    Id_Order = table.Column<int>(type: "int", nullable: true),
                    WorkDate = table.Column<DateTime>(type: "date", nullable: true),
                    ReferenceDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Deliveries = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<double>(type: "float", nullable: false),
                    InsertDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdateDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Isdelete = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeliveryPayoutItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DeliveryPayoutItems_DeliveryPayouts_Id_DeliveryPayout",
                        column: x => x.Id_DeliveryPayout,
                        principalTable: "DeliveryPayouts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DeliveryPayoutItems_Orders_Id_Order",
                        column: x => x.Id_Order,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Orders_Id_User_Admin_Delivery",
                table: "Orders",
                column: "Id_User_Admin_Delivery");

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryPayoutItems_Id_DeliveryPayout",
                table: "DeliveryPayoutItems",
                column: "Id_DeliveryPayout");

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryPayoutItems_Id_Order",
                table: "DeliveryPayoutItems",
                column: "Id_Order");

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryPayouts_Id_User_Delivery",
                table: "DeliveryPayouts",
                column: "Id_User_Delivery");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_User_Admin_Id_User_Admin_Delivery",
                table: "Orders",
                column: "Id_User_Admin_Delivery",
                principalTable: "User_Admin",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_User_Admin_Id_User_Admin_Delivery",
                table: "Orders");

            migrationBuilder.DropTable(
                name: "DeliveryPayoutItems");

            migrationBuilder.DropTable(
                name: "DeliverySettings");

            migrationBuilder.DropTable(
                name: "DeliveryPayouts");

            migrationBuilder.DropIndex(
                name: "IX_Orders_Id_User_Admin_Delivery",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "DailyRate",
                table: "User_Delivery");

            migrationBuilder.DropColumn(
                name: "Delivery_AssignedAt",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Delivery_DispatchedAt",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Id_User_Admin_Delivery",
                table: "Orders");
        }
    }
}
