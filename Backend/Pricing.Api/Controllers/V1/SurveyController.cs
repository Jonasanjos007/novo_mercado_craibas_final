//using Backend.Services.Interfaces;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.AspNetCore.Authorization;
//using System.Security.Claims;
//using Pricing.Api.DTOs.Requests;

//namespace Backend.Controllers.V1;

//[ApiController]
//[Route("api/v1/collections")]
//public class SurveyController : ControllerBase
//{
//    private readonly ISurveyService _service;

//    public SurveyController(ISurveyService service)
//    {
//        _service = service;
//    }

//    [HttpPost]
//    public async Task<IActionResult> Create([FromBody] CollectionUpsertRequest request)
//    {
//        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

//        if (!Guid.TryParse(userIdClaim, out var userId))
//            return Unauthorized();

//        //var id = await _service.CreateAsync(userId, request);

//        return CreatedAtAction(nameof(GetById), new { userIdClaim }, new { userIdClaim });
//    }

//    [HttpPut("{id}")]
//    public async Task<IActionResult> Update(string id, [FromBody] CollectionUpsertRequest request)
//    {
//        if (!Guid.TryParse(id, out var collectionId))
//            return BadRequest("Id inválido");

//        //var updated = await _service.UpdateAsync(collectionId, request);
//        //if (!updated) return NotFound();

//        return NoContent();
//    }

//    [HttpGet("{id}")]
//    public async Task<IActionResult> GetById(string id)
//    {
//        if (!Guid.TryParse(id, out var collectionId))
//            return BadRequest("Id inválido");

//        //var collection = await _service.GetByIdAsync(collectionId);
//        //if (collection == null) return NotFound();

//        return NoContent();
//    }
//}
