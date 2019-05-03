$(document).ready(function () {

    var rdc = new RegisterController();

    var a = [];
    $.ajax({
        url: '/api/device',
        dataType: 'json',
        error: function (request, error) {
            alert(" Can't do because: " + error);
        },
        success: function (data) {
            for (let i = 0; i < data.length; i++) {
                a.push(data[i])
            }
            handleView()
        }
    })

    function handleView() {
        console.log(a)
        if (a.length == 0) {
            $('#page-header').html('No Device Registered')
        } else {
            for (let i = 0; i < a.length; i++) {
                $('#card-device').append('<div class="card"> <div class="card-body"> <h5 class="card-title text-center"><a href="/device?id=' + a[i].device_id + '">' + a[i].device_name + '</a></h5> <hr> <div class="row card-text"> <div class="col font-weight-bold">Device ID</div><div class="col">' + a[i].device_id + '</div></div><br><div class="row card-text"> <div class="col font-weight-bold">Device Pass</div><div class="col">' + a[i].password + '</div></div><br><div class="row card-text"> <div class="col font-weight-bold">Role</div><div class="col">' + a[i].role + '</div></div><br><div class="row card-text"> <div class="col font-weight-bold">Description</div><div class="col">' + a[i].description + '</div></div><br><div class="row card-text"> <div class="col font-weight-bold">Topic</div><div class="col">' + a[i].topic + '</div></div><hr> <p class="card-text text-center"><small class="text-muted">Added ' + a[i].date + '</small></p></div></div>')
            }
        }
    }

})