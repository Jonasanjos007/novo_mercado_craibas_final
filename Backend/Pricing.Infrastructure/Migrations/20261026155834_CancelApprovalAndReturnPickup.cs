using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mercado.Craibas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CancelApprovalAndReturnPickup : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Cancel_Admin_Note",
                table: "Orders",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "Cancel_Decided_At",
                table: "Orders",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "Cancel_Requested_At",
                table: "Orders",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Cancel_Status",
                table: "Orders",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "Return_AssignedAt",
                table: "Orders",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "Return_CollectedAt",
                table: "Orders",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "Return_DispatchedAt",
                table: "Orders",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Return_Id_User_Admin_Delivery",
                table: "Orders",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Return_Id_User_Delivery",
                table: "Orders",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Return_WhoHanded",
                table: "Orders",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Is_Return_Pickup",
                table: "DeliveryPayoutItems",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_Orders_Cancel_Status",
                table: "Orders",
                column: "Cancel_Status");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_Return_Id_User_Admin_Delivery",
                table: "Orders",
                column: "Return_Id_User_Admin_Delivery");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_Return_Id_User_Delivery",
                table: "Orders",
                column: "Return_Id_User_Delivery");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_User_Admin_Return_Id_User_Admin_Delivery",
                table: "Orders",
                column: "Return_Id_User_Admin_Delivery",
                principalTable: "User_Admin",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_User_Delivery_Return_Id_User_Delivery",
                table: "Orders",
                column: "Return_Id_User_Delivery",
                principalTable: "User_Delivery",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_User_Admin_Return_Id_User_Admin_Delivery",
                table: "Orders");

            migrationBuilder.DropForeignKey(
                name: "FK_Orders_User_Delivery_Return_Id_User_Delivery",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_Cancel_Status",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_Return_Id_User_Admin_Delivery",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_Return_Id_User_Delivery",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Cancel_Admin_Note",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Cancel_Decided_At",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Cancel_Requested_At",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Cancel_Status",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Return_AssignedAt",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Return_CollectedAt",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Return_DispatchedAt",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Return_Id_User_Admin_Delivery",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Return_Id_User_Delivery",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Return_WhoHanded",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Is_Return_Pickup",
                table: "DeliveryPayoutItems");
        }
    }
}
