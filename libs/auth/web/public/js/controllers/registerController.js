
function RegisterController() {

    var that = this;

    // redirect to homepage when cancel button is clicked //
    $('#register-form-btn1').click(function () { window.location.href = '/'; });

    // redirect to homepage on new account creation, add short delay so user can read alert window //
    $('.modal-alert #ok').click(function () { setTimeout(function () { window.location.href = '/'; }, 300) });

    // 
    $('#btn-logout').click(function () { that.attemptLogout(); });

    $('#btn-account').click(function () { window.location.href = '/home'; });

    $('#btn-add-device').click(function () { window.location.href = '/register'; });

    $('#btn-device').click(function () { window.location.href = '/device'; });


    this.attemptLogout = function () {
        var that = this;
        $.ajax({
            url: '/logout',
            type: 'POST',
            data: { logout: true },
            success: function (data) {
                that.showLockedAlert('You are now logged out.<br>Redirecting you back to the homepage.');
            },
            error: function (jqXHR) {
                console.log(jqXHR.responseText + ' :: ' + jqXHR.statusText);
            }
        });
    }

    this.showLockedAlert = function (msg) {
        $('.modal-alert').modal({ show: false, keyboard: false, backdrop: 'static' });
        $('.modal-alert .modal-header h4').text('Success!');
        $('.modal-alert .modal-body p').html(msg);
        $('.modal-alert').modal('show');
        $('.modal-alert button').click(function () { window.location.href = '/'; })
        setTimeout(function () { window.location.href = '/'; }, 3000);
    }
}