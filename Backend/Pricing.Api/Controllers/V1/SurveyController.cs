//using backend.services.interfaces;
//using microsoft.aspnetcore.mvc;
//using microsoft.aspnetcore.authorization;
//using system.security.claims;
//using pricing.api.dtos.requests;

//namespace backend.controllers.v1;

//[apicontroller]
//[route("api/v1/collections")]
//public class surveycontroller : controllerbase
//{
//    private readonly isurveyservice _service;

//    public surveycontroller(isurveyservice service)
//    {
//        _service = service;
//    }

//    [httppost]
//    public async task<iactionresult> create([frombody] collectionupsertrequest request)
//    {
//        var useridclaim = user.findfirst(claimtypes.nameidentifier)?.value;

//        if (!guid.tryparse(useridclaim, out var userid))
//            return unauthorized();

//        //var id = await _service.createasync(userid, request);

//        return createdataction(nameof(getbyid), new { useridclaim }, new { useridclaim });
//    }

//    [httpput("{id}")]
//    public async task<iactionresult> update(string id, [frombody] collectionupsertrequest request)
//    {
//        if (!guid.tryparse(id, out var collectionid))
//            return badrequest("id inválido");

//        //var updated = await _service.updateasync(collectionid, request);
//        //if (!updated) return notfound();

//        return nocontent();
//    }

//    [httpget("{id}")]
//    public async task<iactionresult> getbyid(string id)
//    {
//        if (!guid.tryparse(id, out var collectionid))
//            return badrequest("id inválido");

//        //var collection = await _service.getbyidasync(collectionid);
//        //if (collection == null) return notfound();

//        return nocontent();
//    }
//}
