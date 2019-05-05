$(document).ready(function () {

    var hc = new DashboardController();
    var av = new AccountValidator();

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
        $('#welcome-user').text('Welcome, ' + user);
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
                $('.card-columns').append('<div class="card shadow-sm"> <h5 class="card-header text-center bg-white"><a style="text-decoration:none" href="/device?id=' + a[i].device_id + '">' + a[i].device_name.toUpperCase() + '</a></h5> <form class="card-body"> <div class="form-group"> <label>Device ID</label> <input class="form-control" type="text" id="user-tf" name="user" value=' + a[i].device_id + ' disabled/> </div><div class="form-group"> <label>Device Password</label> <input class="form-control" type="text" id="user-tf" name="user" value=' + a[i].password + ' disabled/> </div><div class="form-group"> <label>Key (hex)</label> <input class="form-control" type="text" id="user-tf" name="user" value=' + a[i].key + ' disabled/> </div><div class="form-group"> <label>Initialization Vector (hex)</label> <input class="form-control" type="text" id="user-tf" name="user" value=' + a[i].iv + ' disabled/> </div><div class="form-group"> <label>Role</label> <input class="form-control" type="text" id="user-tf" name="user" value=' + a[i].role + ' disabled/> </div><div class="form-group"> <label>Topic</label> <input class="form-control" type="text" id="user-tf" name="user" value=' + topic + ' disabled/> </div><div class="form-group"> <label>Description</label> <input class="form-control" type="text" id="user-tf" name="user" value=' + a[i].description + ' disabled/> </div></form> <div class="card-footer text-center"> <small class="text-muted">Added ' + a[i].date + '</small> </div></div>')
            }
        }
    }

    $('#account-form').ajaxForm({
        beforeSubmit: function (formData, jqForm, options) {
            if (av.validateForm() == false) {
                return false;
            } else {
                // push the disabled username field onto the form data array //
                formData.push({ name: 'user', value: $('#user-tf').val() })
                return true;
            }
        },
        success: function (responseText, status, xhr, $form) {
            if (status == 'success') hc.onUpdateSuccess();
        },
        error: function (e) {
            if (e.responseText == 'email-taken') {
                av.showInvalidEmail();
            } else if (e.responseText == 'username-taken') {
                av.showInvalidUserName();
            }
        }
    });
    // $('#name-tf').focus();

    // customize the account settings form //
    //$('#account-form #sub').text('Here are the current settings for your account.');
    $('#account-form-btn1').html('Delete');
    $('#account-form-btn1').removeClass('btn-outline-dark');
    $('#account-form-btn1').addClass('btn-danger');
    $('#account-form-btn2').html('Update');

    // setup the confirm window that displays when the user chooses to delete their account //
    $('.modal-confirm').modal({ show: false, keyboard: true, backdrop: true });
    $('.modal-confirm .modal-header h4').text('Delete Account');
    $('.modal-confirm .modal-body p').html('Are you sure you want to delete your account?');
    $('.modal-confirm .cancel').html('Cancel');
    $('.modal-confirm .submit').html('Delete');
    $('.modal-confirm .submit').addClass('btn-danger');
})