$(document).ready(function () {

    var dc = new DeviceController()

    var a = [];
    var user;
    $.ajax({
        url: '/api/device',
        dataType: 'json',
        error: function (request, error) {
            alert("Can't do because: " + error);
        },
        success: function (data) {
            user = data.user
            //console.log(user)
            for (let i = 0; i < data.dvc.length; i++) {
                a.push(data.dvc[i])
            }
            handleView()
        }
    })

    function handleView() {
        if (a.length == 0) {
            $('#page-header').html('No Device Registered')
        } else {
            for (let i = 0; i < a.length; i++) {
                var topic
                if (a[i].topic) {
                    topic = a[i].topic
                } else {
                    topic = "Not Available"
                }
                $('.card-columns').append('<div style="width: 101%" class="card shadow-sm"> <h5 class="card-header text-center bg-white"><a style="text-decoration:none" href="/device?id=' + a[i].device_id + '">' + a[i].device_name.toUpperCase() + '</a></h5> <form class="card-body"> <div class="form-group"> <label>Device ID</label> <textarea style="resize: none;" class="form-control" id="user-tf" name="user" disabled>' + a[i].device_id + '</textarea> </div><div class="form-group"> <label>Device Password</label> <textarea style="resize: none;" class="form-control" id="user-tf" name="user" disabled>' + a[i].password + '</textarea> </div><div class="form-group"> <label>Key (hex)</label> <input class="form-control" type="text" id="user-tf" name="user" value="' + a[i].key + '" disabled/> </div><div class="form-group"> <label>Initialization Vector (hex)</label> <input class="form-control" type="text" id="user-tf" name="user" value="' + a[i].iv + '" disabled/> </div><div class="form-group"> <label>Role</label> <input class="form-control" type="text" id="user-tf" name="user" value="' + a[i].role + '" disabled/> </div><div class="form-group"> <label>Topic</label> <input class="form-control" type="text" id="user-tf" name="user" value="' + topic + '" disabled/> </div><div class="form-group"> <label>Description</label> <input class="form-control" type="text" id="user-tf" name="user" value="' + a[i].description + '" disabled/> </div></form> <div class="card-footer text-center"> <small class="text-muted">Added ' + a[i].date + '</small> </div></div>')
            }
        }
    }
})