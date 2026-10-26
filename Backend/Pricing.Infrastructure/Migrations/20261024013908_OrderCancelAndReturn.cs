using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mercado.Craibas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class OrderCancelAndReturn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Cancel_Reason",
                table: "Orders",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "Canceled_At",
                table: "Orders",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Canceled_By",
                table: "Orders",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Return_Admin_Note",
                table: "Orders",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Return_Reason",
                table: "Orders",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "Return_Requested_At",
                table: "Orders",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Return_Status",
                table: "Orders",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "Return_Updated_At",
                table: "Orders",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Orders_Return_Status",
                table: "Orders",
                column: "Return_Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Orders_Return_Status",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Cancel_Reason",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Canceled_At",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Canceled_By",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Return_Admin_Note",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Return_Reason",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Return_Requested_At",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Return_Status",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Return_Updated_At",
                table: "Orders");
        }
    }
}
