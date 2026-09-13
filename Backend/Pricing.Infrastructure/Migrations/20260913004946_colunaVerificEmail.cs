using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mercado.Craibas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class colunaVerificEmail : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "LastResendAt",
                table: "EmailVerifications",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ResendCount",
                table: "EmailVerifications",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ResendWindowStartedAt",
                table: "EmailVerifications",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastResendAt",
                table: "EmailVerifications");

            migrationBuilder.DropColumn(
                name: "ResendCount",
                table: "EmailVerifications");

            migrationBuilder.DropColumn(
                name: "ResendWindowStartedAt",
                table: "EmailVerifications");
        }
    }
}
