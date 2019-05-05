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
                    topic = "No Topic"
                }
                $('.card-deck').append('<div class="card shadow-sm"> <h5 class="card-header text-center bg-white"><a style="text-decoration:none" href="/device?id=' + a[i].device_id + '">' + a[i].device_name.toUpperCase() + '</a></h5> <div class="card-body"> <div class="row card-text"> <div class="col font-weight-bold">Device ID</div><div class="col">' + a[i].device_id + '</div></div><br><div class="row card-text"> <div class="col font-weight-bold">Device Password</div><div class="col">' + a[i].password + '</div></div><br><div class="row card-text"> <div class="col font-weight-bold">Role</div><div class="col">' + a[i].role + '</div></div><br><div class="row card-text"> <div class="col font-weight-bold">Topic</div><div class="col">' + topic + '</div></div><br><div class="row card-text"> <div class="col font-weight-bold">Description</div><div class="col">' + a[i].description + '</div></div></div><div class="card-footer text-center"> <small class="text-muted">Added ' + a[i].date + '</small> </div></div>')
            }
        }
    }
})