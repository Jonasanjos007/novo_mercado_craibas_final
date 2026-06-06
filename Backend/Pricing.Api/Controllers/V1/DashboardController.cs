//using Backend.Services.Interfaces;
//using Baldan.Pricing.Application.Domain.Enums;
//using Baldan.Pricing.Application.DTOs.Requests;
//using Baldan.Pricing.Application.DTOs.Responses;
//using Baldan.Pricing.Application.Interfaces.Services;
//using Baldan.Pricing.Application.Models.Enums;
//using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Mvc;
//using Pricing.Api.Extensions;
//using System.Security.Claims;

//namespace Backend.Controllers.V1;

//[Authorize]
//[ApiController]
//[Route("api/v1/dashboard")]
//public class DashboardController : ControllerBase
//{
//    private readonly IDashboardService _service;

//    public DashboardController(IDashboardService service)
//    {
//        _service = service;
//    }

//    [HttpPost]
//    public async Task<IActionResult> Get([FromBody] SellerDashboardFilter filters)
//    {
//        var userId = User.GetUserId();

//        var result = await _service.SellerDashboardResearch(filters, userId);

//        return result.ToActionResult();
//    }
//}

