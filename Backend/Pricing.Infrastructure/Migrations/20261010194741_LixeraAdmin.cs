using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mercado.Craibas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class LixeraAdmin : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DeletedByRole",
                table: "DeletionRecords",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OwnerRole",
                table: "DeletionRecords",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "OwnerUserId",
                table: "DeletionRecords",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ParentRecordId",
                table: "DeletionRecords",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PurgedAt",
                table: "DeletionRecords",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PurgedByUserId",
                table: "DeletionRecords",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Reason",
                table: "DeletionRecords",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Snapshot",
                table: "DeletionRecords",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_DeletionRecords_ParentRecordId",
                table: "DeletionRecords",
                column: "ParentRecordId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_DeletionRecords_ParentRecordId",
                table: "DeletionRecords");

            migrationBuilder.DropColumn(
                name: "DeletedByRole",
                table: "DeletionRecords");

            migrationBuilder.DropColumn(
                name: "OwnerRole",
                table: "DeletionRecords");

            migrationBuilder.DropColumn(
                name: "OwnerUserId",
                table: "DeletionRecords");

            migrationBuilder.DropColumn(
                name: "ParentRecordId",
                table: "DeletionRecords");

            migrationBuilder.DropColumn(
                name: "PurgedAt",
                table: "DeletionRecords");

            migrationBuilder.DropColumn(
                name: "PurgedByUserId",
                table: "DeletionRecords");

            migrationBuilder.DropColumn(
                name: "Reason",
                table: "DeletionRecords");

            migrationBuilder.DropColumn(
                name: "Snapshot",
                table: "DeletionRecords");
        }
    }
}
