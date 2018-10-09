$("#amount_from").on('keyup mouseup', convert);

$("#currency_from, #currency_to").on('change', convert);

$('#swap').on('click', function (e) {
    e.preventDefault();
    let currency_from = $('#currency_from').val();
    let currency_to = $('#currency_to').val();

    let currency_from_select = $('#currency_from option');
    let currency_to_select = $('#currency_to option');

    let found_from = false;
    $.each(currency_from_select, function () {
        if ($(this).val() === currency_to) {
            found_from = true;
            return false;
        }
    });

    let found_to = false;
    $.each(currency_to_select, function () {
        if ($(this).val() === currency_from) {
            found_to = true;
            return false;
        }
    });

    if (found_from && found_to) {
        $('#currency_from').val(currency_to);
        $('#currency_to').val(currency_from);
    } else {

    }
    convert();
});

createSelectsOptions();

convert();

function convert() {
    $( "#error" ).hide();
    $( "#error" ).stop();
    $('#error').html('Sorry, currency not found. Try again.');
    let currency_from = $('#currency_from').val();
    let currency_to = $('#currency_to').val();
    let amount_from = $('#amount_from').val();
    let rates = currency_rates();
    if (currency_from === '' || currency_to === '') {
        setResults(0);
        $('#error').html('Error occurs. Please try again.');
        $('#error').fadeIn(500);
        $('#error').fadeOut(2000);
    } else if (currency_from === currency_to) {
        setResults(amount_from);
    } else if ((currency_from in rates.currencies || currency_from === rates.base) && (currency_to in rates.currencies || currency_to === rates.base)) {
        if (currency_from === rates.base) {
            setResults(rates.currencies[currency_to] * amount_from);
        } else {
            setResults(1 / rates.currencies[currency_from] * amount_from);
        }
    } else if (currency_from in rates.currencies) {
        getRatesMixed(currency_from, currency_to, amount_from);
    } else if (currency_to in rates.currencies) {
        getRatesMixed(currency_from, currency_to, amount_from);
    } else {
        getRatesFromAPI(currency_from, currency_to, amount_from);
    }
}

function getRatesMixed(currency_from, currency_to, amount_from) {
    $('#progress').removeClass('d-none');
    let rates = currency_rates();
    $.ajax({
        url: "https://api.exchangeratesapi.io/latest",
        dataType: 'json',
        success: function (result) {
            if (currency_from in rates.currencies) {
                let rate = result.rates[currency_to];
                setResults(rate / rates.currencies[currency_from] * amount_from);
            } else {
                let rate = result.rates[currency_from];
                setResults(rates.currencies[currency_to] / rate * amount_from);
            }
        },
        complete : function () {
            $('#progress').addClass('d-none');
        }
    });
}

function getRatesFromAPI(currency_from, currency_to, amount_from) {
    $('#progress').removeClass('d-none');
    $.ajax({
        url: "https://api.exchangeratesapi.io/latest?base=" + currency_from,
        dataType: 'json',
        success: function (result) {
            if (typeof result.rates[currency_to] !== 'undefined') {
                setResults(result.rates[currency_to] * amount_from);
            } else {
                setResults(0);
                $('#error').fadeIn(500);
                $('#error').fadeOut(2000);
            }
        },
        complete : function () {
            $('#progress').addClass('d-none');
        },
        error: function () {
            setResults(0);
            $('#error').fadeIn(500);
            $('#error').fadeOut(2000);
        }
    });
}

function setResults(res) {
    $('#error').fadeOut();
    $('#amount_to').val((res * 1).toFixed(5));
}

function currency_rates() {
    return {
        'base': 'EUR',
        'currencies' : {
            'LTL' : 3.45,
            'LVL' : 0.703,
        }
    };
}

function createSelectsOptions() {
    $('#progress').removeClass('d-none');
    let rates = currency_rates();
    $.ajax({
        url: "https://api.exchangeratesapi.io/latest",
        dataType: 'json',
        success: function (result) {
            setSelectsOption(rates.base);
            $.each(result.rates, function(key) {
                setSelectsOption(key);
            });
            $.each(rates.currencies, function (key) {
                setSelectsOption(key);
            });
            setSelectsOption('labas');
        },
        complete : function () {
            $('#progress').addClass('d-none');
        }
    });
}

function setSelectsOption(key) {
    $('#currency_from').append("<option value='" + key + "'>" + key + "</option>");
    $('#currency_to').append("<option value='" + key + "'>" + key + "</option>");
}