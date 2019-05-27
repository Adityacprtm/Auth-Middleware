function deleteRow(btn) {
    var row = btn.parentNode.parentNode;
    console.log(row)
    row.parentNode.removeChild(row);
}