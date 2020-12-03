var mainEl = $("main");
var liquorSearchEl = $("#liquor-search");
var proteinSearchEl = $("#protein-search");
var circleIndicatorOneEl = $("#circle-indicator-1");
var circleIndicatorTwoEl = $("#circle-indicator-2");

var drinkResultsEl = $("#drink-results");
var drinks = [];

// disable scrolling
var disableScroll = function() {
    mainEl.attr("overflow-y","hidden");
}
// enable scrolling
var enableScroll = function() {
    mainEl.attr("overflow-y","scroll");
}

// push data from api to drinks array
var suggestLiquor = function(data) {
    data.drinks.forEach(element => {
        drinks.push(element.strIngredient1);
    });
}

// show drink results for liquor searched
var drinkResults = function(data) {
    data.drinks.forEach(element => {
        // cell wrapper for individual drinks
        var cellDiv = document.createElement("div");
        // bg img in wrapper
        var img = document.createElement("img");
        // div wrapper for title/drink name
        var h6Div = document.createElement("div");
        // title/ drink name
        var h6 = document.createElement("h6");

        // add classes needed to elements
        $(cellDiv).addClass("cell large-4 result-cell");
        $(h6Div).addClass("result-bg");
        $(h6).addClass("result");

        // add data-img
        $(img).attr("src", element.strDrinkThumb);
        // add text data-title of drink
        $(h6).text(element.strDrink);
        // set drink id to cell id
        $(cellDiv).attr("id", element.idDrink);

        
        // put h4 in h4 wrapper
        h6Div.append(h6);
        // put h4 and img in cell
        cellDiv.append(img, h6Div);
        // append cell to results element
        drinkResultsEl.append(cellDiv)
    });
}

// fetch list of ingrediants/liquors to add to suggestion
var fetchLiquorIngredientList = function() {
    fetch("https://www.thecocktaildb.com/api/json/v1/1/list.php?i=list")
    .then(function(response) {
        if(response.ok) {
            response.json().then(function(data) {
                suggestLiquor(data); // populate suggestions
            });
        } else {
            console.log("no good baby");
        }
    });
}

// fetch the drinks for the liquor that the user searched
var fetchLiquorSearch = function(keyword) {
    fetch("https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=" + keyword)
        .then(function(response) {
            if(response.ok) {
                response.json().then(function(data) {
                    // run drink results for searched liquor; function
                    drinkResults(data);
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
        // scroll to results section after search
        mainEl[0].scrollTo(0, $('#results-section').offset().top);
    }
    
}

// submit listener
$("#search-form").on("submit", submitHandler);

// auto complete liquor search
fetchLiquorIngredientList();
liquorSearchEl.autocomplete({
    source: drinks,
    appendTo: "#suggestions-wrapper",
    autoFocus: true
});