var liquorSearchEl = $("#liquor-search");
var proteinSearchEl = $("#protein-search");
var circleIndicatorOneEl = $("#circle-indicator-1");
var circleIndicatorTwoEl = $("#circle-indicator-2");



var fetchLiquorSearch = function(keyword) {

    fetch("https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=" + keyword)
        .then(function(response) {
            if(response.ok) {
                response.json().then(function(data) {
                    console.log(data);
                });
            } else {
                console.log("no good baby");
            }
        });
}
var submitHandler = function(event) {
    // prevent from refreshing page
    event.preventDefault()

    // switch to second input field if on first one
    if(circleIndicatorOneEl.hasClass("active") ) {
        // removing visibility from first input and cirle indicator
        proteinSearchEl.removeClass("active");
        circleIndicatorOneEl.removeClass("active");

        // adding visibility to second input and circle indicator and focus on input
        liquorSearchEl.addClass("active");
        circleIndicatorTwoEl.addClass("active");
        liquorSearchEl.focus();

    } else { // user is on second field(liquor input)
        // check if user added protein and liquor before sending data
        if(!proteinSearchEl.val() || proteinSearchEl.val() == " ") {
            console.log("no protein entered");
        } else {
            // fetch food function here
        }

        if(!liquorSearchEl.val() || liquorSearchEl.val() == " ") { // if not valid or just empty spaces
            console.log("no liquor entered");
        } else {
            fetchLiquorSearch(liquorSearchEl.val());
        }
    }
}

$("#search-form").on("submit", submitHandler);