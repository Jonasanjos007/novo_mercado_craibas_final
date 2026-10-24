using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mercado.Craibas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class PaymentTransactions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Payment_Transactions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Id_Order = table.Column<int>(type: "int", nullable: false),
                    Id_User_Customer = table.Column<int>(type: "int", nullable: false),
                    Provider = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Method = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Provider_Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    Provider_Status_Detail = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    Provider_Order_Id = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    Provider_Payment_Id = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    External_Reference = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    Idempotency_Key = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Installments = table.Column<int>(type: "int", nullable: true),
                    Card_Brand = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    Card_Last_Four = table.Column<string>(type: "nvarchar(4)", maxLength: 4, nullable: true),
                    Pix_Qr_Code = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Pix_Qr_Code_Base64 = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Pix_Ticket_Url = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Expires_At = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Paid_At = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Error_Message = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Last_Response = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Last_Sync_At = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Last_Webhook_At = table.Column<DateTime>(type: "datetime2", nullable: true),
                    InsertDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdateDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Isdelete = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payment_Transactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Payment_Transactions_Orders_Id_Order",
                        column: x => x.Id_Order,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Payment_Transactions_Id_Order",
                table: "Payment_Transactions",
                column: "Id_Order");

            migrationBuilder.CreateIndex(
                name: "IX_Payment_Transactions_Idempotency_Key",
                table: "Payment_Transactions",
                column: "Idempotency_Key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Payment_Transactions_Provider_Order_Id",
                table: "Payment_Transactions",
                column: "Provider_Order_Id");

            migrationBuilder.CreateIndex(
                name: "IX_Payment_Transactions_Status_Expires_At",
                table: "Payment_Transactions",
                columns: new[] { "Status", "Expires_At" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Payment_Transactions");
        }
    }
}
