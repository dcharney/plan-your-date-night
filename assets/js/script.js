var liquorSearchEl = $("#liquor-search");
var proteinSearchEl = $("#protein-search");
var circleIndicatorOneEl = $("#circle-indicator-1");
var circleIndicatorTwoEl = $("#circle-indicator-2");

var drinkResultsEl = $("#drink-results");
var drinksSavedEl = $("#drinks-saved");
var drinks = [];

//recipe book save data
var drinkRecipeBookData = [];
// shopping list save data
var drinkShoppingData = [];


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

var openDrinkModal = function(data) {
    var dataInfo = data.drinks[0];
    var drinkId = dataInfo.idDrink;
    var drinkName = dataInfo.strDrink;
    var category = dataInfo.strCategory;
    var alcohol = dataInfo.strAlcoholic;
    var glass = dataInfo.strGlass;
    var instructions = dataInfo.strInstructions;
    var img = dataInfo.strDrinkThumb;
    var ingredients = [];
    var saveText = "";

    // Filtering through the objects to find list of ingredients and put their values in an array
    for(var i = 0; i < 15; i++) { // ingredients list goes to 15 max in api
        if(dataInfo["strIngredient"+i]){
            ingredients.push(" " + dataInfo["strIngredient"+i]); //added (" " + ) to add spaces after ingredient item
        };
    }


    // Find if the array already has recipe as object by comparing the property value then
    // if in recipe book, update to text to "remove from recipe book" else to "save to recipe"
    if(drinkRecipeBookData.some(recipe => recipe.drinkName === drinkName)){
        saveText = "Remove From Recipe Book";
    } else {
        saveText = "Save To Recipe Book";
    }

    // update text and add drink id date in save btn
    $("#save-btn")
        .text(saveText)
        .attr('data-drinkId', drinkId);

    // update drink name in modal
    $("#drink-name").text(drinkName);
    // update drink details: add category, alchohol, glass, instructions, ingredients
    $("#drink-highlight-details").html(
        "<p>Category: "+ category + "</p>" +
        "<br>" +
        "<p>Alcohol: "+ alcohol + "</p>" +
        "<br>" +
        "<p>Glass: "+ glass + "</p>" +
        "<br>" +
        "<p>Instructions: "+ instructions + "</p>" +
        "<br>" +
        "<p id='drink-ingredients'>Ingredients: "+ ingredients + "</p>"
    );
    
    // update img
    $("#drink-highlight-img").html("<img src='"+img+"'/>");
    // open this drink modal 
    var modal = new Foundation.Reveal($('#drink-modal'));
    modal.open();
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

// fetch clicked drink from results
var fetchDrinkInfo = function(idDrink) {
    // search by id
    fetch("https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=" + idDrink)
        .then(function(response) {
            if(response.ok) {
                response.json().then(function(data) {
                    openDrinkModal(data);
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
        scrollTo(0, $('#results-section').offset().top);
    }

}

var drinkClicked = function(event) {
    // find drinks container
    var drink = $(event.target).closest(".result-cell");
    // get id (unique drink id needed for api search)
    var idDrink = $(drink).attr("id");

    // fetch drink clicked
    fetchDrinkInfo(idDrink);
}

//placeholder function for shoping list
var addDrinkShoppingList = function() {
    // find ingredients
    var ingredients = $("#drink-ingredients").text();

    console.log(ingredients);
}

var populateDrinkRecipeBook = function(name, image, id, addRecipe) {
    // if adding to recipe book
    if(addRecipe === true) {
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
        $(img).attr("src", image);
        // add text data-title of drink
        $(h6).text(name);
        // set drink id to cell id
        $(cellDiv).attr("id", id);
    
        // put h4 in h4 wrapper
        h6Div.append(h6);
        // put h4 and img in cell
        cellDiv.append(img, h6Div);
        // append cell to results element
        $("#drinks-saved").append(cellDiv);
    }
    // else if removing from recipe book
    else { 
        // remove from saved recipe book section only
        $(drinksSavedEl).find("#"+id).remove();
    }
}

var populateDrinkShoppingList = function(name, ingredients, image) {

    // add text data-title of drink
    $("#drink-name-shopping").text("Ingredients for the drink: " + name);

    // make ul empty then fill with list elements
    $("#drink-ul-shopping").html("");
    // create list eleements
    ingredients.forEach(element => {
        var ingredient = document.createElement("li");
        $(ingredient).text(element);
        // put list items in UL
        $("#drink-ul-shopping").append(ingredient); 
    });

    // add data-img
    $("#drink-shopping-img").attr("src", image);
}

// save & remove recipe function
var saveDrinkRecipe = function(event) {
    // grab drink name
    var name = $(event.target).closest("#drink-modal").find("#drink-name").text();
    // grab image
    var image = $(event.target).closest("#drink-modal").find("img").attr('src');
    // grab drink unique id
    var id = $(event.target).attr("data-drinkId");
    // add or remove var
    var addRecipe = true;

    // save to recipe book / local storage
    var recipeData = {drinkName: name, drinkImg: image, drinkId: id};

    // Find if the array already has recipe as object by comparing the property value
    if(drinkRecipeBookData.some(recipe => recipe.drinkName === name)){
        // delete if already saved (clicked "remove from recipe book)") by
        // updating recipe book var to not include this recipe
        drinkRecipeBookData = drinkRecipeBookData.filter(recipe => recipe.drinkName !== name);
        // update local storage to array
        localStorage.setItem('drinkRecipeBookData', JSON.stringify(drinkRecipeBookData));
        // remove from recipe book
        addRecipe = false;
        // update text of modal
        $("#save-btn").text("Save To Recipe Book");

    } else { 
        // not a duplicate so save (clicked "save to recipe book")
        drinkRecipeBookData.push(recipeData);
        // update local storage to array
        localStorage.setItem('drinkRecipeBookData', JSON.stringify(drinkRecipeBookData));
        // add to recipe book
        addRecipe = true;
        // update text of modal
        $("#save-btn").text("Remove From Recipe Book");

    }

    // populate to recipe book right away 
    populateDrinkRecipeBook(name, image, id, addRecipe);

}

var saveDrinkShopList = function(event) {
    // grab drink name
    var name = $(event.target).closest("#drink-modal").find("#drink-name").text();
    // grab drink unique id
    var id = $(event.target).attr("data-drinkId");
    // grab ingredients
    var ingredientsText = $(event.target).closest("#drink-modal").find("#drink-ingredients").text();
    // grab image
    var image = $(event.target).closest("#drink-modal").find("img").attr('src');
    // remove the ingredients text from string
    ingredientsText = ingredientsText.split(':').pop();
    // turn into array by seperating from comma
    var ingredients = ingredientsText.split(',');

    // update shopping data
    var shoppingData = {drinkName: name, drinkIngredients: ingredients, drinkImg: image};
    drinkShoppingData.push(shoppingData);

    // update local storage to array
    localStorage.setItem('drinkShoppingData', JSON.stringify(drinkShoppingData));

    // update text of modal
    $("#drink-save-shop-list").text("Update Shopping List");

    // populate to shopping list right away 
    populateDrinkShoppingList(name, ingredients, image);

}

// load drink local storage data
var loadDrinkRecipeBook = function() {
    var localData = JSON.parse(localStorage.getItem("drinkRecipeBookData"));
    // check if empty before loading
    if (localData) {
        // update array to local storage
        drinkRecipeBookData = localData;
        // populate recipe book section with saved data
        drinkRecipeBookData.forEach(element => {
            populateDrinkRecipeBook(element.drinkName, element.drinkImg, element.drinkId, true);
        });
    } else {
        return
    }
}
var loadDrinkShoppingList = function() {
    var localData = JSON.parse(localStorage.getItem("drinkShoppingData"));
    // check if empty before loading
    if (localData) {
        // update array to local storage
        drinkShoppingData = localData;
        // populate recipe book section with saved data
        populateDrinkShoppingList(drinkShoppingData[0].drinkName, drinkShoppingData[0].drinkIngredients, drinkShoppingData[0].drinkImg);
    } else {
        return
    }

}
// load / populate drink section of recipe book when page loads
loadDrinkRecipeBook();
// load / populate shopping list section when page loads
loadDrinkShoppingList();
// submit listener
$("#search-form").on("submit", submitHandler);

// auto complete liquor search
fetchLiquorIngredientList();
liquorSearchEl.autocomplete({
    source: drinks,
    appendTo: "#suggestions-wrapper",
    autoFocus: true
});

// drink selected listener
$(drinkResultsEl).on("click", drinkClicked);
$(drinksSavedEl).on("click", drinkClicked);
// save to recipe btn listener
$("#save-btn").on("click", saveDrinkRecipe);
// save to shopping list listener
$("#drink-save-shop-list").on("click", saveDrinkShopList);
