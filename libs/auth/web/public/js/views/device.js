$(document).ready(function () {

    var rdc = new RegisterController();

    var a = [];
    $.ajax({
        url: '/api/device',
        dataType: 'json',
        error: function (request, error) {
            console.log(arguments);
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
        for (let i = 0; i < a.length; i++) {
            console.log(a[i])
            $('#card-device').append('<div class="card text-center"><div class="card-body"><h5 class="card-title">' + a[i].device_name + '</h5><p class="card-text"><strong>ID: </strong>' + a[i].device_id + '<br><strong>Role: </strong>' + a[i].role + '</p><p class="card-text"><small class="text-muted">Added ' + a[i].date + '</small></p></div></div>')
        }
    }
})