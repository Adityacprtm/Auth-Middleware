$(document).ready(function () {

    var rdc = new RegisDeviceController();
    var rv = new RegisterValidator();

    $('#account-form').ajaxForm({
        beforeSubmit: function (formData, jqForm, options) {
            return rv.validateForm();
        },
        success: function (responseText, status, xhr, $form) {
            if (status == 'success') $('.modal-alert').modal('show');
        },
        error: function (err) {
            if (err.responseText == 'device-name-taken') {
                rv.showInvalidName();
            }
        }
    });

    $('#name-tf').focus();

    // customize the account settings form //
    $('#account-form h2').text('Register Device');
    $('#account-form #sub').text('Register your device.');
    $('#id-tf').attr('disabled', 'disabled');
    $('#account-form-btn1').html('Cancel');
    $('#account-form-btn2').html('Submit');
    $('#account-form-btn2').addClass('btn-primary');

    // setup the alert that displays when an account is successfully created //
    $('.modal-alert').modal({ show: false, keyboard: false, backdrop: 'static' });
    $('.modal-alert .modal-header h4').text('Account Created!');
    $('.modal-alert .modal-body p').html('Your account has been created.</br>Click OK to return to the login page.');

})