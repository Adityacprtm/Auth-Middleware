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
                $('#card-device').append('<div class="card"> <div class="card-body"> <h5 class="card-title text-center"><a href="/device?id=' + a[i].device_id + '">' + a[i].device_name.toUpperCase() + '</a></h5> <hr> <div class="row card-text"> <div class="col font-weight-bold">Device ID</div><div class="col">' + a[i].device_id + '</div></div><br><div class="row card-text"> <div class="col font-weight-bold">Device Password</div><div class="col">' + a[i].password + '</div></div><br><div class="row card-text"> <div class="col font-weight-bold">Role</div><div class="col">' + a[i].role + '</div></div><br><div class="row card-text"> <div class="col font-weight-bold">Topic</div><div class="col">' + topic + '</div></div><br><div class="row card-text"> <div class="col font-weight-bold">Description</div><div class="col">' + a[i].description + '</div></div><hr> <p class="card-text text-center"><small class="text-muted">Added ' + a[i].date + '</small></p></div></div>')
            }
        }
    }
})